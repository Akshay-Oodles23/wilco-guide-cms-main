"use client";

import { useEffect, useRef, useState } from "react";

interface GeoLocation {
	city?: string;
	regionName?: string;
	country?: string;
	region?: string;
	status?: string;
	message?: string;
}

const TEXAS_CITIES = [
	"Georgetown",
	"Round Rock",
	"Cedar Park",
	"Leander",
	"Liberty Hill",
	"Hutto",
	"Taylor",
	"Jarrell",
	"Florence",
	"Austin",
	"San Antonio",
	"Houston",
	"Dallas",
	"Fort Worth",
	"El Paso",
	"Arlington",
	"Corpus Christi",
	"Lubbock",
	"Plano",
];

const CITY_TO_SLUG: Record<string, string> = {
	Georgetown: "georgetown",
	"Round Rock": "round-rock",
	"Cedar Park": "cedar-park",
	Leander: "leander",
	"Liberty Hill": "liberty-hill",
	Hutto: "hutto",
	Taylor: "taylor",
	Jarrell: "jarrell",
	Florence: "florence",
	Austin: "austin",
	"San Antonio": "san-antonio",
	Houston: "houston",
	Dallas: "dallas",
	"Fort Worth": "fort-worth",
	"El Paso": "el-paso",
	Arlington: "arlington",
	"Corpus Christi": "corpus-christi",
	Lubbock: "lubbock",
	Plano: "plano",
};

const COOKIE_NAME = "wilco_detected_location";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const API_CACHE_KEY = "wilco_geo_api_cache";
const API_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Track if detection has already been initiated (global flag)
let detectionInProgress = false;

export function useDetectLocation() {
	const [detectedCity, setDetectedCity] = useState<string | null>(null);
	const [detectedSlug, setDetectedSlug] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const detectionRef = useRef(false);

	useEffect(() => {
		// Prevent running detection multiple times
		if (detectionRef.current) {
			console.log(
				"⏭️  [IP Detection] Detection already initiated, skipping...",
			);
			return;
		}

		async function detectLocation() {
			try {
				detectionRef.current = true;
				setIsLoading(true);

				// Check if we have a cached location in cookies first (fastest)
				const savedSlug = getCookie(COOKIE_NAME);
				if (savedSlug) {
					console.log(
						`📦 [IP Detection] ✓ Using cached location from cookie: ${savedSlug}`,
					);
					setDetectedSlug(savedSlug);
					setIsLoading(false);
					return;
				}

				// Check if we have a recent API cache in localStorage
				const cachedGeo = getLocalStorageCache(API_CACHE_KEY);
				if (cachedGeo) {
					console.log(
						`💾 [IP Detection] ✓ Using cached API response from storage`,
					);
					processGeoLocation(cachedGeo);
					return;
				}

				console.log(
					"🌍 [IP Detection] → Starting IP geolocation API call...",
				);

				// Only make API call if not in progress and no cache
				const response = await fetch("/api/location", {
					cache: "no-store", // Prevent Next.js caching
				});

				if (!response.ok) {
					throw new Error(`API returned ${response.status}`);
				}

				const data: GeoLocation = await response.json();

				console.log("📡 [IP Detection] ✓ API Response received:", {
					status: data.status,
					city: data.city,
					country: data.country,
				});

				// Cache the API response for 1 hour
				setLocalStorageCache(API_CACHE_KEY, data, API_CACHE_DURATION);

				processGeoLocation(data);
			} catch (err) {
				console.error(
					"❌ [IP Detection] Error during geolocation:",
					err,
				);
				const errorMsg =
					err instanceof Error ? err.message : "Unknown error";
				setError(errorMsg);
				console.log(
					`🏠 [IP Detection] → Falling back to default city: Georgetown`,
				);
				// Default to Georgetown on error
				setDetectedCity("Georgetown");
				setDetectedSlug("georgetown");
				// Save fallback to cookie
				setCookie(COOKIE_NAME, "georgetown", COOKIE_MAX_AGE);
			} finally {
				setIsLoading(false);
				console.log("✨ [IP Detection] Detection process complete\n");
			}
		}

		function processGeoLocation(data: GeoLocation) {
			if (data.status === "fail") {
				console.warn(
					"❌ [IP Detection] Geolocation API failed:",
					data.message,
				);
				console.log(
					"🏠 [IP Detection] → Falling back to default city: Georgetown",
				);
				setDetectedCity("Georgetown");
				setDetectedSlug("georgetown");
				// Save fallback to cookie
				setCookie(COOKIE_NAME, "georgetown", COOKIE_MAX_AGE);
				console.log(
					`📦 [IP Detection] Saved fallback to cookie: georgetown`,
				);
				return;
			}

			const detectedCityName = data.city;
			console.log(
				`📍 [IP Detection] Detected city from IP: "${detectedCityName}"`,
			);

			// Check if detected city is in Texas cities list
			if (detectedCityName && TEXAS_CITIES.includes(detectedCityName)) {
				const slug = CITY_TO_SLUG[detectedCityName];
				console.log(
					`✅ [IP Detection] City match found! "${detectedCityName}" → slug: "${slug}"`,
				);
				setDetectedCity(detectedCityName);
				setDetectedSlug(slug);
				// Save to cookie for future visits (persistent)
				setCookie(COOKIE_NAME, slug, COOKIE_MAX_AGE);
				console.log(
					`📦 [IP Detection] Saved location to cookie: ${slug}`,
				);
			} else {
				// Default to Georgetown if city not in list
				console.warn(
					`⚠️ [IP Detection] City "${detectedCityName}" NOT in CMS cities`,
				);
				console.log(`🏠 [IP Detection] → Falling back to: Georgetown`);
				setDetectedCity("Georgetown");
				setDetectedSlug("georgetown");
				setCookie(COOKIE_NAME, "georgetown", COOKIE_MAX_AGE);
			}
		}

		detectLocation();
	}, []);

	return {
		detectedCity,
		detectedSlug,
		isLoading,
		error,
	};
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;

	const nameEQ = name + "=";
	const cookies = document.cookie.split(";");

	for (let cookie of cookies) {
		cookie = cookie.trim();
		if (cookie.indexOf(nameEQ) === 0) {
			return decodeURIComponent(cookie.substring(nameEQ.length));
		}
	}

	return null;
}

/**
 * Set a cookie value
 */
export function setCookie(name: string, value: string, maxAge: number): void {
	if (typeof document === "undefined") return;

	const cookieString = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
	document.cookie = cookieString;
}

/**
 * Get cached data from localStorage with TTL
 */
function getLocalStorageCache(key: string): GeoLocation | null {
	if (typeof localStorage === "undefined") return null;

	const cached = localStorage.getItem(key);
	if (!cached) return null;

	try {
		const { data, timestamp } = JSON.parse(cached);
		const now = Date.now();

		// Check if cache is still valid
		if (now - timestamp < API_CACHE_DURATION) {
			return data;
		} else {
			// Clear expired cache
			localStorage.removeItem(key);
			return null;
		}
	} catch {
		return null;
	}
}

/**
 * Set cache data in localStorage with timestamp
 */
function setLocalStorageCache(
	key: string,
	data: GeoLocation,
	duration: number,
): void {
	if (typeof localStorage === "undefined") return;

	try {
		localStorage.setItem(
			key,
			JSON.stringify({
				data,
				timestamp: Date.now(),
			}),
		);
	} catch (err) {
		console.warn("⚠️ [IP Detection] Failed to cache API response:", err);
	}
}
