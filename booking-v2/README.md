# PaPa Gs Cutz — professional booking website starter

Mobile-first, multi-page website using the established green, navy and white brand. This is a starter package for GitHub Pages + Supabase; it is not a completed production payment system.

## Included pages
- `index.html` — home page
- `services.html` — service menu and current listed prices
- `booking.html` — booking request form, terms checkbox, optional marketing consent, WhatsApp handoff
- `gallery.html` — reserved area for the owner's real haircut photos
- `contact.html` — WhatsApp, address, Maps, Facebook and hours
- `login.html`, `signup.html`, `account.html` — Supabase email/password authentication and customer account
- `admin.html` — owner booking request manager
- `terms.html`, `privacy.html`, `booking-policy.html`, `payments.html` — separate policy pages
- `supabase/schema.sql` — tables, signup profile trigger and Row Level Security policies

## Setup (phone-friendly)
1. Make a backup of your existing `papa-gs-cutz` repository before replacing any files.
2. Upload the files and folders in this ZIP to the root of your GitHub repository. Keep `index.html` at the repository root. The included package does not include the actual haircut images; add your own permitted photos to `assets/` later.
3. In Supabase, create or choose the project for this website. Open **SQL Editor**, review `supabase/schema.sql`, then run it.
4. Open **Project Settings → API** (or the API keys page). Copy the project URL and the publishable key (legacy `anon` key also works with RLS). Edit `js/config.js` and paste them in the matching fields. Never use a `service_role` or secret key in website files.
5. Sign up through `signup.html` using the business owner's email. If email confirmation is enabled, confirm the email.
6. In Supabase SQL Editor, grant business-admin access to that exact owner account by running the final `update public.profiles ...` statement in `schema.sql` after replacing `OWNER_EMAIL_HERE` with the owner's email. Set the same email in `js/config.js` as `adminEmail`.
7. In Supabase **Authentication → URL Configuration**, set the Site URL to `https://justinoliver927-sudo.github.io/papa-gs-cutz/` and add allowed redirect URLs for that Pages URL and its `login.html` route if needed.
8. Open the published site, create a test customer account, and submit a test booking. Check Supabase **Table Editor → booking_requests**. Test customer access and owner access separately.

## Important notes
- The form opens WhatsApp for the barber to confirm. If Supabase is configured, it also attempts to save the request. A WhatsApp message is not confirmation.
- Requests submitted without login are saved with `user_id = null`; they are visible only to the business admin. Customers should log in before booking if they want the request listed on their account page.
- The admin page is protected by Supabase RLS, not merely by hiding a link. Never publish a service-role/secret key.
- The owner must manually grant `is_business_admin=true` in Supabase. The website's `adminEmail` setting controls display only; database RLS is the actual access control.
- The starter permits anonymous booking inserts to support no-account requests. Before public promotion, consider a server-side rate limiter/CAPTCHA and review spam/abuse risks.
- Service prices copied from the current site: Dye Cut R70; Plain Fade R45; Kids Dye Fade R60; Kids Plain Fade R35; Trim R12; Chiskop/Bles R30. Confirm these prices before launch.
- `booking.html` has no payment checkout. Payment is intentionally deferred until the business decides which services require payment and chooses a payment provider. Do not collect card details in this static website. A future integration needs server-side checkout creation, signed webhook verification, payment status storage, receipts and refund/cancellation terms.
- Legal pages are starter drafts, not legal advice or a guarantee of POPIA or consumer-law compliance. Have them reviewed before relying on them for the business.
- No cookies/analytics are added by this starter. If analytics, marketing pixels, or other non-essential tracking are added later, review consent and privacy requirements first.

## Recommended services / tools
- **GitHub Pages**: static website hosting (already used by the current site).
- **Supabase**: Postgres database, Auth and Row Level Security; manage data in the Supabase dashboard.
- **WhatsApp Business**: appointment conversations and confirmations.
- **Google Maps**: directions to the shop.
- **Payment provider (later)**: choose one that supports South African merchants and your intended payment types; complete merchant onboarding and test mode first. Do not activate until the services requiring payment are decided.
- **Domain (optional later)**: connect a domain after the website and authentication redirect URLs have been tested.
- **GitHub repository security**: keep branch protection enabled, never commit private keys, and review changes before publishing.

## Troubleshooting
- Login/signup reports Supabase is not configured: edit `js/config.js` and confirm values have no extra spaces/quotes.
- Signup works but login redirect fails: configure Supabase Auth Site URL and allowed redirect URLs.
- Booking is not stored: check the browser message and Supabase logs, confirm `schema.sql` ran, and check RLS policies. WhatsApp handoff can still work without a database save.
- Admin list is empty/denied: verify the owner profile has `is_business_admin=true`, the correct email is set in `js/config.js`, and you're logged into that owner account.
