import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const priority = searchParams.get('priority') || '';
    const budgetPotential = searchParams.get('budgetPotential') || '';
    const qualificationStatus = searchParams.get('qualificationStatus') || '';
    const hasPhone = searchParams.get('hasPhone');
    const hasWebsite = searchParams.get('hasWebsite');
    const minOpportunityScore = searchParams.get('minOppScore');
    const sortBy = searchParams.get('sortBy') || 'opportunityScore';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (priority && priority !== 'ALL') {
      whereClause.priority = priority;
    }

    if (budgetPotential && budgetPotential !== 'ALL') {
      whereClause.budgetPotential = budgetPotential;
    }

    if (qualificationStatus && qualificationStatus !== 'ALL') {
      whereClause.qualificationStatus = qualificationStatus;
    }

    if (minOpportunityScore) {
      whereClause.opportunityScore = { gte: parseInt(minOpportunityScore, 10) };
    }

    // Business Filters
    const businessConditions: any = {};

    if (category && category !== 'ALL') {
      businessConditions.category = category;
    }

    if (hasPhone === 'true') {
      businessConditions.phone = { not: null, notIn: [''] };
    } else if (hasPhone === 'false') {
      businessConditions.OR = [{ phone: null }, { phone: '' }];
    }

    if (hasWebsite === 'true') {
      businessConditions.website = { not: null, notIn: [''] };
    } else if (hasWebsite === 'false') {
      businessConditions.OR = [{ website: null }, { website: '' }];
    }

    if (search) {
      businessConditions.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { area: { contains: search } },
        { city: { contains: search } },
        { phone: { contains: search } },
        { category: { contains: search } },
      ];
    }

    if (Object.keys(businessConditions).length > 0) {
      whereClause.business = businessConditions;
    }

    // Sorting
    let orderBy: any = { opportunityScore: 'desc' };
    if (sortBy === 'leadScore') {
      orderBy = { leadScore: sortOrder };
    } else if (sortBy === 'opportunityScore') {
      orderBy = { opportunityScore: sortOrder };
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder };
    } else if (sortBy === 'distance') {
      orderBy = { business: { distanceKm: sortOrder } };
    } else if (sortBy === 'name') {
      orderBy = { business: { name: sortOrder } };
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        business: true,
        audit: true,
        opportunities: {
          take: 3,
        },
        followUps: {
          where: { status: 'PENDING' },
          take: 1,
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy,
      take: 150,
    });

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error: any) {
    console.error('Fetch leads error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, priority, estimatedValue, qualificationStatus } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(priority ? { priority } : {}),
        ...(estimatedValue !== undefined ? { estimatedValue: Number(estimatedValue) } : {}),
        ...(qualificationStatus !== undefined ? { qualificationStatus } : {}),
      },
      include: {
        business: true,
      },
    });

    // If status changed to WON, ensure Client record is created
    if (status === 'WON') {
      const existingClient = await prisma.client.findUnique({
        where: { leadId: updated.id },
      });

      if (!existingClient) {
        await prisma.client.create({
          data: {
            leadId: updated.id,
            businessId: updated.businessId,
            clientName: updated.business.name,
            businessName: updated.business.name,
            phone: updated.business.phone,
            email: updated.business.email,
            website: updated.business.website,
            industry: updated.business.category,
            location: updated.business.address,
            status: 'ACTIVE',
            totalBilled: updated.estimatedValue || 1500,
          },
        });
      }
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    console.error('Update lead error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update lead' },
      { status: 500 }
    );
  }
}
