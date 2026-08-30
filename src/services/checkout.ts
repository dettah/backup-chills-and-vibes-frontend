import PaystackPop from "@paystack/inline-js";
import { ticketApi } from "./api";

interface PaymentProcessOptions {
  email: string;
  ticketTypeId: number;
  quantity: number;
  onSuccess: (orderHash: string) => void;
  onFailure: (errorMessage: string) => void;
}

/**
 * Secure payment lifecycle:
 *
 * 1. Reserve inventory
 * 2. Create pending order
 * 3. Receive Paystack payment configuration
 * 4. Open Paystack checkout
 * 5. Send Paystack reference to Django
 * 6. Django verifies transaction directly with Paystack
 *
 * The frontend callback is NEVER treated as proof of payment.
 */
export const executeSecurePaymentFlow = async (
  options: PaymentProcessOptions
) => {
  try {
    // ============================================================
    // STEP 1: RESERVE INVENTORY
    // ============================================================

    const holdData = await ticketApi.reserveTickets({
      email: options.email,
      ticket_type_id: options.ticketTypeId,
      quantity: options.quantity,
    });

    // ============================================================
    // STEP 2: CREATE PENDING ORDER
    // ============================================================

    const checkoutData = await ticketApi.initializeCheckout({
      email: options.email,
      hold_ids: [holdData.hold_id],
      callback_url: `${window.location.origin}/tickets`,
    });

    const gateway = checkoutData.gateway_config;

    // ============================================================
    // STEP 3: OPEN PAYSTACK
    // ============================================================

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    if (!publicKey) {
      throw new Error(
        "Paystack public key is missing. Check your frontend .env file."
      );
    }

    const popup = new PaystackPop();

    popup.newTransaction({
      key: publicKey,
      email: gateway.email,
      amount: gateway.amount,
      currency: gateway.currency,
      reference: gateway.reference,

      metadata: gateway.metadata,

      // ==========================================================
      // IMPORTANT:
      // This callback DOES NOT mark the order as paid.
      // It asks Django to verify the transaction with Paystack.
      // ==========================================================

      onSuccess: async (transaction) => {
        try {
          console.log(
            "Paystack callback received:",
            transaction.reference
          );

          const verification = await ticketApi.verifyPayment(
            transaction.reference
          );

          if (verification.status === "success") {
            options.onSuccess(verification.order_hash);
          } else {
            options.onFailure(
              verification.message ||
                "Payment could not be verified."
            );
          }
        } catch (error: any) {
          console.error(
            "Backend payment verification failed:",
            error
          );

          options.onFailure(
            error.response?.data?.error ||
              "Payment was received but could not be verified yet."
          );
        }
      },

      onCancel: () => {
        options.onFailure(
          "Transaction cancelled by customer."
        );
      },

      onError: (error) => {
        console.error("Paystack error:", error);

        options.onFailure(
          error?.message ||
            "Paystack could not process the transaction."
        );
      },
    });

  } catch (error: any) {
    console.error("Checkout engine error:", error);

    const errorMsg =
      error.response?.data?.error ||
      error.message ||
      "Checkout engine failed.";

    options.onFailure(errorMsg);
  }
};