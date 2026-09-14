import axios from "axios";
import type {
  EventItem,
  TicketOption,
} from "../types";

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export interface ReserveRequest {
  email: string;
  ticket_type_id: number;
  quantity: number;
}

export interface ReserveResponse {
  message: string;
  hold_id: number;
  expires_at: string;
}

export interface CheckoutRequest {
  email: string;
  customer_name: string;
  customer_phone: string;
  hold_ids: number[];
  callback_url?: string;
}

export interface CheckoutResponse {
  order_hash: string;
  total_price: string;

  gateway_config: {
    payment_reference: string;
    transaction_reference: string;
    checkout_url: string;
    amount: number;
    currency: string;
  };
}

export interface VerifyPaymentResponse {
  status: string;
  message: string;
  order_hash: string;
}

export interface OrderLookupResponse {
  order_hash: string;
  customer_email: string;
  status: string;
  total_price: string;
  created_at: string;
}

export interface GuestTicket {
  ticket_hash: string;
  status: "VALID" | "SCANNED" | "CANCELLED";
  ticket_type: string;
  price: string;
}

export interface GuestOrderTicketsResponse {
  order_hash: string;
  customer_email: string;
  tickets: GuestTicket[];
}

export interface GalleryBackendResponse {
  id: string | number;
  src: string;
  caption: string;
  span?: "tall" | "wide" | "normal";

}

export interface GateScanResponse {
  status: "APPROVED" | "REJECTED";
  message?: string;
  error?: string;
  scanned_at?: string;
}

export const ticketApi = {


  // ============================================================
  // TICKET GATE SCANNER
  // ============================================================
  scanTicket: async (
    ticketHash: string
  ): Promise<GateScanResponse> => {
    const response = await api.post<GateScanResponse>(
      "/tickets/gate-scan/",
      {
        ticket_hash: ticketHash,
      }
    );

    return response.data;
  },

  // ============================================================
  // EVENTS
  // ============================================================


  fetchLiveEvents: async (): Promise<EventItem[]> => {
    const response = await api.get<EventItem[]>("/events/");
    return response.data;
  },

  fetchEvent: async (
    eventId: string | number
  ): Promise<EventItem> => {
    const response = await api.get<EventItem>(
      `/events/${eventId}/`
    );

    return response.data;
  },

  fetchEventTickets: async (
    eventId: string | number
  ): Promise<TicketOption[]> => {
    const response = await api.get<TicketOption[]>(
      `/events/${eventId}/tickets/`
    );

    return response.data;
  },



  // ============================================================
  // GALLERY
  // ============================================================

  fetchGalleryImages: async (): Promise<GalleryBackendResponse[]> => {
    const response =
      await api.get<GalleryBackendResponse[]>("/gallery/");

    return response.data;
  },

  // ============================================================
  // ORDERS
  // ============================================================

  reserveTickets: async (
    data: ReserveRequest
  ): Promise<ReserveResponse> => {
    const response = await api.post<ReserveResponse>(
      "/orders/reserve/",
      data
    );

    return response.data;
  },

  initializeCheckout: async (
    data: CheckoutRequest
  ): Promise<CheckoutResponse> => {
    const response =
      await api.post<CheckoutResponse>(
        "/orders/checkout/",
        data
      );

    return response.data;
  },
  verifyPayment: async (
    paymentReference: string
  ): Promise<VerifyPaymentResponse> => {
    const response =
      await api.post<VerifyPaymentResponse>(
        "/orders/verify-payment/",
        {
          payment_reference: paymentReference,
        }
      );

    return response.data;
  },

  lookupGuestOrder: async (
    orderHash: string,
    email: string
  ): Promise<OrderLookupResponse> => {
    const response =
      await api.get<OrderLookupResponse>(
        "/orders/lookup/",
        {
          params: {
            order_hash: orderHash,
            email,
          },
        }
      );

    return response.data;
  },

  fetchOrderTickets: async (
    orderHash: string,
    email: string
  ): Promise<GuestOrderTicketsResponse> => {
    const response =
      await api.get<GuestOrderTicketsResponse>(
        "/orders/tickets/",
        {
          params: {
            order_hash: orderHash,
            email,
          },
        }
      );

    return response.data;
  },
};