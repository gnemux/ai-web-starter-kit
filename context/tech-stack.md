# Tech Stack

## Default Stack

- Runtime: Node.js 22
- Package manager: pnpm
- Monorepo task runner: Turborepo
- Web framework: Next.js App Router
- Language: TypeScript strict mode
- Styling: Tailwind CSS
- UI system: shadcn/ui conventions
- Database and Auth: Supabase
- Deployment: Vercel
- Analytics: PostHog first, Jiguang reserved for China-friendly analytics
- Payments: Sandbox Provider first, then one real provider

## Selection Principles

- Prefer boring, mainstream tools with strong AI and community support.
- Prefer hosted services during MVP validation.
- Add dependencies only when they reduce real complexity.
- Keep provider-specific logic behind adapters.
- Keep generated artifacts explicit and reproducible.

## Pending Decisions

- First real payment provider: Creem, Dodo, Paddle, Stripe, or other.
- Error monitoring provider: Sentry or Vercel native observability.
- Email provider: Resend or provider attached to the deployment stack.
