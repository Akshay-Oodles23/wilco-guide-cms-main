import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
	try {
		// Get IP from request headers
		let ip =
			req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			req.headers.get("x-real-ip")?.trim() ||
			req.headers.get("cf-connecting-ip")?.trim() ||
			req.headers.get("x-client-ip")?.trim() ||
			null;

		// Use fallback if no IP detected
		if (!ip || ip === "Unknown") {
			ip = "8.8.8.8"; // Google's IP for testing
		}

		// Fetch location data from ip-api.com
		const response = await fetch(`http://ip-api.com/json/${ip}`);
		const data = await response.json();

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch location data", details: String(error) },
			{ status: 500 },
		);
	}
}
