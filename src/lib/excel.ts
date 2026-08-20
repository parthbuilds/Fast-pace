import ExcelJS from 'exceljs';

export interface LeadExportData {
  business: {
    id: string;
    name: string;
    category: string;
    subcategory?: string | null;
    address?: string | null;
    area?: string | null;
    city?: string | null;
    distanceKm?: number | null;
    phone?: string | null;
    website?: string | null;
    email?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    mapsUrl?: string | null;
    source: string;
    createdAt: Date;
  };
  lead: {
    id: string;
    status: string;
    leadScore: number;
    opportunityScore: number;
    priority: string;
    estimatedValue?: number | null;
    qualificationStatus?: string | null;
    hasProblem?: string | null;
    decisionMaker?: string | null;
    budgetPotential?: string | null;
    urgency?: string | null;
    notes?: string | null;
    lastContactedAt?: Date | null;
    nextFollowUpAt?: Date | null;
  };
  audit?: {
    websiteStatus: string;
    isHttps: boolean;
    mobileFriendly: boolean;
    hasWhatsApp: boolean;
    hasBooking: boolean;
    hasOnlineOrdering: boolean;
    overallScore: number;
    summaryText?: string | null;
  } | null;
  topOpportunity?: string | null;
  discovery?: {
    employeesCount?: number | null;
    locationsCount?: number | null;
    usesExcel: boolean;
    usesWhatsApp: boolean;
    usesCrm: boolean;
    manualWorkBottlenecks?: string | null;
    mvpScope?: string | null;
    phase2Scope?: string | null;
    expectedBenefits?: string | null;
  } | null;
}

export async function generateFullWorkbook(leads: LeadExportData[]): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Fast Pace — Local Business Sales OS';
  workbook.created = new Date();

  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Slate 800
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };

  // -------------------------------------------------------------
  // Sheet 1: Raw Leads
  // -------------------------------------------------------------
  const wsLeads = workbook.addWorksheet('Leads', { views: [{ state: 'frozen', ySplit: 1 }] });
  wsLeads.columns = [
    { header: 'Business Name', key: 'name', width: 28 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Subcategory', key: 'subcategory', width: 18 },
    { header: 'Address', key: 'address', width: 32 },
    { header: 'Area', key: 'area', width: 18 },
    { header: 'City', key: 'city', width: 15 },
    { header: 'Distance (KM)', key: 'distance', width: 14 },
    { header: 'Phone', key: 'phone', width: 18 },
    { header: 'Website', key: 'website', width: 28 },
    { header: 'Email', key: 'email', width: 24 },
    { header: 'Rating', key: 'rating', width: 10 },
    { header: 'Reviews', key: 'reviews', width: 10 },
    { header: 'Source', key: 'source', width: 16 },
    { header: 'Date Found', key: 'dateFound', width: 15 },
  ];

  leads.forEach((l) => {
    wsLeads.addRow({
      name: l.business.name,
      category: l.business.category,
      subcategory: l.business.subcategory || '—',
      address: l.business.address || '—',
      area: l.business.area || '—',
      city: l.business.city || '—',
      distance: l.business.distanceKm !== null ? Number(l.business.distanceKm) : '—',
      phone: l.business.phone || '—',
      website: l.business.website || '—',
      email: l.business.email || '—',
      rating: l.business.rating || '—',
      reviews: l.business.reviewCount || '—',
      source: l.business.source,
      dateFound: l.business.createdAt ? new Date(l.business.createdAt).toISOString().split('T')[0] : '—',
    });
  });

  // -------------------------------------------------------------
  // Sheet 2: Business Intelligence & Audit
  // -------------------------------------------------------------
  const wsBI = workbook.addWorksheet('Business Intelligence', { views: [{ state: 'frozen', ySplit: 1 }] });
  wsBI.columns = [
    { header: 'Business Name', key: 'name', width: 28 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Lead Score', key: 'leadScore', width: 12 },
    { header: 'Opp. Score', key: 'oppScore', width: 12 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Website State', key: 'webStatus', width: 20 },
    { header: 'HTTPS', key: 'https', width: 10 },
    { header: 'Mobile Friendly', key: 'mobile', width: 14 },
    { header: 'WhatsApp Found', key: 'whatsapp', width: 16 },
    { header: 'Booking System', key: 'booking', width: 16 },
    { header: 'Online Ordering', key: 'ordering', width: 16 },
    { header: 'Top Detected Opportunity', key: 'opportunity', width: 34 },
    { header: 'Audit Summary', key: 'auditSummary', width: 45 },
  ];

  leads.forEach((l) => {
    wsBI.addRow({
      name: l.business.name,
      category: l.business.category,
      leadScore: l.lead.leadScore,
      oppScore: l.lead.opportunityScore,
      priority: l.lead.priority,
      webStatus: l.audit?.websiteStatus || (l.business.website ? 'UNABLE_TO_ASSESS' : 'NO_WEBSITE'),
      https: l.audit?.isHttps ? 'YES' : 'NO',
      mobile: l.audit?.mobileFriendly ? 'YES' : 'NO',
      whatsapp: l.audit?.hasWhatsApp ? 'YES' : 'NO',
      booking: l.audit?.hasBooking ? 'YES' : 'NO',
      ordering: l.audit?.hasOnlineOrdering ? 'YES' : 'NO',
      opportunity: l.topOpportunity || 'Custom Software Solution',
      auditSummary: l.audit?.summaryText || 'Audit pending or baseline assessment.',
    });
  });

  // -------------------------------------------------------------
  // Sheet 3: Outreach CRM & Pipeline
  // -------------------------------------------------------------
  const wsCRM = workbook.addWorksheet('CRM Pipeline', { views: [{ state: 'frozen', ySplit: 1 }] });
  wsCRM.columns = [
    { header: 'Business Name', key: 'name', width: 28 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Est. Value ($)', key: 'estValue', width: 15 },
    { header: 'Qualification', key: 'qualification', width: 16 },
    { header: 'Decision Maker', key: 'decisionMaker', width: 15 },
    { header: 'Last Contacted', key: 'lastContact', width: 16 },
    { header: 'Next Follow-Up', key: 'nextFollowUp', width: 16 },
    { header: 'Phone', key: 'phone', width: 18 },
    { header: 'Notes', key: 'notes', width: 35 },
  ];

  leads.forEach((l) => {
    wsCRM.addRow({
      name: l.business.name,
      status: l.lead.status,
      priority: l.lead.priority,
      estValue: l.lead.estimatedValue || 1500,
      qualification: l.lead.qualificationStatus || 'PENDING',
      decisionMaker: l.lead.decisionMaker || 'UNKNOWN',
      lastContact: l.lead.lastContactedAt ? new Date(l.lead.lastContactedAt).toISOString().split('T')[0] : '—',
      nextFollowUp: l.lead.nextFollowUpAt ? new Date(l.lead.nextFollowUpAt).toISOString().split('T')[0] : '—',
      phone: l.business.phone || '—',
      notes: l.lead.notes || '—',
    });
  });

  // -------------------------------------------------------------
  // Sheet 4: Discovery Sessions
  // -------------------------------------------------------------
  const wsDisc = workbook.addWorksheet('Discovery', { views: [{ state: 'frozen', ySplit: 1 }] });
  wsDisc.columns = [
    { header: 'Business Name', key: 'name', width: 28 },
    { header: 'Employees', key: 'employees', width: 12 },
    { header: 'Locations', key: 'locations', width: 12 },
    { header: 'Current Tools', key: 'tools', width: 25 },
    { header: 'Main Bottleneck / Problem', key: 'bottleneck', width: 35 },
    { header: 'Recommended MVP Scope', key: 'mvp', width: 35 },
    { header: 'Phase 2 Expansion', key: 'phase2', width: 30 },
    { header: 'Expected Benefits', key: 'benefits', width: 35 },
  ];

  leads.forEach((l) => {
    const disc = l.discovery;
    if (disc) {
      const tools: string[] = [];
      if (disc.usesExcel) tools.push('Excel');
      if (disc.usesWhatsApp) tools.push('WhatsApp');
      if (disc.usesCrm) tools.push('CRM');

      wsDisc.addRow({
        name: l.business.name,
        employees: disc.employeesCount || '—',
        locations: disc.locationsCount || 1,
        tools: tools.length ? tools.join(', ') : 'Manual / Paper',
        bottleneck: disc.manualWorkBottlenecks || '—',
        mvp: disc.mvpScope || '—',
        phase2: disc.phase2Scope || '—',
        benefits: disc.expectedBenefits || '—',
      });
    }
  });

  // -------------------------------------------------------------
  // Sheet 5: Summary Dashboard
  // -------------------------------------------------------------
  const wsSummary = workbook.addWorksheet('Summary');
  wsSummary.columns = [
    { header: 'Metric', key: 'metric', width: 35 },
    { header: 'Count / Value', key: 'val', width: 20 },
  ];

  const totalLeads = leads.length;
  const contactedCount = leads.filter((l) => ['CONTACTED', 'WHATSAPP_SENT', 'CALLED', 'INTERESTED', 'PROPOSAL_SENT', 'WON'].includes(l.lead.status)).length;
  const interestedCount = leads.filter((l) => l.lead.status === 'INTERESTED').length;
  const proposalCount = leads.filter((l) => l.lead.status === 'PROPOSAL_SENT').length;
  const wonCount = leads.filter((l) => l.lead.status === 'WON').length;
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.lead.estimatedValue || 0), 0);
  const avgOppScore = totalLeads ? Math.round(leads.reduce((sum, l) => sum + l.lead.opportunityScore, 0) / totalLeads) : 0;
  const withPhone = leads.filter((l) => Boolean(l.business.phone)).length;
  const withWebsite = leads.filter((l) => Boolean(l.business.website)).length;
  const withoutWebsite = totalLeads - withWebsite;

  const summaryRows = [
    { metric: 'Total Discovered Leads', val: totalLeads },
    { metric: 'Leads with Phone Number', val: withPhone },
    { metric: 'Leads with Website', val: withWebsite },
    { metric: 'Businesses Without Website (Prime Prospects)', val: withoutWebsite },
    { metric: 'Average Opportunity Score (0-100)', val: `${avgOppScore} / 100` },
    { metric: 'Leads Contacted / In Progress', val: contactedCount },
    { metric: 'Interested Leads', val: interestedCount },
    { metric: 'Proposals Pending', val: proposalCount },
    { metric: 'Closed Won Clients', val: wonCount },
    { metric: 'Estimated Total Pipeline Value', val: `$${totalPipelineValue.toLocaleString()}` },
  ];

  summaryRows.forEach((r) => wsSummary.addRow(r));

  // Style all headers
  [wsLeads, wsBI, wsCRM, wsDisc, wsSummary].forEach((sheet) => {
    sheet.getRow(1).eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
    sheet.getRow(1).height = 28;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.border = borderStyle;
        });
      }
    });
  });

  return await workbook.xlsx.writeBuffer();
}
