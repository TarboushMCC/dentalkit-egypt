# DentalKit Egypt

Egypt's first specialized e-commerce platform for dental students — buy the exact equipment package your university and academic year require, in one order.

> **Note:** This repository currently contains documentation only. The source code will be published at a later date.

## What it is

Dental students in Egypt spend the start of every year assembling long, university-specific equipment lists from scattered suppliers. DentalKit turns that into a guided flow: pick your university, pick your academic year, get the complete required kit as a single package — with individual products available too.

## Features

- **Kit finder** — university → academic year → your required package
- **Storefront** — packages, individual products, university browsing
- **Student dashboard** — orders, wishlist, reviews, profile
- **Admin panel** — manage universities, academic years, packages, products, orders, coupons
- **Payments** — InstaPay integration flow
- **Full commerce model** — cart, wishlist, reviews, coupons, order lifecycle
- **SEO** — structured data schemas, sitemap, robots, plus `llms.txt` / `llms-full.txt` for AI crawlers

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Base UI) |
| Animation | Framer Motion |
| Database | Prisma + PostgreSQL |
| Auth | NextAuth |
| Validation | Zod |
| Deployment | Multi-stage Dockerfile; docker-compose with app + Postgres + Redis + nginx |

## Data model

Full relational schema: User, University, AcademicYear, Package, Product, PackageItem, Order, Payment, Cart, Wishlist, Review, Coupon.

## Design

Deep dental blue (#0A2540) with medical cyan accents (#00B4D8) on warm white, Figtree display type with Noto Sans body — clinical but friendly.
