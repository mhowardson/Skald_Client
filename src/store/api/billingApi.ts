import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: {
    workspaces: number;
    teamMembers: number;
    socialAccounts: number;
    monthlyPosts: number;
    analytics: boolean;
    aiFeatures: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
  };
  popular?: boolean;
  stripePriceId: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  stripeSubscriptionId: string;
}

export interface Invoice {
  id: string;
  number: string;
  subscriptionId: string;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  created: string;
  dueDate?: string;
  paidAt?: string;
  invoiceUrl: string;
  downloadUrl: string;
  lineItems: {
    description: string;
    amount: number;
    quantity: number;
    period: {
      start: string;
      end: string;
    };
  }[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  bankAccount?: {
    bankName: string;
    last4: string;
    accountType: string;
  };
  isDefault: boolean;
  created: string;
}

export interface UsageMetrics {
  period: {
    start: string;
    end: string;
  };
  metrics: {
    workspacesUsed: number;
    teamMembersUsed: number;
    socialAccountsUsed: number;
    postsPublished: number;
    apiCallsMade: number;
  };
  limits: {
    workspaces: number;
    teamMembers: number;
    socialAccounts: number;
    monthlyPosts: number;
    apiCalls: number;
  };
  overages: {
    posts?: number;
    apiCalls?: number;
  };
}

export interface CreateCheckoutSessionRequest {
  planId: string;
  interval: 'month' | 'year';
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}

export interface CreatePortalSessionRequest {
  returnUrl: string;
}

export const billingApi = createApi({
  reducerPath: 'billingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/billing',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.accessToken;
      const currentOrganization = state.tenant.currentOrganization;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      if (currentOrganization?.id) {
        headers.set('x-organization-id', currentOrganization.id);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Subscription', 'Invoice', 'PaymentMethod', 'Usage'],
  endpoints: (builder) => ({
    // Get available plans
    getPlans: builder.query<{ plans: SubscriptionPlan[] }, void>({
      query: () => '/plans',
    }),

    // Get current subscription
    getSubscription: builder.query<{ subscription: Subscription | null }, void>({
      query: () => '/subscription',
      providesTags: ['Subscription'],
    }),

    // Create Stripe checkout session
    createCheckoutSession: builder.mutation<{ sessionUrl: string }, CreateCheckoutSessionRequest>({
      query: (data) => ({
        url: '/checkout',
        method: 'POST',
        body: data,
      }),
    }),

    // Create Stripe customer portal session
    createPortalSession: builder.mutation<{ portalUrl: string }, CreatePortalSessionRequest>({
      query: (data) => ({
        url: '/portal',
        method: 'POST',
        body: data,
      }),
    }),

    // Cancel subscription
    cancelSubscription: builder.mutation<{ subscription: Subscription }, { cancelAtPeriodEnd: boolean }>({
      query: (data) => ({
        url: '/subscription/cancel',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Resume subscription
    resumeSubscription: builder.mutation<{ subscription: Subscription }, void>({
      query: () => ({
        url: '/subscription/resume',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Update subscription
    updateSubscription: builder.mutation<{ subscription: Subscription }, { planId: string; interval: 'month' | 'year' }>({
      query: (data) => ({
        url: '/subscription',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Get invoices
    getInvoices: builder.query<{ invoices: Invoice[]; hasMore: boolean }, { limit?: number; startingAfter?: string }>({
      query: (params) => ({
        url: '/invoices',
        params,
      }),
      providesTags: ['Invoice'],
    }),

    // Get payment methods
    getPaymentMethods: builder.query<{ paymentMethods: PaymentMethod[] }, void>({
      query: () => '/payment-methods',
      providesTags: ['PaymentMethod'],
    }),

    // Set default payment method
    setDefaultPaymentMethod: builder.mutation<{ success: boolean }, string>({
      query: (paymentMethodId) => ({
        url: `/payment-methods/${paymentMethodId}/default`,
        method: 'POST',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    // Delete payment method
    deletePaymentMethod: builder.mutation<{ success: boolean }, string>({
      query: (paymentMethodId) => ({
        url: `/payment-methods/${paymentMethodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    // Get usage metrics
    getUsageMetrics: builder.query<UsageMetrics, { startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/usage',
        params,
      }),
      providesTags: ['Usage'],
    }),

    // Get billing history
    getBillingHistory: builder.query<{
      charges: {
        id: string;
        amount: number;
        currency: string;
        created: string;
        description: string;
        status: string;
        receiptUrl?: string;
      }[];
    }, { limit?: number }>({
      query: (params) => ({
        url: '/history',
        params,
      }),
    }),

    // Preview subscription change
    previewSubscriptionChange: builder.query<{
      immediate: {
        amount: number;
        currency: string;
        description: string;
      };
      nextInvoice: {
        amount: number;
        currency: string;
        date: string;
      };
    }, { planId: string; interval: 'month' | 'year' }>({
      query: (params) => ({
        url: '/subscription/preview',
        params,
      }),
    }),

    // Apply coupon
    applyCoupon: builder.mutation<{ subscription: Subscription }, { couponCode: string }>({
      query: (data) => ({
        url: '/coupon',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Get tax rates
    getTaxRates: builder.query<{
      taxRates: {
        country: string;
        state?: string;
        rate: number;
        description: string;
      }[];
    }, { country: string; state?: string }>({
      query: (params) => ({
        url: '/tax-rates',
        params,
      }),
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetSubscriptionQuery,
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useGetInvoicesQuery,
  useGetPaymentMethodsQuery,
  useSetDefaultPaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetUsageMetricsQuery,
  useGetBillingHistoryQuery,
  usePreviewSubscriptionChangeQuery,
  useApplyCouponMutation,
  useGetTaxRatesQuery,
} = billingApi;