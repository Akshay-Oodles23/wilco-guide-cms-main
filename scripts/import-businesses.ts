import { getPayload } from "payload";
import config from "../src/payload.config";
import * as fs from "fs";
import * as path from "path";

interface BusinessData {
	name: string;
	slug: string;
	category: string;
	subcategory?: string;
	description: string;
	address: {
		street: string;
		city: string;
		state: string;
		zip: string;
		lat?: number;
		lng?: number;
	};
	phone: string;
	email: string;
	website: string;
	googleRating: number;
	googleReviewCount: number;
	priceRange: string;
	amenities: string[];
	featured: boolean;
	status: string;
	hours: {
		[key: string]: {
			open: string;
			close: string;
		};
	};
	reviews: Array<{
		author: string;
		text: string;
		rating: number;
		date: string;
	}>;
	deals: Array<{
		title: string;
		description: string;
		discount: string;
		validFrom: string;
		validUntil: string;
		conditions: string;
	}>;
	jobs: Array<{
		title: string;
		type: string;
		salary: string;
		description: string;
	}>;
	menuItems: Array<{
		name: string;
		description: string;
		price: string;
	}>;
	upcomingEvents: Array<{
		title: string;
		date: string;
		startTime: string;
		endTime: string;
		description: string;
	}>;
	socialMedia: {
		[key: string]: string;
	};
	tags: Array<{
		label: string;
		type: string;
	}>;
}

interface BusinessPayload {
	name: string;
	slug: string;
	category?: string;
	subcategory?: string;
	description: string;
	address?: {
		street: string;
		city: string;
		state: string;
		zip: string;
		lat?: number;
		lng?: number;
	};
	phone?: string;
	email?: string;
	website?: string;
	googleRating?: number;
	googleReviewCount?: number;
	priceRange?: string;
	amenities?: string[];
	featured?: boolean;
	status: string;
	hours?: Record<string, { open: string; close: string }>;
	reviews?: Array<{
		author: string;
		text: string;
		rating: number;
		date: string;
	}>;
	deals?: Array<{
		title: string;
		description: string;
		discount: string;
		validFrom: string;
		validUntil: string;
		conditions: string;
	}>;
	jobs?: Array<{
		title: string;
		type: string;
		salary: string;
		description: string;
	}>;
	menuItems?: Array<{
		name: string;
		description: string;
		price: string;
	}>;
	upcomingEvents?: Array<{
		title: string;
		date: string;
		startTime: string;
		endTime: string;
		description: string;
	}>;
	socialMedia?: Record<string, string>;
	tags?: Array<{
		label: string;
		type: string;
	}>;
}

async function importBusinesses() {
	try {
		console.log("🚀 Starting business data import...");

		// Initialize Payload
		const payload = await getPayload({ config });
		console.log("✅ Connected to Payload CMS");

		// Read the JSON file
		const jsonPath = path.join(__dirname, "../BUSINESS_DATA_COMPLETE.json");
		const businessesData: BusinessData[] = JSON.parse(
			fs.readFileSync(jsonPath, "utf-8"),
		);

		console.log(`📋 Found ${businessesData.length} businesses to import`);

		let successCount = 0;
		let errorCount = 0;
		const errors: { business: string; error: string }[] = [];

		// Import each business
		for (const businessData of businessesData) {
			try {
				console.log(`\n⏳ Importing: ${businessData.name}...`);

				const businessPayload: BusinessPayload = {
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
