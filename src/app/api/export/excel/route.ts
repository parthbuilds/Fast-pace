import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateFullWorkbook, LeadExportData } from '@/lib/excel';

export async function GET(req: NextRequest) {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        business: true,
        audit: true,
        opportunities: {
          take: 1,
          orderBy: { confidenceScore: 'desc' },
        },
        discoveries: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { opportunityScore: 'desc' },
    });

    const exportData: LeadExportData[] = leads.map((l) => ({
      business: {
        id: l.business.id,
        name: l.business.name,
        category: l.business.category,
        subcategory: l.business.subcategory,
        address: l.business.address,
        area: l.business.area,
        city: l.business.city,
        distanceKm: l.business.distanceKm,
        phone: l.business.phone,
        website: l.business.website,
        email: l.business.email,
        rating: l.business.rating,
        reviewCount: l.business.reviewCount,
        mapsUrl: l.business.mapsUrl,
        source: l.business.source,
        createdAt: l.business.createdAt,
      },
      lead: {
        id: l.id,
        status: l.status,
        leadScore: l.leadScore,
        opportunityScore: l.opportunityScore,
        priority: l.priority,
        estimatedValue: l.estimatedValue,
        qualificationStatus: l.qualificationStatus,
        hasProblem: l.hasProblem,
        decisionMaker: l.decisionMaker,
        budgetPotential: l.budgetPotential,
        urgency: l.urgency,
        notes: l.notes,
        lastContactedAt: l.lastContactedAt,
        nextFollowUpAt: l.nextFollowUpAt,
      },
      audit: l.audit
        ? {
            websiteStatus: l.audit.websiteStatus,
            isHttps: l.audit.isHttps,
            mobileFriendly: l.audit.mobileFriendly,
            hasWhatsApp: l.audit.hasWhatsApp,
            hasBooking: l.audit.hasBooking,
            hasOnlineOrdering: l.audit.hasOnlineOrdering,
            overallScore: l.audit.overallScore,
            summaryText: l.audit.summaryText,
          }
        : null,
      topOpportunity: l.opportunities.length > 0 ? l.opportunities[0].title : null,
      discovery: l.discoveries.length > 0
        ? {
            employeesCount: l.discoveries[0].employeesCount,
            locationsCount: l.discoveries[0].locationsCount,
            usesExcel: l.discoveries[0].usesExcel,
            usesWhatsApp: l.discoveries[0].usesWhatsApp,
            usesCrm: l.discoveries[0].usesCrm,
            manualWorkBottlenecks: l.discoveries[0].manualWorkBottlenecks,
            mvpScope: l.discoveries[0].mvpScope,
            phase2Scope: l.discoveries[0].phase2Scope,
            expectedBenefits: l.discoveries[0].expectedBenefits,
          }
        : null,
    }));

    const buffer = await generateFullWorkbook(exportData);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `FastPace_Sales_OS_Export_${dateStr}.xlsx`;

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Excel export error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
