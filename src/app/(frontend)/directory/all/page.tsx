// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database

import { Metadata } from "next";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@/payload.config";
import DirectoryFilters from "@/components/wilco/DirectoryFilters";
import "@/styles/directory.css";


function getLocationName(item: any): string {
	if (!item.location) return "WilCo";
	if (typeof item.location === "object")
		return item.location?.name || item.location?.title || "WilCo";
	return String(item.location);
}

function getBusinessLocation(business: any): string {
	// Check address.city first (most reliable for CMS businesses)
	if (business.address?.city) {
		if (typeof business.address.city === "object") {
			return (
				business.address.city?.name ||
				business.address.city?.title ||
				""
			);
		}
		return String(business.address.city);
	}

	// Fallback to location field
	if (business.location) {
		if (typeof business.location === "object") {
			return business.location?.name || business.location?.title || "";
		}
		return String(business.location);
	}

	// Last resort
	return "Williamson County";
}

function getImageUrl(media: any): string | null {
	if (!media) return null;
	if (typeof media === "string") return media;
	if (media.url) return media.url;
	if (media.filename) return media.filename;
	return null;
}

export default async function DirectoryAllPage(props: {
	searchParams: Promise<{
		category?: string;
		location?: string;
		search?: string;
		page?: string;
	}>;
}) {
	const searchParams = await props.searchParams;
	const selectedCategory = searchParams.category || "";
	const selectedLocation = searchParams.location || "";
	const searchQuery = searchParams.search || "";
	const currentPage = parseInt(searchParams.page || "1");
	const itemsPerPage = 12;

	const payload = await getPayload({ config });

	let businesses: any[] = [];
	let categories: any[] = [];
	let locations: any[] = [];

	try {
		businesses = await payload.find({
			collection: "businesses",
			limit: 1000,
		});
		businesses = businesses.docs || businesses;
	} catch (e) {
		console.error("Failed to fetch businesses:", e);
	}

	try {
		categories = await payload.find({
			collection: "categories",
			limit: 100,
		});
		categories = categories.docs || categories;
	} catch (e) {
		console.error("Failed to fetch categories:", e);
	}

	try {
		locations = await payload.find({
			collection: "locations",
			limit: 100,
		});
		locations = locations.docs || locations;
	} catch (e) {
		console.error("Failed to fetch locations:", e);
	}

	/* ═══ FILTER BUSINESSES ═══ */
	let filteredBusinesses = businesses;

	// Filter by category
	if (selectedCategory && selectedCategory !== "All") {
		filteredBusinesses = filteredBusinesses.filter((b: any) => {
			if (typeof b.category === "object") {
				return (
					b.category?.name?.toLowerCase() ===
					selectedCategory.toLowerCase()
				);
			}
			return b.category?.toLowerCase() === selectedCategory.toLowerCase();
		});
	}

	// Filter by location
	if (selectedLocation && selectedLocation !== "All WilCo") {
		filteredBusinesses = filteredBusinesses.filter((b: any) => {
			const loc = getBusinessLocation(b);
			return loc.toLowerCase() === selectedLocation.toLowerCase();
		});
	}

	// Filter by search query
	if (searchQuery) {
		filteredBusinesses = filteredBusinesses.filter((b: any) => {
			const query = searchQuery.toLowerCase();
			return (
				b.name?.toLowerCase().includes(query) ||
				b.description?.toLowerCase().includes(query) ||
				(typeof b.category === "object"
					? b.category?.name?.toLowerCase().includes(query)
					: b.category?.toLowerCase().includes(query)) ||
				getLocationName(b).toLowerCase().includes(query)
			);
		});
	}

	/* ═══ PAGINATION ═══ */
	const totalCount = filteredBusinesses.length;
	const totalPages = Math.ceil(totalCount / itemsPerPage);
	const validPage = Math.min(Math.max(currentPage, 1), totalPages || 1);
	const startIndex = (validPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const pageBusinesses = filteredBusinesses.slice(startIndex, endIndex);

	/* ═══ CATEGORY & LOCATION NAMES ═══ */
	const categoryNames =
		categories.length > 0
			? ["All", ...categories.map((c: any) => c.name || c.title)]
			: [
					"All",
					"Restaurants",
					"Home Services",
					"Cafes & Coffee Shops",
					"Healthcare",
					"Retail",
					"Automotive",
					"Tourism & Recreation",
					"Business Services",
					"Hospitality & Lodging",
					"Health & Wellness",
				];

	const locationNames =
		locations.length > 0
			? ["All WilCo", ...locations.map((l: any) => l.name || l.title)]
			: [
					"All WilCo",
					"Leander",
					"Cedar Park",
					"Round Rock",
					"Georgetown",
					"Liberty Hill",
					"Hutto",
					"Jarrell",
					"Florence",
					"Taylor",
				];

	return (
		<div className='directory-all-page'>
			{/* ═══ PAGE HEADER ═══ */}
			<div className='page-header'>
				<Link
					href='/directory'
					className='breadcrumb-link'
				>
					← Back to Directory
				</Link>
				<h1>All Businesses</h1>
				<p className='results-count'>
					Showing {pageBusinesses.length} of {totalCount} businesses
					{selectedCategory && selectedCategory !== "All"
						? ` in ${selectedCategory}`
						: ""}
					{selectedLocation && selectedLocation !== "All WilCo"
						? ` in ${selectedLocation}`
						: ""}
				</p>
			</div>

			{/* ═══ FILTERS ═══ */}
			<DirectoryFilters
				categories={categoryNames}
				locations={locationNames}
				selectedCategory={selectedCategory}
				selectedLocation={selectedLocation}
				selectedSearch={searchQuery}
			/>

			{/* ═══ RESULTS GRID ═══ */}
			{pageBusinesses.length > 0 ? (
				<>
					<div className='all-businesses-grid'>
						{pageBusinesses.map((b: any, i: number) => (
							<Link
								key={i}
								href={`/directory/${b.name
									.toLowerCase()
									.replace(/[^a-z0-9]+/g, "-")}`}
								className='biz-card all-card'
								style={{ textDecoration: "none" }}
							>
								<div className='card-media'>
									<img
										src={
											getImageUrl(b.photos?.[0]?.photo) ||
											getImageUrl(b.featuredImage) ||
											"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80"
										}
										alt={b.name}
									/>
								</div>
								<div className='card-overlay' />
								<div className='card-info'>
									<div className='card-category'>
										{typeof b.category === "object"
											? b.category?.name
											: b.category}{" "}
										· {b.priceRange || "$$"}
									</div>
									<div className='card-name'>{b.name}</div>
									<div className='card-location'>
										📍 {getBusinessLocation(b)}
									</div>
									<div className='card-rating'>
										<span className='stars'>
											{"★".repeat(
												Math.round(
													b.googleRating || 4.5,
												),
											)}
										</span>
										<span className='rating-count'>
											{b.googleRating || 4.5}
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>

					{/* ═══ PAGINATION ═══ */}
					{totalPages > 1 && (
						<div className='pagination'>
							{validPage > 1 && (
								<Link
									href={`/directory/all?category=${selectedCategory}&location=${selectedLocation}&search=${searchQuery}&page=${validPage - 1}`}
									className='pagination-button prev'
								>
									← Previous
								</Link>
							)}

							<div className='pagination-info'>
								Page {validPage} of {totalPages}
							</div>

							{validPage < totalPages && (
								<Link
									href={`/directory/all?category=${selectedCategory}&location=${selectedLocation}&search=${searchQuery}&page=${validPage + 1}`}
									className='pagination-button next'
								>
									Next →
								</Link>
							)}
						</div>
					)}
				</>
			) : (
				<div className='no-results'>
					<h2>No businesses found</h2>
					<p>Try adjusting your filters or search query.</p>
					<Link
						href='/directory'
						className='back-button'
					>
						Back to Directory
					</Link>
				</div>
			)}

		</div>
	);
}
