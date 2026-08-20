export interface CategoryDefinition {
  id: string;
  name: string;
  group: string;
  osmTags: Array<{ key: string; value: string }>;
  icon?: string;
  defaultOpportunityScore: number;
  description: string;
}

export const CATEGORY_GROUPS = [
  'Food',
  'Hospitality',
  'Health',
  'Professional Services',
  'Beauty',
  'Education',
  'Automotive',
  'Retail',
  'Events',
  'Fitness',
] as const;

export const CATEGORIES: CategoryDefinition[] = [
  // Food
  {
    id: 'restaurants',
    name: 'Restaurants',
    group: 'Food',
    osmTags: [{ key: 'amenity', value: 'restaurant' }],
    defaultOpportunityScore: 75,
    description: 'Dine-in and takeaway restaurants needing digital menus, ordering, table reservations',
  },
  {
    id: 'cafes',
    name: 'Cafes',
    group: 'Food',
    osmTags: [{ key: 'amenity', value: 'cafe' }],
    defaultOpportunityScore: 70,
    description: 'Coffee shops and casual dining spots',
  },
  {
    id: 'bakeries',
    name: 'Bakeries',
    group: 'Food',
    osmTags: [{ key: 'shop', value: 'bakery' }],
    defaultOpportunityScore: 70,
    description: 'Bakeries and cake shops needing custom order forms and catalog',
  },
  {
    id: 'juice_shops',
    name: 'Juice Shops',
    group: 'Food',
    osmTags: [{ key: 'shop', value: 'beverages' }, { key: 'amenity', value: 'juice_bar' }],
    defaultOpportunityScore: 60,
    description: 'Juice, shake and beverage outlets',
  },
  {
    id: 'fast_food',
    name: 'Fast Food',
    group: 'Food',
    osmTags: [{ key: 'amenity', value: 'fast_food' }],
    defaultOpportunityScore: 65,
    description: 'Quick service food counters and franchises',
  },
  {
    id: 'sweet_shops',
    name: 'Sweet Shops',
    group: 'Food',
    osmTags: [{ key: 'shop', value: 'confectionery' }, { key: 'shop', value: 'pastry' }],
    defaultOpportunityScore: 65,
    description: 'Mithai and traditional confectionery stores',
  },
  {
    id: 'ice_cream_shops',
    name: 'Ice Cream Shops',
    group: 'Food',
    osmTags: [{ key: 'amenity', value: 'ice_cream' }],
    defaultOpportunityScore: 60,
    description: 'Ice cream parlours and dessert stores',
  },

  // Hospitality
  {
    id: 'hotels',
    name: 'Hotels',
    group: 'Hospitality',
    osmTags: [{ key: 'tourism', value: 'hotel' }],
    defaultOpportunityScore: 85,
    description: 'Hotels requiring direct room booking engines and review automation',
  },
  {
    id: 'resorts',
    name: 'Resorts',
    group: 'Hospitality',
    osmTags: [{ key: 'tourism', value: 'resort' }],
    defaultOpportunityScore: 90,
    description: 'Luxury resorts with high booking transaction volume',
  },
  {
    id: 'guest_houses',
    name: 'Guest Houses',
    group: 'Hospitality',
    osmTags: [{ key: 'tourism', value: 'guest_house' }],
    defaultOpportunityScore: 75,
    description: 'Bed & Breakfast and boutique stays',
  },

  // Health
  {
    id: 'clinics',
    name: 'Clinics',
    group: 'Health',
    osmTags: [{ key: 'amenity', value: 'clinic' }],
    defaultOpportunityScore: 90,
    description: 'Medical clinics with appointment scheduling and patient CRM needs',
  },
  {
    id: 'dental_clinics',
    name: 'Dental Clinics',
    group: 'Health',
    osmTags: [{ key: 'amenity', value: 'dentist' }],
    defaultOpportunityScore: 92,
    description: 'Dental care centres needing reminder automation and treatment tracking',
  },
  {
    id: 'physiotherapy',
    name: 'Physiotherapy Clinics',
    group: 'Health',
    osmTags: [{ key: 'healthcare', value: 'physiotherapist' }, { key: 'amenity', value: 'clinic' }],
    defaultOpportunityScore: 85,
    description: 'Physical rehabilitation and recovery centres',
  },
  {
    id: 'diagnostic_centres',
    name: 'Diagnostic Centres',
    group: 'Health',
    osmTags: [{ key: 'healthcare', value: 'laboratory' }, { key: 'amenity', value: 'clinic' }],
    defaultOpportunityScore: 88,
    description: 'Pathology labs and diagnostic report download portals',
  },
  {
    id: 'pharmacies',
    name: 'Pharmacies',
    group: 'Health',
    osmTags: [{ key: 'amenity', value: 'pharmacy' }],
    defaultOpportunityScore: 65,
    description: 'Chemist shops and medical retail',
  },
  {
    id: 'veterinary_clinics',
    name: 'Veterinary Clinics',
    group: 'Health',
    osmTags: [{ key: 'amenity', value: 'veterinary' }],
    defaultOpportunityScore: 80,
    description: 'Pet clinics and animal care centres',
  },
  {
    id: 'wellness_centres',
    name: 'Wellness Centres',
    group: 'Health',
    osmTags: [{ key: 'leisure', value: 'spa' }, { key: 'amenity', value: 'spa' }],
    defaultOpportunityScore: 80,
    description: 'Holistic healing and wellness institutes',
  },

  // Professional Services
  {
    id: 'lawyers',
    name: 'Lawyers',
    group: 'Professional Services',
    osmTags: [{ key: 'office', value: 'lawyer' }],
    defaultOpportunityScore: 78,
    description: 'Law firms and legal advocates needing professional websites and intake forms',
  },
  {
    id: 'accountants',
    name: 'Chartered Accountants',
    group: 'Professional Services',
    osmTags: [{ key: 'office', value: 'accountant' }],
    defaultOpportunityScore: 80,
    description: 'CA firms and tax consultancies needing client document management',
  },
  {
    id: 'architects',
    name: 'Architects',
    group: 'Professional Services',
    osmTags: [{ key: 'office', value: 'architect' }],
    defaultOpportunityScore: 85,
    description: 'Architecture firms looking for sleek portfolio showcases and lead forms',
  },
  {
    id: 'interior_designers',
    name: 'Interior Designers',
    group: 'Professional Services',
    osmTags: [{ key: 'office', value: 'interior_design' }, { key: 'craft', value: 'interior_decorator' }],
    defaultOpportunityScore: 88,
    description: 'High-ticket interior design studios requiring stunning portfolio showcases',
  },
  {
    id: 'real_estate',
    name: 'Real Estate Agencies',
    group: 'Professional Services',
    osmTags: [{ key: 'office', value: 'estate_agent' }],
    defaultOpportunityScore: 92,
    description: 'Real estate brokers needing listing portals, CRM, and WhatsApp lead routing',
  },

  // Beauty
  {
    id: 'salons',
    name: 'Salons',
    group: 'Beauty',
    osmTags: [{ key: 'shop', value: 'hairdresser' }, { key: 'shop', value: 'beauty' }],
    defaultOpportunityScore: 86,
    description: 'Hair & beauty salons requiring online booking, staff schedule & loyalty',
  },
  {
    id: 'spas',
    name: 'Spas',
    group: 'Beauty',
    osmTags: [{ key: 'leisure', value: 'spa' }],
    defaultOpportunityScore: 82,
    description: 'Luxury day spas and massage therapy centres',
  },
  {
    id: 'skin_clinics',
    name: 'Skin Clinics',
    group: 'Beauty',
    osmTags: [{ key: 'healthcare', value: 'dermatologist' }, { key: 'shop', value: 'beauty' }],
    defaultOpportunityScore: 88,
    description: 'Aesthetic dermatology and laser skin care clinics',
  },

  // Education
  {
    id: 'coaching_centres',
    name: 'Coaching Centres',
    group: 'Education',
    osmTags: [{ key: 'amenity', value: 'language_school' }, { key: 'amenity', value: 'school' }, { key: 'office', value: 'educational_institution' }],
    defaultOpportunityScore: 88,
    description: 'Exam coaching and tuition centres needing admissions CRM & parent notifications',
  },
  {
    id: 'training_institutes',
    name: 'Training Institutes',
    group: 'Education',
    osmTags: [{ key: 'amenity', value: 'college' }, { key: 'amenity', value: 'training' }],
    defaultOpportunityScore: 85,
    description: 'Skill development and tech bootcamp providers',
  },
  {
    id: 'music_schools',
    name: 'Music Schools',
    group: 'Education',
    osmTags: [{ key: 'amenity', value: 'music_school' }],
    defaultOpportunityScore: 75,
    description: 'Music academies needing student batch management',
  },
  {
    id: 'dance_academies',
    name: 'Dance Academies',
    group: 'Education',
    osmTags: [{ key: 'amenity', value: 'dance_school' }, { key: 'leisure', value: 'dance' }],
    defaultOpportunityScore: 75,
    description: 'Dance and performing arts studios',
  },

  // Automotive
  {
    id: 'car_service',
    name: 'Car Service',
    group: 'Automotive',
    osmTags: [{ key: 'shop', value: 'car_repair' }],
    defaultOpportunityScore: 78,
    description: 'Auto repair shops needing service reminder automation and booking',
  },
  {
    id: 'car_wash',
    name: 'Car Wash & Detailing',
    group: 'Automotive',
    osmTags: [{ key: 'amenity', value: 'car_wash' }],
    defaultOpportunityScore: 75,
    description: 'Detailing and wash centres needing package subscriptions and appointments',
  },

  // Retail
  {
    id: 'clothing_stores',
    name: 'Clothing Stores',
    group: 'Retail',
    osmTags: [{ key: 'shop', value: 'clothes' }, { key: 'shop', value: 'boutique' }],
    defaultOpportunityScore: 70,
    description: 'Apparel boutiques needing online catalogs and WhatsApp shopping',
  },
  {
    id: 'furniture_stores',
    name: 'Furniture Stores',
    group: 'Retail',
    osmTags: [{ key: 'shop', value: 'furniture' }],
    defaultOpportunityScore: 76,
    description: 'Home decor and furniture stores needing product visualizers and quote forms',
  },
  {
    id: 'electronics_stores',
    name: 'Electronics Stores',
    group: 'Retail',
    osmTags: [{ key: 'shop', value: 'electronics' }],
    defaultOpportunityScore: 72,
    description: 'Consumer gadgets and appliances retail',
  },

  // Events
  {
    id: 'event_management',
    name: 'Event Management',
    group: 'Events',
    osmTags: [{ key: 'office', value: 'event_management' }, { key: 'amenity', value: 'events_venue' }],
    defaultOpportunityScore: 88,
    description: 'Corporate and social event planners needing enquiry routing and portfolios',
  },
  {
    id: 'wedding_planners',
    name: 'Wedding Planners',
    group: 'Events',
    osmTags: [{ key: 'office', value: 'wedding_planner' }, { key: 'shop', value: 'wedding' }],
    defaultOpportunityScore: 90,
    description: 'Luxury wedding designers requiring quote calculators and client portals',
  },
  {
    id: 'photographers',
    name: 'Photographers',
    group: 'Events',
    osmTags: [{ key: 'shop', value: 'photo' }, { key: 'craft', value: 'photographer' }],
    defaultOpportunityScore: 80,
    description: 'Studio and wedding photographers needing client gallery portals',
  },

  // Fitness
  {
    id: 'gyms',
    name: 'Gyms',
    group: 'Fitness',
    osmTags: [{ key: 'leisure', value: 'fitness_centre' }, { key: 'leisure', value: 'sports_centre' }],
    defaultOpportunityScore: 85,
    description: 'Gyms needing membership tracking, renewals, and WhatsApp reminders',
  },
  {
    id: 'yoga_studios',
    name: 'Yoga Studios',
    group: 'Fitness',
    osmTags: [{ key: 'leisure', value: 'fitness_station' }, { key: 'amenity', value: 'yoga' }],
    defaultOpportunityScore: 82,
    description: 'Yoga and pilates studios needing class schedules and pass booking',
  },
];

export interface SearchPresetDefinition {
  id: string;
  name: string;
  description: string;
  categoryIds: string[];
}

export const SEARCH_PRESETS: SearchPresetDefinition[] = [
  {
    id: 'local_business_prospects',
    name: 'Local Business Prospects',
    description: 'Core local service businesses with high propensity for digital tools',
    categoryIds: [
      'restaurants',
      'cafes',
      'clinics',
      'dental_clinics',
      'salons',
      'gyms',
      'coaching_centres',
      'real_estate',
      'interior_designers',
      'hotels',
    ],
  },
  {
    id: 'website_prospects',
    name: 'Website Prospects',
    description: 'Businesses frequently missing websites or running outdated single-pagers',
    categoryIds: [
      'restaurants',
      'clinics',
      'salons',
      'lawyers',
      'accountants',
      'real_estate',
      'interior_designers',
      'clothing_stores',
    ],
  },
  {
    id: 'automation_prospects',
    name: 'Automation Prospects',
    description: 'Appointment and follow-up heavy workflows ready for WhatsApp and CRM automation',
    categoryIds: [
      'clinics',
      'dental_clinics',
      'salons',
      'gyms',
      'coaching_centres',
      'real_estate',
      'hotels',
      'event_management',
    ],
  },
  {
    id: 'high_ticket_prospects',
    name: 'High-Ticket Prospects',
    description: 'Established businesses with budget for custom software, portals, and dashboards',
    categoryIds: [
      'hotels',
      'resorts',
      'clinics',
      'real_estate',
      'interior_designers',
      'event_management',
      'wedding_planners',
      'training_institutes',
    ],
  },
];
