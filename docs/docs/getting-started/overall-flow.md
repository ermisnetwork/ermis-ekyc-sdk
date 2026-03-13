---
sidebar_position: 3
---

# Overall Flow

## Architecture Overview

The Ermis eKYC system consists of two layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ErmisService (Management)                    │
│                                                                 │
│  1. Login ──► 2. Create Customer ──► 3. Create Appraiser        │
│                                           │                     │
│                    4. Setup Appraisal Session                   │
│                       (1 HOST + 1 GUEST)                        │
│                           │                                     │
│                    5. Get joinCode from registrants              │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ermis-ekyc-react (React UI)                    │
│                                                                 │
│  6. EkycMeetingPreview ──► 7. EkycMeetingRoom ──► 8. ActionPanel│
│     (join with code)          (video call)         (OCR/Live/FM)│
└─────────────────────────────────────────────────────────────────┘
```

## Step-by-Step

### Step 1-3: Setup (Management Module)

The **Management Module** (`ErmisService`) handles all backend operations:

1. **Login** – Authenticate with username/password to get an access token
2. **Create Customer** – Register the person being verified, with their ID card images
3. **Create Appraiser** – Register the person who will perform the verification

### Step 4-5: Create Session

4. **Setup Appraisal Session** – Create a meeting with exactly 2 registrants:
   - 1 **HOST** (Appraiser) – performs the eKYC verification
   - 1 **GUEST** (Customer) – being verified
5. **Get Join Codes** – Each registrant receives a unique `joinCode` to enter the video session

### Step 6-8: Video eKYC (React Module)

6. **EkycMeetingPreview** – Test camera & microphone, then join with room code
7. **EkycMeetingRoom** – Video call between appraiser and customer
8. **EkycActionPanel** – The appraiser runs the 3-step eKYC:
   - **OCR** – Capture and extract ID card information
   - **Liveness** – Verify the customer is a real person
   - **Face Match** – Compare the customer's face with the document photo

## Authentication Flow

```
┌──────────────┐                    ┌──────────────────┐
│  ErmisService │ ──── Bearer ────► │ Management API   │
│  (Management) │     Token         │ (auth, customers,│
└──────────────┘                    │  appraisers,     │
                                    │  meetings)       │
                                    └──────────────────┘

┌──────────────┐                    ┌──────────────────┐
│  EkycService  │ ──── API ───────► │ eKYC API         │
│  (eKYC)      │     Key           │ (OCR, liveness,  │
└──────────────┘                    │  face match)     │
                                    └──────────────────┘
```

- **ErmisService** uses **Bearer token** authentication (login → get token → use token)
- **EkycService** uses **API key** authentication (set once at initialization)
