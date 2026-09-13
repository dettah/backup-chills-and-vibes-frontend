import { ticketApi } from "./api";

interface PaymentProcessOptions {
  email: string;
  customerName: string;
  customerPhone: string;
  ticketTypeId: number;
  quantity: number;

  onSuccess: (
    orderHash: string
  ) => void;

  onFailure: (
    errorMessage: string
  ) => void;
}


/**
 * Secure Monnify payment lifecycle:
 *
 * 1. Reserve inventory
 * 2. Create pending order
 * 3. Django initializes Monnify transaction
 * 4. Django returns Monnify checkout URL
 * 5. Browser redirects to Monnify hosted checkout
 *
 * Payment verification happens separately through Django.
 */
export const executeSecurePaymentFlow =
  async (
    options: PaymentProcessOptions
  ) => {

    try {

      // =========================================================
      // STEP 1: RESERVE INVENTORY
      // =========================================================

      const holdData =
        await ticketApi.reserveTickets({
          email: options.email,
          ticket_type_id:
            options.ticketTypeId,
          quantity:
            options.quantity,
        });


      // =========================================================
      // STEP 2: CREATE PENDING ORDER
      // =========================================================

      const checkoutData =
        await ticketApi.initializeCheckout({
          email: options.email,
          customer_name: options.customerName,
          customer_phone: options.customerPhone,
          hold_ids: [
            holdData.hold_id,
          ],

          callback_url:
            `${window.location.origin}` +
            `/checkout`,
        });


      // =========================================================
      // STEP 3: GET MONNIFY CHECKOUT URL
      // =========================================================

      const checkoutUrl =
        checkoutData
          .gateway_config
          .checkout_url;


      if (!checkoutUrl) {

        throw new Error(
          "Monnify checkout URL was not returned."
        );

      }


      console.log(
        "Redirecting to Monnify:",
        checkoutUrl
      );


      // =========================================================
      // STEP 4: REDIRECT TO MONNIFY
      // =========================================================

      window.location.assign(
        checkoutUrl
      );

    } catch (
    error: any
    ) {

      console.error(
        "Monnify checkout initialization failed:",
        error
      );


      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.message ||
        "Payment initialization failed.";


      options.onFailure(
        errorMessage
      );

    }

  };


// 