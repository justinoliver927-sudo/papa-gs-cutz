# PaPa Gs Cutz — Incident Response Plan

## Purpose
This plan describes how to respond to suspected website, account, database, or payment security incidents.

## 1. Identify the incident
Examples include:
- An unexpected administrator account or login.
- Suspected exposure of a private key or password.
- Unauthorized access to booking records.
- Unexpected website changes.
- Repeated failed security checks or suspicious database activity.

Record the time, affected service, symptoms, and relevant error messages. Do not record passwords, private keys, or verification tokens.

## 2. Contain the issue
- Restrict access to the affected account or service.
- Disable a compromised credential and rotate it using the provider's official dashboard.
- If a deployment is unsafe, stop further deployments and prepare a reviewed rollback.
- Do not delete logs or evidence needed for investigation.

## 3. Protect Supabase
- Review authentication sessions and account activity.
- Inspect database policies and suspicious records.
- Revoke and rotate any exposed privileged keys.
- Never place privileged keys in frontend files.
- Confirm that ordinary users cannot access administrator-only data.

## 4. Protect GitHub
- Review recent commits, workflow runs, and repository access.
- Revert unsafe changes only after reviewing the affected files.
- Remove unauthorized access and rotate exposed credentials.
- Keep recovery changes on a review branch until tested.

## 5. Investigate and recover
- Identify the likely cause and affected data.
- Fix the underlying issue before restoring normal operation.
- Restore from a known-good backup if necessary.
- Test booking, authentication, and access permissions after recovery.

## 6. Communicate responsibly
- Notify the website owner promptly.
- If personal information may have been exposed, seek appropriate privacy or legal guidance and follow applicable notification requirements.
- Do not publicly disclose private customer information.

## 7. Record the outcome
Document:
- Date and time.
- Affected systems.
- Cause, if known.
- Actions taken.
- Credentials rotated.
- Tests completed.
- Follow-up improvements.

## Important
This plan is a response guide, not an active monitoring or automatic incident-response system. Its steps must be carried out by an authorized person.
