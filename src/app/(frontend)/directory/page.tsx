// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database
import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import type { Metadata } from "next";
import "@/styles/directory.css";
import DirectorySpotlight from "@/components/wilco/DirectorySpotlight";
import DirectoryFilters from "@/components/wilco/DirectoryFilters";

/* ═══════════════════════════════════════
   DIRECTORY PAGE — WilCo Guide
   Matches "WilCo Guide - Directory Home Page.html" design.
   ═══════════════════════════════════════ */

export const metadata: Metadata = {
	title: "Business Directory — WilCo Guide",
	description:
		"Discover local businesses in Williamson County. Restaurants, services, fitness, retail, and more — all in one directory.",
};

function getLocationName(item: any): string {
	if (!item.location) return "";
	if (typeof item.location === "object")
		return item.location.name || item.location.title || "";
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

export default async function DirectoryPage(props: {
	searchParams: Promise<{
		category?: string;
		location?: string;
		search?: string;
	}>;
}) {
	const searchParams = await props.searchParams;
	const selectedCategory = searchParams.category || "";
	const selectedLocation = searchParams.location || "";
	const searchQuery = searchParams.search || "";

	const payload = await getPayload({ config });

	let businesses: any[] = [];
	let categories: any[] = [];
	let locations: any[] = [];

	try {
		const r = await payload.find({
			collection: "businesses",
			limit: 100,
			depth: 2,
		});
		businesses = r.docs || [];
	} catch (e) {
		console.error("Directory: failed to fetch businesses", e);
	}
	try {
		const r = await payload.find({ collection: "categories", limit: 30 });
		categories = r.docs || [];
	} catch (e) {
		console.error("Directory: failed to fetch categories", e);
	}
	try {
		const r = await payload.find({ collection: "locations", limit: 20 });
		locations = r.docs || [];
	} catch (e) {
		console.error("Directory: failed to fetch locations", e);
	}

	/* ═══ FILTER BUSINESSES ═══ */
	let filteredBusinesses = businesses;

	// Filter by category
	if (selectedCategory && selectedCategory !== "All") {
		filteredBusinesses = filteredBusinesses.filter((b: any) => {
			const bizCategory =
				typeof b.category === "object" ? b.category?.name : b.category;
			return (
				bizCategory?.toLowerCase() === selectedCategory.toLowerCase()
			);
		});
	}

	// Filter by location
	if (selectedLocation && selectedLocation !== "All WilCo") {
		filteredBusinesses = filteredBusinesses.filter((b: any) => {
			const bizLocation = getBusinessLocation(b);
			return (
				bizLocation?.toLowerCase() === selectedLocation.toLowerCase()
			);
		});
	}

	// Filter by search query
	if (searchQuery) {
		filteredBusinesses = filteredBusinesses.filter((b: any) => {
			const name = (b.name || "").toLowerCase();
			const category =
				typeof b.category === "object"
					? (b.category?.name || "").toLowerCase()
					: (b.category || "").toLowerCase();
			const description = (b.description || "").toLowerCase();
			const query = searchQuery.toLowerCase();
			return (
				name.includes(query) ||
				category.includes(query) ||
				description.includes(query)
			);
		});
	}

	/* ═══ CATEGORIZE BUSINESSES BY SECTION ═══ */
	const categorizeBusinesses = (businesses: any[]) => {
		return {
			// Spotlight: Featured businesses (marked as featured in CMS) - max 3
			spotlight: businesses
				.filter((b) => b.featured === true)
				.slice(0, 3),

			// Restaurants & Dining: Only businesses with category "Restaurants"
			restaurants: businesses
				.filter((b) => {
					const bizCategory =
						typeof b.category === "object"
							? (b.category?.name || "").toLowerCase()
							: (b.category || "").toLowerCase();
					return bizCategory === "restaurants";
				})
				.slice(0, 4),

			// Home Services: Only businesses with category "Home Services"
			homeServices: businesses
				.filter((b) => {
					const bizCategory =
						typeof b.category === "object"
							? (b.category?.name || "").toLowerCase()
							: (b.category || "").toLowerCase();
					return bizCategory === "home services";
				})
				.slice(0, 4),

			// More Services: Everything else (non-featured, non-restaurant, non-home services)
			moreServices: businesses
				.filter((b) => {
					const bizCategory =
						typeof b.category === "object"
							? (b.category?.name || "").toLowerCase()
							: (b.category || "").toLowerCase();
					return (
						b.featured !== true &&
						bizCategory !== "restaurants" &&
						bizCategory !== "home services"
					);
				})
				.slice(0, 8),
		};
	};

	const categorized = categorizeBusinesses(filteredBusinesses);

	/* ═══ GET DISPLAY SECTIONS (SMART SECTION LOGIC) ═══ */
	const getDisplaySections = () => {
		// If user selected a specific category filter
		if (selectedCategory && selectedCategory !== "All") {
			const filteredBySelectedCategory = filteredBusinesses.filter(
				(b: any) => {
					const bizCategory =
						typeof b.category === "object"
							? (b.category?.name || "").toLowerCase()
							: (b.category || "").toLowerCase();
					return bizCategory === selectedCategory.toLowerCase();
				},
			);

			return {
				featured: categorized.spotlight, // Always show featured
				mainSection: {
					title: selectedCategory,
					businesses: filteredBySelectedCategory,
					count: filteredBySelectedCategory.length,
				},
				secondarySection: null, // Hide second section
				otherSection: null, // Hide third section
			};
		}

		// If NO category filter (showing all) - Traditional 3-section layout
		return {
			featured: categorized.spotlight,
			mainSection: {
				title: "Restaurants & Dining",
				businesses: categorized.restaurants,
				count: categorized.restaurants.length,
			},
			secondarySection: {
				title: "Home Services",
				businesses: categorized.homeServices,
				count: categorized.homeServices.length,
			},
			otherSection: {
				title: "More Services & Businesses",
				businesses: categorized.moreServices,
				count: categorized.moreServices.length,
			},
		};
	};

	const sections = getDisplaySections();

	/* ═══ DEBUG LOGGING ═══ */
	console.log("📊 Display Sections:", {
		selectedCategory,
		mainSectionTitle: sections.mainSection?.title,
		mainSectionCount: sections.mainSection?.count,
		secondarySectionVisible: sections.secondarySection !== null,
		otherSectionVisible: sections.otherSection !== null,
	});

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

	/* Build spotlight data from CMS businesses or use static fallback */
	const premiumSpotlight =
		filteredBusinesses.length >= 3
			? filteredBusinesses.slice(0, 3).map((b: any) => ({
					name: b.name || b.title || "Business",
					category:
						typeof b.category === "object"
							? b.category?.name || "Business"
							: b.category || "Business",
					priceRange: b.priceRange || "$$",
					description: b.description || b.tagline || "",
					location: getBusinessLocation(b), // ✅ CORRECT - gets address.city or location
					rating: b.googleRating || 4.8,
					reviewCount: b.googleReviewCount || "100+",
					image:
						getImageUrl(b.photos?.[0]?.photo) ||
						getImageUrl(b.featuredImage || b.image || b.logo) ||
						"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
					// tags: [] as {
					// 	label: string;
					// 	type: "deal" | "hiring" | "new" | "event" | "featured";
					// }[],
				}))
			: [
					{
						name: "Rosalie's Kitchen & Bar",
						category: "Italian Restaurant",
						priceRange: "$$",
						description:
							"Handmade pasta, wood-fired pizzas, and craft cocktails in the heart of Leander. Family-owned since 2019.",
						location: "Leander, TX",
						rating: 4.8,
						reviewCount: "312 reviews",
						image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
						// tags: [
						// 	{ label: "Active Deal", type: "deal" as const },
						// 	{ label: "Hiring", type: "hiring" as const },
						// ],
					},
					{
						name: "Summit Builders & Remodel",
						category: "Home Services",
						priceRange: "$$$",
						description:
							"Full-service home renovation, custom builds, and kitchen remodels. Licensed, insured, and locally owned.",
						location: "Liberty Hill, TX",
						rating: 4.9,
						reviewCount: "189 reviews",
						image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
						// tags: [{ label: "Just Opened", type: "new" as const }],
					},
					{
						name: "CrossFit WilCo",
						category: "Fitness Center",
						priceRange: "$$",
						description:
							"Strength, conditioning, and community. Open gym, personal training, and group classes for all levels.",
						location: "Round Rock, TX",
						rating: 4.9,
						reviewCount: "247 reviews",
						image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
						// tags: [
						// 	{ label: "1st Month Free", type: "deal" as const },
						// 	{
						// 		label: "Hiring Trainers",
						// 		type: "hiring" as const,
						// 	},
						// ],
					},
				];

	/* Build right cards (2x2) from CMS or static */
	const generateRightCards = () => {
		if (filteredBusinesses.length < 4) {
			return [
				[
					{
						name: "Iron Peak Gym",
						category: "Fitness",
						priceRange: "$$",
						description: "",
						location: "Cedar Park, TX",
						rating: 4.9,
						reviewCount: "",
						image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80",
						// tags: [{ label: "New", type: "new" as const }],
					},
					{
						name: "Morning Grind Coffee",
						category: "Coffee & Bakery",
						priceRange: "$",
						description: "",
						location: "Cedar Park, TX",
						rating: 4.8,
						reviewCount: "",
						image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80",
						// tags: [],
					},
				],
				[
					{
						name: "Luxe Beauty Studio",
						category: "Salon & Spa",
						priceRange: "$$$",
						description: "",
						location: "Round Rock, TX",
						rating: 4.7,
						reviewCount: "",
						image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
						// tags: [{ label: "20% Off", type: "deal" as const }],
					},
					{
						name: "WilCo Animal Hospital",
						category: "Veterinary",
						priceRange: "$$",
						description: "",
						location: "Round Rock, TX",
						rating: 4.9,
						reviewCount: "",
						image: "https://images.unsplash.com/photo-1552642986-ccb41e7059e7?w=600&q=80",
						// tags: [
						// 	{ label: "Free Consult", type: "deal" as const },
						// ],
					},
				],
				[
					{
						name: "The Hive Workspace",
						category: "Coworking",
						priceRange: "$$",
						description: "",
						location: "Leander, TX",
						rating: 4.6,
						reviewCount: "",
						image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
						// tags: [
						// 	{
						// 		label: "Hiring 3 Roles",
						// 		type: "hiring" as const,
						// 	},
						// ],
					},
					{
						name: "Westlake Legal Group",
						category: "Law Firm",
						priceRange: "$$$",
						description: "",
						location: "Cedar Park, TX",
						rating: 4.8,
						reviewCount: "",
						image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
						// tags: [],
					},
				],
				[
					{
						name: "Pint House Craft",
						category: "Bar & Grill",
						priceRange: "$$",
						description: "",
						location: "Round Rock, TX",
						rating: 4.5,
						reviewCount: "",
						image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
						// tags: [
						// 	{ label: "Event Tonight", type: "event" as const },
						// ],
					},
					{
						name: "Smoky Trail BBQ",
						category: "BBQ & Smokehouse",
						priceRange: "$$",
						description: "",
						location: "Liberty Hill, TX",
						rating: 4.9,
						reviewCount: "",
						image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
						// tags: [
						// 	{ label: "Live Music Fri", type: "event" as const },
						// ],
					},
				],
			];
		}
		// Use CMS data: slice 3-10 for right cards (2x2 grid = 4 cards)
		const rightBusinesses = filteredBusinesses.slice(3, 11);
		const result = [];
		for (let i = 0; i < rightBusinesses.length; i += 2) {
			result.push(
				[
					{
						name: rightBusinesses[i].name || "Business",
						category:
							typeof rightBusinesses[i].category === "object"
								? rightBusinesses[i].category?.name
								: rightBusinesses[i].category,
						priceRange: rightBusinesses[i].priceRange || "$$",
						description: "",
						location: getBusinessLocation(rightBusinesses[i]),
						rating: rightBusinesses[i].googleRating || 4.5,
						reviewCount: rightBusinesses[i].googleReviewCount || "",
						image:
							getImageUrl(
								rightBusinesses[i].photos?.[0]?.photo,
							) ||
							getImageUrl(rightBusinesses[i].featuredImage) ||
							"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
						tags: [] as {
							label: string;
							type:
								| "deal"
								| "hiring"
								| "new"
								| "event"
								| "featured";
						}[],
					},
					rightBusinesses[i + 1]
						? {
								name: rightBusinesses[i + 1].name || "Business",
								category:
									typeof rightBusinesses[i + 1].category ===
									"object"
										? rightBusinesses[i + 1].category?.name
										: rightBusinesses[i + 1].category,
								priceRange:
									rightBusinesses[i + 1].priceRange || "$$",
								description: "",
								location: getBusinessLocation(
									rightBusinesses[i + 1],
								),
								rating:
									rightBusinesses[i + 1].googleRating || 4.5,
								reviewCount:
									rightBusinesses[i + 1].googleReviewCount ||
									"",
								image:
									getImageUrl(
										rightBusinesses[i + 1].photos?.[0]
											?.photo,
									) ||
									getImageUrl(
										rightBusinesses[i + 1].featuredImage,
									) ||
									"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
								tags: [] as {
									label: string;
									type:
										| "deal"
										| "hiring"
										| "new"
										| "event"
										| "featured";
								}[],
							}
						: null,
				].filter(Boolean) as any,
			);
		}
		return result.length > 0
			? result
			: [
					[
						{
							name: "Iron Peak Gym",
							category: "Fitness",
							priceRange: "$$",
							description: "",
							location: "Cedar Park, TX",
							rating: 4.9,
							reviewCount: "",
							image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80",
							tags: [{ label: "New", type: "new" as const }],
						},
						{
							name: "Morning Grind Coffee",
							category: "Coffee & Bakery",
							priceRange: "$",
							description: "",
							location: "Cedar Park, TX",
							rating: 4.8,
							reviewCount: "",
							image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80",
							tags: [],
						},
					],
				];
	};

	const rightCards = generateRightCards();

	/* Build restaurant and service cards from CMS */
	const generateRestaurantCards = () => {
		// Filter for Restaurants category
		const restaurantBusinesses = filteredBusinesses.filter((b: any) => {
			const bizCategory =
				typeof b.category === "object" ? b.category?.name : b.category;
			return bizCategory?.toLowerCase() === "restaurants";
		});

		if (restaurantBusinesses.length === 0) {
			return [
				{
					name: "El Rey Tacos",
					category: "Tacos",
					price: "$",
					location: "Leander",
					rating: 4.8,
					image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80",
					tags: [{ label: "Deal", type: "deal" }],
				},
				{
					name: "Stack'd Burger Bar",
					category: "Burgers",
					price: "$$",
					location: "Cedar Park",
					rating: 4.5,
					image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80",
					tags: [],
				},
				{
					name: "Koi House Sushi",
					category: "Sushi",
					price: "$$$",
					location: "Round Rock",
					rating: 4.9,
					image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600&q=80",
					tags: [{ label: "New", type: "new" }],
				},
				{
					name: "The Willow Table",
					category: "Fine Dining",
					price: "$$$$",
					location: "Georgetown",
					rating: 4.9,
					image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
					tags: [{ label: "Wine Night Wed", type: "event" }],
				},
			];
		}
		return restaurantBusinesses.slice(0, 4).map((b: any) => ({
			name: b.name || "Business",
			category:
				typeof b.category === "object" ? b.category?.name : b.category,
			price: b.priceRange || "$$",
			location:
				(typeof b.address?.city === "object"
					? b.address?.city?.name
					: b.address?.city) || "WilCo",
			rating: b.googleRating || 4.5,
			image:
				getImageUrl(b.photos?.[0]?.photo) ||
				getImageUrl(b.featuredImage) ||
				"https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80",
			tags: [] as any[],
		}));
	};

	const generateServiceCards = () => {
		// Filter for Home Services category
		const serviceBusinesses = filteredBusinesses.filter((b: any) => {
			const bizCategory =
				typeof b.category === "object" ? b.category?.name : b.category;
			return bizCategory?.toLowerCase() === "home services";
		});

		if (serviceBusinesses.length === 0) {
			return [
				{
					name: "Bright Spark Electric",
					category: "Electrician",
					price: "$$",
					location: "Leander",
					rating: 4.7,
					image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
					tags: [{ label: "Hiring", type: "hiring" }],
				},
				{
					name: "True Colors Painting",
					category: "Painting",
					price: "$$",
					location: "Round Rock",
					rating: 4.6,
					image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
					tags: [{ label: "10% Off", type: "deal" }],
				},
				{
					name: "Texas Top Roofing",
					category: "Roofing",
					price: "$$$",
					location: "Georgetown",
					rating: 4.8,
					image: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=600&q=80",
					tags: [],
				},
				{
					name: "Sparkle Home Clean",
					category: "Cleaning",
					price: "$",
					location: "Cedar Park",
					rating: 4.9,
					image: "https://images.unsplash.com/photo-1527515637462-cee1395c2deb?w=600&q=80",
					tags: [
						{ label: "New", type: "new" },
						{ label: "Deal", type: "deal" },
					],
				},
			];
		}
		return serviceBusinesses.slice(0, 4).map((b: any) => ({
			name: b.name || "Business",
			category:
				typeof b.category === "object" ? b.category?.name : b.category,
			price: b.priceRange || "$$",
			location:
				(typeof b.address?.city === "object"
					? b.address?.city?.name
					: b.address?.city) || "WilCo",
			rating: b.googleRating || 4.5,
			image:
				getImageUrl(b.photos?.[0]?.photo) ||
				getImageUrl(b.featuredImage) ||
				"https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
			tags: [] as any[],
		}));
	};

	const restaurantCards = generateRestaurantCards();
	const serviceCards = generateServiceCards();

	/* Calculate dynamic business counts for each section */
	const restaurantCount = restaurantCards.length;
	const serviceCount = serviceCards.length;

	/* Build URL for filtered "See all" links - preserve current filters */
	const buildCategoryLink = (category: string) => {
		const params = new URLSearchParams();
		params.set("category", category);
		if (selectedLocation && selectedLocation !== "All Locations") {
			params.set("location", selectedLocation);
		}
		if (searchQuery) {
			params.set("search", searchQuery);
		}
		return `/directory?${params.toString()}`;
	};

	const trendingChips = [
		"🍕 Best Pizza in Leander",
		"💇 Hair Salons Near Me",
		"🏋️ New Gym Opening",
		"🔧 Emergency Plumber",
		"☕ Coffee Shops",
		"🐕 Dog Groomers",
		"🏠 Home Cleaning",
		"🍔 Best Burgers",
		"👶 Daycares",
		"🚗 Auto Repair",
		"🌮 Taco Tuesday",
		"🧘 Yoga Studios",
	];

	return (
		<>
			{/* Directory-specific secondary nav */}
			<DirectoryFilters
				categories={categoryNames}
				locations={locationNames}
			/>

			<div className='directory-page'>
				{/* ═══ TRENDING BAR ═══ */}
				<div className='trending-bar'>
					<div className='trending-label'>
						<div className='pulse' />
						Trending Now
					</div>
					<div className='trending-items-wrap'>
						<div className='trending-items'>
							{trendingChips.map((chip, i) => (
								<div
									className='trending-chip'
									key={i}
								>
									{chip}
								</div>
							))}
						</div>
					</div>
				</div>

				{/* ═══ PREMIUM SPOTLIGHT ═══ */}
				<div className='spotlight-section'>
					<div className='spotlight-header'>
						<div className='spotlight-label'>
							<div className='spotlight-icon'>★</div>
							<div className='spotlight-title'>
								Spotlight Businesses
							</div>
						</div>
					</div>

					<div className='dir-hero-grid'>
						{/* Premium Card (Left) */}
						<DirectorySpotlight
							businesses={premiumSpotlight}
							cycleSpeed={6000}
							isPremium={true}
						/>

						{/* Right 2x2 Grid */}
						<div className='hero-right'>
							{rightCards.map((cardSet, i) => (
								<DirectorySpotlight
									key={i}
									businesses={cardSet}
									cycleSpeed={5000 + i * 1500}
									isPremium={false}
								/>
							))}
						</div>
					</div>
				</div>

				{/* ═══ ACTIVE DEALS STRIP ═══ */}
				<div className='deals-strip'>
					<div className='deals-strip-label'>Active Deals</div>
					<div className='deals-scroll'>
						{[
							{ name: "Rosalie's", offer: "15% off dinner" },
							{ name: "Luxe Beauty", offer: "20% first visit" },
							{ name: "CrossFit WilCo", offer: "1st month free" },
							{ name: "Green Scene", offer: "$500 off project" },
							{ name: "WilCo Animal", offer: "Free consult" },
							{ name: "Iron Peak", offer: "7 days free" },
						].map((deal, i) => (
							<div
								className='deal-chip'
								key={i}
							>
								<span className='deal-chip-name'>
									{deal.name}
								</span>
								<span className='deal-chip-offer'>
									— {deal.offer}
								</span>
							</div>
						))}
					</div>
					<Link
						href='/search'
						className='deals-see-all'
					>
						See All Deals →
					</Link>
				</div>

				{/* ═══ NOW HIRING STRIP ═══ */}
				<div className='hiring-strip'>
					<div className='hiring-strip-label'>💼 Now Hiring</div>
					<div className='hiring-scroll'>
						{[
							{
								company: "Rosalie's",
								roles: "Line Cook, Server",
							},
							{ company: "The Hive", roles: "Community Manager" },
							{ company: "CrossFit WilCo", roles: "3 Trainers" },
							{ company: "Reliable Pros", roles: "HVAC Tech" },
							{
								company: "Summit Builders",
								roles: "Project Lead",
							},
						].map((item, i) => (
							<div
								className='hiring-chip'
								key={i}
							>
								<strong>{item.company}</strong> — {item.roles}
							</div>
						))}
					</div>
					<Link
						href='/jobs'
						className='deals-see-all'
					>
						See All Jobs →
					</Link>
				</div>

				{/* ═══ MAIN SECTION (Dynamic) ═══ */}
				{sections.mainSection && (
					<div className='category-row'>
						<div className='section-header'>
							<div className='section-title-group'>
								<h2 className='section-title'>
									{sections.mainSection.title}
								</h2>
								<span className='section-count'>
									{sections.mainSection.count}{" "}
									{sections.mainSection.count === 1
										? "business"
										: "businesses"}
								</span>
							</div>
							{sections.mainSection.count > 4 && (
								<Link
									href={buildCategoryLink(
										sections.mainSection.title,
									)}
									className='section-see-all'
								>
									See all →
								</Link>
							)}
						</div>
						<div className='row-grid'>
							{sections.mainSection.businesses
								.slice(0, 4)
								.map((b: any, i: number) => (
									<Link
										href={`/directory/${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
										className='biz-card row-card'
										key={i}
										style={{ textDecoration: "none" }}
									>
										<div className='card-media'>
											<img
												src={
													getImageUrl(
														b.photos?.[0]?.photo,
													) ||
													getImageUrl(
														b.featuredImage,
													) ||
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
											<div className='card-name'>
												{b.name}
											</div>
											<div className='card-location'>
												📍 {getBusinessLocation(b)}
											</div>
											<div className='card-rating'>
												<span className='stars'>
													{"★".repeat(
														Math.round(
															b.googleRating ||
																4.5,
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
					</div>
				)}

				{/* ═══ SECONDARY SECTION (Conditional) ═══ */}
				{sections.secondarySection && (
					<div className='category-row'>
						<div className='section-header'>
							<div className='section-title-group'>
								<h2 className='section-title'>
									{sections.secondarySection.title}
								</h2>
								<span className='section-count'>
									{sections.secondarySection.count}{" "}
									{sections.secondarySection.count === 1
										? "business"
										: "businesses"}
								</span>
							</div>
							{sections.secondarySection.count > 4 && (
								<Link
									href={buildCategoryLink(
										sections.secondarySection.title,
									)}
									className='section-see-all'
								>
									See all →
								</Link>
							)}
						</div>
						<div className='row-grid'>
							{sections.secondarySection.businesses
								.slice(0, 4)
								.map((b: any, i: number) => (
									<Link
										href={`/directory/${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
										className='biz-card row-card'
										key={i}
										style={{ textDecoration: "none" }}
									>
										<div className='card-media'>
											<img
												src={
													getImageUrl(
														b.photos?.[0]?.photo,
													) ||
													getImageUrl(
														b.featuredImage,
													) ||
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
											<div className='card-name'>
												{b.name}
											</div>
											<div className='card-location'>
												📍 {getBusinessLocation(b)}
											</div>
											<div className='card-rating'>
												<span className='stars'>
													{"★".repeat(
														Math.round(
															b.googleRating ||
																4.5,
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
					</div>
				)}

				{/* ═══ OTHER SECTION - More Services & Businesses (Conditional) ═══ */}
				{sections.otherSection && (
					<div className='category-row'>
						<div className='section-header'>
							<div className='section-title-group'>
								<h2 className='section-title'>
									{sections.otherSection.title}
								</h2>
								<span className='section-count'>
									{sections.otherSection.count}{" "}
									{sections.otherSection.count === 1
										? "business"
										: "businesses"}
								</span>
							</div>
							{sections.otherSection.count > 4 && (
								<Link
									href='/directory/all'
									className='section-see-all'
								>
									See all →
								</Link>
							)}
						</div>
						<div className='row-grid'>
							{sections.otherSection.businesses
								.slice(0, 8)
								.map((b: any, i: number) => (
									<Link
										href={`/directory/${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
										className='biz-card row-card'
										key={i}
										style={{ textDecoration: "none" }}
									>
										<div className='card-media'>
											<img
												src={
													getImageUrl(
														b.photos?.[0]?.photo,
													) ||
													getImageUrl(
														b.featuredImage,
													) ||
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
											<div className='card-name'>
												{b.name}
											</div>
											<div className='card-location'>
												📍 {getBusinessLocation(b)}
											</div>
											<div className='card-rating'>
												<span className='stars'>
													{"★".repeat(
														Math.round(
															b.googleRating ||
																4.5,
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
					</div>
				)}

				{/* ═══ CTA BANNER ═══ */}
				<div className='cta-banner'>
					<div className='cta-content'>
						<div className='cta-title'>
							Own a local business? Get discovered.
						</div>
						<div className='cta-desc'>
							Join 150+ WilCo businesses already in the directory.
							Featured listings, deals, hiring posts, and weekly
							newsletter exposure to 15,000+ local residents.
						</div>
					</div>
					<button className='cta-button'>
						List Your Business — $49/mo
					</button>
				</div>
			</div>
		</>
	);
}
