import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        business: true,
        audit: true,
        opportunities: {
          orderBy: { confidenceScore: 'desc' },
        },
        interactions: {
          orderBy: { conductedAt: 'desc' },
        },
        followUps: {
          orderBy: { dueDate: 'asc' },
        },
        discoveries: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        proposals: {
          orderBy: { createdAt: 'desc' },
        },
        client: {
          include: {
            projects: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error('Fetch lead 360 error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Lead removed successfully' });
  } catch (error: any) {
    console.error('Delete lead error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
