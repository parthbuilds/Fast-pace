import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    const whereClause: any = {};
    if (leadId) whereClause.leadId = leadId;

    const proposals = await prisma.proposal.findMany({
      where: whereClause,
      include: {
        lead: {
          include: { business: true },
        },
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, proposals });
  } catch (error: any) {
    console.error('Fetch proposals error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leadId,
      clientId,
      title,
      problemStatement,
      proposedSolution,
      scopeFeatures,
      timelineWeeks = 3,
      price,
      currency = 'USD',
      paymentSchedule,
      maintenanceTerms,
      termsConditions,
      status = 'DRAFT',
    } = body;

    if (!title || !problemStatement || !proposedSolution || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required proposal fields' },
        { status: 400 }
      );
    }

    // Default payment schedule if not custom
    const calculatedSchedule = paymentSchedule || [
      { milestone: 'Project Kickoff & Design Approval', percentage: 50, amount: Number(price) * 0.5 },
      { milestone: 'Testing Signoff & UAT', percentage: 30, amount: Number(price) * 0.3 },
      { milestone: 'Production Launch & Handover', percentage: 20, amount: Number(price) * 0.2 },
    ];

    const proposal = await prisma.proposal.create({
      data: {
        leadId: leadId || null,
        clientId: clientId || null,
        title,
        problemStatement,
        proposedSolution,
        scopeFeatures: Array.isArray(scopeFeatures) ? JSON.stringify(scopeFeatures) : scopeFeatures,
        timelineWeeks: Number(timelineWeeks),
        price: Number(price),
        currency,
        paymentSchedule: JSON.stringify(calculatedSchedule),
        maintenanceTerms: maintenanceTerms || '30 days of bug fixes and performance monitoring included after launch.',
        termsConditions: termsConditions || 'All intellectual property and source code transferred upon final milestone settlement.',
        status,
        sentAt: status === 'SENT' ? new Date() : null,
      },
      include: {
        lead: { include: { business: true } },
        client: true,
      },
    });

    // If attached to a Lead, update status to PROPOSAL_SENT
    if (leadId && status === 'SENT') {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'PROPOSAL_SENT', estimatedValue: Number(price) },
      });

      await prisma.interaction.create({
        data: {
          leadId,
          type: 'PROPOSAL',
          summary: `Created & Sent Proposal: ${title}`,
          details: `Quoted: $${price} (${timelineWeeks} weeks delivery).`,
          sentiment: 'POSITIVE',
        },
      });
    }

    return NextResponse.json({ success: true, proposal });
  } catch (error: any) {
    console.error('Create proposal error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
