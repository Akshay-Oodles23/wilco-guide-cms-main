import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Only enable debug route in development
export async function GET(req: NextRequest) {
	// Only allow debug endpoint in development
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json(
			{ error: "Debug endpoint not available in production" },
			{ status: 403 },
		);
	}

	try {
		// Get all headers
		const headers: Record<string, string> = {};
		req.headers.forEach((value, key) => {
			headers[key] = value;
		});

		// Get IP from request headers with detailed fallbacks
		let ip =
			req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			req.headers.get("x-real-ip")?.trim() ||
			req.headers.get("cf-connecting-ip")?.trim() ||
			req.headers.get("x-client-ip")?.trim() ||
			null;

		return NextResponse.json(
			{
				ip: ip || "not-detected",
				headers,
				timestamp: new Date().toISOString(),
				environment: process.env.NODE_ENV,
			},
			{ status: 200 },
		);
	} catch (error) {
		return NextResponse.json(
			{ error: "Debug error", details: String(error) },
			{ status: 500 },
		);
	}
}
