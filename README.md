# Irielle Healthcare Platform

This is a [Next.js](https://nextjs.org) healthcare management platform bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Production Deployment

The application uses Docker Compose with Nginx reverse proxy and SSL support:

- **Frontend:** Next.js application (port 3000 internal)
- **Backend:** FastAPI AI service (port 8001 -> 8000 internal)
- **Database:** MongoDB (port 27017)
- **Vector DB:** ChromaDB (port 8000)
- **Reverse Proxy:** Nginx with SSL termination (ports 80/443)
- **SSL:** Let's Encrypt certificates via certbot

### Quick Start (Production)

1. **Clone and setup:**
```bash
git clone <repository-url>
cd irielle
```

2. **Configure environment:**
```bash
# Copy and edit environment file
cp .env.production.example .env.production
# Edit with your actual values (MongoDB, JWT secrets, etc.)
```

3. **Start all services:**
```bash
docker compose up -d
```

4. **Setup SSL certificates (production):**
```bash
# Replace with your domain and email
./docker/certbot/init-letsencrypt.sh yourdomain.com admin@yourdomain.com 0
```

For detailed setup instructions, see [Docker Setup Guide](./docker/README.md).

## 🛠️ Development Setup

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
