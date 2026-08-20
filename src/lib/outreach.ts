export interface OutreachContext {
  developerName: string;
  agencyName?: string;
  businessName: string;
  category: string;
  area?: string;
  city?: string;
  websiteState: 'STRONG' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'NO_WEBSITE' | 'UNABLE_TO_ASSESS';
  detectedOpportunity: string;
  phone?: string;
  email?: string;
  serviceOffering?: string;
}

export interface GeneratedOutreach {
  tone: string;
  channel: 'whatsapp' | 'email' | 'call' | 'general';
  subject?: string;
  content: string;
  callTalkingPoints?: string[];
  waLink?: string;
  mailToLink?: string;
}

export function generateOutreachTemplates(ctx: OutreachContext): Record<string, GeneratedOutreach> {
  const loc = ctx.area || ctx.city || 'your area';
  const dev = ctx.developerName || 'Parth';
  const agency = ctx.agencyName ? ` from ${ctx.agencyName}` : '';
  const service = ctx.serviceOffering || 'modern websites and simple workflow automations';

  // Specific observation based on website state & opportunity
  let observation = '';
  let customService = service;

  const isVoiceAgentOpp = ctx.detectedOpportunity.toLowerCase().includes('voice') || ctx.detectedOpportunity.toLowerCase().includes('phone') || ctx.detectedOpportunity.toLowerCase().includes('receptionist') || ctx.detectedOpportunity.toLowerCase().includes('assistant');

  if (isVoiceAgentOpp) {
    observation = `I noticed you're active locally but might be missing incoming customer queries during peak operational hours. I put together a quick mockup of a 24/7 AI Phone Assistant that answers calls, answers FAQs, and books clients directly into your booking system so you never miss another lead.`;
    customService = 'AI customer support automation and voice assistant solutions';
  } else if (ctx.websiteState === 'NO_WEBSITE') {
    observation = `I noticed ${ctx.businessName} doesn't have a direct website listed yet. Local customers searching online in ${loc} might be having trouble finding your services or booking directly.`;
    customService = 'high-speed direct booking websites and client acquisition channels';
  } else if (ctx.websiteState === 'NEEDS_IMPROVEMENT') {
    observation = `I checked out your website and noticed a few quick opportunities to improve mobile load speeds, fix layout flaws, and add instant WhatsApp booking integrations.`;
    customService = 'modern website redesigns and high-converting client booking flows';
  } else {
    observation = `I came across ${ctx.businessName} while researching leading ${ctx.category.toLowerCase()} in ${loc}. You have a great local presence, and I noticed a neat opportunity to streamline your ${ctx.detectedOpportunity.toLowerCase()} and client workflow.`;
  }

  // 1. WhatsApp Message (Concise, conversational)
  const waContent = `Hi! I came across *${ctx.businessName}* while looking at ${ctx.category.toLowerCase()} in ${loc}.

${observation}

I build ${customService} that help businesses increase bookings and save manual staff time.

I put together a 2-minute idea on how you could get more direct enquiries without relying on third-party aggregators. 

Would you be open to a quick 5-minute chat sometime this week?

Best regards,  
${dev}${agency}`;

  // 2. Professional Tone (Email / LinkedIn)
  const proSubject = `Idea for ${ctx.businessName} — Streamlining client enquiries in ${loc}`;
  const proContent = `Hello Team ${ctx.businessName},

I hope this note finds you well.

My name is ${dev}${agency}. I build custom software, web platforms, and automated workflow systems for local businesses in ${ctx.city || 'the area'}.

While reviewing businesses in the ${ctx.category.toLowerCase()} sector, I took a look at ${ctx.businessName}. ${observation}

Specifically, implementing ${ctx.detectedOpportunity.toLowerCase()} could help:
• Capture enquiries 24/7 without manual back-and-forth
• Reduce missed customer calls during peak hours
• Centralize client follow-ups and repeat reminders

I would love to share a quick mock-up or walkthrough of how other local ${ctx.category.toLowerCase()} businesses handle this.

Are you available for a brief 10-minute discovery call on Tuesday or Thursday?

Best regards,

${dev}
Software Engineer & Solutions Consultant
${ctx.agencyName || ''}`;

  // 3. Friendly / Casual Tone
  const friendlyContent = `Hey ${ctx.businessName} team! 👋

I was exploring top ${ctx.category.toLowerCase()} around ${loc} and love what you've built with ${ctx.businessName}.

I'm an independent software developer nearby. ${observation}

I specialize in building quick, lightweight systems — like instant WhatsApp booking, digital menus, and automated reminder alerts — that take the manual headache off your staff.

I had a couple of ideas specifically for ${ctx.businessName}. Would you be up for a quick informal coffee or 5-minute phone call to see if it's a fit?

Cheers,  
${dev}`;

  // 4. Short / Direct Tone
  const shortContent = `Hi ${ctx.businessName}, I'm a local developer in ${loc}. 

${observation}

I build ${customService}. Would you be interested in a quick 5-minute call to see how a direct ${ctx.detectedOpportunity.toLowerCase()} system could bring you more direct clients?

Let me know if you're open to chatting.

Thanks,  
${dev}`;

  // 5. Follow-Up Message (Day 3-4)
  const followUpContent = `Hi there! Just following up on my previous note regarding ${ctx.businessName}. 

I know you're busy running daily operations, so no worries at all if now isn't the right time.

Just wanted to see if exploring ${ctx.detectedOpportunity.toLowerCase()} is something on your radar this quarter? Happy to send over a 1-page breakdown if that's easier.

Best,  
${dev}`;

  // Clean phone number for WhatsApp wa.me link
  let cleanPhone = ctx.phone?.replace(/[^0-9]/g, '') || '';
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`; // Default India prefix if 10 digit
  }

  const waLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waContent)}`
    : undefined;

  const mailToLink = ctx.email
    ? `mailto:${ctx.email}?subject=${encodeURIComponent(proSubject)}&body=${encodeURIComponent(proContent)}`
    : undefined;

  // Phone Call Talking Points
  const callTalkingPoints = [
    `Greeting: "Hi, this is ${dev}, a local software developer here in ${loc}. Am I speaking with the owner or manager of ${ctx.businessName}?"`,
    `Hook: "I'm calling because I noticed ${observation.toLowerCase()}"`,
    `Value Proposition: "I help local ${ctx.category.toLowerCase()} set up simple systems so customers can book or order directly on WhatsApp without staff taking manual calls."`,
    `Qualification: "How are you currently handling incoming customer enquiries when the team is busy?"`,
    `Call-To-Action: "I'm not asking you to buy anything today. Can I send over a quick 1-page preview on WhatsApp and check back with you on Friday?"`,
  ];

  return {
    whatsapp: {
      tone: 'WhatsApp (Conversational)',
      channel: 'whatsapp',
      content: waContent,
      waLink,
    },
    professional: {
      tone: 'Professional Email',
      channel: 'email',
      subject: proSubject,
      content: proContent,
      mailToLink,
    },
    friendly: {
      tone: 'Friendly & Casual',
      channel: 'general',
      content: friendlyContent,
    },
    short: {
      tone: 'Short & Punchy',
      channel: 'general',
      content: shortContent,
    },
    follow_up: {
      tone: 'Follow-up Nudge',
      channel: 'general',
      content: followUpContent,
    },
    call_script: {
      tone: 'Phone Call Script',
      channel: 'call',
      content: callTalkingPoints.join('\n\n'),
      callTalkingPoints,
    },
  };
}
