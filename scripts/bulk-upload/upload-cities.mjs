#!/usr/bin/env node

/**
 * Bulk Upload Script for Texas Cities
 * Uploads all cities to Payload CMS Locations collection via REST API
 *
 * Usage: npm run upload:cities
 */

import { texasCities, CITY_COUNT } from "./cities-data.mjs";

const API_URL = "http://localhost:3000/api/locations";
const LOGIN_URL = "http://localhost:3000/api/users/login";

// Admin credentials (same as import-businesses.js)
const ADMIN_EMAIL = "admin@wilcoguide.com";
const ADMIN_PASSWORD = "WilCo2024!Secure";

let authToken = null;

async function login() {
	try {
		console.log("🔐 Authenticating with Payload CMS...");
		const response = await fetch(LOGIN_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: ADMIN_EMAIL,
				password: ADMIN_PASSWORD,
			}),
		});

		if (!response.ok) {
			throw new Error(
				`Login failed: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();
		authToken = data.token;
		console.log("✅ Authentication successful!\n");
		return true;
	} catch (error) {
		console.error("❌ Authentication failed:", error.message);
		return false;
	}
}

async function uploadCities() {
	try {
		console.log("\n🚀 Starting Bulk City Upload...");
		console.log(`📊 Total cities to upload: ${CITY_COUNT}\n`);

		// Authenticate first
		const authenticated = await login();
		if (!authenticated) {
			console.error("Cannot proceed without authentication");
			process.exit(1);
		}

		// Upload cities
		console.log("📍 Uploading cities...\n");
		let successCount = 0;
		let skipCount = 0;
		let errorCount = 0;
		const errors = [];

		for (let i = 0; i < texasCities.length; i++) {
			const city = texasCities[i];
			try {
				const response = await fetch(API_URL, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
					body: JSON.stringify(city),
				});

				if (response.status === 201 || response.status === 200) {
					console.log(
						`  ✅ ${i + 1}/${CITY_COUNT} - ${city.name} (${city.slug})`,
					);
					successCount++;
				} else if (response.status === 409 || response.status === 400) {
					// Duplicate or validation error
					console.log(
						`  ⏭️  ${i + 1}/${CITY_COUNT} - ${city.name} - Already exists`,
					);
					skipCount++;
				} else {
					const errorData = await response.text();
					console.error(
						`  ❌ ${i + 1}/${CITY_COUNT} - ${city.name} - Error: ${response.status}`,
					);
					errors.push(
						`${city.name}: ${response.status} - ${errorData}`,
					);
					errorCount++;
				}
			} catch (error) {
				console.error(
					`  ❌ ${i + 1}/${CITY_COUNT} - ${city.name} - Error:`,
					error.message,
				);
				errors.push(`${city.name}: ${error.message}`);
				errorCount++;
			}
		}

		// Summary
		console.log("\n📊 Upload Summary:");
		console.log(`  ✅ Created: ${successCount}`);
		console.log(`  ⏭️  Skipped (duplicates): ${skipCount}`);
		console.log(`  ❌ Errors: ${errorCount}`);

		// Show errors if any
		if (errors.length > 0) {
			console.log("\n⚠️  Error Details:");
			errors.slice(0, 5).forEach((err) => console.log(`  • ${err}`));
			if (errors.length > 5) {
				console.log(`  ... and ${errors.length - 5} more errors`);
			}
		}

		console.log("\n✨ Bulk upload completed!");
		console.log("\n📋 Next Steps:");
		console.log(
			"  1. Go to Payload CMS Admin (http://localhost:3000/admin)",
		);
		console.log("  2. Navigate to Collections → Locations");
		console.log("  3. Verify all cities are present");
		console.log(
			"  4. Update Articles, Jobs, and Businesses with location relationships\n",
		);

		process.exit(successCount > 0 ? 0 : 1);
	} catch (error) {
		console.error("\n❌ Bulk upload failed:", error.message);
		process.exit(1);
	}
}

// Run the upload
uploadCities();
