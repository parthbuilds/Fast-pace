import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { type, summary, details, sentiment, newStatus, followUpDate, followUpReason } = body;

    if (!summary) {
      return NextResponse.json({ success: false, error: 'Summary is required' }, { status: 400 });
    }

    // 1. Create Interaction
    const interaction = await prisma.interaction.create({
      data: {
        leadId: id,
        type: type || 'NOTE',
        summary,
        details: details || null,
        sentiment: sentiment || 'NEUTRAL',
      },
    });

    // 2. Update Lead last contacted & status
    const updateData: any = {
      lastContactedAt: new Date(),
    };

    if (newStatus) {
      updateData.status = newStatus;
    }

    if (followUpDate) {
      updateData.nextFollowUpAt = new Date(followUpDate);

      // Create or update follow-up
      await prisma.followUp.create({
        data: {
          leadId: id,
          dueDate: new Date(followUpDate),
          reason: followUpReason || summary,
          notes: details || null,
          status: 'PENDING',
        },
      });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        business: true,
      },
    });

    return NextResponse.json({
      success: true,
      interaction,
      lead: updatedLead,
    });
  } catch (error: any) {
    console.error('Log interaction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to log interaction' },
      { status: 500 }
    );
  }
}
