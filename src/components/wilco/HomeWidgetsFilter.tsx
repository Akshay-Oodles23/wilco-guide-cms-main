"use client";

import { useState } from "react";
import Link from "next/link";

interface WidgetBusiness {
	id: number;
	name: string;
	slug: string;
	category: string;
	location: string;
	image: string | null;
	rating: number | null;
	type: string;
	dealText: string | null;
}

export function HomeWidgetsFilter({
	businesses,
}: {
	businesses: WidgetBusiness[];
}) {
	const [activeFilter, setActiveFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 4;

	// Determine which businesses match the active filter
	const filtered = businesses.filter((b) => {
		if (activeFilter === "all") return true;
		if (activeFilter === "business")
			return b.type === "business" || !b.dealText;
		if (activeFilter === "deal") return !!b.dealText;
		if (activeFilter === "restaurant") {
			const cat = b.category.toLowerCase();
			return (
				cat.includes("food") ||
				cat.includes("restaurant") ||
				cat.includes("dining")
			);
		}
		return true;
	});

	const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
	const page = Math.min(currentPage, totalPages);
	const visible = filtered.slice(
		(page - 1) * itemsPerPage,
		page * itemsPerPage,
	);

	// If we have fewer than 4 businesses from CMS, show static placeholders
	const showStatic = businesses.length < 4;

	const handleFilter = (filter: string) => {
		setActiveFilter(filter);
		setCurrentPage(1);
	};

	const handleNext = () => {
		setCurrentPage((prev) => (prev >= totalPages ? 1 : prev + 1));
	};

	const filters = [
		{ key: "all", label: "All" },
		{ key: "business", label: "Businesses" },
		{ key: "deal", label: "Deals" },
		{ key: "restaurant", label: "Restaurants" },
	];

	return (
		<div className='widgets-area'>
			<div className='filter-row'>
				<div className='filter-buttons'>
					{filters.map((f) => (
						<button
							key={f.key}
							className={`filter-btn${activeFilter === f.key ? " active" : ""}`}
							onClick={() => handleFilter(f.key)}
						>
							{f.label}
						</button>
					))}
				</div>
				<button
					className='filter-arrow'
					onClick={handleNext}
					title='See more'
				>
					→
				</button>
			</div>
			<div className='widgets-grid'>
				{showStatic ? (
					/* Show empty state message when no data found */
					<div
						style={{
							gridColumn: "1 / -1",
							padding: "40px 20px",
							textAlign: "center",
							color: "var(--text-muted)",
						}}
					>
						<div style={{ fontSize: 18, fontWeight: 500 }}>
							No businesses found for this location
						</div>
						<div style={{ fontSize: 14, marginTop: 8 }}>
							Try selecting a different location or check back
							soon
						</div>
					</div>
				) : (
					/* Dynamic cards from CMS */
					visible.map((b) => (
						<Link
							href={`/directory/${b.slug}`}
							key={b.id}
							className={`fw-card${b.dealText ? " deal" : ""}`}
							style={{ textDecoration: "none", color: "inherit" }}
						>
							<div className='fw-img'>
								{b.image ? (
									<img
										src={b.image}
										alt={b.name}
									/>
								) : (
									<div
										style={{
											width: "100%",
											height: "100%",
											background: "var(--bg)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: 20,
											fontWeight: 700,
											color: "var(--text-muted)",
										}}
									>
										{b.name.charAt(0)}
									</div>
								)}
								{b.dealText && (
									<div className='fw-badge'>{b.dealText}</div>
								)}
							</div>
							<div className='fw-body'>
								<div className='fw-name'>{b.name}</div>
								<div className='fw-sub'>
									{b.category} · {b.location}
									{b.rating && ` · ★ ${b.rating}`}
								</div>
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	);
}
