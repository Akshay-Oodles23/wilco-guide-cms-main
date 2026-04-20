"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocationContext } from "@/contexts/LocationContext";

export interface Location {
	name: string;
	slug: string;
}

export interface JobCategory {
	name: string;
	slug: string;
}

interface JobsSearchBarProps {
	locations: Location[];
	categories: JobCategory[];
	onLocationChange?: (location: string) => void;
}

function setLocationCookie(value: string): void {
	if (typeof document === "undefined") return;
	if (!value) {
		document.cookie = "wilco_detected_location=; path=/; max-age=0";
		return;
	}
	document.cookie = `wilco_detected_location=${encodeURIComponent(value)}; path=/; max-age=${30 * 24 * 60 * 60}`;
}

function getLocationCookie(): string {
	if (typeof document === "undefined") return "";
	const match = document.cookie.match(
		/(?:^|;\s*)wilco_detected_location=([^;]+)/,
	);
	return match ? decodeURIComponent(match[1]) : "";
}

export function JobsSearchBar({
	locations,
	categories,
	onLocationChange,
}: JobsSearchBarProps) {
	const LOCATIONS: Location[] = [
		{ name: "All Williamson County", slug: "" },
		...locations,
	];
	const CATEGORIES: JobCategory[] = [
		{ name: "All Categories", slug: "" },
		...categories,
	];
	const searchParams = useSearchParams();
	const router = useRouter();
	const { setSelectedLocation: setGlobalSelectedLocation } =
		useLocationContext();
	const [selectedLocation, setSelectedLocation] = useState(
		"All Williamson County",
	);
	const [selectedCategory, setSelectedCategory] = useState("All Categories");
	const [isLocationOpen, setIsLocationOpen] = useState(false);
	const [isCategoryOpen, setIsCategoryOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// If user arrives at /jobs without a location param, reuse the globally selected location.
		const locationParam = searchParams.get("location");
		if (locationParam) return;

		const normalizedGlobalLocation = getLocationCookie().trim();
		if (!normalizedGlobalLocation) return;

		const locationExists = LOCATIONS.some(
			(loc) => loc.slug === normalizedGlobalLocation,
		);
		if (!locationExists) return;

		const params = new URLSearchParams(searchParams.toString());
		params.set("location", normalizedGlobalLocation);
		router.replace(`/jobs?${params.toString()}`);
	}, [searchParams, router, locations]);

	useEffect(() => {
		const locationParam = searchParams.get("location");
		if (locationParam) {
			const location = LOCATIONS.find(
				(loc) => loc.slug === locationParam,
			);
			if (location) {
				setSelectedLocation(location.name);
			}
		} else {
			setSelectedLocation("All Williamson County");
		}

		const categoryParam = searchParams.get("category");
		if (categoryParam) {
			const category = CATEGORIES.find(
				(cat) => cat.slug === categoryParam,
			);
			if (category) {
				setSelectedCategory(category.name);
			}
		} else {
			setSelectedCategory("All Categories");
		}

		// Sync search query from URL params
		const searchParam = searchParams.get("search");
		setSearchQuery(searchParam || "");
	}, [searchParams, locations, categories]);

	const handleLocationSelect = (name: string, slug: string) => {
		setSelectedLocation(name);
		setIsLocationOpen(false);
		setGlobalSelectedLocation(slug || "");
		setLocationCookie(slug || "");

		// Build URL with both location and search parameters
		const params = new URLSearchParams();
		if (slug) {
			params.set("location", slug);
		}
		const categoryParam = searchParams.get("category");
		if (categoryParam) {
			params.set("category", categoryParam);
		}
		if (searchQuery) {
			params.set("search", searchQuery);
		}

		// Navigate to update URL and trigger server-side filtering
		const newUrl = params.toString()
			? `/jobs?${params.toString()}`
			: "/jobs";
		router.push(newUrl);

		// Notify parent if callback provided
		if (onLocationChange) {
			onLocationChange(slug || "");
		}
	};

	const handleCategorySelect = (name: string, slug: string) => {
		setSelectedCategory(name);
		setIsCategoryOpen(false);

		const params = new URLSearchParams();
		const locationParam = searchParams.get("location");
		if (locationParam) {
			params.set("location", locationParam);
		}
		if (slug) {
			params.set("category", slug);
		}
		if (searchQuery) {
			params.set("search", searchQuery);
		}

		const newUrl = params.toString()
			? `/jobs?${params.toString()}`
			: "/jobs";
		router.push(newUrl);
	};

	const handleSearch = (query: string) => {
		setSearchQuery(query);

		// Debounce the router.push to avoid too many updates
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		debounceTimer.current = setTimeout(() => {
			// Build URL with both location and search parameters
			const params = new URLSearchParams();
			const locationParam = searchParams.get("location");
			const categoryParam = searchParams.get("category");
			if (locationParam) {
				params.set("location", locationParam);
			}
			if (categoryParam) {
				params.set("category", categoryParam);
			}
			if (query) {
				params.set("search", query);
			}

			// Navigate to update URL and trigger server-side filtering
			const newUrl = params.toString()
				? `/jobs?${params.toString()}`
				: "/jobs";
			router.push(newUrl);
		}, 500); // Wait 500ms after user stops typing
	};

	const handleClearSearch = () => {
		setSearchQuery("");

		// Build URL with location parameter only
		const params = new URLSearchParams();
		const locationParam = searchParams.get("location");
		const categoryParam = searchParams.get("category");
		if (locationParam) {
			params.set("location", locationParam);
		}
		if (categoryParam) {
			params.set("category", categoryParam);
		}

		// Navigate to update URL
		const newUrl = params.toString()
			? `/jobs?${params.toString()}`
			: "/jobs";
		router.push(newUrl);
	};

	return (
		<div className='mx-auto mt-6 max-w-[720px] flex flex-col gap-3 px-5'>
			{/* Search Field */}
			<div className='flex items-stretch rounded-2xl border-2 border-gray-200 bg-white shadow-md overflow-hidden focus-within:border-blue-600 focus-within:shadow-lg transition'>
				<svg
					className='w-[18px] h-[18px] text-gray-400 flex-shrink-0 ml-4 my-auto'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2.5'
				>
					<circle
						cx='11'
						cy='11'
						r='8'
					/>
					<line
						x1='21'
						y1='21'
						x2='16.65'
						y2='16.65'
					/>
				</svg>
				<input
					type='text'
					placeholder='Job title, keyword, or company'
					value={searchQuery}
					onChange={(e) => handleSearch(e.target.value)}
					className='flex-1 px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400'
				/>
				{searchQuery && (
					<button
						onClick={handleClearSearch}
						className='px-4 py-3 text-gray-400 hover:text-gray-600 transition flex-shrink-0'
						aria-label='Clear search'
					>
						<svg
							className='w-[18px] h-[18px]'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2.5'
						>
							<line
								x1='18'
								y1='6'
								x2='6'
								y2='18'
							/>
							<line
								x1='6'
								y1='6'
								x2='18'
								y2='18'
							/>
						</svg>
					</button>
				)}
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
				{/* Location Dropdown */}
				<div className='relative'>
					<button
						onClick={() => {
							setIsLocationOpen(!isLocationOpen);
							setIsCategoryOpen(false);
						}}
						className='w-full flex items-center justify-between rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-left shadow-md hover:border-gray-300 transition'
					>
						<div className='flex items-center gap-3'>
							<svg
								className='w-[18px] h-[18px] text-gray-600 flex-shrink-0'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2.5'
							>
								<path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
								<circle
									cx='12'
									cy='10'
									r='3'
								/>
							</svg>
							<span className='text-gray-900 font-semibold'>
								{selectedLocation}
							</span>
						</div>
						<svg
							className={`w-[14px] h-[14px] text-gray-600 flex-shrink-0 transition-transform ${
								isLocationOpen ? "rotate-180" : ""
							}`}
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='3'
						>
							<polyline points='6 9 12 15 18 9' />
						</svg>
					</button>

					{isLocationOpen && (
						<div
							className='absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10'
							style={{ maxHeight: "300px", overflowY: "auto" }}
						>
							{LOCATIONS.map((location) => (
								<button
									key={location.slug}
									onClick={() =>
										handleLocationSelect(
											location.name,
											location.slug,
										)
									}
									className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition flex items-center justify-between border-b border-gray-100 last:border-b-0 ${
										selectedLocation === location.name
											? "bg-blue-50"
											: ""
									}`}
								>
									<span
										className={
											selectedLocation === location.name
												? "text-blue-600 font-semibold"
												: "text-gray-700"
										}
									>
										{location.name}
									</span>
									{selectedLocation === location.name && (
										<span className='text-blue-600 font-bold'>
											✓
										</span>
									)}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Category Dropdown */}
				<div className='relative'>
					<button
						onClick={() => {
							setIsCategoryOpen(!isCategoryOpen);
							setIsLocationOpen(false);
						}}
						className='w-full flex items-center justify-between rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-left shadow-md hover:border-gray-300 transition'
					>
						<div className='flex items-center gap-3'>
							<svg
								className='w-[18px] h-[18px] text-gray-600 flex-shrink-0'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2.5'
							>
								<path d='M4 6h16M7 12h10M10 18h4' />
							</svg>
							<span className='text-gray-900 font-semibold'>
								{selectedCategory}
							</span>
						</div>
						<svg
							className={`w-[14px] h-[14px] text-gray-600 flex-shrink-0 transition-transform ${
								isCategoryOpen ? "rotate-180" : ""
							}`}
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='3'
						>
							<polyline points='6 9 12 15 18 9' />
						</svg>
					</button>

					{isCategoryOpen && (
						<div
							className='absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10'
							style={{ maxHeight: "300px", overflowY: "auto" }}
						>
							{CATEGORIES.map((category) => (
								<button
									key={category.slug}
									onClick={() =>
										handleCategorySelect(
											category.name,
											category.slug,
										)
									}
									className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition flex items-center justify-between border-b border-gray-100 last:border-b-0 ${
										selectedCategory === category.name
											? "bg-blue-50"
											: ""
									}`}
								>
									<span
										className={
											selectedCategory === category.name
												? "text-blue-600 font-semibold"
												: "text-gray-700"
										}
									>
										{category.name}
									</span>
									{selectedCategory === category.name && (
										<span className='text-blue-600 font-bold'>
											✓
										</span>
									)}
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Info Text */}
			<p className='text-center text-sm text-gray-500'>
				Showing jobs in{" "}
				<span className='font-semibold text-gray-700'>
					{selectedLocation}
				</span>
				{selectedCategory !== "All Categories" && (
					<>
						{" "}
						· Category:{" "}
						<span className='font-semibold text-gray-700'>
							{selectedCategory}
						</span>
					</>
				)}
			</p>
		</div>
	);
}
