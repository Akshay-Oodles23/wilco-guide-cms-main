"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MapPin, ChevronDown } from "lucide-react";
import { useDetectLocation } from "@/hooks/useDetectLocation";

interface LocationDropdownProps {
	locations: Array<{ id: string; name: string; slug: string }>;
}

export function LocationDropdown({ locations }: LocationDropdownProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const activeLocation = searchParams.get("location") || "";
	const [locOpen, setLocOpen] = useState(false);
	const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
	const locRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const { detectedSlug, isLoading } = useDetectLocation();

	// Auto-select detected location on first load if no location selected
	useEffect(() => {
		if (!activeLocation && detectedSlug && !isLoading) {
			const detectedLocationName = locations.find(
				(l) => l.slug === detectedSlug,
			)?.name;
			console.log(
				`🏠 [LocationDropdown] Auto-selecting detected location: ${detectedLocationName} (${detectedSlug})`,
			);
			const params = new URLSearchParams();
			params.set("location", detectedSlug);
			router.push(`/?${params.toString()}`);
		}
	}, [detectedSlug, isLoading, activeLocation, router, locations]);

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
		const params = new URLSearchParams();
		if (slug) {
			params.set("location", slug);
			router.push(`/?${params.toString()}`);
		} else {
			router.push("/");
		}
		setLocOpen(false);
	}

	const currentLocationLabel = activeLocation
		? locations.find((l) => l.slug === activeLocation)?.name ||
			"All Locations"
		: isLoading
			? "Detecting..."
			: "All Locations";

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
					disabled={isLoading}
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
						}}
					>
						<button
							onClick={() => selectLocation("")}
							className={`w-full px-3 py-2 text-[13px] font-medium rounded-md cursor-pointer flex items-center justify-between transition-colors ${
								!activeLocation
									? "text-blue font-semibold"
									: "text-text-secondary hover:bg-bg hover:text-text-primary"
							}`}
						>
							All Locations
							{!activeLocation && (
								<span className='text-blue text-xs'>✓</span>
							)}
						</button>
						{locations.map((loc) => (
							<button
								key={loc.slug}
								onClick={() => selectLocation(loc.slug)}
								className={`w-full px-3 py-2 text-[13px] font-medium rounded-md cursor-pointer flex items-center justify-between transition-colors ${
									activeLocation === loc.slug
										? "text-blue font-semibold"
										: "text-text-secondary hover:bg-bg hover:text-text-primary"
								}`}
							>
								{loc.name}
								{activeLocation === loc.slug && (
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
