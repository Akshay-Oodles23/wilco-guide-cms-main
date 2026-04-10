# WilCo Guide - Data Import Scripts

This folder contains production-ready bulk import scripts for Payload CMS.

## 📋 Scripts

### 1. Import Businesses (`import-businesses.js`)

**Status:** ✅ Proven Working  
**Purpose:** Bulk import all 12 businesses from `BUSINESS_DATA_COMPLETE.json`  
**Usage:**

```bash
node scripts/import-businesses.js
```

**What it does:**

- Authenticates with Payload CMS
- Looks up location IDs for each business by city name
- Transforms address data to use location relationships
- Uploads all businesses with complete data (hours, reviews, ratings, deals, amenities, etc.)
- Handles errors gracefully with detailed logging

**Data source:** `BUSINESS_DATA_COMPLETE.json` (root directory)

---

### 2. Upload Cities (`bulk-upload/upload-cities.mjs`)

**Status:** ✅ Proven Working  
**Purpose:** Bulk import 19 Texas cities/locations  
**Usage:**

```bash
npm run upload:cities
```

**What it does:**

- Authenticates with Payload CMS
- Uploads all Texas cities to the Locations collection
- Each city has coordinates for geolocation features

**Data source:** `bulk-upload/cities-data.mjs`

---

## 🚀 Quick Start Guide

### Step 1: Upload Locations (Cities)

```bash
npm run upload:cities
```

✅ This must run **first** as businesses reference city locations.

### Step 2: Upload Businesses

```bash
node scripts/import-businesses.js
```

✅ Imports all 12 businesses with complete data.

---

## 📊 Data Files

- **`BUSINESS_DATA_COMPLETE.json`** (root)
    - Contains all 12 businesses with complete information
    - Each business includes: hours, reviews, ratings, deals, amenities, jobs, menu items, events, social media

- **`bulk-upload/cities-data.mjs`**
    - Contains 19 Texas cities with coordinates
    - Used by `upload-cities.mjs`

---

## 🔧 Maintenance

### Key Features of Import Scripts

**import-businesses.js:**

- ✅ Handles location ID lookups (city name → location ID)
- ✅ Transforms address format for relationship fields
- ✅ Validates all required fields
- ✅ Detailed error reporting
- ✅ Uses JWT authentication

**upload-cities.mjs:**

- ✅ REST API-based approach
- ✅ Handles authentication tokens
- ✅ Batch processing with delays between requests
- ✅ Comprehensive logging with emojis

---

## ⚠️ Notes

- **CMS must be running:** `npm run dev` in another terminal
- **Locations first:** Always upload cities before businesses
- **Authentication:** Uses `admin@wilcoguide.com` / `WilCo2024!Secure`
- **Idempotent:** Scripts can be re-run safely (updates existing records)

---

## 🗑️ Removed Files

The following files were removed as they were redundant or broken:

- `import-businesses.mjs` (had TypeScript import errors)
- `import-businesses.ts` (not needed - using .js version)
- `import-businesses.sh` (not needed - using .js version)
- `manual-import-guide.js` (just a reference guide)
- `bulk-upload/upload-businesses.mjs` (had category lookup issues)

These were replaced by the proven `import-businesses.js` script.

---

## ✅ Verification

After running imports, verify data was uploaded:

1. **Admin Dashboard:** http://localhost:3000/admin/collections
2. **Directory Page:** http://localhost:3000/directory
3. **Home Page:** http://localhost:3000 (should show businesses by auto-detected location)

---

**Last Updated:** April 10, 2026  
**Status:** Production Ready
