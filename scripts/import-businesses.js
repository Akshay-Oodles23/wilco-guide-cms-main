#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Read the business data
const dataPath = path.join(__dirname, "../BUSINESS_DATA_COMPLETE.json");
const businessesData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

const API_URL = "http://localhost:3000/api/businesses";
const LOGIN_URL = "http://localhost:3000/api/users/login";
const MEDIA_URL = "http://localhost:3000/api/media";

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

async function getLocationIdByCity(cityName) {
	try {
		const response = await fetch(
			`http://localhost:3000/api/locations?where[name][equals]=${encodeURIComponent(cityName)}`,
			{
				headers: {
					Authorization: `JWT ${authToken}`,
				},
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		if (data.docs && data.docs.length > 0) {
			return data.docs[0].id;
		}

		return null;
	} catch (error) {
		console.error(
			`Error fetching location for ${cityName}:`,
			error.message,
		);
		return null;
	}
}

async function uploadMediaFromUrl(imageUrl) {
	try {
		// Download image from URL
		const imageResponse = await fetch(imageUrl);
		if (!imageResponse.ok) {
			console.warn(
				`   ⚠️  Failed to download image: ${imageUrl} (${imageResponse.status})`,
			);
			return null;
		}

		// Convert Response to Buffer using arrayBuffer()
		const arrayBuffer = await imageResponse.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		if (buffer.length === 0) {
			console.warn(`   ⚠️  Downloaded image is empty from: ${imageUrl}`);
			return null;
		}

		// Ensure we have a valid filename
		const filename = `business-photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.jpg`;

		// Create FormData for multipart upload
		const FormData = require("form-data");
		const { Readable } = require("stream");

		const formData = new FormData();

		// Append file as a stream for better compatibility
		const bufferStream = Readable.from(buffer);
		formData.append("file", bufferStream, {
			filename,
			contentType: "image/jpeg",
		});

		// Add required fields for Media collection
		formData.append("alt", "Business photo");
		formData.append("franchise", "1"); // WilCo Guide franchise ID

		// Upload to Payload media collection
		const uploadResponse = await fetch(MEDIA_URL, {
			method: "POST",
			headers: {
				Authorization: `JWT ${authToken}`,
				...formData.getHeaders(),
			},
			body: formData,
		});

		if (!uploadResponse.ok) {
			const errorText = await uploadResponse.text();
			console.warn(
				`   ⚠️  Media upload failed for ${filename}: ${errorText}`,
			);
			return null;
		}

		const mediaData = await uploadResponse.json();
		if (!mediaData.id) {
			console.warn(
				`   ⚠️  No media ID returned from upload for ${filename}`,
			);
			return null;
		}
		return mediaData.id;
	} catch (error) {
		console.warn(`   ⚠️  Error uploading media: ${error.message}`);
		return null;
	}
}

async function getBusinessIdBySlug(slug) {
	try {
		const response = await fetch(
			`http://localhost:3000/api/businesses?where[slug][equals]=${encodeURIComponent(slug)}`,
			{
				headers: {
					Authorization: `JWT ${authToken}`,
				},
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		if (data.docs && data.docs.length > 0) {
			return data.docs[0].id;
		}

		return null;
	} catch (error) {
		console.error(
			`Error fetching business by slug ${slug}:`,
			error.message,
		);
		return null;
	}
}

async function importBusinesses() {
	// Authenticate first
	const authenticated = await login();
	if (!authenticated) {
		console.error("Cannot proceed without authentication");
		process.exit(1);
	}

	console.log("🚀 Starting business data import...");
	console.log(`📋 Found ${businessesData.length} businesses to import\n`);

	let successCount = 0;
	let errorCount = 0;
	const errors = [];

	for (let i = 0; i < businessesData.length; i++) {
		const business = businessesData[i];
		try {
			console.log(
				`⏳ [${i + 1}/${businessesData.length}] Importing: ${business.name}...`,
			);

			// Get location ID for the city
			const locationId = await getLocationIdByCity(business.address.city);
			if (!locationId) {
				throw new Error(
					`Location not found for city: ${business.address.city}`,
				);
			}

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

			// Upload photos and collect media IDs
			const photosData = [];
			if (business.photos && business.photos.length > 0) {
				console.log(
					`   📸 Uploading ${business.photos.length} photos...`,
				);
				for (const photoUrl of business.photos) {
					const mediaId = await uploadMediaFromUrl(photoUrl);
					if (mediaId) {
						photosData.push(mediaId);
						console.log(`   ✅ Photo uploaded (ID: ${mediaId})`);
					}
				}
			}

			// Build the payload
			const payload = {
				franchise: 1, // WilCo Guide franchise
				name: business.name,
				slug: business.slug,
				description: business.description,
				status: business.status,
				featured: business.featured,
				category: business.category,
				...(business.subcategory && {
					subcategory: business.subcategory,
				}),
				...(business.address && {
					address: {
						street: business.address.street,
						city: locationId, // Use location ID instead of city name
						state: business.address.state,
						zip: business.address.zip,
						lat: business.address.lat,
						lng: business.address.lng,
					},
				}),
				...(business.phone && { phone: business.phone }),
				...(business.email && { email: business.email }),
				...(business.website && { website: business.website }),
				...(business.googleRating && {
					googleRating: business.googleRating,
				}),
				...(business.googleReviewCount && {
					googleReviewCount: business.googleReviewCount,
				}),
				...(business.priceRange && { priceRange: business.priceRange }),
				...(amenitiesData.length && { amenities: amenitiesData }),
				...(reviewsData.length && { reviews: reviewsData }),
				...(photosData.length && { photos: photosData }),
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

			// Check if business already exists
			const existingBusinessId = await getBusinessIdBySlug(business.slug);

			let method = "POST";
			let url = API_URL;
			let successMessage = `Successfully imported`;

			if (existingBusinessId) {
				method = "PATCH";
				url = `${API_URL}/${existingBusinessId}`;
				successMessage = `Successfully updated`;
			}

			const response = await fetch(url, {
				method,
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

			const result = await response.json();
			const resultId = result.id || existingBusinessId || "unknown";
			console.log(
				`✅ ${successMessage}: ${business.name} (ID: ${resultId})\n`,
			);
			successCount++;
		} catch (error) {
			errorCount++;
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error(
				`❌ Error importing ${business.name}: ${errorMessage}\n`,
			);
			errors.push({
				business: business.name,
				error: errorMessage,
			});
		}
	}

	// Print summary
	console.log("=".repeat(70));
	console.log("📊 IMPORT SUMMARY");
	console.log("=".repeat(70));
	console.log(
		`✅ Successfully imported: ${successCount}/${businessesData.length}`,
	);
	console.log(`❌ Failed imports: ${errorCount}/${businessesData.length}`);

	if (errors.length > 0) {
		console.log("\n⚠️  Failed imports details:");
		errors.forEach(({ business, error }) => {
			console.log(`  • ${business}`);
			console.log(`    └─ ${error}`);
		});
	}

	console.log("=".repeat(70));
	console.log("✨ Import process completed!");
	console.log("\n💡 Next steps:");
	console.log(
		"   1. Visit: http://localhost:3000/admin/collections/businesses",
	);
	console.log("   2. Verify imported businesses appear in the list");
	console.log("   3. Test: http://localhost:3000/directory");
	console.log("=".repeat(70));

	process.exit(successCount === businessesData.length ? 0 : 1);
}

importBusinesses().catch((error) => {
	console.error("❌ Fatal error during import:", error);
	process.exit(1);
});
