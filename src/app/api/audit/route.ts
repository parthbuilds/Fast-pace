import { NextRequest, NextResponse } from 'next/server';
import { runDigitalAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { calculateScores } from '@/lib/scoring';
import { detectOpportunitiesForBusiness } from '@/lib/intelligence';
import { CATEGORIES } from '@/lib/categories';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, url } = body;

    let targetUrl = url;
    let lead: any = null;

    if (leadId) {
      lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { business: true, audit: true },
      });

      if (lead && !targetUrl) {
        targetUrl = lead.business.website;
      }
    }

    const auditResult = await runDigitalAudit(targetUrl);

    // If leadId is provided, persist audit in database and refresh scores
    if (lead) {
      await prisma.businessAudit.upsert({
        where: { leadId: lead.id },
        update: {
          websiteStatus: auditResult.websiteStatus,
          isReachable: auditResult.isReachable,
          isHttps: auditResult.isHttps,
          mobileFriendly: auditResult.mobileFriendly,
          hasContactInfo: auditResult.hasContactInfo,
          hasPhoneVisible: auditResult.hasPhoneVisible,
          hasWhatsApp: auditResult.hasWhatsApp,
          hasEmail: auditResult.hasEmail,
          hasContactForm: auditResult.hasContactForm,
          hasBooking: auditResult.hasBooking,
          hasOnlineOrdering: auditResult.hasOnlineOrdering,
          hasEcommerce: auditResult.hasEcommerce,
          hasPayment: auditResult.hasPayment,
          socialLinks: JSON.stringify(auditResult.socialLinks),
          pageTitle: auditResult.pageTitle,
          metaDescription: auditResult.metaDescription,
          seoSignalsScore: auditResult.seoSignalsScore,
          overallScore: auditResult.overallScore,
          summaryText: auditResult.summaryText,
          lastAuditedAt: new Date(),
        },
        create: {
          leadId: lead.id,
          websiteStatus: auditResult.websiteStatus,
          isReachable: auditResult.isReachable,
          isHttps: auditResult.isHttps,
          mobileFriendly: auditResult.mobileFriendly,
          hasContactInfo: auditResult.hasContactInfo,
          hasPhoneVisible: auditResult.hasPhoneVisible,
          hasWhatsApp: auditResult.hasWhatsApp,
          hasEmail: auditResult.hasEmail,
          hasContactForm: auditResult.hasContactForm,
          hasBooking: auditResult.hasBooking,
          hasOnlineOrdering: auditResult.hasOnlineOrdering,
          hasEcommerce: auditResult.hasEcommerce,
          hasPayment: auditResult.hasPayment,
          socialLinks: JSON.stringify(auditResult.socialLinks),
          pageTitle: auditResult.pageTitle,
          metaDescription: auditResult.metaDescription,
          seoSignalsScore: auditResult.seoSignalsScore,
          overallScore: auditResult.overallScore,
          summaryText: auditResult.summaryText,
        },
      });

      // Recalculate scores with new audit signals
      const matchedCat = CATEGORIES.find(
        (c) => c.name.toLowerCase() === lead.business.category.toLowerCase()
      ) || { group: 'Food', name: lead.business.category };

      const updatedScores = calculateScores({
        categoryGroup: matchedCat.group,
        categoryName: lead.business.category,
        distanceKm: lead.business.distanceKm,
        hasPhone: Boolean(lead.business.phone),
        hasWebsite: Boolean(targetUrl),
        hasEmail: Boolean(lead.business.email || auditResult.hasEmail),
        auditData: auditResult,
      });

      // Update lead scores
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          leadScore: updatedScores.leadScore,
          opportunityScore: updatedScores.opportunityScore,
          priority: updatedScores.priority,
          budgetPotential: updatedScores.budgetPotential,
          qualificationStatus: updatedScores.qualificationStatus,
          estimatedValue: updatedScores.estimatedValue,
        },
      });

      // Refresh opportunities
      const freshOpps = detectOpportunitiesForBusiness(
        lead.business.category,
        matchedCat.group,
        Boolean(targetUrl),
        Boolean(lead.business.phone),
        auditResult
      );

      // Delete old & insert updated opportunities
      await prisma.opportunity.deleteMany({ where: { leadId: lead.id } });
      for (const opp of freshOpps) {
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

      // Log interaction
      await prisma.interaction.create({
        data: {
          leadId: lead.id,
          type: 'NOTE',
          summary: `Completed Digital Opportunity Audit: ${auditResult.websiteStatus}`,
          details: auditResult.summaryText,
        },
      });
    }

    return NextResponse.json({
      success: true,
      audit: auditResult,
    });
  } catch (error: any) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Audit execution failed' },
      { status: 500 }
    );
  }
}
