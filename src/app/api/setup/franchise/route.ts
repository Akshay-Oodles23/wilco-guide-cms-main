/**
 * API Route to create the "wilco" franchise
 * Accessible at: http://localhost:3000/api/setup/franchise
 *
 * Usage:
 * 1. Start dev server: npm run dev
 * 2. In browser, go to: http://localhost:3000/api/setup/franchise
 * 3. Should see: {ok: true, message: "Franchise created", id: "..."}
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export async function GET(request: Request) {
	try {
		console.log("🚀 API: Setting up franchise...");

		const payload = await getPayload({ config });

		// Check if franchise already exists
		console.log('🔍 Checking if "wilco" franchise exists...');
		const existing = await payload.find({
			collection: "franchises",
			where: { franchiseId: { equals: "wilco" } },
			limit: 1,
			overrideAccess: true,
		});

		if (existing.docs.length > 0) {
			console.log("✅ Franchise already exists!");
			return NextResponse.json({
				ok: true,
				message: "Franchise already exists",
				franchise: {
					id: existing.docs[0].id,
					franchiseId: existing.docs[0].franchiseId,
					name: existing.docs[0].name,
				},
			});
		}

		// Create franchise
		console.log('📝 Creating "wilco" franchise...');
		const result = await payload.create({
			collection: "franchises",
			data: {
				franchiseId: "wilco",
				name: "WilCo Guide",
				domain: "wilcoguide.com", // REQUIRED field
				cities: [
					{ city: "Williamson County" },
					{ city: "Round Rock" },
					{ city: "Georgetown" },
				],
				settings: {
					logoUrl: "https://wilcoguide.com/logo.png",
					primaryColor: "#1a5276",
					tagline: "Your Williamson County Home Page",
					newsletterBrands: [{ brand: "wilco-grind" }],
				},
			},
			overrideAccess: true,
		});

		console.log("✅ Franchise created successfully!");
		return NextResponse.json({
			ok: true,
			message: "Franchise created successfully",
			franchise: {
				id: result.id,
				franchiseId: result.franchiseId,
				name: result.name,
				description: result.description,
			},
		});
	} catch (error) {
		console.error("❌ Error:", error);
		return NextResponse.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
