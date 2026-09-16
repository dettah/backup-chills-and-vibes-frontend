export interface EventItem {
  id: string;

  slug: string;

  title: string;

  category: "Parties" | "Concerts" | "Special Events" | string;

  date: string;

  isoDate: string;

  time: string;

  location: string;

  description: string;

  shortDescription: string;

  flyer: string | null;

  priceFrom: string;

  ticketsAvailable: boolean;
  is_featured: boolean;
}


export type TicketTier =
  | "Early Bird"
  | "Standing Table"
  | "VIP Lounge"
  | string;


export interface TicketOption {
  id: string;

  tier: TicketTier;

  description: string;

  price: number;

  perks: string[];

  highlight?: boolean;
}


export interface GalleryImage {
  id: string;

  src: string;

  caption: string;

  span?: "tall" | "wide" | "normal";
}


export interface SelectedTicket {
  eventId: number;

  ticketId: string;

  tier: TicketTier;

  price: number;

  quantity: number;
}


export interface CustomerInfo {
  fullName: string;

  email: string;

  phone: string;
}


export interface PaystackConfig {
  key: string;

  email: string;

  amount: number;

  ref: string;

  callback: (
    response: {
      reference: string;
      status: string;
    }
  ) => void;

  onClose: () => void;

  currency?: string;

  metadata?: Record<string, any>;
}


declare global {
  interface Window {
    PaystackPop: {
      setup: (
        config: PaystackConfig
      ) => {
        open: () => void;
      };
    };
  }
}