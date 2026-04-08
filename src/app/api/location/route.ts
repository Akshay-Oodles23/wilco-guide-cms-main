import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface GeoLocationResponse {
	ip: string;
	city?: string;
	country?: string;
	countryCode?: string;
	regionName?: string;
	timezone?: string;
	lat?: number;
	lon?: number;
	isp?: string;
	status?: string;
	message?: string;
}

const FALLBACK_IP = "8.8.8.8";
const API_TIMEOUT = 5000; // 5 seconds

export async function GET(req: NextRequest) {
	try {
		// Get IP from request headers with multiple fallbacks
		let ip =
			req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			req.headers.get("x-real-ip")?.trim() ||
			req.headers.get("cf-connecting-ip")?.trim() ||
			req.headers.get("x-client-ip")?.trim() ||
			null;

		// Use fallback for local development or missing IP
		if (!ip || ip === "unknown" || ip === "") {
			ip = FALLBACK_IP;
		}

		// Validate IP format (basic check)
		if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
			return NextResponse.json(
				{ error: "Invalid IP address format" },
				{ status: 400 },
			);
		}

		// Call ip-api.com to get geolocation data with timeout
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

		const res = await fetch(
			`https://ip-api.com/json/${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,timezone,offset,isp,org,as,asname,lat,lon`,
			{
				signal: controller.signal,
				headers: {
					Accept: "application/json",
				},
			},
		);

		clearTimeout(timeout);

		if (!res.ok) {
			throw new Error(`IP API returned status ${res.status}`);
		}

		const data: GeoLocationResponse = await res.json();

		// Check if API returned an error
		if (data.status === "fail") {
			throw new Error(data.message || "IP API returned failure status");
		}

		// Return location data
		return NextResponse.json(
			{
				ip,
				city: data.city || "Unknown",
				country: data.country || "Unknown",
				countryCode: data.countryCode || "Unknown",
				region: data.regionName || "Unknown",
				timezone: data.timezone || "Unknown",
				lat: data.lat || null,
				lon: data.lon || null,
				isp: data.isp || "Unknown",
				status: "success",
			},
			{ status: 200 },
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";

		return NextResponse.json(
			{
				error: "Failed to fetch location",
				details:
					process.env.NODE_ENV === "development"
						? errorMessage
						: undefined,
			},
			{ status: 500 },
		);
	}
}
