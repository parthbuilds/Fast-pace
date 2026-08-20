import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/geocoding';
import { fetchBusinessesFromOverpass } from '@/lib/overpass';
import { calculateScores } from '@/lib/scoring';
import { detectOpportunitiesForBusiness } from '@/lib/intelligence';
import { prisma } from '@/lib/prisma';
import { CATEGORIES } from '@/lib/categories';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, lat, lon, radiusKm = 5, categoryIds = [] } = body;

    let centerLat = lat;
    let centerLon = lon;
    let resolvedAddress = address || 'HSR Layout, Bangalore';

    if ((!centerLat || !centerLon) && address) {
      const geo = await geocodeAddress(address);
      if (geo) {
        centerLat = geo.latitude;
        centerLon = geo.longitude;
        resolvedAddress = geo.displayName;
      } else {
        centerLat = 12.9121;
        centerLon = 77.6446;
      }
    } else if (!centerLat || !centerLon) {
      centerLat = 12.9121;
      centerLon = 77.6446;
    }

    // Query Overpass API with deduplication & caching
    const { businesses, cached, source, error } = await fetchBusinessesFromOverpass(
      centerLat,
      centerLon,
      radiusKm,
      categoryIds
    );

    // Save Search history
    await prisma.search.create({
      data: {
        address: resolvedAddress,
        latitude: centerLat,
        longitude: centerLon,
        radiusKm: Number(radiusKm),
        categories: JSON.stringify(categoryIds),
        resultsCount: businesses.length,
      },
    });

    // Upsert discovered businesses and create Leads
    const savedLeads: any[] = [];

    for (const biz of businesses) {
      // Find category group
      const matchedCat = CATEGORIES.find((c) => c.name.toLowerCase() === biz.category.toLowerCase()) || {
        group: 'Food',
        name: biz.category,
      };

      // Heuristic scores
      const scores = calculateScores({
        categoryGroup: matchedCat.group,
        categoryName: biz.category,
        distanceKm: biz.distanceKm,
        hasPhone: Boolean(biz.phone),
        hasWebsite: Boolean(biz.website),
        hasEmail: Boolean(biz.email),
        hasOpeningHours: Boolean(biz.openingHours),
        rating: biz.rating,
        reviewCount: biz.reviewCount,
      });

      // Upsert Business
      const dbBusiness = await prisma.business.upsert({
        where: { osmId: biz.osmId },
        update: {
          name: biz.name,
          category: biz.category,
          subcategory: biz.subcategory,
          address: biz.address,
          area: biz.area,
          city: biz.city,
          latitude: biz.latitude,
          longitude: biz.longitude,
          distanceKm: biz.distanceKm,
          phone: biz.phone,
          website: biz.website,
          email: biz.email,
          openingHours: biz.openingHours,
          rawTags: JSON.stringify(biz.rawTags),
        },
        create: {
          osmId: biz.osmId,
          name: biz.name,
          category: biz.category,
          subcategory: biz.subcategory,
          address: biz.address,
          area: biz.area,
          city: biz.city,
          latitude: biz.latitude,
          longitude: biz.longitude,
          distanceKm: biz.distanceKm,
          phone: biz.phone,
          website: biz.website,
          email: biz.email,
          openingHours: biz.openingHours,
          mapsUrl: biz.mapsUrl,
          rawTags: JSON.stringify(biz.rawTags),
        },
      });

      // Ensure Lead exists
      let lead = await prisma.lead.findUnique({
        where: { businessId: dbBusiness.id },
        include: {
          business: true,
          audit: true,
          opportunities: true,
        },
      });

      if (!lead) {
        lead = await prisma.lead.create({
          data: {
            businessId: dbBusiness.id,
            status: 'NEW',
            leadScore: scores.leadScore,
            opportunityScore: scores.opportunityScore,
            priority: scores.priority,
            budgetPotential: scores.budgetPotential,
            qualificationStatus: scores.qualificationStatus,
            estimatedValue: scores.estimatedValue,
          },
          include: {
            business: true,
            audit: true,
            opportunities: true,
          },
        });

        // Create initial heuristic audit record
        const webStatus = biz.website ? 'AVERAGE' : 'NO_WEBSITE';
        await prisma.businessAudit.create({
          data: {
            leadId: lead.id,
            websiteStatus: webStatus,
            isReachable: Boolean(biz.website),
            isHttps: Boolean(biz.website?.startsWith('https')),
            mobileFriendly: Boolean(biz.website),
            hasContactInfo: Boolean(biz.phone || biz.email),
            hasPhoneVisible: Boolean(biz.phone),
            hasEmail: Boolean(biz.email),
            overallScore: biz.website ? 60 : 10,
            summaryText: biz.website
              ? 'Web presence listed in public registries. Detailed audit available.'
              : 'No website listed in public registries. Prime candidate for modern web presence.',
          },
        });

        // Detect opportunities
        const detectedOpps = detectOpportunitiesForBusiness(
          biz.category,
          matchedCat.group,
          Boolean(biz.website),
          Boolean(biz.phone)
        );

        for (const opp of detectedOpps) {
          await prisma.opportunity.create({
            data: {
              leadId: lead.id,
              type: opp.type,
              title: opp.title,
              description: opp.description,
              confidenceScore: opp.confidenceScore,
              estimatedImpact: opp.estimatedImpact,
              tags: JSON.stringify(opp.tags),
            },
          });
        }

        // Log Created Interaction
        await prisma.interaction.create({
          data: {
            leadId: lead.id,
            type: 'CREATED',
            summary: `Discovered via OpenStreetMap (${resolvedAddress})`,
            details: `Located ${biz.distanceKm} km away. Lead score: ${scores.leadScore}, Opp score: ${scores.opportunityScore}`,
          },
        });
      }

      savedLeads.push({
        id: lead.id,
        businessId: dbBusiness.id,
        name: dbBusiness.name,
        category: dbBusiness.category,
        subcategory: dbBusiness.subcategory,
        address: dbBusiness.address,
        area: dbBusiness.area,
        city: dbBusiness.city,
        latitude: dbBusiness.latitude,
        longitude: dbBusiness.longitude,
        distanceKm: dbBusiness.distanceKm,
        phone: dbBusiness.phone,
        website: dbBusiness.website,
        email: dbBusiness.email,
        status: lead.status,
        leadScore: lead.leadScore,
        opportunityScore: lead.opportunityScore,
        priority: lead.priority,
      });
    }

    return NextResponse.json({
      success: true,
      center: {
        address: resolvedAddress,
        latitude: centerLat,
        longitude: centerLon,
        radiusKm: Number(radiusKm),
      },
      source,
      cached,
      warning: error,
      totalFound: savedLeads.length,
      leads: savedLeads,
    });
  } catch (error: any) {
    console.error('Finder API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while discovering businesses.',
      },
      { status: 500 }
    );
  }
}
