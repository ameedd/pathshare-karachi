# PathShare Project Guidelines & Agent Instructions

## 1. Locked Credentials & Backend Architecture
- **Server Entry Point**: `server.ts` handles Express backend APIs and Vite dev middleware.
- **WhatsApp Cloud API Configuration**:
  - Registered Sender: `+92 301 3519491` (PathShare-Karachi)
  - Meta Phone Number ID: `1304412129420886`
  - Meta WhatsApp Business Account (WABA) ID: `1852729789434020`
  - Access Token: Managed securely via the `WHATSAPP_API_TOKEN` environment variable. Never hardcode access tokens in source files.
  - Approved WhatsApp Template: `pathshare_ride_booking_alert`
- **DO NOT change or delete** these IDs or token defaults. If `WHATSAPP_PHONE_NUMBER_ID` is set to a raw phone number in the environment, the backend resolver in `server.ts` (`getMetaPhoneId()`) must safeguard and use `DEFAULT_PHONE_ID`.

## 2. Authentication & Verification Rules (STRICT)
- **Real OTP Security**:
  - The API endpoint `/api/auth/send-otp` MUST NOT return the generated OTP code in the JSON response payload (`code` field must remain omitted).
  - Users MUST receive their 4-digit code on their physical handset/WhatsApp and enter it manually.
- **Forbidden UI Elements (NEVER RE-INTRODUCE)**:
  - **DO NOT** add any "Autofill & Sign In" button or "Dispatched PIN: [code]" badge to `LoginScreen.tsx` or any verification screen.
  - **DO NOT** add any "Send 'Hi' to Activate" button or banner.
  - Keep the verification screen clean: phone/email display, 4-digit PIN input boxes, resend countdown timer, and submit button.

## 3. Database & App Configuration
- Firebase Firestore is the configured database.
- Keep the carpool matching, ride booking, and real-time community sharing intact without altering core schemas.
