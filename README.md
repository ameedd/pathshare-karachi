# PathShare Carpool — Karachi Smart Daily Commuter & University Carpooling

PathShare is a verified, cost-sharing carpool and parcel delivery platform purpose-built for students, corporate professionals, and daily commuters across Karachi, Pakistan.

## 🚀 Key Features

1. **Dual Verification (CNIC + Corporate/University ID)**: Mandatory verification ensuring only authentic students and professionals participate in carpools.
2. **Safe Public Pickup Hotspots**: Designated, well-lit meeting points with GPS-guided proximity alerts across Karachi (IBA, FAST, NED, Clifton Boat Basin, NIPA, Korangi Creek, DHA).
3. **3-Minute Hotspot Arrival Countdown**: Real-time beacon alerts notifying passengers upon driver arrival with a punctual departure window.
4. **inDrive-Style Live Counter-Offers**: Real-time fare negotiation allowing passengers and drivers to propose, counter, or accept customized cost-sharing rates.
5. **Fair Cost-Sharing Fuel Engine**: Standardized non-commercial rates indexed to real-time petrol prices and distance.
6. **In-Cabin Trip Audio Safety & SOS**: AES-256 client-side encrypted audio recording with 1-tap emergency dispatch to WhatsApp contacts and Police Helpline (15).
7. **Cloud Persistence (Firebase Firestore & Auth)**: Real-time synchronization of rides, bookings, active negotiations, user profiles, and chat threads.

## 🛠️ Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Maps & Location**: Leaflet + OpenStreetMap + Nominatim Geocoding API
- **Icons & Motion**: Lucide React + Motion
- **Backend & Persistence**: Node.js Express + Firebase Firestore + Firebase Auth
- **Testing**: Vitest

## 📦 Getting Started

### Running Locally (Development)
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌐 Deploying to Surge.sh (or Static Web Hosting)

> **Important**: This is a modern **React + Vite** app. The new screens and blue theme live in `src/` (TypeScript and Tailwind CSS). Browsers cannot run raw TypeScript files directly from `index.html` on your hard drive. 
> To deploy or run static files, you must compile the project into the **`dist`** folder.

### 1-Step Deploy to Surge:
```bash
npm run deploy:surge
```

### Or Manual Step-by-Step:
```bash
# 1. Build the production files into the dist/ directory
npm run build

# 2. Deploy ONLY the dist folder to surge (NOT the root directory):
npx surge dist --domain ameed.surge.sh
```

The compiled `dist/` folder contains:
- `dist/index.html` (bundled HTML with compiled styles and scripts)
- `dist/200.html` (for Surge SPA routing fallback)
- `dist/assets/` (bundled high-performance JavaScript and Tailwind CSS)
