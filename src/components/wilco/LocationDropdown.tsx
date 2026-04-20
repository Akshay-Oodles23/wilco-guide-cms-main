"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MapPin, ChevronDown } from "lucide-react";
import { useDetectLocation } from "@/hooks/useDetectLocation";
import { useLocationContext } from "@/contexts/LocationContext";

interface LocationDropdownProps {
	locations: Array<{ id: string; name: string; slug: string }>;
}

export function LocationDropdown({ locations }: LocationDropdownProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const {
		selectedLocation,
		setSelectedLocation,
		isLoading: contextLoading,
	} = useLocationContext();
	const [locOpen, setLocOpen] = useState(false);
	const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
	const [hasInitialized, setHasInitialized] = useState(false);
	const locRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const { detectedSlug, isLoading: ipLoading } = useDetectLocation();

	// Initialize location with priority: URL params > Cookie > IP Detection
	useEffect(() => {
		if (hasInitialized || contextLoading) return;

		const initializeLocation = () => {
			// 1. Check URL params (highest priority)
			const urlLocation = searchParams.get("location");
			if (urlLocation) {
				console.log(
					`📍 [LocationDropdown] Using location from URL params: ${urlLocation}`,
				);
				setSelectedLocation(urlLocation);
				setCookie("wilco_detected_location", urlLocation, 30);
				setHasInitialized(true);
				return;
			}

			// 2. Check context/cookie (including explicit "All Locations" = "")
			if (selectedLocation !== null) {
				console.log(
					`📍 [LocationDropdown] Using location from context/cookie: ${selectedLocation}`,
				);
				// Update URL to reflect current selection (or clear it for "All Locations")
				if (selectedLocation) {
					const params = new URLSearchParams();
					params.set("location", selectedLocation);
					router.push(`${pathname}?${params.toString()}`);
				} else {
					router.push(pathname);
				}
				setHasInitialized(true);
				return;
			}

			// 3. Use IP-detected location (first time visitor)
			if (detectedSlug && !ipLoading) {
				console.log(
					`📍 [LocationDropdown] Using IP-detected location: ${detectedSlug}`,
				);
				setSelectedLocation(detectedSlug);
				setCookie("wilco_detected_location", detectedSlug, 30);
				const params = new URLSearchParams();
				params.set("location", detectedSlug);
				router.push(`${pathname}?${params.toString()}`);
				setHasInitialized(true);
			}
		};

		initializeLocation();
	}, [
		selectedLocation,
		detectedSlug,
		ipLoading,
		contextLoading,
		hasInitialized,
		pathname,
		router,
		searchParams,
		setSelectedLocation,
	]);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (locRef.current && !locRef.current.contains(e.target as Node)) {
				setLocOpen(false);
			}
		}
		document.addEventListener("click", handleClick);
		return () => document.removeEventListener("click", handleClick);
	}, []);

	useEffect(() => {
		if (locOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setDropdownPos({
				top: rect.bottom + 6,
				right: window.innerWidth - rect.right,
			});
		}
	}, [locOpen]);

	function selectLocation(slug: string) {
		if (slug) {
			// A specific location was selected
			setSelectedLocation(slug);
			setCookie("wilco_detected_location", slug, 30);
			const params = new URLSearchParams();
			params.set("location", slug);
			router.push(`${pathname}?${params.toString()}`);
		} else {
			// "All Locations" was selected - clear everything
			setSelectedLocation("");
			setCookie("wilco_detected_location", "", -1);
			router.push(pathname);
		}
		setLocOpen(false);
	}

	const currentLocationLabel = !selectedLocation
		? "All Locations"
		: locations.find((l) => l.slug === selectedLocation)?.name ||
			"All Locations";

	return (
		<div
			style={{
				paddingTop: "5px",
				paddingBottom: "5px",
				borderBottom: "1px solid var(--border)",
			}}
			className='flex justify-end'
		>
			<div
				className='relative'
				ref={locRef}
			>
				<button
					ref={buttonRef}
					onClick={() => setLocOpen(!locOpen)}
					disabled={contextLoading || ipLoading}
					className='py-2 px-3 rounded-lg border-[1.5px] border-border bg-white text-xs font-medium text-text-secondary cursor-pointer whitespace-nowrap transition-all hover:border-blue hover:text-blue flex items-center gap-[5px] disabled:opacity-60 disabled:cursor-default'
				>
					<MapPin size={13} />
					<span>{currentLocationLabel}</span>
					<ChevronDown
						size={12}
						className={`transition-transform ${locOpen ? "rotate-180" : ""}`}
					/>
				</button>
				{locOpen && (
					<div
						className='fixed bg-white border-[1.5px] border-border rounded-[10px] shadow-lg z-[9999] p-[5px] min-w-[180px] animate-in fade-in slide-in-from-top-1'
						style={{
							top: `${dropdownPos.top}px`,
							right: `${dropdownPos.right}px`,
							maxHeight: "300px",
							overflowY: "auto",
						}}
					>
						<button
							onClick={() => selectLocation("")}
							className={`w-full px-3 py-2 text-[13px] font-medium rounded-md cursor-pointer flex items-center justify-between transition-colors ${
								!selectedLocation
									? "text-blue font-semibold"
									: "text-text-secondary hover:bg-bg hover:text-text-primary"
							}`}
						>
							All Locations
							{!selectedLocation && (
								<span className='text-blue text-xs'>✓</span>
							)}
						</button>
						{locations.map((loc) => (
							<button
								key={loc.slug}
								onClick={() => selectLocation(loc.slug)}
								className={`w-full px-3 py-2 text-[13px] font-medium rounded-md cursor-pointer flex items-center justify-between transition-colors ${
									selectedLocation === loc.slug
										? "text-blue font-semibold"
										: "text-text-secondary hover:bg-bg hover:text-text-primary"
								}`}
							>
								{loc.name}
								{selectedLocation === loc.slug && (
									<span className='text-blue text-xs'>✓</span>
								)}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * Helper function to get a cookie value
 */
function getCookie(name: string): string | null {
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
 * Helper function to set a cookie value
 * @param name Cookie name
 * @param value Cookie value
 * @param days Days until expiry (use -1 to delete)
 */
function setCookie(name: string, value: string, days: number): void {
	if (typeof document === "undefined") return;

	const maxAge = days === -1 ? 0 : days * 24 * 60 * 60;
	const cookieString = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
	document.cookie = cookieString;
}
