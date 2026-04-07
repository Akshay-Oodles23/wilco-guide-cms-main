/**
 * Setup Script - Creates the "wilco" franchise in Payload CMS
 * Run this BEFORE accessing http://localhost:3000/admin
 *
 * Usage: npx tsx src/scripts/setup-franchise.ts
 */

import { getPayload } from "payload";
import config from "@payload-config";

async function setupFranchise() {
	console.log("🚀 Starting franchise setup...\n");

	try {
		const payload = await getPayload({ config });

		// Check if franchise already exists
		console.log('🔍 Checking if "wilco" franchise exists...');
		const existing = await payload.find({
			collection: "franchises",
			where: { franchiseId: { equals: "wilco" } },
			limit: 1,
		});

		if (existing.docs.length > 0) {
			console.log('✅ "wilco" franchise already exists!');
			console.log("   ID:", existing.docs[0].id);
			return;
		}

		// Create franchise
		console.log('📝 Creating "wilco" franchise...\n');
		const result = await payload.create({
			collection: "franchises",
			data: {
				franchiseId: "wilco",
				name: "WilCo Guide",
				description: "Williamson County local guide",
				slug: "wilco",
			},
		});

		console.log("✅ Franchise created successfully!");
		console.log("   ID:", result.id);
		console.log("   Name:", result.name);
		console.log("   Franchise ID:", result.franchiseId);
		console.log("\n✨ Now you can create the first user in Payload Admin!");
		console.log("   URL: http://localhost:3000/admin\n");
	} catch (error) {
		console.error("❌ Error during setup:", error);
		process.exit(1);
	}
}

setupFranchise();
