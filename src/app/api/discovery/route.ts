import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SOFTWARE_MODULES } from '@/lib/intelligence';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leadId,
      businessSummary,
      employeesCount,
      locationsCount,
      monthlyCustomers,
      contactMethods,
      leadSource,
      usesExcel,
      usesWhatsApp,
      usesCrm,
      usesBooking,
      hasWebsite,
      websiteManager,
      manualWorkBottlenecks,
      repetitiveDataEntry,
      enquiryLossPoints,
      delayCauses,
      mistakeCauses,
      customerComplaints,
      desiredReports,
      leadsPerMonth,
      responseSpeed,
      conversionRate,
      billingMethod,
      manualPaymentReminders,
      automationWishes,
    } = body;

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { business: true },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    // Heuristic Solution Scoping
    const cat = lead.business.category.toLowerCase();
    const recommendedModules: string[] = [];

    if (!hasWebsite) {
      recommendedModules.push('business_website');
    }

    if (usesWhatsApp || cat.includes('clinic') || cat.includes('salon') || cat.includes('gym')) {
      recommendedModules.push('whatsapp_automation');
    }

    if (cat.includes('clinic') || cat.includes('dentist') || cat.includes('salon') || cat.includes('spa')) {
      recommendedModules.push('appointment_booking');
    }

    if (cat.includes('restaurant') || cat.includes('cafe') || cat.includes('food') || cat.includes('bakery')) {
      recommendedModules.push('online_ordering_menu');
    }

    if (usesExcel || (employeesCount && employeesCount > 4) || enquiryLossPoints) {
      recommendedModules.push('lead_crm');
    }

    if (manualPaymentReminders || billingMethod) {
      recommendedModules.push('payment_billing');
    }

    if (recommendedModules.length === 0) {
      recommendedModules.push('business_website', 'whatsapp_automation');
    }

    // Synthesize structured summary
    const synthesizedProblem =
      manualWorkBottlenecks ||
      enquiryLossPoints ||
      `Manual workflow overhead and lack of unified digital booking for ${lead.business.name}.`;

    const currentProcessSummary = `Operations rely primarily on ${contactMethods || 'phone and walk-ins'}${
      usesExcel ? ', spreadsheets for record tracking' : ''
    }${usesWhatsApp ? ', and manual WhatsApp messaging' : ''}.`;

    const bottlenecksSummary = [
      manualWorkBottlenecks ? `Bottleneck: ${manualWorkBottlenecks}` : '',
      repetitiveDataEntry ? `Repetitive data entry: ${repetitiveDataEntry}` : '',
      enquiryLossPoints ? `Enquiry loss: ${enquiryLossPoints}` : '',
    ]
      .filter(Boolean)
      .join(' | ') || 'Manual communication delay during peak hours.';

    const mvpModules = SOFTWARE_MODULES.filter((m) => recommendedModules.slice(0, 2).includes(m.id));
    const phase2Modules = SOFTWARE_MODULES.filter((m) => recommendedModules.slice(2).includes(m.id));

    const mvpScope = mvpModules.map((m) => m.name).join(' + ');
    const phase2Scope = phase2Modules.map((m) => m.name).join(' + ') || 'Advanced Analytics Dashboard & Automated Review Booster';
    const recommendedSolution = `Deploy ${mvpScope} to directly eliminate manual bottlenecks and capture 24/7 digital demand.`;

    const expectedBenefits = `Eliminate repetitive data entry, accelerate enquiry response time from ${
      responseSpeed || 'several hours'
    } to instant 24/7 self-service, and reduce customer drop-offs.`;

    // Save Discovery in DB
    const discovery = await prisma.discovery.create({
      data: {
        leadId,
        businessSummary,
        employeesCount: employeesCount ? Number(employeesCount) : null,
        locationsCount: locationsCount ? Number(locationsCount) : 1,
        monthlyCustomers: monthlyCustomers ? Number(monthlyCustomers) : null,
        contactMethods,
        leadSource,
        usesExcel: Boolean(usesExcel),
        usesWhatsApp: Boolean(usesWhatsApp),
        usesCrm: Boolean(usesCrm),
        usesBooking: Boolean(usesBooking),
        hasWebsite: Boolean(hasWebsite),
        websiteManager,
        manualWorkBottlenecks,
        repetitiveDataEntry,
        enquiryLossPoints,
        delayCauses,
        mistakeCauses,
        customerComplaints,
        desiredReports,
        leadsPerMonth: leadsPerMonth ? Number(leadsPerMonth) : null,
        responseSpeed,
        conversionRate,
        billingMethod,
        manualPaymentReminders: Boolean(manualPaymentReminders),
        automationWishes,
        synthesizedProblem,
        currentProcessSummary,
        bottlenecksSummary,
        recommendedSolution,
        mvpScope,
        phase2Scope,
        expectedBenefits,
        recommendedModules: JSON.stringify(recommendedModules),
      },
    });

    // Update lead status to DISCOVERY_COMPLETED & upgrade qualification
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'DISCOVERY_COMPLETED',
        qualificationStatus: 'QUALIFIED',
        hasProblem: 'YES',
        decisionMaker: 'YES',
      },
    });

    // Log interaction
    await prisma.interaction.create({
      data: {
        leadId,
        type: 'MEETING',
        summary: 'Completed Client Discovery Session',
        details: `Identified MVP Scope: ${mvpScope}. Expected Solution: ${recommendedSolution}`,
        sentiment: 'POSITIVE',
      },
    });

    return NextResponse.json({
      success: true,
      discovery,
    });
  } catch (error: any) {
    console.error('Discovery API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save discovery' },
      { status: 500 }
    );
  }
}
