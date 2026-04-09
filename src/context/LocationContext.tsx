"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LocationContextType {
	selectedLocation: string | null;
	setSelectedLocation: (location: string | null) => void;
	detectedCity: string | null;
	setDetectedCity: (city: string | null) => void;
	isDetecting: boolean;
	setIsDetecting: (detecting: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
	undefined,
);

export function LocationProvider({ children }: { children: ReactNode }) {
	const [selectedLocation, setSelectedLocation] = useState<string | null>(
		null,
	);
	const [detectedCity, setDetectedCity] = useState<string | null>(null);
	const [isDetecting, setIsDetecting] = useState(false);

	return (
		<LocationContext.Provider
			value={{
				selectedLocation,
				setSelectedLocation,
				detectedCity,
				setDetectedCity,
				isDetecting,
				setIsDetecting,
			}}
		>
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
