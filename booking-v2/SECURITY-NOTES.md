# Security checklist before public launch

- [ ] Replace all Supabase placeholders in `js/config.js`.
- [ ] Verify only a publishable/anon key is used in browser code; never use a service-role or secret key.
- [ ] Run the SQL schema and review RLS policies against the actual business workflow.
- [ ] Grant owner status only to the business owner's account and test that a normal customer cannot access `admin.html` data.
- [ ] Configure Supabase Auth URL allow-list and email confirmation.
- [ ] Add server-side anti-spam/rate limiting before advertising anonymous booking forms widely.
- [ ] Review terms, privacy, cancellation, payment and refund wording for the actual business and applicable South African requirements.
- [ ] Add real photos with permission and verify all links from a phone.
- [ ] Confirm listed prices and business details before launch.
- [ ] Do not enable payments until a provider is selected and server-side verification is implemented.
