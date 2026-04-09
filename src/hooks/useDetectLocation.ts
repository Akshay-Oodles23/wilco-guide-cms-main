"use client";

import { useEffect, useState } from "react";

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

export function useDetectLocation() {
	const [detectedCity, setDetectedCity] = useState<string | null>(null);
	const [detectedSlug, setDetectedSlug] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function detectLocation() {
			try {
				setIsLoading(true);
				console.log(
					"🌍 [IP Detection] Starting IP geolocation detection...",
				);

				const response = await fetch("/api/location");
				const data: GeoLocation = await response.json();

				console.log("📡 [IP Detection] API Response:", {
					status: data.status,
					city: data.city,
					regionName: data.regionName,
					country: data.country,
					message: data.message,
				});

				if (data.status === "fail") {
					console.warn(
						"❌ [IP Detection] Geolocation API failed:",
						data.message,
					);
					console.log(
						"🏠 [IP Detection] Falling back to default city: Georgetown",
					);
					setDetectedCity("Georgetown");
					setDetectedSlug("georgetown");
					setIsLoading(false);
					return;
				}

				const detectedCityName = data.city;
				console.log(
					`📍 [IP Detection] Detected city from IP: "${detectedCityName}"`,
				);

				// Check if detected city is in Texas cities list
				if (
					detectedCityName &&
					TEXAS_CITIES.includes(detectedCityName)
				) {
					const slug = CITY_TO_SLUG[detectedCityName];
					console.log(
						`✅ [IP Detection] City match found in CMS! "${detectedCityName}" → slug: "${slug}"`,
					);
					setDetectedCity(detectedCityName);
					setDetectedSlug(slug);
				} else {
					// Default to Georgetown if city not in list
					console.warn(
						`⚠️ [IP Detection] City "${detectedCityName}" NOT found in CMS cities list`,
					);
					console.log(
						`🏠 [IP Detection] Falling back to default city: Georgetown (slug: georgetown)`,
					);
					console.log(
						`📋 [IP Detection] Available cities in CMS:`,
						TEXAS_CITIES.join(", "),
					);
					setDetectedCity("Georgetown");
					setDetectedSlug("georgetown");
				}
			} catch (err) {
				console.error(
					"❌ [IP Detection] Error during geolocation:",
					err,
				);
				const errorMsg =
					err instanceof Error ? err.message : "Unknown error";
				setError(errorMsg);
				console.log(
					`🏠 [IP Detection] Falling back to default city due to error: Georgetown`,
				);
				// Default to Georgetown on error
				setDetectedCity("Georgetown");
				setDetectedSlug("georgetown");
			} finally {
				setIsLoading(false);
				console.log("✨ [IP Detection] IP detection process complete");
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
