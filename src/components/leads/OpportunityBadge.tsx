import React from 'react';
import { cn } from '@/lib/utils';
import {
  Globe,
  RefreshCw,
  Calendar,
  MessageSquare,
  Sparkles,
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Layers,
  Bot,
} from 'lucide-react';

interface Props {
  type: string;
  title?: string;
  className?: string;
}

export function OpportunityBadge({ type, title, className }: Props) {
  let Icon = Sparkles;
  let label = title || type;
  // light: darker text + border, dark: lighter text + border
  let style = 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30';

  switch (type.toUpperCase()) {
    case 'WEBSITE':
      Icon = Globe;
      label = title || 'Website Opportunity';
      style = 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-500/30';
      break;
    case 'REDESIGN':
    case 'WEBSITE_REDESIGN':
      Icon = RefreshCw;
      label = title || 'Website Redesign';
      style = 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/30';
      break;
    case 'APPOINTMENT_BOOKING':
    case 'BOOKING':
    case 'DIRECT_BOOKING':
      Icon = Calendar;
      label = title || 'Online Booking';
      style = 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30';
      break;
    case 'WHATSAPP':
    case 'WHATSAPP_AUTOMATION':
    case 'WHATSAPP_WORKFLOW':
    case 'WHATSAPP_CONCIERGE':
      Icon = MessageSquare;
      label = title || 'WhatsApp Automation';
      style = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30';
      break;
    case 'ONLINE_ORDERING':
    case 'ECOMMERCE':
    case 'QR_ORDERING':
      Icon = ShoppingCart;
      label = title || 'Online Ordering';
      style = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30';
      break;
    case 'CRM':
    case 'LEAD_CRM':
    case 'PATIENT_CRM':
    case 'MEMBERSHIP_CRM':
    case 'ADMISSIONS_CRM':
      Icon = Layers;
      label = title || 'Custom CRM';
      style = 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-500/30';
      break;
    case 'PAYMENT':
    case 'PAYMENT_BILLING':
    case 'FEE_PAYMENT':
      Icon = CreditCard;
      label = title || 'Payment Automation';
      style = 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-500/30';
      break;
    case 'DASHBOARD':
    case 'INTERNAL_OPERATIONS':
    case 'PORTAL':
    case 'TRAINER_PORTAL':
    case 'STAFF_MANAGEMENT':
      Icon = LayoutDashboard;
      label = title || 'Operations Portal';
      style = 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30';
      break;
    case 'AI':
    case 'AI_CHATBOT':
      Icon = Bot;
      label = title || 'AI Assistant';
      style = 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-300 dark:border-pink-500/30';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border tracking-tight',
        style,
        className
      )}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="truncate max-w-[200px]">{label}</span>
    </span>
  );
}
