"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocationDropdown } from "./LocationDropdown";

interface DirectoryFiltersProps {
	categories: string[];
	locations: Array<{ id: string; name: string; slug: string }>;
}

const DirectoryFilters: React.FC<DirectoryFiltersProps> = ({
	categories,
	locations,
}) => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLocationOpen, setIsLocationOpen] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<string | null>(
		null,
	);
	const locationMenuRef = useRef<HTMLDivElement>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Initialize from URL params on mount
	useEffect(() => {
		const category = searchParams.get("category");
		const location = searchParams.get("location");
		const query = searchParams.get("search");

		if (category) setActiveCategory(category);
		if (location) setSelectedLocation(location);
		if (query) setSearchQuery(query);
	}, [searchParams]);

	// Close location dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				locationMenuRef.current &&
				!locationMenuRef.current.contains(event.target as Node)
			) {
				setIsLocationOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Cleanup debounce timer on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	const updateFilters = (
		newCategory?: string | null,
		newLocation?: string | null,
		newSearch?: string,
	) => {
		const params = new URLSearchParams();

		const finalCategory =
			newCategory !== undefined ? newCategory : activeCategory;
		const finalLocation =
			newLocation !== undefined ? newLocation : selectedLocation;
		const finalSearch = newSearch !== undefined ? newSearch : searchQuery;

		if (finalCategory && finalCategory !== "All") {
			params.set("category", finalCategory);
		}
		if (finalLocation && finalLocation !== "All Locations") {
			params.set("location", finalLocation);
		}
		if (finalSearch) {
			params.set("search", finalSearch);
		}

		const queryString = params.toString();
		router.push(queryString ? `/directory?${queryString}` : "/directory");
	};

	const handleCategorySelect = (category: string) => {
		const newCategory = activeCategory === category ? null : category;
		setActiveCategory(newCategory);
		// Immediately update URL for category (no debounce needed for clicks)
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}
		debounceTimerRef.current = setTimeout(() => {
			updateFilters(newCategory);
		}, 300);
	};

	const handleLocationSelect = (location: string) => {
		setSelectedLocation(location === selectedLocation ? "" : location);
		setIsLocationOpen(false);
		// Immediately update URL for location (no debounce needed for clicks)
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}
		debounceTimerRef.current = setTimeout(() => {
			updateFilters(
				undefined,
				location === selectedLocation ? "" : location,
			);
		}, 300);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value); // Update UI immediately

		// Clear previous timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// Set new timer - wait 500ms before updating URL
		debounceTimerRef.current = setTimeout(() => {
			updateFilters(undefined, undefined, value);
		}, 500);
	};

	return (
		<div
			className='secondary-nav'
			style={{
				display: "flex",
				alignItems: "center",
				gap: "16px",
				padding: "12px 16px",
				borderBottom: "1px solid #eee",
			}}
		>
			{/* Category Filters - Horizontally Scrollable */}
			<div
				className='category-filters'
				style={{
					display: "flex",
					gap: "8px",
					overflowX: "auto",
					flex: "1",
					scrollBehavior: "smooth",
				}}
			>
				{categories.map((category) => (
					<button
						key={category}
						className='cat-btn'
						onClick={() => handleCategorySelect(category)}
						style={{
							padding: "8px 16px",
							borderRadius: "20px",
							border:
								activeCategory === category
									? "1px solid #333"
									: "1px solid #ddd",
							backgroundColor:
								activeCategory === category
									? "#f0f0f0"
									: "#fff",
							cursor: "pointer",
							fontSize: "14px",
							fontWeight:
								activeCategory === category ? "500" : "500",
							whiteSpace: "nowrap",
							// transition: "all 0.2s ease",
						}}
					>
						{category}
					</button>
				))}
			</div>

			{/* Search Bar */}
			<div
				className='search-area'
				style={{ flex: "0 1 200px" }}
			>
				<input
					type='text'
					className='search-bar'
					placeholder='Search businesses...'
					value={searchQuery}
					onChange={handleSearchChange}
					style={{
						width: "100%",
						padding: "8px 12px",
						borderRadius: "6px",
						border: "1px solid #ddd",
						fontSize: "14px",
						outline: "none",
					}}
					onFocus={(e) =>
						(e.currentTarget.style.borderColor = "#333")
					}
					onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
				/>
			</div>

			{/* Location Dropdown - Using LocationDropdown Component */}
			<LocationDropdown locations={locations} />
		</div>
	);
};

export default DirectoryFilters;
