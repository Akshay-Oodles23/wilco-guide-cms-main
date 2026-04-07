import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importBusinesses() {
	try {
		console.log("🚀 Starting business data import...");

		// Read the JSON file
		const jsonPath = path.join(__dirname, "../BUSINESS_DATA_COMPLETE.json");
		const businessesData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

		console.log(`📋 Found ${businessesData.length} businesses to import`);

		// Dynamically import getPayload - works with ESM modules
		const payloadModule = await import("payload");
		const { getPayload } = payloadModule;

		// Import the config
		const configModule = await import("../src/payload.config.ts");
		const config = configModule.default;

		// Initialize Payload
		const payload = await getPayload({ config });
		console.log("✅ Connected to Payload CMS");

		let successCount = 0;
		let errorCount = 0;
		const errors = [];

		// Import each business
		for (const businessData of businessesData) {
			try {
				console.log(`\n⏳ Importing: ${businessData.name}...`);

				const businessPayload = {
					name: businessData.name,
					slug: businessData.slug,
					description: businessData.description,
					status: businessData.status,
					...(businessData.category && {
						category: businessData.category,
					}),
					...(businessData.subcategory && {
						subcategory: businessData.subcategory,
					}),
					...(businessData.address && {
						address: businessData.address,
					}),
					...(businessData.phone && { phone: businessData.phone }),
					...(businessData.email && { email: businessData.email }),
					...(businessData.website && {
						website: businessData.website,
					}),
					...(businessData.googleRating && {
						googleRating: businessData.googleRating,
					}),
					...(businessData.googleReviewCount && {
						googleReviewCount: businessData.googleReviewCount,
					}),
					...(businessData.priceRange && {
						priceRange: businessData.priceRange,
					}),
					...(businessData.amenities?.length && {
						amenities: businessData.amenities,
					}),
					featured: businessData.featured,
					...(businessData.hours && { hours: businessData.hours }),
					...(businessData.reviews?.length && {
						reviews: businessData.reviews,
					}),
					...(businessData.deals?.length && {
						deals: businessData.deals,
					}),
					...(businessData.jobs?.length && {
						jobs: businessData.jobs,
					}),
					...(businessData.menuItems?.length && {
						menuItems: businessData.menuItems,
					}),
					...(businessData.upcomingEvents?.length && {
						upcomingEvents: businessData.upcomingEvents,
					}),
					...(Object.keys(businessData.socialMedia).length && {
						socialMedia: businessData.socialMedia,
					}),
					...(businessData.tags?.length && {
						tags: businessData.tags,
					}),
				};

				const result = await payload.create({
					collection: "businesses",
					data: businessPayload,
				});

				console.log(
					`✅ Successfully imported: ${businessData.name} (ID: ${result.id})`,
				);
				successCount++;
			} catch (error) {
				errorCount++;
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				console.error(
					`❌ Error importing ${businessData.name}: ${errorMessage}`,
				);
				errors.push({
					business: businessData.name,
					error: errorMessage,
				});
			}
		}

		// Print summary
		console.log("\n" + "=".repeat(60));
		console.log("📊 IMPORT SUMMARY");
		console.log("=".repeat(60));
		console.log(
			`✅ Successfully imported: ${successCount}/${businessesData.length}`,
		);
		console.log(
			`❌ Failed imports: ${errorCount}/${businessesData.length}`,
		);

		if (errors.length > 0) {
			console.log("\n⚠️  Failed imports details:");
			errors.forEach(({ business, error }) => {
				console.log(`  • ${business}: ${error}`);
			});
		}

		console.log("=".repeat(60));
		console.log("✨ Import process completed!");

		process.exit(successCount === businessesData.length ? 0 : 1);
	} catch (error) {
		console.error("❌ Fatal error during import:", error);
		process.exit(1);
	}
}

// Run the import
importBusinesses();
