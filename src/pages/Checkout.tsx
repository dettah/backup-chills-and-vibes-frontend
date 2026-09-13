import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  HiOutlineTicket,
} from "react-icons/hi";

import SectionTitle from "../components/SectionTitle";
import CheckoutForm from "../components/CheckoutForm";
import SuccessScreen from "../components/SuccessScreen";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";

import {
  useCheckout,
} from "../hooks/useCheckout";

import {
  executeSecurePaymentFlow,
} from "../services/checkout";

import {
  ticketApi,
} from "../services/api";

import type {
  CustomerInfo,
} from "../types";

import {
  events,
  featuredEvent,
} from "../data/events";


const Checkout = () => {

  const navigate =
    useNavigate();


  /*
   * ============================================================
   * CHECKOUT CONTEXT
   * ============================================================
   */

  const {
    selectedTicket,
    setSelectedTicket,
    event,
    setEvent,
    customer,
    setCustomer,
    paymentReference,
    setPaymentReference,
  } = useCheckout();


  /*
   * ============================================================
   * LOCAL STATE
   * ============================================================
   */

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const hasMonnifyReturn =
    new URLSearchParams(
      window.location.search
    ).has("paymentReference");

  const [
    restoringCheckout,
    setRestoringCheckout,
  ] = useState(
    hasMonnifyReturn
  );

  const [
    paymentError,
    setPaymentError,
  ] = useState<string | null>(
    null
  );


  /*
 * ============================================================
 * RESOLVE THE EVENT FOR THIS CHECKOUT
 * ============================================================
 *
 * selectedTicket.eventId is the authoritative event ID for
 * this purchase.
 *
 * We first use the event already stored in CheckoutContext.
 * If it is unavailable, we look it up from the live events
 * collection.
 *
 * featuredEvent is only used as a final fallback.
 */
  const currentEvent =
    event ??
    (
      selectedTicket
        ? events.find(
          (item) =>
            String(item.id) ===
            String(selectedTicket.eventId)
        )
        : undefined
    ) ??
    featuredEvent;



  /*
   * ============================================================
   * MONNIFY RETURN VERIFICATION
   * ============================================================
   *
   * Monnify redirects the customer back to:
   *
   * /checkout?paymentReference=ord_xxxxx
   *
   * The reference is NOT trusted by itself.
   *
   * Django asks Monnify to verify the transaction.
   */

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const returnedPaymentReference =
      params.get(
        "paymentReference"
      );


    /*
     * ============================================================
     * NORMAL CHECKOUT
     * ============================================================
     */

    if (
      !returnedPaymentReference
    ) {

      setRestoringCheckout(
        false
      );

      return;

    }


    /*
     * ============================================================
     * RESTORE THE CHECKOUT THAT EXISTED BEFORE MONNIFY
     * ============================================================
     */

    const savedCheckout =
      sessionStorage.getItem(
        "chills_vibes_pending_checkout"
      );


    if (
      savedCheckout
    ) {

      try {

        const parsedCheckout =
          JSON.parse(
            savedCheckout
          );


        /*
         * IMPORTANT:
         *
         * setEvent() intentionally clears:
         *
         * selectedTicket
         * customer
         * paymentReference
         *
         * Therefore event MUST be restored first.
         */


        if (
          parsedCheckout.event
        ) {

          setEvent(
            parsedCheckout.event
          );

        }


        /*
         * Restore customer AFTER setEvent(),
         * because setEvent() resets customer.
         */

        if (
          parsedCheckout.customer
        ) {

          setCustomer(
            parsedCheckout.customer
          );

        }


        /*
         * Restore selected ticket LAST.
         *
         * This is the critical fix.
         *
         * setEvent() clears selectedTicket, so the ticket
         * must be restored after the event.
         */

        if (
          parsedCheckout.selectedTicket
        ) {

          setSelectedTicket(
            parsedCheckout.selectedTicket
          );

        }


        console.log(
          "[CHECKOUT RESTORE] Event restored:",
          parsedCheckout.event
        );

        console.log(
          "[CHECKOUT RESTORE] Customer restored:",
          parsedCheckout.customer
        );

        console.log(
          "[CHECKOUT RESTORE] Ticket restored:",
          parsedCheckout.selectedTicket
        );


      } catch (
      restoreError
      ) {

        console.error(
          "[CHECKOUT RESTORE] Unable to restore checkout session:",
          restoreError
        );

      }

    }


    /*
     * ============================================================
     * VERIFY PAYMENT
     * ============================================================
     */

    let cancelled = false;

    console.log(
      "[CHECKOUT RESTORE] Current sessionStorage:",
      sessionStorage.getItem(
        "chills_vibes_pending_checkout"
      )
    );

    const verifyReturnedPayment =
      async () => {

        try {

          setSubmitting(
            true
          );

          setPaymentError(
            null
          );


          console.log(
            "Monnify returned payment reference:",
            returnedPaymentReference
          );


          const verification =
            await ticketApi.verifyPayment(
              returnedPaymentReference
            );


          if (
            cancelled
          ) {
            return;
          }


          if (
            verification.status ===
            "success"
          ) {

            console.log(
              "Monnify payment verified:",
              verification
            );


            /*
             * The backend has now confirmed the payment.
             */

            setPaymentReference(
              verification.order_hash
            );


            /*
             * The pending checkout has successfully
             * become a completed order.
             *
             * We no longer need the temporary browser copy.
             */

            sessionStorage.removeItem(
              "chills_vibes_pending_checkout"
            );


            /*
             * Remove Monnify query parameters.
             */

            window.history.replaceState(
              {},
              document.title,
              "/checkout"
            );


          } else {

            setPaymentError(
              verification.message ||
              "Payment could not be verified."
            );

          }


        } catch (
        error: any
        ) {

          if (
            cancelled
          ) {

            return;

          }


          console.error(
            "Monnify payment verification failed:",
            error
          );


          setPaymentError(
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            "Payment could not be verified yet."
          );


        } finally {

          if (
            !cancelled
          ) {

            setSubmitting(
              false
            );

            setRestoringCheckout(
              false
            );

          }

        }

      };


    void verifyReturnedPayment();


    return () => {

      cancelled = true;

    };

  }, [
    setCustomer,
    setEvent,
    setPaymentReference,
    setSelectedTicket,
  ]);


  /*
   * ============================================================
   * SUBMIT CHECKOUT FORM
   * ============================================================
   */

  const handleSubmit = async (
    values: CustomerInfo
  ) => {

    if (
      !selectedTicket
    ) {
      return;
    }

    /*
 * ============================================================
 * EVENT VALIDATION
 * ============================================================
 *
 * Checkout components require a real EventItem.
 * Never pass null into them.
 */



    setCustomer(
      values
    );

    sessionStorage.setItem(
      "chills_vibes_pending_checkout",
      JSON.stringify({
        selectedTicket,
        customer: values,
        event: currentEvent,
      })
    );

    setSubmitting(
      true
    );

    setPaymentError(
      null
    );


    /*
     * Ticket IDs returned by Django are numeric strings
     * such as "4", "5", "6".
     *
     * Convert the selected ticket ID to a number.
     */

    const backendTicketTypeId =
      Number(
        selectedTicket.ticketId
      );


    if (
      !Number.isInteger(
        backendTicketTypeId
      ) ||
      backendTicketTypeId <= 0
    ) {

      setSubmitting(
        false
      );

      setPaymentError(
        "Invalid ticket type selected."
      );

      return;
    }


    /*
     * Start Monnify payment initialization.
     *
     * This creates:
     *
     * TicketHold
     *     ↓
     * Order(PENDING)
     *     ↓
     * Monnify transaction
     *     ↓
     * hosted checkout URL
     */

    await executeSecurePaymentFlow({
      email:
        values.email,

      customerName:
        values.fullName,

      customerPhone:
        values.phone,

      ticketTypeId:
        backendTicketTypeId,

      quantity:
        selectedTicket.quantity,
      /*
       * The hosted Monnify flow redirects away from
       * this page, so onSuccess is not normally reached
       * during initialization.
       */

      onSuccess: (
        orderHash
      ) => {

        setSubmitting(
          false
        );

        setPaymentReference(
          orderHash
        );

      },

      onFailure: (
        errorMessage
      ) => {

        setSubmitting(
          false
        );

        setPaymentError(
          errorMessage
        );

      },

    });

  };



  if (restoringCheckout) {
    return (
      <section className="section-pad pt-32">
        <div className="container-x text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gold/20 border-t-gold" />

          <p className="mt-4 text-sm text-mute">
            Confirming your payment...
          </p>

        </div>
      </section>
    );
  }

  /*
   * ============================================================
   * NO TICKET SELECTED
   * ============================================================
   */



  if (
    !selectedTicket
  ) {

    return (
      <div className="section-pad pt-32">

        <div className="container-x">

          <EmptyState
            icon={
              <HiOutlineTicket />
            }
            title="No ticket selected"
            description="Choose a ticket tier first so we know what you're checking out for."
            action={

              <Button
                variant="gold"
                onClick={() =>
                  navigate(
                    event
                      ? `/tickets/${event.id}`
                      : "/events"
                  )
                }
              >
                Choose a Ticket
              </Button>

            }
          />

        </div>

      </div>
    );

  }

  /*
 * ============================================================
 * EVENT VALIDATION
 * ============================================================
 *
 * CheckoutForm and SuccessScreen require a real EventItem.
 * Do not allow null to reach either component.
 */
  if (!currentEvent) {
    return (
      <div className="section-pad pt-32">
        <div className="container-x text-center">

          <h2 className="text-2xl font-bold text-bone">
            Event information unavailable
          </h2>

          <p className="mt-3 text-mute">
            We could not determine which event this ticket
            belongs to. Please return to the events page
            and select your ticket again.
          </p>

          <Button
            variant="gold"
            onClick={() =>
              navigate("/events")
            }
            className="mt-6"
          >
            View Events
          </Button>

        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PAYMENT SUCCESS
   * ============================================================
   */

  if (
    paymentReference
  ) {

    return (
      <div className="section-pad pt-32">

        <div className="container-x">

          <SuccessScreen
            customer={
              customer
            }

            ticket={
              selectedTicket
            }

            event={
              currentEvent
            }

            reference={
              paymentReference
            }

          />

        </div>

      </div>
    );

  }


  /*
   * ============================================================
   * CHECKOUT FORM
   * ============================================================
   */

  return (
    <div className="section-pad pt-32">

      <div className="container-x">

        <SectionTitle
          eyebrow="Checkout"
          title="Almost there"
          description="Enter your details to secure your spot."
        />


        {paymentError && (

          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs font-medium text-red-400">

            ⚠️ {paymentError}

          </div>

        )}


        <CheckoutForm
          ticket={
            selectedTicket
          }

          event={
            currentEvent
          }

          onSubmit={
            handleSubmit
          }

          submitting={
            submitting
          }

        />

      </div>

    </div>
  );

};


export default Checkout;