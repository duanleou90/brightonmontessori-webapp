This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Environment variables

This app requires a Builder.io public API key.

- **Create**: `.env.local` in the project root
- **Set**: `NEXT_PUBLIC_BUILDER_API_KEY=...`
- **Template**: see `env.example`

## Preview mode (draft content)

This project supports a **secure preview mode** for content editors.

- **What becomes “draft” in preview**: Umbraco content (fetched from the Umbraco Content Delivery API).
- **What stays “published” in preview**: Builder.io layout (known limitation: Builder Content API may not reliably return draft changes once an entry has been published).

### Setup

Add these to your `.env.local` (see `env.example`):

- **`PREVIEW_SECRET`**: shared secret used to enable preview mode (protects the preview endpoint).
- **`UMBRACO_DELIVERY_API_BASE_URL`**: e.g. `https://<site>/umbraco/delivery/api/v2`
- **`UMBRACO_DELIVERY_API_KEY`**: required for Umbraco draft preview (sent as `Api-Key` header).

Restart the dev server after changing environment variables.

### Enter preview mode

Open:

- `/api/preview?secret=<PREVIEW_SECRET>&slug=/events/english-day-on-carfree-day`

This endpoint:

- enables Next.js **draft mode** (sets a cookie in your browser)
- redirects you to the requested `slug`

When preview mode is enabled, you’ll see a **Preview mode banner** at the top of the site.

### Exit preview mode

Use the banner’s **Exit preview** button, or open:

- `/api/preview/exit?slug=/`

This clears the draft-mode cookie and redirects you back to the provided `slug`.

### Security notes

- Preview is **cookie-based** (Next.js draft mode). Query params like `?preview=1` are intentionally ignored.
- The `PREVIEW_SECRET` is what prevents anyone on the internet from enabling preview mode in their own browser.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
