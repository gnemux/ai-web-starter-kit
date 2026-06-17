export type ProductTrack = {
  name: string;
  description: string;
};

export const productTracks: ProductTrack[] = [
  {
    name: "AI Rules",
    description: "Context, specs, status, and repeatable AI coding rules."
  },
  {
    name: "Auth",
    description: "Sign up, sign in, protected routes, and user profile."
  },
  {
    name: "Payment",
    description: "Checkout, orders, subscriptions, and entitlement."
  },
  {
    name: "Analytics",
    description: "Events, funnels, validation signals, and monitoring."
  }
];
