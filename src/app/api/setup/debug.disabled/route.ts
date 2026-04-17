/**
 * DEBUG API Route
 * Shows what franchises exist in the database
 * Useful for troubleshooting dropdown issues
 *
 * Visit: http://localhost:3000/api/setup/debug
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export async function GET() {
	try {
		const payload = await getPayload({ config });

		// Check franchises
		console.log("🔍 Checking franchises in database...");
		const franchisesResult = await payload.find({
			collection: "franchises",
			limit: 100,
			overrideAccess: true,
		});

		console.log(`📊 Found ${franchisesResult.docs.length} franchises`);

		// Check users
		console.log("🔍 Checking users in database...");
		const usersResult = await payload.find({
			collection: "users",
			limit: 100,
			overrideAccess: true,
		});

		console.log(`📊 Found ${usersResult.docs.length} users`);

		return NextResponse.json({
			ok: true,
			debug: {
				franchises: {
					count: franchisesResult.docs.length,
					data: franchisesResult.docs.map((f: any) => ({
						id: f.id,
						franchiseId: f.franchiseId,
						name: f.name,
						domain: f.domain,
					})),
				},
				users: {
					count: usersResult.docs.length,
					data: usersResult.docs.map((u: any) => ({
						id: u.id,
						email: u.email,
						role: u.role,
						franchiseId: u.franchise?.id || "NO FRANCHISE",
					})),
				},
				nextSteps: [
					"1. If franchises count = 0 → Run /api/setup/franchise first",
					"2. If franchises count > 0 but dropdown still shows 'Loading' → Check browser console for errors",
					"3. If users count = 0 → You're in 'create first user' mode (expected)",
					"4. If users count > 0 → You should be able to login with existing user",
				],
			},
		});
	} catch (error) {
		console.error("❌ Debug error:", error);
		return NextResponse.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : undefined,
			},
			{ status: 500 },
		);
	}
}
