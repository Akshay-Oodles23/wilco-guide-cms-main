# Bulk Upload Cities to CMS

This folder contains scripts and utilities for bulk uploading Texas cities to the Payload CMS Locations collection.

## 📁 Files

- **`cities-data.ts`** - Master list of all Texas cities with metadata
- **`upload-cities.ts`** - Script to bulk upload cities to CMS
- **`README.md`** - This file

## 🚀 Quick Start

### Prerequisites

- Payload CMS running locally (`npm run dev`)
- `.env.local` file configured with database connection
- Locations collection created in CMS

### Upload Cities

```bash
# From project root
npm run upload:cities
```

## 📊 What Gets Uploaded

**19 Total Cities:**

### Williamson County (9 cities)

1. Georgetown (DEFAULT)
2. Round Rock
3. Cedar Park
4. Leander
5. Liberty Hill
6. Hutto
7. Taylor
8. Jarrell
9. Florence

### Major Texas Cities (10 cities)

10. Austin
11. San Antonio
12. Houston
13. Dallas
14. Fort Worth
15. El Paso
16. Arlington
17. Corpus Christi
18. Lubbock
19. Plano

## 📝 City Data Structure

Each city includes:

```typescript
{
	name: string; // Full city name
	slug: string; // URL-friendly slug
	state: "Texas"; // Always Texas
	country: "US"; // Always US
	isDefault: boolean; // Only Georgetown = true
	description: string; // City description
}
```

## ✅ Verification

After upload, the script will:

1. ✅ Show upload progress
2. ✅ Display summary (created, skipped, errors)
3. ✅ Count total locations in database
4. ✅ Confirm default location is set

Expected output:

```
✅ Created: 19
⏭️ Skipped (duplicates): 0
❌ Errors: 0

📍 Total locations in database: 19
✅ Default location set: Georgetown
```

## 🔄 Running Again

If you need to re-run the upload:

- **Already existing cities will be skipped** (no duplicates)
- **New cities will be added**
- **Safe to run multiple times**

```bash
npm run upload:cities
```

## ❌ Troubleshooting

### Error: "Locations collection not found"

- Go to Payload CMS Admin
- Create the Locations collection first
- Then run the upload script

### Error: "Cannot find module 'payload'"

```bash
npm install
```

### Error: "Database connection failed"

- Ensure `.env.local` is configured
- Ensure database is running
- Ensure `npm run dev` is running first

## 📌 Next Steps After Upload

1. **Verify in CMS**
    - Go to Payload Admin → Locations
    - Confirm all 19 cities appear
    - Confirm Georgetown has `isDefault: true`

2. **Update Content**
    - Link Articles to locations
    - Link Jobs to locations
    - Link Businesses to locations

3. **Test Filtering**
    - Visit home page
    - Click location dropdown
    - Verify all cities appear
    - Test location filtering

## 🛠️ Customization

### Add More Cities

Edit `cities-data.ts`:

```typescript
{
  name: "Your City",
  slug: "your-city",
  state: "Texas",
  country: "US",
  isDefault: false,
  description: "City description"
}
```

Then re-run the upload script.

### Change Default City

Edit `cities-data.ts` and change `isDefault: true` to the desired city:

```typescript
{
  name: "Austin",
  slug: "austin",
  isDefault: true,  // ← Change this
  // ...
}
```

## 📚 Related Files

- Main Locations collection: `src/collections/Locations.ts`
- LocationDropdown component: `src/components/wilco/LocationDropdown.tsx`
- Location context: `src/context/LocationContext.tsx`
- Detection hook: `src/hooks/useDetectLocation.ts`

## 🤝 Support

For issues or questions:

1. Check `.env.local` configuration
2. Ensure database is running
3. Check CMS console for errors
4. Review script output for detailed error messages
