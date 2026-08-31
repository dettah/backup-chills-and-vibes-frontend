// src/pages/Checkout.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineTicket } from "react-icons/hi";
import SectionTitle from "../components/SectionTitle";
import CheckoutForm from "../components/CheckoutForm";
import SuccessScreen from "../components/SuccessScreen";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import { useCheckout } from "../hooks/useCheckout";
import { executeSecurePaymentFlow } from "../services/checkout"; // 👈 Import our core payment pipeline
import type { CustomerInfo } from "../types";
import { featuredEvent } from "../data/events";

const Checkout = () => {
  const navigate = useNavigate();
  const { selectedTicket, event, customer, setCustomer, paymentReference, setPaymentReference } =
    useCheckout();
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (values: CustomerInfo) => {
    if (!selectedTicket) return;
    
    setCustomer(values);
    setSubmitting(true);
    setPaymentError(null);

    // Parse your backend database row identifier string into an absolute integer
    // E.g. "ticket-db-5" becomes 5
    const backendTicketTypeId = parseInt(selectedTicket.ticketId.replace(/^\D+/g, ""), 10) || 1;

    // Trigger the multi-layered payment orchestration lifecycle
    await executeSecurePaymentFlow({
      email: values.email,
      ticketTypeId: backendTicketTypeId,
      quantity: selectedTicket.quantity,
      
      onSuccess: (orderHash) => {
        setSubmitting(false);
        // Save the verified order hash directly into your context memory layout
        setPaymentReference(orderHash);
      },
      onFailure: (errorMessage) => {
        setSubmitting(false);
        setPaymentError(errorMessage);
      }
    });
  };

  if (!selectedTicket) {
    return (
      <div className="section-pad pt-32">
        <div className="container-x">
          <EmptyState
            icon={<HiOutlineTicket />}
            title="No ticket selected"
            description="Choose a ticket tier first so we know what you're checking out for."
            action={
              <Button variant="gold" onClick={() => navigate("/tickets")}>
                Choose a Ticket
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (paymentReference) {
    return (
      <div className="section-pad pt-32">
        <div className="container-x">
          <SuccessScreen
            customer={customer}
            ticket={selectedTicket}
            event={event ?? featuredEvent}
            reference={paymentReference}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="section-pad pt-32">
      <div className="container-x">
        <SectionTitle eyebrow="Checkout" title="Almost there" description="Enter your details to secure your spot." />
        
        {paymentError && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-xs font-medium text-red-400">
            ⚠️ {paymentError}
          </div>
        )}

        <CheckoutForm ticket={selectedTicket} event={event ?? featuredEvent} onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
};

export default Checkout;
