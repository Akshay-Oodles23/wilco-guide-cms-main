/**
 * COMPLETE SETUP ENDPOINT
 * Creates both franchise AND first admin user
 * No dropdown needed!
 *
 * Visit: http://localhost:3000/api/setup/complete
 */

import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export async function GET(request: Request) {
	try {
		console.log("🚀 Starting complete setup...");

		const payload = await getPayload({ config });

		// Step 1: Create or get franchise
		console.log("📝 Step 1: Setting up franchise...");
		let franchise: any = null;

		const existingFranchise = await payload.find({
			collection: "franchises",
			where: { franchiseId: { equals: "wilco" } },
			limit: 1,
			overrideAccess: true,
		});

		if (existingFranchise.docs.length > 0) {
			franchise = existingFranchise.docs[0];
			console.log("✅ Franchise already exists");
		} else {
			franchise = await payload.create({
				collection: "franchises",
				data: {
					franchiseId: "wilco",
					name: "WilCo Guide",
					domain: "wilcoguide.com",
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
			console.log("✅ Franchise created");
		}

		// Step 2: Create first admin user
		console.log("📝 Step 2: Setting up first admin user...");

		const existingUsers = await payload.find({
			collection: "users",
			limit: 1,
			overrideAccess: true,
		});

		if (existingUsers.docs.length > 0) {
			console.log("✅ Admin user already exists");
			return NextResponse.json({
				ok: true,
				message: "Setup already complete!",
				data: {
					franchise: {
						id: franchise.id,
						franchiseId: franchise.franchiseId,
						name: franchise.name,
					},
					user: {
						id: existingUsers.docs[0].id,
						email: existingUsers.docs[0].email,
					},
					nextStep:
						"Go to http://localhost:3000/admin and login with your credentials",
				},
			});
		}

		// Create first user
		const newUser = await payload.create({
			collection: "users",
			data: {
				email: "admin@wilcoguide.com",
				password: "WilCo2024!Secure",
				firstName: "Admin",
				lastName: "User",
				role: "super-admin",
				franchise: franchise.id,
			},
			overrideAccess: true,
		});

		console.log("✅ First admin user created!");

		return NextResponse.json({
			ok: true,
			message: "Complete setup successful!",
			data: {
				franchise: {
					id: franchise.id,
					franchiseId: franchise.franchiseId,
					name: franchise.name,
					domain: franchise.domain,
				},
				user: {
					id: newUser.id,
					email: newUser.email,
					role: newUser.role,
					loginCredentials: {
						email: "admin@wilcoguide.com",
						password: "WilCo2024!Secure",
					},
				},
				nextSteps: [
					"✅ Franchise created: WilCo Guide",
					"✅ Admin user created: admin@wilcoguide.com",
					"👉 Next: Go to http://localhost:3000/admin",
					"👉 Click 'Login' button",
					"👉 Enter email: admin@wilcoguide.com",
					"👉 Enter password: WilCo2024!Secure",
					"👉 You should now be in the admin dashboard!",
				],
			},
		});
	} catch (error) {
		console.error("❌ Setup error:", error);
		return NextResponse.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
				troubleshooting: [
					"1. Make sure DATABASE_URL is set in .env.local",
					"2. Make sure PostgreSQL/Supabase is running",
					"3. Check server logs for detailed error message",
					"4. Try restarting dev server: npm run dev",
				],
			},
			{ status: 500 },
		);
	}
}
