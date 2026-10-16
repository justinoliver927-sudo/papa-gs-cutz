# PaPa Gs Cutz — Security Layers

## Purpose
This document tracks the security controls required for the PaPa Gs Cutz website and booking system.

A checklist item is a goal until it has been implemented and tested. Do not treat this document as proof that a control is active.

## 1. Repository security
- [ ] Protect the main branch and review changes before merging.
- [ ] Enable Dependabot alerts and security updates where available.
- [ ] Review GitHub Actions permissions and third-party actions.
- [ ] Never commit private keys, passwords, access tokens, or service-role secrets.

## 2. Authentication
- [ ] Use Supabase Auth for protected user access.
- [ ] Configure appropriate password and email verification settings.
- [ ] Test account recovery and session expiry.

## 3. Authorization
- [ ] Enforce administrator permissions in trusted backend/database policies.
- [ ] Never rely on a hidden button or frontend email comparison as the only admin check.
- [ ] Test that ordinary users cannot access admin-only data or actions.

## 4. Database security
- [ ] Enable and verify Row Level Security on exposed tables.
- [ ] Review every SELECT, INSERT, UPDATE, and DELETE policy.
- [ ] Test policies using ordinary and administrator accounts.
- [ ] Keep privileged server keys out of browser code.

## 5. Input validation
- [ ] Validate booking data and allowed field values.
- [ ] Apply validation in trusted backend/database layers, not only the browser.
- [ ] Safely render user-supplied text.

## 6. Abuse protection
- [ ] Add appropriate rate limits to sensitive backend operations.
- [ ] Prevent duplicate or abusive booking submissions.
- [ ] Monitor unusual authentication and booking activity.

## 7. Browser protections
- [ ] Review HTTPS and browser security headers.
- [ ] Configure Content Security Policy where hosting supports it.
- [ ] Do not assume a repository file named _headers is enforced by GitHub Pages.

## 8. Secrets management
- [ ] Store private credentials in approved secret storage.
- [ ] Rotate any credential that may have been exposed.
- [ ] Keep only intended public configuration in frontend files.

## 9. Dependencies
- [ ] Enable Dependabot version updates.
- [ ] Review dependency alerts and update changes before merging.
- [ ] Avoid unnecessary third-party scripts and libraries.

## 10. Payment integrity
- [ ] Do not trust payment status supplied by the browser.
- [ ] Verify payments through a trusted payment-provider callback or backend.
- [ ] Never store raw card details in this website.

## 11. Privacy
- [ ] Collect only the personal information needed for bookings.
- [ ] Publish an appropriate privacy notice.
- [ ] Define retention and deletion practices for booking information.

## 12. Monitoring
- [ ] Run automated checks on changes.
- [ ] Check website availability on a schedule.
- [ ] Review failed workflows and unexpected backend activity.

## 13. Backups and recovery
- [ ] Document database backup and restore procedures.
- [ ] Test restoration periodically.
- [ ] Keep recovery instructions accessible to the owner.

## 14. Testing
- [ ] Test normal booking flows after changes.
- [ ] Test unauthorized access and invalid inputs.
- [ ] Review logs and resolve failed automated checks.

## 15. Incident response
- [ ] Document who to contact and how to disable compromised credentials.
- [ ] Record incidents without storing passwords or verification tokens.
- [ ] Re-test affected controls after remediation.

## Hosting limitation
GitHub Pages serves static files. It does not provide a custom application server or automatically enforce server-side authorization, database policies, payment verification, or arbitrary security-header configuration. These controls must be provided by the appropriate backend, database, payment provider, or supported hosting platform.

## Current status
Automated checks have passed on the review branch. This is not a full security audit. Each control above must be implemented and verified before being marked complete.
