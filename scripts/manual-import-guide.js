#!/usr/bin/env node

/**
 * Manual Import Guide for Payload CMS Admin
 *
 * Since API imports are having authorization/relationship issues,
 * use this guide to import data via the admin UI
 */

const fs = require("fs");
const path = require("path");

// Read the business data
const dataPath = path.join(__dirname, "../BUSINESS_DATA_COMPLETE.json");
const businessesData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                  MANUAL IMPORT GUIDE - PAYLOAD CMS ADMIN                 ║
╚═══════════════════════════════════════════════════════════════════════════╝

📊 BUSINESSES TO IMPORT: ${businessesData.length}

STEP 1: Open Admin Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌐 Visit: http://localhost:3000/admin/collections/businesses

STEP 2: Click "Create New Business"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OR: http://localhost:3000/admin/collections/businesses/create

STEP 3: Copy & Paste Data for Each Business
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

businessesData.forEach((business, index) => {
	console.log(`
📍 Business ${index + 1}/${businessesData.length}: ${business.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASIC INFO:
  Name:          ${business.name}
  Slug:          ${business.slug}
  Status:        ${business.status}
  Featured:      ${business.featured}
  Category:      ${business.category}
  Subcategory:   ${business.subcategory || "N/A"}
  Description:   ${business.description.substring(0, 60)}...
  
CONTACT:
  Phone:         ${business.phone}
  Email:         ${business.email}
  Website:       ${business.website}

LOCATION:
  Street:        ${business.address.street}
  City:          ${business.address.city}
  State:         ${business.address.state}
  ZIP:           ${business.address.zip}
  Latitude:      ${business.address.lat}
  Longitude:     ${business.address.lng}

RATINGS:
  Google Rating: ${business.googleRating}
  Review Count:  ${business.googleReviewCount}
  Price Range:   ${business.priceRange}

BUSINESS HOURS:
  Monday:        ${business.hours.mon.open} - ${business.hours.mon.close}
  Tuesday:       ${business.hours.tue.open} - ${business.hours.tue.close}
  Wednesday:     ${business.hours.wed.open} - ${business.hours.wed.close}
  Thursday:      ${business.hours.thu.open} - ${business.hours.thu.close}
  Friday:        ${business.hours.fri.open} - ${business.hours.fri.close}
  Saturday:      ${business.hours.sat.open} - ${business.hours.sat.close}
  Sunday:        ${business.hours.sun.open} - ${business.hours.sun.close}

AMENITIES (${business.amenities.length}):
  ${business.amenities.map((a, i) => `${i + 1}. ${a}`).join("\n  ")}

REVIEWS (${business.reviews.length}):
${business.reviews
	.map(
		(r) =>
			`  Author: ${r.author}
  Rating: ${r.rating}/5 stars
  Date: ${r.date}
  Text: ${r.text.substring(0, 60)}...`,
	)
	.join("\n")}

DEALS (${business.deals.length}):
${business.deals.map((d) => `  • ${d.title} - ${d.discount}`).join("\n")}

JOBS (${business.jobs.length}):
${business.jobs.map((j) => `  • ${j.title} (${j.type}) - ${j.salary}`).join("\n")}

MENU ITEMS (${business.menuItems.length}):
${business.menuItems.map((m) => `  • ${m.name} - ${m.price}`).join("\n")}

UPCOMING EVENTS (${business.upcomingEvents.length}):
${business.upcomingEvents.map((e) => `  • ${e.title} - ${e.date}`).join("\n")}

SOCIAL MEDIA:
${Object.entries(business.socialMedia)
	.map(([k, v]) => `  • ${k}: ${v}`)
	.join("\n")}

TAGS:
${business.tags.map((t) => `  • ${t.label} (${t.type})`).join("\n")}

`);
});

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                        ALTERNATIVE APPROACH                              ║
╚═══════════════════════════════════════════════════════════════════════════╝

If manual entry is tedious, you can:

1. Import via JSON file in Payload (if supported)
2. Use PayloadCMS CLI if available
3. Use GraphQL mutations
4. Use Direct Database Import

For now, manual entry ensures all fields are correctly mapped.

📄 Full data saved in: BUSINESS_DATA_COMPLETE.json

═══════════════════════════════════════════════════════════════════════════
`);
