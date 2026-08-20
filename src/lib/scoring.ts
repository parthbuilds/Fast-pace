export interface ScoringInputs {
  categoryGroup: string;
  categoryName: string;
  distanceKm?: number | null;
  hasPhone: boolean;
  hasWebsite: boolean;
  hasEmail?: boolean;
  hasOpeningHours?: boolean;
  rating?: number | null;
  reviewCount?: number | null;
  auditData?: {
    websiteStatus?: string;
    hasBooking?: boolean;
    hasOnlineOrdering?: boolean;
    hasWhatsApp?: boolean;
    hasContactForm?: boolean;
    isHttps?: boolean;
    mobileFriendly?: boolean;
  };
}

export function calculateScores(inputs: ScoringInputs): {
  leadScore: number;
  opportunityScore: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  breakdown: {
    leadFactors: Array<{ label: string; points: number }>;
    opportunityFactors: Array<{ label: string; points: number }>;
  };
} {
  let leadScore = 20; // baseline
  let opportunityScore = 15; // baseline

  const leadFactors: Array<{ label: string; points: number }> = [];
  const opportunityFactors: Array<{ label: string; points: number }> = [];

  const highTicketGroups = ['Health', 'Hospitality', 'Professional Services', 'Events'];
  const isHighTicket = highTicketGroups.includes(inputs.categoryGroup);

  // 1. Lead Score Factors
  if (inputs.hasPhone) {
    leadScore += 25;
    leadFactors.push({ label: 'Direct Phone Available', points: 25 });
  }

  if (inputs.hasWebsite) {
    leadScore += 20;
    leadFactors.push({ label: 'Web Presence Established', points: 20 });
  }

  if (isHighTicket) {
    leadScore += 20;
    leadFactors.push({ label: 'High-Value Industry Tier', points: 20 });
  }

  if (inputs.distanceKm !== undefined && inputs.distanceKm !== null) {
    if (inputs.distanceKm <= 3.0) {
      leadScore += 15;
      leadFactors.push({ label: 'Within 3 km Proximity', points: 15 });
    } else if (inputs.distanceKm <= 7.0) {
      leadScore += 10;
      leadFactors.push({ label: 'Within 7 km Local Radius', points: 10 });
    }
  }

  if (inputs.hasOpeningHours) {
    leadScore += 10;
    leadFactors.push({ label: 'Active Business Hours Listed', points: 10 });
  }

  if (inputs.rating && inputs.rating >= 4.0) {
    leadScore += 10;
    leadFactors.push({ label: 'Strong Local Reputation (4.0+)', points: 10 });
  }

  // 2. Opportunity Score Factors
  if (!inputs.hasWebsite) {
    opportunityScore += 30;
    opportunityFactors.push({ label: 'No Website Listed (+30)', points: 30 });
  } else if (inputs.auditData?.websiteStatus === 'NEEDS_IMPROVEMENT') {
    opportunityScore += 20;
    opportunityFactors.push({ label: 'Website Needs Improvement (+20)', points: 20 });
  } else if (inputs.hasWebsite && (inputs.auditData?.websiteStatus === 'AVERAGE' || !inputs.auditData?.websiteStatus)) {
    opportunityScore += 10;
    opportunityFactors.push({ label: 'Website Optimization Potential (+10)', points: 10 });
  }

  // Voice Agent Opportunity Check
  const bookingIntensiveGroups = ['Health', 'Beauty', 'Hospitality', 'Fitness', 'Professional Services'];
  if (inputs.hasPhone && bookingIntensiveGroups.includes(inputs.categoryGroup)) {
    opportunityScore += 25;
    opportunityFactors.push({ label: 'AI Voice Receptionist Candidate (+25)', points: 25 });
  }

  if (inputs.categoryGroup === 'Health' || inputs.categoryGroup === 'Beauty' || inputs.categoryGroup === 'Fitness') {
    if (!inputs.auditData?.hasBooking) {
      opportunityScore += 20;
      opportunityFactors.push({ label: 'Appointment Business Without Booking (+20)', points: 20 });
    }
  }

  if (inputs.categoryGroup === 'Food') {
    if (!inputs.auditData?.hasOnlineOrdering) {
      opportunityScore += 15;
      opportunityFactors.push({ label: 'Food Outlet Without Direct Ordering (+15)', points: 15 });
    }
  }

  if (!inputs.auditData?.hasWhatsApp) {
    opportunityScore += 15;
    opportunityFactors.push({ label: 'No Instant WhatsApp Workflow (+15)', points: 15 });
  }

  if (!inputs.auditData?.hasContactForm && !inputs.hasEmail) {
    opportunityScore += 10;
    opportunityFactors.push({ label: 'Missing Online Enquiry Channel (+10)', points: 10 });
  }

  if (isHighTicket) {
    opportunityScore += 15;
    opportunityFactors.push({ label: 'High Budget Category Potential (+15)', points: 15 });
  }

  if (inputs.hasPhone) {
    opportunityScore += 5;
    opportunityFactors.push({ label: 'Phone Reachable (+5)', points: 5 });
  }

  if (inputs.distanceKm !== undefined && inputs.distanceKm !== null && inputs.distanceKm <= 3.0) {
    opportunityScore += 10;
    opportunityFactors.push({ label: 'Walk-in / Fast In-Person Meeting (+10)', points: 10 });
  }

  const boundedLeadScore = Math.min(100, Math.max(10, leadScore));
  const boundedOpportunityScore = Math.min(100, Math.max(10, opportunityScore));

  let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
  if (boundedOpportunityScore >= 80 && inputs.hasPhone) {
    priority = 'URGENT';
  } else if (boundedOpportunityScore >= 70) {
    priority = 'HIGH';
  } else if (boundedOpportunityScore <= 40) {
    priority = 'LOW';
  }

  return {
    leadScore: boundedLeadScore,
    opportunityScore: boundedOpportunityScore,
    priority,
    breakdown: {
      leadFactors,
      opportunityFactors,
    },
  };
}
