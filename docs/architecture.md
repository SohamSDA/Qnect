# System Architecture – Qnect

Greetings everyone!!  

This document describes the **official folder structure and architectural organization** of the Qnect project.  
All contributors are expected to **strictly follow this structure and naming convention** to ensure consistency, scalability, and maintainability across the codebase.

```txt
Qnect/
│
├── README.md
├── .gitignore
├── package.json                # Root-level scripts (linting, formatting, tooling)
│
├── contributors/               # Contributor profiles
│   └── vaidik.md
│
├── frontend/                   # Next.js PWA client
│   ├── package.json
│   ├── next.config.js
│   ├── public/
│   │   ├── icons/
│   │   └── images/
│   │
│   └── src/
│       ├── app/                # Next.js App Router
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   └── (routes)/
│       │       ├── landing/
│       │       │   └── page.tsx
│       │       ├── login/
│       │       │   └── page.tsx
│       │       ├── dashboard/
│       │       │   └── page.tsx
│       │       ├── queues/
│       │       │   └── page.tsx
│       │       └── kiosk/
│       │           └── page.tsx
│       │
│       ├── components/         # Reusable UI and domain components
│       │   ├── ui/              # Buttons, modals, inputs
│       │   ├── queue/           # Queue lists and token cards
│       │   ├── charts/          # Admin analytics
│       │   └── navbar/
│       │
│       ├── context/
│       │   └── AuthContext.tsx
│       │
│       ├── hooks/
│       │   └── useAuth.ts
│       │
│       ├── lib/
│       │   ├── api.ts           # API wrapper (fetch / axios)
│       │   └── websocket.ts     # WebSocket client
│       │
│       ├── service-workers/
│       │   └── sw.js            # PWA offline support
│       │
│       └── types/
│           └── frontend.d.ts
│
├── backend/                    # Express + MongoDB API
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts              # Express app configuration
│       ├── server.ts           # Server bootstrap
│       │
│       ├── config/
│       │   ├── db.ts            # MongoDB connection
│       │   └── env.ts           # Environment variables
│       │
│       ├── middlewares/
│       │   ├── auth.middleware.ts
│       │   ├── error.middleware.ts
│       │   └── rateLimit.middleware.ts
│       │
│       ├── routes/
│       │   └── index.ts         # Route registry
│       │
│       ├── modules/             # Domain-driven modules
│       │   ├── auth/
│       │   │   ├── auth.routes.ts
│       │   │   ├── auth.controller.ts
│       │   │   └── auth.service.ts
│       │   │
│       │   ├── queue/
│       │   │   ├── queue.model.ts
│       │   │   ├── queue.routes.ts
│       │   │   ├── queue.controller.ts
│       │   │   └── services/
│       │   │       └── token.service.ts
│       │   │
│       │   ├── admin/
│       │   │   ├── admin.routes.ts
│       │   │   └── admin.controller.ts
│       │   │
│       │   └── notifications/
│       │       ├── email.service.ts
│       │       └── whatsapp.service.ts
│       │
│       ├── server/
│       │   └── socket.ts        # Socket.IO handlers
│       │
│       └── utils/
│           ├── jwt.ts
│           └── logger.ts
│
├── ml-service/                 # FastAPI ML service
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── schemas.py
│       └── services/
│           └── predictor.py
│
├── shared/                     # Shared contracts
│   ├── types/
│   │   ├── user.ts
│   │   ├── queue.ts
│   │   └── token.ts
│   └── schemas/
│       └── zod.ts
│
├── infra/                      # Infrastructure & deployment
│   ├── docker-compose.yml
│   ├── docker/
│   │   ├── backend.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   └── ml.Dockerfile
│   └── scripts/
│       └── seed.ts
│
└── docs/                       # Documentation
    ├── architecture.md
    ├── api.md
    └── websocket-events.md
