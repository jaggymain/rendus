# Rendus AI

<div align="center">

![Rendus AI](https://img.shields.io/badge/Rendus-AI%20Generation-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)

**A full-stack AI image and video generation SaaS platform**

[Demo](https://rendus.ai) • [Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Architecture](#architecture)

</div>

---

## 🎯 Overview

Rendus AI is a modern, production-ready SaaS platform for AI-powered image and video generation. Built with Next.js 16 and React 19, it provides a seamless experience for creating stunning visuals using state-of-the-art AI models from providers like Black Forest Labs (FLUX), Google (Veo), and more.

### Key Highlights

- **🎨 Multi-Modal Generation**: Text-to-image, text-to-video, and image-to-video
- **⚡ Real-time Processing**: Async job queue with live status updates
- **💳 Integrated Payments**: Stripe checkout with credit-based billing
- **🔐 Secure Authentication**: NextAuth.js with OAuth providers
- **☁️ Cloud Storage**: AWS S3 for persistent media storage
- **📱 Responsive Design**: Works beautifully on desktop and mobile

---

## ✨ Features

### AI Generation
- **6 Curated Image Models** including FLUX Pro Ultra, Recraft V3, and Stable Diffusion 3.5
- **4 Curated Video Models** including Kling 2.1, Veo 3, and Wan Effects
- Parameter controls: aspect ratio, inference steps, guidance scale, seeds
- Special effects: 40+ Wan Effects (Cakeify, Hulk, Anime, etc.)

### User Experience
- Real-time generation progress with polling
- Gallery view with video preview on hover
- Full-screen media viewer with metadata
- Credit balance display with purchase flow

### Platform
- Credit-based usage system (10 free credits on signup)
- Stripe integration for credit purchases
- User dashboard with generation history
- Model-specific pricing (1-8 credits per generation)

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js v5 (Google OAuth) |
| **Payments** | Stripe Checkout |
| **Job Queue** | Inngest |
| **Storage** | AWS S3 |
| **AI Providers** | FAL.ai (FLUX, Kling, Veo, etc.) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js App Router • React 19 • shadcn/ui • Tailwind       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      API Routes                              │
│  /api/generate • /api/credits • /api/stripe/* • /api/images │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Inngest     │ │   Stripe      │ │   NextAuth    │
│  Job Queue    │ │  Payments     │ │     Auth      │
└───────┬───────┘ └───────────────┘ └───────────────┘
        │
        ▼
┌───────────────┐      ┌───────────────┐
│   FAL.ai      │──────│   AWS S3      │
│  AI Models    │      │   Storage     │
└───────────────┘      └───────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│                    PostgreSQL                              │
│  Users • Generations • CreditPurchases • Sessions         │
└───────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- AWS account (for S3)
- FAL.ai API key
- Stripe account (for payments)
- Google OAuth credentials

### Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rendus-ai"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# FAL.ai
FAL_KEY="your-fal-api-key"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-west-2"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Inngest
INNGEST_EVENT_KEY="your-inngest-key"
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rendus.git
cd rendus

# Install dependencies
npm install

# Set up database
npx prisma migrate dev

# Start development server
npm run dev

# In another terminal, start Inngest dev server
npx inngest-cli@latest dev
```

Visit `http://localhost:3000` to see the app.

---

## 📁 Project Structure

```
rendus/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── generate/      # Generation endpoint
│   │   ├── credits/       # Credits management
│   │   ├── stripe/        # Stripe checkout & webhooks
│   │   └── images/        # Image operations
│   ├── generate/          # Main generation UI
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── generation-sidebar.tsx
│   ├── credits-display.tsx
│   └── model-selector.tsx
├── lib/                   # Utilities & configs
│   ├── models-curated.ts # AI model definitions
│   ├── credits.ts        # Credit system
│   ├── stripe.ts         # Stripe config
│   ├── s3.ts             # AWS S3 utilities
│   └── prisma.ts         # Database client
├── inngest/              # Background job functions
├── prisma/               # Database schema
└── public/               # Static assets
```

---

## 💰 Credit System

| Model | Credits | Type |
|-------|---------|------|
| FLUX 1.1 Pro Ultra | 2 | Image |
| FLUX 1.1 Pro | 1 | Image |
| FLUX.1 Dev | 1 | Image |
| Recraft V3 | 1 | Image |
| Ideogram V2 | 2 | Image |
| Stable Diffusion 3.5 | 1 | Image |
| Kling 2.1 Master | 5 | Video |
| Veo 3 | 8 | Video |
| MiniMax Video | 4 | Video |
| Wan Effects | 3 | Video |

**Credit Packages:**
- Starter: 50 credits / $5
- Creator: 200 credits / $15 (Best Value)
- Pro: 500 credits / $30

---

## 🔒 Security

- All API routes protected with NextAuth session validation
- Stripe webhook signature verification
- Environment variables for sensitive data
- S3 signed URLs for secure media access
- HTTPS enforced in production

---

## 📈 Future Roadmap

- [ ] Subscription plans (unlimited generations)
- [ ] Team workspaces
- [ ] API access for developers
- [ ] Custom model fine-tuning
- [ ] Batch generation
- [ ] Advanced editing tools

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Nick Williams**

Built with Claude AI assistance as a demonstration of AI-augmented development.

---

<div align="center">

Made with ❤️ using [Next.js](https://nextjs.org) and [Claude](https://anthropic.com)

</div>
