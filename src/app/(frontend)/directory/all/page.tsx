// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database

import { Metadata } from "next";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@/payload.config";
import DirectoryFilters from "@/components/wilco/DirectoryFilters";

export const metadata: Metadata = {
	title: "All Businesses — WilCo Guide Directory",
	description:
		"Browse all businesses in Williamson County. Filter by category, location, or search.",
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

			{/* ═══ STYLES ═══ */}
			<style jsx>{`
				.directory-all-page {
					padding: 40px 20px;
					max-width: 1200px;
					margin: 0 auto;
				}

				.page-header {
					margin-bottom: 40px;
				}

				.breadcrumb-link {
					display: inline-block;
					color: #0066cc;
					text-decoration: none;
					margin-bottom: 15px;
					font-weight: 500;
					transition: color 0.2s;
				}

				.breadcrumb-link:hover {
					color: #0052a3;
				}

				.page-header h1 {
					font-size: 2.5rem;
					font-weight: 700;
					margin: 15px 0;
					color: #1a1a1a;
				}

				.results-count {
					font-size: 1rem;
					color: #666;
					margin: 10px 0 0 0;
				}

				.all-businesses-grid {
					display: grid;
					grid-template-columns: repeat(
						auto-fill,
						minmax(280px, 1fr)
					);
					gap: 24px;
					margin: 40px 0;
				}

				.biz-card {
					position: relative;
					border-radius: 12px;
					overflow: hidden;
					background: white;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					transition:
						transform 0.2s,
						box-shadow 0.2s;
				}

				.biz-card:hover {
					transform: translateY(-4px);
					box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
				}

				.card-media {
					width: 100%;
					height: 200px;
					overflow: hidden;
					background: #f0f0f0;
				}

				.card-media img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				.card-overlay {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: linear-gradient(
						to bottom,
						rgba(0, 0, 0, 0),
						rgba(0, 0, 0, 0.3)
					);
					pointer-events: none;
				}

				.card-info {
					padding: 16px;
				}

				.card-category {
					font-size: 0.85rem;
					color: #0066cc;
					font-weight: 600;
					margin-bottom: 8px;
					text-transform: capitalize;
				}

				.card-name {
					font-size: 1.1rem;
					font-weight: 700;
					color: #1a1a1a;
					margin-bottom: 8px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.card-location {
					font-size: 0.9rem;
					color: #666;
					margin-bottom: 8px;
				}

				.card-rating {
					display: flex;
					align-items: center;
					gap: 6px;
					font-size: 0.9rem;
				}

				.stars {
					color: #ffc107;
					font-size: 1rem;
				}

				.rating-count {
					color: #666;
				}

				.pagination {
					display: flex;
					justify-content: center;
					align-items: center;
					gap: 20px;
					margin: 60px 0 40px;
					padding: 20px;
					border-top: 1px solid #eee;
				}

				.pagination-button {
					padding: 10px 20px;
					background: #0066cc;
					color: white;
					text-decoration: none;
					border-radius: 6px;
					font-weight: 600;
					transition: background 0.2s;
				}

				.pagination-button:hover {
					background: #0052a3;
				}

				.pagination-info {
					font-weight: 600;
					color: #1a1a1a;
				}

				.no-results {
					text-align: center;
					padding: 60px 20px;
				}

				.no-results h2 {
					font-size: 1.8rem;
					margin-bottom: 10px;
				}

				.no-results p {
					color: #666;
					margin-bottom: 20px;
				}

				.back-button {
					display: inline-block;
					padding: 12px 24px;
					background: #0066cc;
					color: white;
					text-decoration: none;
					border-radius: 6px;
					font-weight: 600;
					transition: background 0.2s;
				}

				.back-button:hover {
					background: #0052a3;
				}

				@media (max-width: 768px) {
					.page-header h1 {
						font-size: 1.8rem;
					}

					.all-businesses-grid {
						grid-template-columns: repeat(
							auto-fill,
							minmax(200px, 1fr)
						);
						gap: 16px;
					}

					.pagination {
						flex-direction: column;
						gap: 10px;
					}
				}
			`}</style>
		</div>
	);
}
