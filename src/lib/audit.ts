export interface AuditResult {
  websiteStatus: 'STRONG' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'NO_WEBSITE' | 'UNABLE_TO_ASSESS';
  isReachable: boolean;
  isHttps: boolean;
  mobileFriendly: boolean;
  hasContactInfo: boolean;
  hasPhoneVisible: boolean;
  hasWhatsApp: boolean;
  hasEmail: boolean;
  hasContactForm: boolean;
  hasBooking: boolean;
  hasOnlineOrdering: boolean;
  hasEcommerce: boolean;
  hasPayment: boolean;
  socialLinks: string[];
  pageTitle?: string;
  metaDescription?: string;
  seoSignalsScore: number;
  overallScore: number;
  summaryText: string;
}

export async function runDigitalAudit(url?: string | null): Promise<AuditResult> {
  if (!url || !url.trim()) {
    return {
      websiteStatus: 'NO_WEBSITE',
      isReachable: false,
      isHttps: false,
      mobileFriendly: false,
      hasContactInfo: false,
      hasPhoneVisible: false,
      hasWhatsApp: false,
      hasEmail: false,
      hasContactForm: false,
      hasBooking: false,
      hasOnlineOrdering: false,
      hasEcommerce: false,
      hasPayment: false,
      socialLinks: [],
      seoSignalsScore: 0,
      overallScore: 0,
      summaryText: 'No website URL is listed in public records. Building an initial high-speed web presence is a high-priority opportunity.',
    };
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  const isHttps = formattedUrl.startsWith('https://');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        websiteStatus: 'NEEDS_IMPROVEMENT',
        isReachable: false,
        isHttps,
        mobileFriendly: false,
        hasContactInfo: false,
        hasPhoneVisible: false,
        hasWhatsApp: false,
        hasEmail: false,
        hasContactForm: false,
        hasBooking: false,
        hasOnlineOrdering: false,
        hasEcommerce: false,
        hasPayment: false,
        socialLinks: [],
        seoSignalsScore: 10,
        overallScore: 25,
        summaryText: `Website returned HTTP status ${res.status}. The site may be experiencing downtime, configuration issues, or server errors.`,
      };
    }

    const html = await res.text();
    const lowerHtml = html.toLowerCase();

    // Extract Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : undefined;

    // Extract Meta Description
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const metaDescription = metaMatch ? metaMatch[1].trim() : undefined;

    // Signals Analysis
    const mobileFriendly = lowerHtml.includes('name="viewport"') || lowerHtml.includes("name='viewport'");
    const hasPhoneVisible = /tel:|phone|\+?[0-9]{2,3}[- ]?[0-9]{3,5}[- ]?[0-9]{4,6}/i.test(lowerHtml);
    const hasWhatsApp = lowerHtml.includes('wa.me') || lowerHtml.includes('api.whatsapp.com') || lowerHtml.includes('whatsapp');
    const hasEmail = /mailto:|contact@|info@|sales@|support@/i.test(lowerHtml);
    const hasContactForm = lowerHtml.includes('<form') && (lowerHtml.includes('input') || lowerHtml.includes('textarea'));
    
    const hasBooking = lowerHtml.includes('calendly') || lowerHtml.includes('book') || lowerHtml.includes('appointment') || lowerHtml.includes('schedule') || lowerHtml.includes('practo') || lowerHtml.includes('fresha');
    const hasOnlineOrdering = lowerHtml.includes('order-online') || lowerHtml.includes('online ordering') || lowerHtml.includes('swiggy') || lowerHtml.includes('zomato') || lowerHtml.includes('menu');
    const hasEcommerce = lowerHtml.includes('cart') || lowerHtml.includes('checkout') || lowerHtml.includes('shopify') || lowerHtml.includes('woocommerce');
    const hasPayment = lowerHtml.includes('razorpay') || lowerHtml.includes('stripe') || lowerHtml.includes('upi') || lowerHtml.includes('paytm') || lowerHtml.includes('payment');

    // Social Links
    const socialLinks: string[] = [];
    if (lowerHtml.includes('instagram.com/')) socialLinks.push('Instagram');
    if (lowerHtml.includes('facebook.com/')) socialLinks.push('Facebook');
    if (lowerHtml.includes('linkedin.com/')) socialLinks.push('LinkedIn');
    if (lowerHtml.includes('twitter.com/') || lowerHtml.includes('x.com/')) socialLinks.push('Twitter/X');
    if (lowerHtml.includes('youtube.com/')) socialLinks.push('YouTube');

    // SEO Score
    let seoSignalsScore = 20;
    if (pageTitle && pageTitle.length > 5) seoSignalsScore += 30;
    if (metaDescription && metaDescription.length > 20) seoSignalsScore += 30;
    if (isHttps) seoSignalsScore += 20;

    // Overall Score Calculation (0-100)
    let score = 20;
    if (isHttps) score += 15;
    if (mobileFriendly) score += 15;
    if (hasPhoneVisible || hasEmail) score += 15;
    if (hasWhatsApp) score += 15;
    if (hasContactForm) score += 10;
    if (hasBooking || hasOnlineOrdering || hasEcommerce) score += 10;

    let websiteStatus: 'STRONG' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'NO_WEBSITE' | 'UNABLE_TO_ASSESS' = 'AVERAGE';
    if (score >= 75) {
      websiteStatus = 'STRONG';
    } else if (score < 50) {
      websiteStatus = 'NEEDS_IMPROVEMENT';
    }

    const summaryParts: string[] = [];
    if (websiteStatus === 'STRONG') {
      summaryParts.push('Web presence is established with modern security and contact channels.');
    } else if (websiteStatus === 'AVERAGE') {
      summaryParts.push('Website is active but lacks key conversion touchpoints (e.g. direct booking or WhatsApp chat).');
    } else {
      summaryParts.push('Website has outdated formatting, lacks responsive mobile viewport, or misses instant lead capture hooks.');
    }

    if (!hasWhatsApp) summaryParts.push('No direct WhatsApp integration detected.');
    if (!hasBooking && !hasOnlineOrdering) summaryParts.push('No automated booking or direct self-service ordering workflow found.');

    return {
      websiteStatus,
      isReachable: true,
      isHttps,
      mobileFriendly,
      hasContactInfo: hasPhoneVisible || hasEmail || hasContactForm,
      hasPhoneVisible,
      hasWhatsApp,
      hasEmail,
      hasContactForm,
      hasBooking,
      hasOnlineOrdering,
      hasEcommerce,
      hasPayment,
      socialLinks,
      pageTitle,
      metaDescription,
      seoSignalsScore,
      overallScore: Math.min(100, Math.max(0, score)),
      summaryText: summaryParts.join(' '),
    };
  } catch (err: any) {
    // If request failed (e.g. timeout or blocked), return graceful unable to assess
    return {
      websiteStatus: 'UNABLE_TO_ASSESS',
      isReachable: false,
      isHttps,
      mobileFriendly: false,
      hasContactInfo: false,
      hasPhoneVisible: false,
      hasWhatsApp: false,
      hasEmail: false,
      hasContactForm: false,
      hasBooking: false,
      hasOnlineOrdering: false,
      hasEcommerce: false,
      hasPayment: false,
      socialLinks: [],
      seoSignalsScore: 0,
      overallScore: 40,
      summaryText: 'Unable to reach the web server during quick check. Manual verification recommended.',
    };
  }
}
