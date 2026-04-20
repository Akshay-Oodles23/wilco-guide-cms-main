"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useDetectLocation, getCookie } from "@/hooks/useDetectLocation";

interface LocationContextType {
	selectedLocation: string | null;
	setSelectedLocation: (location: string | null) => void;
	isLoading: boolean;
	source: "url" | "cookie" | "detection" | "default";
}

const LocationContext = createContext<LocationContextType | undefined>(
	undefined,
);

export function LocationProvider({ children }: { children: React.ReactNode }) {
	const [selectedLocation, setSelectedLocation] = useState<string | null>(
		null,
	);
	const [source, setSource] = useState<
		"url" | "cookie" | "detection" | "default"
	>("default");

	// Get detected location from the hook
	const { detectedSlug, isLoading: detectionLoading } = useDetectLocation();

	// Initialize location on mount (client-side only)
	useEffect(() => {
		if (typeof window === "undefined") return;

		console.log("\n🎯 [LocationProvider] Initializing location...");

		// Priority: URL params > Cookie > Detected location > Default
		const urlLocation = new URLSearchParams(window.location.search).get(
			"location",
		);

		if (urlLocation) {
			console.log(`  ✓ Found location in URL: ${urlLocation}`);
			setSelectedLocation(urlLocation);
			setSource("url");
			return;
		}

		// Check cookie
		const cookieLocation = getCookie("wilco_detected_location");
		if (cookieLocation) {
			console.log(`  ✓ Found location in cookie: ${cookieLocation}`);
			setSelectedLocation(cookieLocation);
			setSource("cookie");
			return;
		}

		console.log(
			`  ⏳ Waiting for IP detection result... (loading: ${detectionLoading})`,
		);
	}, []);

	// Once detection completes, use detected location if no URL/cookie set
	useEffect(() => {
		if (
			detectionLoading ||
			!detectedSlug ||
			selectedLocation !== null // Already initialized (including explicit "All Locations")
		) {
			return;
		}

		console.log(
			`✅ [LocationProvider] IP detection complete: ${detectedSlug}`,
		);
		setSelectedLocation(detectedSlug);
		setSource("detection");
	}, [detectedSlug, detectionLoading, selectedLocation]);

	const value: LocationContextType = {
		selectedLocation,
		setSelectedLocation,
		isLoading: detectionLoading,
		source,
	};

	console.log(
		`📍 [LocationProvider] Current state:`,
		{
			selectedLocation: value.selectedLocation,
			source,
			isLoading: detectionLoading,
		},
		"\n",
	);

	return (
		<LocationContext.Provider value={value}>
			{children}
		</LocationContext.Provider>
	);
}

export function useLocationContext() {
	const context = useContext(LocationContext);
	if (context === undefined) {
		throw new Error(
			"useLocationContext must be used within LocationProvider",
		);
	}
	return context;
}
