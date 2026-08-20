export interface SoftwareModule {
  id: string;
  name: string;
  category: 'web' | 'automation' | 'crm' | 'operations' | 'ai';
  description: string;
  estimatedWeeks: number;
  basePrice: number;
  highlightTag: string;
  techStack: string[];
  clientMonthlyCost: number;
  devSelfCost: number;
}

export const SOFTWARE_MODULES: SoftwareModule[] = [
  {
    id: 'business_website',
    name: 'Modern Business Website',
    category: 'web',
    description: 'High-converting responsive website with modern typography, SEO optimization, and mobile-first speed.',
    estimatedWeeks: 2,
    basePrice: 45000,
    highlightTag: 'Web Presence',
    techStack: ['Next.js', 'Vercel', 'Tailwind CSS', 'Framer Motion'],
    clientMonthlyCost: 1250,
    devSelfCost: 0,
  },
  {
    id: 'website_redesign',
    name: 'Website Redesign & Speed Optimization',
    category: 'web',
    description: 'Modernizing outdated visual design, fixing mobile responsiveness, and elevating brand authority.',
    estimatedWeeks: 2,
    basePrice: 35000,
    highlightTag: 'Modernization',
    techStack: ['Next.js', 'Lighthouse Optimization', 'Vercel'],
    clientMonthlyCost: 1250,
    devSelfCost: 0,
  },
  {
    id: 'appointment_booking',
    name: 'Online Appointment & Booking Engine',
    category: 'automation',
    description: 'Self-service calendar booking with real-time slot availability, intake questionnaires, and deposit handling.',
    estimatedWeeks: 2,
    basePrice: 55000,
    highlightTag: 'Booking',
    techStack: ['Cal.com API', 'Supabase Database', 'Stripe Payments'],
    clientMonthlyCost: 2400,
    devSelfCost: 0,
  },
  {
    id: 'whatsapp_automation',
    name: 'WhatsApp Automation & Instant Enquiry Router',
    category: 'automation',
    description: 'Instant lead capture from website, automated booking reminders, review requests, and catalog sharing via WhatsApp.',
    estimatedWeeks: 1,
    basePrice: 35000,
    highlightTag: 'WhatsApp',
    techStack: ['Meta Cloud API', 'Make.com Workflow', 'NodeJS Hooks'],
    clientMonthlyCost: 3750,
    devSelfCost: 750,
  },
  {
    id: 'lead_crm',
    name: 'Custom Lead CRM & Sales Tracker',
    category: 'crm',
    description: 'Centralized lead pipeline to stop lead leakage, track follow-up schedules, and record interaction history.',
    estimatedWeeks: 3,
    basePrice: 85000,
    highlightTag: 'Sales OS',
    techStack: ['NextJS Dashboard', 'Supabase Postgres', 'Prisma ORM'],
    clientMonthlyCost: 2000,
    devSelfCost: 0,
  },
  {
    id: 'online_ordering_menu',
    name: 'Direct Online Ordering & Digital Menu',
    category: 'web',
    description: 'Zero-commission direct ordering system with item modifiers, table QR ordering, and WhatsApp order alerts.',
    estimatedWeeks: 3,
    basePrice: 65000,
    highlightTag: 'Direct Sales',
    techStack: ['Next.js PWA', 'Supabase Database', 'Stripe checkout'],
    clientMonthlyCost: 2900,
    devSelfCost: 0,
  },
  {
    id: 'customer_loyalty',
    name: 'Customer Loyalty & Membership Portal',
    category: 'operations',
    description: 'Digital points tracker, tier benefits, renewal reminders, and VIP offer triggers to maximize lifetime value.',
    estimatedWeeks: 2,
    basePrice: 45000,
    highlightTag: 'Retention',
    techStack: ['Supabase DB', 'Clerk Auth', 'WhatsApp templates'],
    clientMonthlyCost: 1650,
    devSelfCost: 0,
  },
  {
    id: 'payment_billing',
    name: 'Payment Gateway & Automated Billing Reminders',
    category: 'operations',
    description: 'Stripe/UPI integration with instant receipts, payment link generation, and automated overdue nudges.',
    estimatedWeeks: 1,
    basePrice: 30000,
    highlightTag: 'Payments',
    techStack: ['Stripe API', 'Razorpay Checkout', 'Make.com Hooks'],
    clientMonthlyCost: 1250,
    devSelfCost: 0,
  },
  {
    id: 'analytics_dashboard',
    name: 'Business Analytics & Owner Dashboard',
    category: 'operations',
    description: 'Live charts tracking daily sales, lead sources, peak enquiry hours, staff capacity, and revenue trends.',
    estimatedWeeks: 2,
    basePrice: 55000,
    highlightTag: 'Intelligence',
    techStack: ['Tremor Charts', 'NextJS App', 'Tinybird Analytics'],
    clientMonthlyCost: 1650,
    devSelfCost: 0,
  },
  {
    id: 'ai_chatbot',
    name: '24/7 AI Customer Enquiry Assistant',
    category: 'ai',
    description: 'Trained AI assistant answering FAQs, checking service pricing, qualifying prospects, and collecting contact details.',
    estimatedWeeks: 2,
    basePrice: 50000,
    highlightTag: 'AI Automation',
    techStack: ['OpenAI Assistants API', 'Pinecone Vector DB', 'NextJS'],
    clientMonthlyCost: 2500,
    devSelfCost: 400,
  },
  {
    id: 'internal_portal',
    name: 'Internal Operations & Staff Management Portal',
    category: 'operations',
    description: 'Role-based portal for staff shift scheduling, task assignment, inventory alerts, and daily checklists.',
    estimatedWeeks: 4,
    basePrice: 95000,
    highlightTag: 'Internal Tool',
    techStack: ['NextJS Server Actions', 'Clerk Team auth', 'Supabase'],
    clientMonthlyCost: 2900,
    devSelfCost: 0,
  },
  {
    id: 'ai_voice_agent',
    name: '24/7 AI Phone Assistant & Voice Agent',
    category: 'ai',
    description: 'Conversational AI receptionist that answers calls instantly, answers business FAQs, qualifies callers, schedules bookings, and sends alerts.',
    estimatedWeeks: 2,
    basePrice: 90000,
    highlightTag: 'AI Voice',
    techStack: ['Vapi.ai SDK', 'Bland.ai API', 'Twilio Webhooks', 'Cal.com'],
    clientMonthlyCost: 6500,
    devSelfCost: 800,
  },
];

export interface IndustryOpportunityRule {
  industryKeywords: string[];
  opportunities: Array<{
    type: string;
    title: string;
    description: string;
    confidence: number;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    applicableModules: string[];
  }>;
}

export const INDUSTRY_OPPORTUNITY_RULES: Record<string, IndustryOpportunityRule> = {
  Food: {
    industryKeywords: ['restaurant', 'cafe', 'bakery', 'food', 'juice', 'fast_food', 'sweet'],
    opportunities: [
      {
        type: 'WEBSITE_REDESIGN',
        title: 'High-Converting Digital Menu & Brand Website',
        description: 'Modern mobile-first website showcasing signature dishes, ambience photos, and location hours.',
        confidence: 85,
        impact: 'HIGH',
        applicableModules: ['business_website', 'online_ordering_menu'],
      },
      {
        type: 'ONLINE_ORDERING',
        title: 'Direct Zero-Commission Online Ordering',
        description: 'Save 20-30% aggregator commissions with direct customer ordering and pickup/delivery coordination.',
        confidence: 90,
        impact: 'HIGH',
        applicableModules: ['online_ordering_menu', 'payment_billing'],
      },
      {
        type: 'WHATSAPP_WORKFLOW',
        title: 'WhatsApp Table Reservation & Menu Bot',
        description: 'Instant WhatsApp reservation confirmation and automated Google review requests post-dining.',
        confidence: 80,
        impact: 'MEDIUM',
        applicableModules: ['whatsapp_automation', 'customer_loyalty'],
      },
      {
        type: 'INTERNAL_OPERATIONS',
        title: 'Kitchen Inventory & Supplier Reorder Portal',
        description: 'Track daily ingredient depletion, batch costs, and supplier deliveries without Excel chaos.',
        confidence: 75,
        impact: 'MEDIUM',
        applicableModules: ['internal_portal', 'analytics_dashboard'],
      },
    ],
  },
  Health: {
    industryKeywords: ['clinic', 'dentist', 'dental', 'doctor', 'physiotherapy', 'diagnostic', 'pharmacy', 'health'],
    opportunities: [
      {
        type: 'APPOINTMENT_BOOKING',
        title: 'Self-Service Patient Appointment Scheduling',
        description: 'Allow patients to select doctor slots online, reducing front-desk telephone load.',
        confidence: 95,
        impact: 'HIGH',
        applicableModules: ['appointment_booking', 'whatsapp_automation'],
      },
      {
        type: 'WHATSAPP_AUTOMATION',
        title: 'Automated WhatsApp Appointment Reminders & Follow-Ups',
        description: 'Cut no-shows by 40% with automated day-before WhatsApp confirmations and post-visit care notes.',
        confidence: 95,
        impact: 'HIGH',
        applicableModules: ['whatsapp_automation'],
      },
      {
        type: 'PATIENT_CRM',
        title: 'Patient Treatment & Enquiry CRM',
        description: 'Centralized record of patient visits, consultation history, and automated prescription renewal reminders.',
        confidence: 85,
        impact: 'HIGH',
        applicableModules: ['lead_crm', 'internal_portal'],
      },
      {
        type: 'PATIENT_PORTAL',
        title: 'Online Lab Report Download Portal',
        description: 'Secure OTP-based patient portal to download test results and prescription history.',
        confidence: 80,
        impact: 'MEDIUM',
        applicableModules: ['business_website', 'payment_billing'],
      },
      {
        type: 'AI_VOICE_AGENT',
        title: '24/7 AI Clinic Call Assistant',
        description: 'Bypass missed client calls during busy clinic hours. Automatically handle patient bookings and patient queries over voice calls.',
        confidence: 90,
        impact: 'HIGH',
        applicableModules: ['ai_voice_agent', 'appointment_booking'],
      },
    ],
  },
  Beauty: {
    industryKeywords: ['salon', 'spa', 'beauty', 'hairdresser', 'barber', 'skin'],
    opportunities: [
      {
        type: 'APPOINTMENT_BOOKING',
        title: 'Stylist & Service Slot Booking System',
        description: 'Visual service menu with stylist selection, estimated duration, and advance slot booking.',
        confidence: 90,
        impact: 'HIGH',
        applicableModules: ['appointment_booking', 'business_website'],
      },
      {
        type: 'CUSTOMER_LOYALTY',
        title: 'WhatsApp Membership & Repeat Booking Engine',
        description: 'Automated 4-week haircut/service reminder and points balance updates directly on WhatsApp.',
        confidence: 90,
        impact: 'HIGH',
        applicableModules: ['whatsapp_automation', 'customer_loyalty'],
      },
      {
        type: 'STAFF_MANAGEMENT',
        title: 'Stylist Commission & Shift Management Portal',
        description: 'Track daily stylist service counts, tip tracking, and commission calculations automatically.',
        confidence: 75,
        impact: 'MEDIUM',
        applicableModules: ['internal_portal', 'analytics_dashboard'],
      },
      {
        type: 'AI_VOICE_AGENT',
        title: '24/7 AI Salon Call Receptionist',
        description: 'Auto-answer customer enquiries for treatments, stylist availability, and schedule bookings dynamically over phone.',
        confidence: 88,
        impact: 'HIGH',
        applicableModules: ['ai_voice_agent', 'appointment_booking'],
      },
    ],
  },
  Fitness: {
    industryKeywords: ['gym', 'fitness', 'yoga', 'sports', 'trainer'],
    opportunities: [
      {
        type: 'MEMBERSHIP_CRM',
        title: 'Gym Membership & Subscription Management CRM',
        description: 'Automated membership expiry alerts, recurring UPI/card payments, and lead enquiry tracking.',
        confidence: 92,
        impact: 'HIGH',
        applicableModules: ['lead_crm', 'payment_billing'],
      },
      {
        type: 'WHATSAPP_WORKFLOW',
        title: 'WhatsApp Trial Class Booking & Absentee Nudges',
        description: 'Capture trial pass requests and send motivational check-ins to members absent for 7+ days.',
        confidence: 85,
        impact: 'HIGH',
        applicableModules: ['whatsapp_automation'],
      },
      {
        type: 'TRAINER_PORTAL',
        title: 'Personal Trainer Schedule & Member Check-in Portal',
        description: 'Digital attendance logs, trainer session counters, and workout progress tracking.',
        confidence: 78,
        impact: 'MEDIUM',
        applicableModules: ['internal_portal', 'analytics_dashboard'],
      },
    ],
  },
  'Professional Services': {
    industryKeywords: ['lawyer', 'accountant', 'architect', 'interior', 'estate_agent', 'consultant', 'real_estate'],
    opportunities: [
      {
        type: 'LEAD_CRM',
        title: 'High-Ticket Lead Pipeline & Consultation Tracker',
        description: 'Track leads from Facebook/Instagram/Website, assign consultants, and track multi-month deal stages.',
        confidence: 95,
        impact: 'HIGH',
        applicableModules: ['lead_crm', 'business_website'],
      },
      {
        type: 'PORTFOLIO_WEBSITE',
        title: 'High-Authority Project Portfolio & Case Studies Website',
        description: 'Stunning visual showcase for high-ticket design/legal services that commands premium pricing.',
        confidence: 90,
        impact: 'HIGH',
        applicableModules: ['business_website'],
      },
      {
        type: 'DOCUMENT_AUTOMATION',
        title: 'Client Intake & Document Collection Portal',
        description: 'Secure checklist portal where clients upload KYC, floor plans, or tax records without messy email chains.',
        confidence: 82,
        impact: 'HIGH',
        applicableModules: ['internal_portal', 'payment_billing'],
      },
    ],
  },
  Education: {
    industryKeywords: ['coaching', 'tuition', 'school', 'institute', 'training', 'music', 'dance'],
    opportunities: [
      {
        type: 'ADMISSIONS_CRM',
        title: 'Student Admissions & Enquiry Pipeline CRM',
        description: 'Capture demo class registrations, automate parent callbacks, and prevent admission lead loss.',
        confidence: 92,
        impact: 'HIGH',
        applicableModules: ['lead_crm', 'whatsapp_automation'],
      },
      {
        type: 'FEE_PAYMENT',
        title: 'Online Fee Collection & Installment Reminders',
        description: 'Automated WhatsApp fee reminders with instant payment links and digital receipt generation.',
        confidence: 88,
        impact: 'HIGH',
        applicableModules: ['payment_billing', 'whatsapp_automation'],
      },
      {
        type: 'STUDENT_PORTAL',
        title: 'Batch Schedule & Attendance Portal',
        description: 'Manage class timetables, exam results, and student test score report cards.',
        confidence: 80,
        impact: 'MEDIUM',
        applicableModules: ['internal_portal', 'analytics_dashboard'],
      },
    ],
  },
  Hospitality: {
    industryKeywords: ['hotel', 'resort', 'guest_house', 'hostel'],
    opportunities: [
      {
        type: 'DIRECT_BOOKING',
        title: 'Direct Room Booking Engine (OTA Commission Saver)',
        description: 'Bypass 15-20% Booking.com/MakeMyTrip fees with a seamless direct website booking engine.',
        confidence: 95,
        impact: 'HIGH',
        applicableModules: ['appointment_booking', 'business_website', 'payment_billing'],
      },
      {
        type: 'WHATSAPP_CONCIERGE',
        title: 'WhatsApp Guest Concierge & Room Service Ordering',
        description: 'Digital room service menu with QR code in rooms sending food and housekeeping orders to reception.',
        confidence: 88,
        impact: 'HIGH',
        applicableModules: ['whatsapp_automation', 'online_ordering_menu'],
      },
      {
        type: 'REVIEW_AUTOMATION',
        title: 'Automated Post-Checkout Review Generator',
        description: 'Send personalized WhatsApp feedback requests at 11:00 AM checkout to surge 5-star Google reviews.',
        confidence: 85,
        impact: 'MEDIUM',
        applicableModules: ['whatsapp_automation'],
      },
      {
        type: 'AI_VOICE_AGENT',
        title: 'AI Hotel Desk Reservation Assistant',
        description: 'Answer customer phone enquiries regarding room rates, checkout hours, and send direct booking links via SMS.',
        confidence: 85,
        impact: 'HIGH',
        applicableModules: ['ai_voice_agent', 'appointment_booking'],
      },
    ],
  },
  Events: {
    industryKeywords: ['event', 'wedding', 'photographer', 'venue'],
    opportunities: [
      {
        type: 'QUOTE_CALCULATOR',
        title: 'Interactive Event Package & Quote Estimator',
        description: 'Allow clients to customize guest count, decor style, and get instant indicative pricing with lead capture.',
        confidence: 90,
        impact: 'HIGH',
        applicableModules: ['business_website', 'lead_crm'],
      },
      {
        type: 'CLIENT_GALLERY',
        title: 'Client Proofing & Digital Asset Portal',
        description: 'Private photo/video gallery portal for clients to select albums and download high-res files.',
        confidence: 85,
        impact: 'MEDIUM',
        applicableModules: ['internal_portal'],
      },
    ],
  },
};

export function detectOpportunitiesForBusiness(
  categoryName: string,
  groupName: string,
  hasWebsite: boolean,
  hasPhone: boolean,
  auditData?: {
    websiteStatus?: string;
    hasBooking?: boolean;
    hasWhatsApp?: boolean;
    hasContactForm?: boolean;
    hasOnlineOrdering?: boolean;
  }
) {
  const detected: Array<{
    type: string;
    title: string;
    description: string;
    confidenceScore: number;
    estimatedImpact: 'HIGH' | 'MEDIUM' | 'LOW';
    tags: string[];
  }> = [];

  const matchedGroup = INDUSTRY_OPPORTUNITY_RULES[groupName] || INDUSTRY_OPPORTUNITY_RULES['Food'];

  // Base rule 1: Website opportunity
  if (!hasWebsite) {
    detected.push({
      type: 'WEBSITE',
      title: 'New Modern Business Website',
      description: `Business has no official website listed on public registries. A dedicated website would establish instant credibility and capture local search demand in ${categoryName}.`,
      confidenceScore: 95,
      estimatedImpact: 'HIGH',
      tags: ['No Website', 'High Priority', 'Web Presence'],
    });
  } else if (auditData?.websiteStatus === 'NEEDS_IMPROVEMENT') {
    detected.push({
      type: 'REDESIGN',
      title: 'Website Redesign & Conversion Upgrade',
      description: `Existing web presence lacks modern mobile optimization, clear contact hooks, or speed standards. Redesign can double customer conversion.`,
      confidenceScore: 85,
      estimatedImpact: 'HIGH',
      tags: ['Redesign', 'Speed', 'SEO'],
    });
  }

  // Base rule 2: WhatsApp workflow
  if (!auditData?.hasWhatsApp) {
    detected.push({
      type: 'WHATSAPP',
      title: 'WhatsApp Instant Lead & Enquiry Integration',
      description: 'Connect direct 1-click WhatsApp chat and automated greetings to capture mobile visitors before they leave.',
      confidenceScore: 80,
      estimatedImpact: 'HIGH',
      tags: ['WhatsApp', 'Lead Capture'],
    });
  }

  // AI Voice Agent detection rule for booking-intensive groups
  const bookingIntensiveGroups = ['Health', 'Beauty', 'Hospitality', 'Fitness', 'Professional Services'];
  if (hasPhone && bookingIntensiveGroups.includes(groupName)) {
    detected.push({
      type: 'AI_VOICE_AGENT',
      title: '24/7 AI Phone Assistant & Receptionist',
      description: `Instantly answer phone calls for ${categoryName}, manage appointment scheduling, answer service FAQs, and capture warm client leads 24/7.`,
      confidenceScore: 88,
      estimatedImpact: 'HIGH',
      tags: ['Voice Agent', 'AI Automation', 'Call Capture'],
    });
  }

  // Base rule 3: Industry specific rules
  for (const rule of matchedGroup.opportunities) {
    if (rule.type === 'APPOINTMENT_BOOKING' && auditData?.hasBooking) continue;
    if (rule.type === 'ONLINE_ORDERING' && auditData?.hasOnlineOrdering) continue;

    detected.push({
      type: rule.type,
      title: rule.title,
      description: rule.description,
      confidenceScore: rule.confidence,
      estimatedImpact: rule.impact,
      tags: [groupName, categoryName],
    });
  }

  return detected.slice(0, 4); // return top 4 best opportunities
}
