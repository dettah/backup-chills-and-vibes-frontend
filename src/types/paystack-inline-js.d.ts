declare module "@paystack/inline-js" {
  interface PaystackTransactionResponse {
    reference: string;
    status: string;
    [key: string]: unknown;
  }

  interface PaystackPopupConfig {
    key: string;
    email: string;
    amount: number;
    ref: string;
    currency?: string;

    metadata?: Record<string, unknown>;

    onSuccess?: (
      transaction: PaystackTransactionResponse
    ) => void;

    onCancel?: () => void;

    onClose?: () => void;

    onError?: (
      error: unknown
    ) => void;

    callback?: (
      transaction: PaystackTransactionResponse
    ) => void;
  }

  export default class PaystackPop {
    newTransaction(
      config: PaystackPopupConfig
    ): {
      openIframe: () => void;
    };

    setup(
      config: PaystackPopupConfig
    ): {
      openIframe?: () => void;
    };
  }
}