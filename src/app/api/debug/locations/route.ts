/**
 * DEBUG ENDPOINT - Check if locations are in the database
 * Visit: http://localhost:3000/api/debug/locations
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export async function GET() {
	try {
		const payload = await getPayload({ config });

		// Fetch all locations
		const result = await payload.find({
			collection: "locations",
			limit: 100,
			overrideAccess: true,
		});

		return NextResponse.json({
			ok: true,
			message: `Found ${result.docs.length} locations in database`,
			data: {
				totalLocations: result.docs.length,
				locations: result.docs.map((loc: any) => ({
					id: loc.id,
					name: loc.name,
					slug: loc.slug,
				})),
			},
		});
	} catch (error) {
		console.error("❌ Debug error:", error);
		return NextResponse.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
