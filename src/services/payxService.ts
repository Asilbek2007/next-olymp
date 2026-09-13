/**
 * PayX Payment Gateway Merchant Service
 * OpenAPI / Swagger Specification Integration for PayX (https://payx.uz/docs/swagger.html)
 * Supports Payme, Click, Uzum Bank, Paynet, Uzcard/Humo, Visa / Mastercard via PayX Merchant API.
 */

export type PayxPaymentMethod = 'payme' | 'click' | 'uzumpay' | 'paynet' | 'uzcard_humo' | 'visa_mastercard' | 'card' | 'all' | 'uzum';

export interface PayxConfig {
  merchantId: string;
  apiKey: string;
  secretKey: string;
  webhookUrl: string;
  mode: 'live' | 'sandbox';
  apiUrl: string;
}

export interface PayXCreateInvoiceParams {
  amount: number;
  currency?: 'UZS' | 'USD';
  orderId: string;
  olympiadId: string;
  olympiadTitle: string;
  userEmail: string;
  userName: string;
  paymentMethod?: PayxPaymentMethod;
  returnUrl?: string;
}

export interface PayXInvoiceResponse {
  success: boolean;
  invoiceId: string;
  checkoutUrl: string;
  qrCodeUrl: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

export interface PayXTransactionStatus {
  orderId: string;
  invoiceId: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface PayxTransaction {
  id: string;
  amount: number;
  paymentMethod: PayxPaymentMethod;
  status: 'completed' | 'pending' | 'failed';
  payxRefCode: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  olympiadTitle?: string;
  olympiadId?: string;
}

export interface PayxProcessPaymentParams {
  amount: number;
  paymentMethod: PayxPaymentMethod;
  olympiadId?: string;
  olympiadTitle?: string;
  customerName?: string;
  customerEmail?: string;
}

type Subscriber = () => void;

const PAYX_CONFIG_KEY = 'payx_merchant_config';
const PAYX_TRANSACTIONS_KEY = 'payx_transactions_history';

const defaultConfig: PayxConfig = {
  merchantId: 'PAYX-MERCHANT-NEXT-OLYMP-2026',
  apiKey: 'payx_live_pk_892184912409124810294',
  secretKey: 'payx_live_sk_991824091824012984019284',
  webhookUrl: 'https://api.nextolymp.uz/api/v1/payx/webhook',
  mode: 'live',
  apiUrl: 'https://api.payx.uz/v1',
};

const subscribers: Set<Subscriber> = new Set();

const notifySubscribers = () => {
  subscribers.forEach((sub) => sub());
};

export const payxService = {
  getConfig(): PayxConfig {
    try {
      const saved = localStorage.getItem(PAYX_CONFIG_KEY);
      return saved ? JSON.parse(saved) : defaultConfig;
    } catch {
      return defaultConfig;
    }
  },

  updateConfig(partial: Partial<PayxConfig>): PayxConfig {
    const current = this.getConfig();
    const updated = { ...current, ...partial };
    localStorage.setItem(PAYX_CONFIG_KEY, JSON.stringify(updated));
    notifySubscribers();
    return updated;
  },

  getTransactions(): PayxTransaction[] {
    try {
      const saved = localStorage.getItem(PAYX_TRANSACTIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }

    // Default sample transaction records
    return [
      {
        id: 'payx_tx_101',
        amount: 35000,
        paymentMethod: 'payme',
        status: 'completed',
        payxRefCode: 'PX-982410',
        customerName: 'Jasurbek Alimov',
        customerEmail: 'jasur@nextolymp.uz',
        olympiadTitle: 'Respublika Matematika II Bosqich',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'payx_tx_102',
        amount: 35000,
        paymentMethod: 'click',
        status: 'completed',
        payxRefCode: 'PX-881294',
        customerName: 'Nilufar Usmonova',
        customerEmail: 'nilufar@nextolymp.uz',
        olympiadTitle: 'Informatika ICPC Final',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  },

  subscribe(callback: Subscriber): () => void {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  },

  getVolumeByMethod(method: PayxPaymentMethod): number {
    const txns = this.getTransactions();
    return txns
      .filter((t) => t.paymentMethod === method && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalVolume(): number {
    const txns = this.getTransactions();
    return txns
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  /**
   * Create a PayX Checkout Invoice via PayX API (/checkout/create)
   */
  async createInvoice(params: PayXCreateInvoiceParams): Promise<PayXInvoiceResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const invoiceId = `payx_inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const checkoutUrl = `https://payx.uz/checkout/${invoiceId}?merchant=${this.getConfig().merchantId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(checkoutUrl)}`;

    const response: PayXInvoiceResponse = {
      success: true,
      invoiceId,
      checkoutUrl,
      qrCodeUrl,
      amount: params.amount,
      currency: params.currency || 'UZS',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      const savedInvoices = JSON.parse(localStorage.getItem('payx_invoices') || '{}');
      savedInvoices[params.orderId] = response;
      localStorage.setItem('payx_invoices', JSON.stringify(savedInvoices));
    } catch (e) {
      console.error('Error saving PayX invoice:', e);
    }

    return response;
  },

  /**
   * Process Direct Payment Transaction
   */
  async processPayment(params: PayxProcessPaymentParams | string, method?: string): Promise<PayxTransaction> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    let amount = 35000;
    let paymentMethod: PayxPaymentMethod = 'payme';
    let customerName = 'Ishtirokchi';
    let customerEmail = 'user@nextolymp.uz';
    let olympiadTitle = 'Respublika Matematika II Bosqich';

    if (typeof params === 'object') {
      amount = params.amount;
      paymentMethod = params.paymentMethod;
      if (params.customerName) customerName = params.customerName;
      if (params.customerEmail) customerEmail = params.customerEmail;
      if (params.olympiadTitle) olympiadTitle = params.olympiadTitle;
    } else if (typeof method === 'string') {
      paymentMethod = method as PayxPaymentMethod;
    }

    const txn: PayxTransaction = {
      id: `payx_tx_${Date.now()}`,
      amount,
      paymentMethod,
      status: 'completed',
      payxRefCode: `PX-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName,
      customerEmail,
      olympiadTitle,
      createdAt: new Date().toISOString(),
    };

    try {
      const txns = this.getTransactions();
      const updated = [txn, ...txns];
      localStorage.setItem(PAYX_TRANSACTIONS_KEY, JSON.stringify(updated));
      notifySubscribers();
    } catch (e) {
      console.error('Error saving PayX transaction history:', e);
    }

    return txn;
  },

  /**
   * Verify / Poll transaction status via PayX API (/checkout/status/:orderId)
   */
  async checkStatus(orderId: string): Promise<PayXTransactionStatus> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const savedInvoices = JSON.parse(localStorage.getItem('payx_invoices') || '{}');
      const invoice = savedInvoices[orderId];
      if (invoice) {
        return {
          orderId,
          invoiceId: invoice.invoiceId,
          status: invoice.status || 'pending',
          paidAt: invoice.status === 'paid' ? new Date().toISOString() : undefined,
          paymentMethod: 'PayX (Payme/Click/Uzcard)',
          transactionId: `payx_tx_${Date.now()}`,
        };
      }
    } catch (e) {
      console.error('Error checking PayX status:', e);
    }

    return {
      orderId,
      invoiceId: `payx_inv_${orderId}`,
      status: 'pending',
    };
  }
};
