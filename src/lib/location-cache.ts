import { getPayload } from "payload";
import config from "@payload-config";

// Cache locations in memory for the duration of the request
let cachedLocations: any[] | null = null;

/**
 * Fetch locations from CMS with caching
 * Results are cached in memory during server-side rendering
 * and reused across multiple page renders within the same request cycle
 */
export async function getLocationsWithCache() {
	// Return cached locations if available
	if (cachedLocations) {
		console.log("📍 [Location Cache] Using cached locations (in-memory)");
		return cachedLocations;
	}

	try {
		const payload = await getPayload({ config });
		const r = await payload.find({
			collection: "locations",
			sort: "name",
			limit: 50,
			depth: 0,
		});

		cachedLocations = r.docs || [];
		console.log(
			`📍 [Location Cache] Fetched ${cachedLocations.length} locations from CMS (new fetch)`,
		);
		return cachedLocations;
	} catch (e) {
		console.error("❌ Error fetching locations:", e);
		return [];
	}
}

/**
 * Reset cache - call this if you need to force a fresh fetch
 * (not typically needed in production)
 */
export function resetLocationCache() {
	cachedLocations = null;
	console.log("🔄 [Location Cache] Cache cleared");
}
