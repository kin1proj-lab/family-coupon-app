# 🎟️ Kupony - Family Coupon & Voucher Vault
### כספת השוברים והקופונים המשפחתית

A modern, responsive, and collaborative family voucher and coupon management system. **Kupony** allows families to pool gift cards, club vouchers, shopping discounts, and promo codes into a shared, real-time synchronized cloud vault.

---

## 🌟 Key Features

### 🔐 Authentication & Scoped Authorization
- **Google Sign-In (Gmail)**: Seamless 1-click authentication with Google account picker.
- **Email & Password**: Full registration and login workflows with display name support.
- **Strict Authorization**: Users only see families they **own** or **participate in** (by user ID or invited email). No unauthorized access to other families' vouchers.
- **Instant Onboarding**: First-time users automatically receive their personalized primary family vault upon login.

### 👨‍👩‍👧‍👦 Multi-Family Management & Owner Controls
- **Multiple Family Memberships**: Switch effortlessly between different families (e.g., immediate family, grandparents, vacation club).
- **Owner Controls**: Family owners can:
  - ✏️ **Edit Family**: Update family name and emoji (🏡, ❤️, 🌟, 🛒, 🏖️, 👑).
  - 🗑️ **Delete Family**: Permanently delete a family and all its associated coupons with a confirmation safety guard.
  - ✉️ **Invite Members**: Invite relatives by email address with pending/accept/decline workflows.

### ⚡ Smart Redemption & Partial Usage Tracking
- **⚡ Fast Full Use ("נוצל מלא ⚡")**: Single-click button on coupon cards and details to mark a voucher completely used without any popup friction.
- **🧮 Partial Deductions**: Easily record partial transactions (e.g., starting with ₪500, spending ₪120 at the cashier, leaving ₪380).
- **📜 Detailed Usage Ledger**: Comprehensive history tracking which family member deducted how much, date/time, remaining balance, and optional shopping notes.
- **↩️ Undo Redemption**: Mistake at the checkout? Family members can undo a usage entry to restore the balance.

### 📱 Cashier-Ready Presentation
- **Dynamic Barcode & QR Code**: Built-in SVG renderer supporting Code-128 and QR codes with high-contrast cashier scanning.
- **Photo Vouchers**: Upload screenshot/photo vouchers with a 1-tap "Enlarge for Cashier" zoom view.
- **One-Tap Copy**: Quick copy for promo codes and PINs for online shopping.

### 🌐 Native Bilingual (Hebrew / English & Full RTL)
- Complete Hebrew (`he`) and English (`en`) localization with instantaneous language switcher.
- Strict bi-directional layout adaptation (Right-to-Left for Hebrew, Left-to-Right for English).

### 🔍 Advanced Filtering & Sorting
- **Smart Statuses**: Filter by usable/active coupons, unused, partially used, or fully redeemed.
- **Expiration Alerts**: Highlight vouchers expiring within the next 7 days or already expired.
- **Search & Filter**: Filter by store, category (Groceries, Fashion, Dining, Electronics, Home, etc.), and price ranges.
- **Sort**: Sort by expiration date, remaining value, store name, or date added.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Bundler & Dev Server** | [Vite 8](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Authentication** | [Firebase Authentication](https://firebase.google.com/docs/auth) (Google & Email/Password) |
| **Database** | [Google Cloud Firestore](https://firebase.google.com/docs/firestore) (Real-Time Synchronized) |
| **Effects** | Canvas Confetti for celebratory redemption feedback |

---

## 📁 Project Architecture

```
├── firebase-applet-config.json    # Firebase project configuration
├── firestore.rules                # Firestore security rules
├── index.html                     # Main HTML entry point
├── package.json                   # Project dependencies and scripts
├── vite.config.ts                 # Vite bundler configuration
└── src/
    ├── App.tsx                    # Main app container, routing & state orchestrator
    ├── main.tsx                   # React root entry point
    ├── index.css                  # Global Tailwind styles
    ├── types/
    │   └── index.ts               # Core TypeScript models (Coupon, Family, User, Invite)
    ├── i18n/
    │   └── translations.ts        # Hebrew & English translation dictionaries
    ├── services/
    │   ├── firebase.ts            # Firebase Auth & Cloud Firestore synchronization
    │   └── storage.ts             # LocalStorage offline caching utilities
    └── components/
        ├── LoginPage.tsx          # Authentication screen (Google & Email/Password)
        ├── Header.tsx             # Navbar with user badge, family switcher & logout
        ├── CouponCard.tsx         # Responsive coupon card with fast-use button
        ├── CouponDetailModal.tsx  # Fullscreen details, cashier scanner & history
        ├── RedeemModal.tsx        # Partial deduction calculator with preset amounts
        ├── AddEditCouponModal.tsx # Full coupon creation/edit form
        ├── QuickAddModal.tsx      # Express 10-second coupon creation modal
        ├── FilterBar.tsx          # Store, category, and expiration search filters
        ├── FamilyManageModal.tsx  # Family switcher, member list, invites, owner controls
        └── BarcodeRenderer.tsx    # High-contrast Code-128 and QR code renderer
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation
1. Clone the repository or navigate to the project directory:
   ```bash
   cd /path/to/project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
Create an optimized production bundle:
```bash
npm run build
```

### Type Checking & Linting
Validate TypeScript types and syntax:
```bash
npm run lint
```

---

## 🔒 Security & Privacy

- Firestore security rules (`firestore.rules`) enforce secure top-level collection access.
- All user data and family memberships are isolated per family group.
- All mutations (deductions, additions, removals) are logged with member attribution and timestamped.
