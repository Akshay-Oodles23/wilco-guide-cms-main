// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database

import { Metadata } from "next";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@/payload.config";
import DirectoryFilters from "@/components/wilco/DirectoryFilters";
import StarRating from "@/components/StarRating";
import "@/styles/directory.css";

export const metadata: Metadata = {
	title: "All Businesses — WilCo Guide",
	description:
		"Browse all businesses in the WilCo Guide directory with category, location, and search filters.",
};

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
	if (media.filename) return `/media/${media.filename}`;
	return null;
}

function toBusinessSlug(name: string): string {
	return (name || "business")
		.toLowerCase()
		.replace(/[\u2019']/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function getBusinessHref(business: any): string {
	const slug =
		business?.slug ||
		toBusinessSlug(business?.name || business?.title || "business");
	return `/directory/${slug}`;
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
	let selectedLocationId: string | null = null;

	try {
		const response = await payload.find({
			collection: "businesses",
			limit: 1000,
			depth: 2,
		});
		businesses = response.docs || [];
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
		const response = await payload.find({
			collection: "locations",
			limit: 100,
		});
		locations = response.docs || [];
	} catch (e) {
		console.error("Failed to fetch locations:", e);
	}

	if (selectedLocation && selectedLocation !== "All WilCo") {
		const locationDoc = locations.find(
			(loc: any) => loc.slug === selectedLocation,
		);
		if (locationDoc) {
			selectedLocationId = locationDoc.id;
		}
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
			if (selectedLocationId) {
				const businessLocationId =
					typeof b.address?.city === "object"
						? b.address.city?.id
						: null;
				return businessLocationId === selectedLocationId;
			}

			const locationName = getBusinessLocation(b).toLowerCase();
			const locationSlug = locationName
				.replace(/[\u2019']/g, "")
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");

			return (
				locationName === selectedLocation.toLowerCase() ||
				locationSlug === selectedLocation.toLowerCase()
			);
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

	const locationOptions =
		locations.length > 0
			? locations.map((l: any) => ({
					id: String(l.id),
					name: l.name || l.title,
					slug: l.slug,
			  }))
			: [
					{ id: "leander", name: "Leander", slug: "leander" },
					{
						id: "cedar-park",
						name: "Cedar Park",
						slug: "cedar-park",
					},
					{
						id: "round-rock",
						name: "Round Rock",
						slug: "round-rock",
					},
					{
						id: "georgetown",
						name: "Georgetown",
						slug: "georgetown",
					},
					{
						id: "liberty-hill",
						name: "Liberty Hill",
						slug: "liberty-hill",
					},
					{ id: "hutto", name: "Hutto", slug: "hutto" },
					{ id: "jarrell", name: "Jarrell", slug: "jarrell" },
					{ id: "florence", name: "Florence", slug: "florence" },
					{ id: "taylor", name: "Taylor", slug: "taylor" },
				];

	const selectedLocationLabel =
		locationOptions.find((l) => l.slug === selectedLocation)?.name ||
		selectedLocation;

	const buildPageHref = (page: number) => {
		const params = new URLSearchParams();
		if (selectedCategory && selectedCategory !== "All") {
			params.set("category", selectedCategory);
		}
		if (selectedLocation && selectedLocation !== "All WilCo") {
			params.set("location", selectedLocation);
		}
		if (searchQuery) {
			params.set("search", searchQuery);
		}
		params.set("page", String(page));
		return `/directory/all?${params.toString()}`;
	};

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
						? ` in ${selectedLocationLabel}`
						: ""}
				</p>
			</div>

			{/* ═══ FILTERS ═══ */}
			<DirectoryFilters
				categories={categoryNames}
				locations={locationOptions}
			/>

			{/* ═══ RESULTS GRID ═══ */}
			{pageBusinesses.length > 0 ? (
				<>
					<div className='all-businesses-grid'>
						{pageBusinesses.map((b: any, i: number) => (
							<Link
								key={i}
								href={getBusinessHref(b)}
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
										<StarRating
											rating={b.googleRating}
											size='sm'
										/>
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
									href={buildPageHref(validPage - 1)}
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
									href={buildPageHref(validPage + 1)}
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
