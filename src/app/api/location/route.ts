import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
	// Get IP from request headers
	const ip =
		req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		req.headers.get("x-real-ip")?.trim() ||
		req.headers.get("cf-connecting-ip")?.trim() ||
		req.headers.get("x-client-ip")?.trim() ||
		"Unknown";

	return NextResponse.json({ ip });
}
