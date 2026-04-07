#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Read the business data
const dataPath = path.join(__dirname, "../BUSINESS_DATA_COMPLETE.json");
const businessesData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

const API_URL = "http://localhost:3000/api/businesses";
const LOGIN_URL = "http://localhost:3000/api/users/login";

// Admin credentials
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
			throw new Error(`Login failed: ${response.status}`);
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

async function getBusinessBySlug(slug) {
	try {
		const response = await fetch(`${API_URL}?where[slug][equals]=${slug}`, {
			headers: {
				Authorization: `JWT ${authToken}`,
			},
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data.docs && data.docs.length > 0 ? data.docs[0] : null;
	} catch (error) {
		console.error("Error fetching business:", error.message);
		return null;
	}
}

async function updateBusiness(businessId, payload) {
	try {
		const response = await fetch(`${API_URL}/${businessId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `JWT ${authToken}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorData = await response.json();
			const errorMessage = errorData.errors
				? errorData.errors.map((e) => e.message).join("; ")
				: `HTTP ${response.status}`;
			throw new Error(errorMessage);
		}

		return await response.json();
	} catch (error) {
		throw error;
	}
}

async function updateBusinesses() {
	// Authenticate first
	const authenticated = await login();
	if (!authenticated) {
		console.error("Cannot proceed without authentication");
		process.exit(1);
	}

	console.log("🚀 Starting business data update...");
	console.log(`📋 Found ${businessesData.length} businesses to update\n`);

	let successCount = 0;
	let errorCount = 0;
	const errors = [];

	for (let i = 0; i < businessesData.length; i++) {
		const business = businessesData[i];
		try {
			console.log(
				`⏳ [${i + 1}/${businessesData.length}] Fetching: ${business.name}...`,
			);

			// Get existing business
			const existingBusiness = await getBusinessBySlug(business.slug);

			if (!existingBusiness) {
				throw new Error(
					`Business not found with slug: ${business.slug}`,
				);
			}

			console.log(`   Found existing ID: ${existingBusiness.id}`);
			console.log(`   📝 Updating with complete data...`);

			// Transform amenities array format
			const amenitiesData = business.amenities
				? business.amenities.map((amenity) => ({ amenity }))
				: [];

			// Transform reviews - ensure date is in YYYY-MM-DD format
			const reviewsData = business.reviews
				? business.reviews.map((review) => ({
						author: review.author,
						text: review.text,
						rating: review.rating,
						date: review.date,
					}))
				: [];

			// Build the update payload
			const payload = {
				googleRating: business.googleRating,
				googleReviewCount: business.googleReviewCount,
				priceRange: business.priceRange,
				...(amenitiesData.length && { amenities: amenitiesData }),
				...(reviewsData.length && { reviews: reviewsData }),
				...(business.hours && { hours: business.hours }),
				...(business.deals &&
					business.deals.length && {
						deals: business.deals.map((deal) => ({
							title: deal.title,
							description: deal.description,
							discount: deal.discount,
							validFrom: deal.validFrom,
							validUntil: deal.validUntil,
							conditions: deal.conditions,
						})),
					}),
				...(business.jobs &&
					business.jobs.length && {
						jobs: business.jobs.map((job) => ({
							title: job.title,
							type: job.type
								? job.type.includes("part") ||
									job.type.includes("Part")
									? "part-time"
									: "full-time"
								: "full-time",
							salary: job.salary,
							description: job.description,
						})),
					}),
				...(business.menuItems &&
					business.menuItems.length && {
						menuItems: business.menuItems.map((item) => ({
							name: item.name,
							description: item.description,
							price: item.price,
						})),
					}),
				...(business.upcomingEvents &&
					business.upcomingEvents.length && {
						upcomingEvents: business.upcomingEvents.map(
							(event) => ({
								title: event.title,
								date: event.date,
								startTime: event.startTime,
								endTime: event.endTime,
								description: event.description,
							}),
						),
					}),
				...(business.socialMedia &&
					Object.keys(business.socialMedia).length && {
						socialMedia: business.socialMedia,
					}),
				...(business.tags &&
					business.tags.length && {
						tags: business.tags.map((tag) => ({
							label: tag.label,
							type: tag.type,
						})),
					}),
			};

			const result = await updateBusiness(existingBusiness.id, payload);
			console.log(`✅ Successfully updated: ${business.name}\n`);
			successCount++;
		} catch (error) {
			errorCount++;
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error(
				`❌ Error updating ${business.name}: ${errorMessage}\n`,
			);
			errors.push({
				business: business.name,
				error: errorMessage,
			});
		}
	}

	// Print summary
	console.log("=".repeat(70));
	console.log("📊 UPDATE SUMMARY");
	console.log("=".repeat(70));
	console.log(
		`✅ Successfully updated: ${successCount}/${businessesData.length}`,
	);
	console.log(`❌ Failed updates: ${errorCount}/${businessesData.length}`);

	if (errors.length > 0) {
		console.log("\n⚠️  Failed updates details:");
		errors.forEach(({ business, error }) => {
			console.log(`  • ${business}`);
			console.log(`    └─ ${error}`);
		});
	}

	console.log("=".repeat(70));
	console.log("✨ Update process completed!");
	console.log("\n💡 Next steps:");
	console.log(
		"   1. Visit: http://localhost:3000/admin/collections/businesses",
	);
	console.log("   2. Verify updated businesses have complete data");
	console.log("   3. Test: http://localhost:3000/directory");
	console.log("=".repeat(70));

	process.exit(successCount === businessesData.length ? 0 : 1);
}

updateBusinesses().catch((error) => {
	console.error("❌ Fatal error during update:", error);
	process.exit(1);
});
