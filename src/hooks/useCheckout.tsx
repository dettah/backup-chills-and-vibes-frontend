import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  CustomerInfo,
  EventItem,
  SelectedTicket,
} from "../types";

import { events } from "../data/events";


interface CheckoutState {
  selectedTicket: SelectedTicket | null;

  event: EventItem | null;

  customer: CustomerInfo;

  paymentReference: string | null;

  setSelectedTicket: (
    ticket: SelectedTicket | null
  ) => void;

  setEvent: (
    event: EventItem
  ) => void;

  setCustomer: (
    customer: CustomerInfo
  ) => void;

  setPaymentReference: (
    ref: string | null
  ) => void;

  reset: () => void;
}


const CheckoutContext =
  createContext<
    CheckoutState | undefined
  >(undefined);


const emptyCustomer: CustomerInfo = {
  fullName: "",
  email: "",
  phone: "",
};


export const CheckoutProvider = ({
  children,
}: {
  children: ReactNode;
}) => {

  const [selectedTicket, setSelectedTicket] =
    useState<SelectedTicket | null>(null);


  const [event, setEventState] =
    useState<EventItem | null>(
      events[0] ?? null
    );


  const [customer, setCustomer] =
    useState<CustomerInfo>(
      emptyCustomer
    );


  const [paymentReference, setPaymentReference] =
    useState<string | null>(null);


  const setEvent = (
    nextEvent: EventItem
  ) => {
    setEventState(nextEvent);

    // Don't accidentally carry a ticket
    // from another event.
    setSelectedTicket(null);
  };


  const reset = () => {
    setSelectedTicket(null);

    setCustomer(emptyCustomer);

    setPaymentReference(null);
  };


  const value = useMemo(
    () => ({
      selectedTicket,

      event,

      customer,

      paymentReference,

      setSelectedTicket,

      setEvent,

      setCustomer,

      setPaymentReference,

      reset,
    }),
    [
      selectedTicket,
      event,
      customer,
      paymentReference,
    ]
  );


  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};


export const useCheckout =
  (): CheckoutState => {

    const ctx =
      useContext(CheckoutContext);

    if (!ctx) {
      throw new Error(
        "useCheckout must be used within CheckoutProvider"
      );
    }

    return ctx;
  };