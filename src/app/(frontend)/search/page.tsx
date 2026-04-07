// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database
import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import { Metadata } from "next";
import "../../../styles/search.css";
import { SearchFiltersClient } from "./SearchFiltersClient";

// Helper to safely render values that might be objects
function safeRender(value: any): string {
	if (value === null || value === undefined) return "";
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	)
		return String(value);
	if (typeof value === "object") {
		return (
			value.name ||
			value.title ||
			value.label ||
			value.value ||
			value.display ||
			value.text ||
			""
		);
	}
	return "";
}

// Helper to format salary objects
function formatSalary(salary: any): string {
	if (!salary) return "";
	if (typeof salary === "string") return salary;

	let min = salary.min;
	let max = salary.max;

	// Ensure we're working with numbers
	const minNum = typeof min === "number" ? min : null;
	const maxNum = typeof max === "number" ? max : null;

	if (minNum && maxNum)
		return `$${Math.round(minNum / 1000)}K – $${Math.round(maxNum / 1000)}K/yr`;
	if (minNum) return `$${Math.round(minNum / 1000)}K+/yr`;
	if (maxNum) return `Up to $${Math.round(maxNum / 1000)}K/yr`;
	return "";
}

export const metadata: Metadata = {
	title: "Search Results — WilCo Guide",
	description:
		"Search for news, businesses, jobs, events, and deals in Williamson County.",
};

interface SearchParams {
	q?: string;
	type?: string;
	page?: string;
}

interface SearchResult {
	type: "article" | "business" | "job" | "event" | "deal" | "re";
	id: string;
	title: string;
	excerpt?: string;
	description?: string;
	image?: string;
	category?: string;
	location?: string;
	company?: string;
	salary?: string;
	featured?: boolean;
	rating?: number;
	reviews?: number;
	tags?: string[];
	badge?: string;
	date?: string;
	time?: string;
	price?: string;
	address?: string;
	stats?: string[];
	isFeatured?: boolean;
}

interface ContentItem {
	id: string;
	title?: string;
	name?: string;
	description?: string;
	excerpt?: string;
	slug?: string;
	category?: string;
	location?: string;
	company?: string;
	salary?: string;
	image?: { url?: string };
	featured?: boolean;
	rating?: number;
	reviews?: number;
	tags?: string[];
	publishedAt?: string;
}

// Helper function to search content
function searchContent(items: ContentItem[], query: string): ContentItem[] {
	if (!query) return items;
	const lowercaseQuery = query.toLowerCase();
	return items.filter((item) => {
		const title = (item.title || item.name || "").toLowerCase();
		const description = (
			item.description ||
			item.excerpt ||
			""
		).toLowerCase();
		const company = (item.company || "").toLowerCase();
		return (
			title.includes(lowercaseQuery) ||
			description.includes(lowercaseQuery) ||
			company.includes(lowercaseQuery)
		);
	});
}

// Helper function to transform items to results
function transformToResults(
	items: ContentItem[],
	type: "article" | "business" | "job" | "event" | "deal" | "re",
): SearchResult[] {
	return items.map((item) => ({
		type,
		id: item.id,
		title: item.title || item.name || "",
		excerpt: item.excerpt || item.description || "",
		image: item.image?.url || "",
		category: item.category || "",
		location: item.location || "",
		company: item.company || "",
		salary: formatSalary(item.salary) || "",
		featured: item.featured || false,
		rating: item.rating || 0,
		reviews: item.reviews || 0,
		tags: item.tags || [],
		date: item.publishedAt || "",
	}));
}

export default async function SearchPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const resolvedParams = await searchParams;
	const query = resolvedParams.q || "";
	const typeFilter = resolvedParams.type || "all";
	const page = parseInt(resolvedParams.page || "1");

	let articles: ContentItem[] = [];
	let businesses: ContentItem[] = [];
	let jobs: ContentItem[] = [];
	let events: ContentItem[] = [];

	try {
		const payload = await getPayload({ config });

		// Fetch articles
		try {
			const articlesResult = await payload.find({
				collection: "articles",
				limit: 100,
			});
			articles = (articlesResult.docs || []) as ContentItem[];
		} catch (error) {
			console.log("Articles collection not available or empty");
		}

		// Fetch businesses
		try {
			const businessResult = await payload.find({
				collection: "businesses",
				limit: 100,
			});
			businesses = (businessResult.docs || []) as ContentItem[];
		} catch (error) {
			console.log("Businesses collection not available or empty");
		}

		// Fetch jobs
		try {
			const jobsResult = await payload.find({
				collection: "jobs",
				limit: 100,
			});
			jobs = (jobsResult.docs || []) as ContentItem[];
		} catch (error) {
			console.log("Jobs collection not available or empty");
		}

		// Fetch events
		try {
			const eventsResult = await payload.find({
				collection: "events",
				limit: 100,
			});
			events = (eventsResult.docs || []) as ContentItem[];
		} catch (error) {
			console.log("Events collection not available or empty");
		}
	} catch (error) {
		console.log("Error fetching CMS data:", error);
	}

	// Search filter logic
	const searchedArticles = searchContent(articles, query);
	const searchedBusinesses = searchContent(businesses, query);
	const searchedJobs = searchContent(jobs, query);
	const searchedEvents = searchContent(events, query);

	// Transform to results
	const articleResults = transformToResults(searchedArticles, "article");
	const businessResults = transformToResults(searchedBusinesses, "business");
	const jobResults = transformToResults(searchedJobs, "job");
	const eventResults = transformToResults(searchedEvents, "event");

	// Combine and filter by type
	let allResults: SearchResult[] = [
		...businessResults,
		...articleResults,
		...jobResults,
		...eventResults,
	];

	if (typeFilter !== "all") {
		allResults = allResults.filter((r) => r.type === typeFilter);
	}

	// Pagination
	const itemsPerPage = 10;
	const totalResults = allResults.length;
	const totalPages = Math.ceil(totalResults / itemsPerPage);
	const startIdx = (page - 1) * itemsPerPage;
	const endIdx = startIdx + itemsPerPage;
	const paginatedResults = allResults.slice(startIdx, endIdx);

	// Count by type
	const typeCounts = {
		all: allResults.length,
		articles: articleResults.length,
		businesses: businessResults.length,
		jobs: jobResults.length,
		events: eventResults.length,
	};

	// Fallback static data when no query
	const staticResults: SearchResult[] = query
		? []
		: [
				{
					type: "business",
					id: "1",
					title: "CrossFit Leander",
					category: "Fitness & Gym · Leander",
					excerpt:
						"Williamson County's top-rated CrossFit box. Group classes, personal training, nutrition coaching, and youth programs for all fitness levels.",
					rating: 4.9,
					reviews: 187,
					tags: [
						"Group Classes",
						"Personal Training",
						"Youth Programs",
					],
					isFeatured: true,
				},
				{
					type: "article",
					id: "2",
					title: "CrossFit Leander Named Best Gym in WilCo for Third Straight Year",
					excerpt:
						"The Leander fitness community continues to rally behind CrossFit Leander, which earned the top spot in our annual Best of WilCo reader poll for an unprecedented third consecutive year.",
					category: "Business",
					date: "Feb 10, 2026",
					image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
				},
				{
					type: "job",
					id: "3",
					company: "CrossFit Leander",
					title: "Head Coach & Programming Director",
					salary: "$55K – $70K",
					tags: ["Full-time", "Leander", "Benefits"],
				},
				{
					type: "deal",
					id: "4",
					title: "New Member Special — First Month 20% Off",
					company: "CrossFit Leander",
					badge: "20% OFF",
					excerpt: "Save $40",
					date: "Expires Mar 1, 2026",
				},
				{
					type: "article",
					id: "5",
					title: "The Complete Guide to CrossFit Gyms in Williamson County",
					excerpt:
						"From Leander to Georgetown, here are all the CrossFit boxes in WilCo ranked by ratings, pricing, and what makes each one unique for different fitness levels.",
					category: "Guide",
					date: "Jan 28, 2026",
					image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
				},
				{
					type: "event",
					id: "6",
					title: "CrossFit Leander Open Workout — Free Community WOD",
					location: "CrossFit Leander · 9:00 AM – 11:00 AM",
					date: "Feb 22 (Sat)",
					badge: "Free",
				},
				{
					type: "business",
					id: "7",
					title: "CrossFit Round Rock",
					category: "Fitness & Gym · Round Rock",
					excerpt:
						"Round Rock's original CrossFit affiliate. Olympic lifting, endurance training, and competitive team programming since 2014.",
					rating: 4.6,
					reviews: 94,
					tags: ["Olympic Lifting", "Competition Team"],
				},
				{
					type: "job",
					id: "8",
					company: "CrossFit Round Rock",
					title: "Part-Time CrossFit Coach (Weekends)",
					salary: "$25 – $35 / hr",
					tags: ["Part-time", "Round Rock"],
				},
				{
					type: "article",
					id: "9",
					title: "WilCo CrossFit Community Raises $12K for Local Food Bank",
					excerpt:
						"Athletes from five Williamson County CrossFit gyms came together for a charity workout that raised over $12,000 for the Williamson County Food Bank.",
					category: "Community",
					date: "Jan 15, 2026",
					image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
				},
				{
					type: "re",
					id: "10",
					title: "2847 Crystal Falls Pkwy, Leander",
					price: "$485,000",
					badge: "New Listing",
					excerpt: "0.3 mi from CrossFit Leander",
					stats: ["4 bd", "3 ba", "2,450 sqft"],
					image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
				},
			];

	const displayResults =
		allResults.length > 0 ? paginatedResults : staticResults.slice(0, 10);

	return (
		<>
			{/* Search Bar Section */}
			<div className='search-bar-section'>
				<div className='search-bar-inner'>
					<div className='search-input-wrap'>
						<svg
							width='16'
							height='16'
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
							className='search-input'
							defaultValue={query}
							placeholder='Search news, businesses, jobs, events, deals...'
						/>
					</div>
					<SearchFiltersClient />
					<button className='search-btn'>Search</button>
				</div>
			</div>

			{/* Presenting Sponsor */}
			<div
				className='presenting-sponsor'
				style={{ marginLeft: "32px", marginRight: "32px" }}
			>
				<span className='ps-label'>Presented by</span>
				<div className='ps-divider'></div>
				<div className='ps-logo'>AC</div>
				<div className='ps-info'>
					<div className='ps-name'>Amplify Credit Union</div>
					<div className='ps-tagline'>
						Built for Williamson County since 1967
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='search-page'>
				{/* Results Header */}
				<div className='results-header'>
					<div className='results-query'>
						Results for <span>"{query || "All Results"}"</span>
					</div>
					<div className='results-count'>
						{totalResults}{" "}
						{totalResults === 1 ? "result" : "results"} across all
						sections
					</div>
				</div>

				{/* Type Tabs */}
				<div className='type-tabs'>
					<button
						className={`type-tab ${typeFilter === "all" ? "active" : ""}`}
					>
						All<span className='tab-count'>{typeCounts.all}</span>
					</button>
					<button
						className={`type-tab ${typeFilter === "article" ? "active" : ""}`}
					>
						Articles
						<span className='tab-count'>{typeCounts.articles}</span>
					</button>
					<button
						className={`type-tab ${typeFilter === "business" ? "active" : ""}`}
					>
						Businesses
						<span className='tab-count'>
							{typeCounts.businesses}
						</span>
					</button>
					<button
						className={`type-tab ${typeFilter === "job" ? "active" : ""}`}
					>
						Jobs<span className='tab-count'>{typeCounts.jobs}</span>
					</button>
					<button
						className={`type-tab ${typeFilter === "event" ? "active" : ""}`}
					>
						Events
						<span className='tab-count'>{typeCounts.events}</span>
					</button>
				</div>

				{/* Two Column Layout */}
				<div className='results-layout'>
					{/* Main Results */}
					<div className='results-main'>
						{displayResults.map((result) => (
							<ResultCard
								key={result.id}
								result={result}
							/>
						))}

						{/* Load More */}
						{paginatedResults.length > 0 && page < totalPages && (
							<div className='load-more-wrap'>
								<button className='load-more-btn'>
									Load More Results
								</button>
							</div>
						)}
					</div>

					{/* Sidebar */}
					<div className='sidebar'>
						{/* Newsletter CTA */}
						<div className='newsletter-sidebar'>
							<div className='ns-title'>Get WilCo news free</div>
							<div className='ns-sub'>
								Join 15,000+ Williamson County residents. Local
								news, openings, events & more every Tuesday.
							</div>
							<input
								type='email'
								className='ns-input'
								placeholder='Your email'
							/>
							<button className='ns-btn'>Subscribe Free</button>
						</div>

						{/* Sponsor Widget */}
						<div className='right-sponsor'>
							<div className='right-sponsor-label'>Sponsored</div>
							<div className='right-sponsor-name'>
								Amplify Credit Union
							</div>
							<div className='right-sponsor-desc'>
								Open a checking account and get $300. Six WilCo
								branches.
							</div>
							<Link
								href='#'
								className='right-sponsor-link'
							>
								Learn More →
							</Link>
						</div>

						{/* Trending */}
						<div className='trending-sidebar'>
							<div className='trending-title'>
								Trending This Week
							</div>
							<div className='trending-item'>
								<div className='trending-num'>1</div>
								<div>
									<div className='trending-text'>
										Cedar Park's $180M Mixed-Use District
										Breaks Ground
									</div>
									<div className='trending-meta'>
										Development · Today
									</div>
								</div>
							</div>
							<div className='trending-item'>
								<div className='trending-num'>2</div>
								<div>
									<div className='trending-text'>
										Leander Home Prices Drop 8%
										Year-Over-Year
									</div>
									<div className='trending-meta'>
										Real Estate · Feb 4
									</div>
								</div>
							</div>
							<div className='trending-item'>
								<div className='trending-num'>3</div>
								<div>
									<div className='trending-text'>
										DataMesh Relocates HQ to Georgetown
									</div>
									<div className='trending-meta'>
										Business · Feb 3
									</div>
								</div>
							</div>
							<div className='trending-item'>
								<div className='trending-num'>4</div>
								<div>
									<div className='trending-text'>
										H-E-B Opening Second Leander Location
									</div>
									<div className='trending-meta'>
										Business · Feb 1
									</div>
								</div>
							</div>
							<div className='trending-item'>
								<div className='trending-num'>5</div>
								<div>
									<div className='trending-text'>
										Leander ISD Approves New Elementary
										School
									</div>
									<div className='trending-meta'>
										Schools · Jan 29
									</div>
								</div>
							</div>
						</div>

						{/* Popular Businesses */}
						<div className='popular-biz-sidebar'>
							<div className='pbs-title'>Popular Businesses</div>
							<div className='pbs-item'>
								<div
									className='pbs-logo'
									style={{
										background: "#f0f4ff",
										color: "var(--blue)",
									}}
								>
									TC
								</div>
								<div className='pbs-content'>
									<div className='pbs-name'>
										Torchy's Tacos
									</div>
									<div className='pbs-detail'>
										Restaurant · Round Rock
									</div>
									<div className='pbs-rating'>
										<span
											style={{ color: "var(--yellow)" }}
										>
											★★★★★
										</span>{" "}
										4.8
									</div>
								</div>
							</div>
							<div className='pbs-item'>
								<div
									className='pbs-logo'
									style={{
										background: "#ecfdf5",
										color: "var(--green)",
									}}
								>
									KR
								</div>
								<div className='pbs-content'>
									<div className='pbs-name'>
										Kalahari Resorts
									</div>
									<div className='pbs-detail'>
										Entertainment · Round Rock
									</div>
									<div className='pbs-rating'>
										<span
											style={{ color: "var(--yellow)" }}
										>
											★★★★☆
										</span>{" "}
										4.5
									</div>
								</div>
							</div>
							<div className='pbs-item'>
								<div
									className='pbs-logo'
									style={{
										background: "#fef3e2",
										color: "var(--orange)",
									}}
								>
									BB
								</div>
								<div className='pbs-content'>
									<div className='pbs-name'>
										Brotherton's Black Iron BBQ
									</div>
									<div className='pbs-detail'>
										BBQ · Pflugerville
									</div>
									<div className='pbs-rating'>
										<span
											style={{ color: "var(--yellow)" }}
										>
											★★★★★
										</span>{" "}
										4.9
									</div>
								</div>
							</div>
							<div className='pbs-item'>
								<div
									className='pbs-logo'
									style={{
										background: "#f5f3ff",
										color: "var(--purple)",
									}}
								>
									DR
								</div>
								<div className='pbs-content'>
									<div className='pbs-name'>
										Dr. Teeth Dental
									</div>
									<div className='pbs-detail'>
										Healthcare · Leander
									</div>
									<div className='pbs-rating'>
										<span
											style={{ color: "var(--yellow)" }}
										>
											★★★★★
										</span>{" "}
										4.7
									</div>
								</div>
							</div>
							<Link
								href='#'
								className='pbs-see-all'
							>
								Browse Directory →
							</Link>
						</div>

						{/* Second Sponsor */}
						<div className='right-sponsor'>
							<div className='right-sponsor-label'>Sponsored</div>
							<div className='right-sponsor-name'>
								WilCo Properties
							</div>
							<div className='right-sponsor-desc'>
								Buying, selling, or investing in Williamson
								County? Free home valuations available.
							</div>
							<Link
								href='#'
								className='right-sponsor-link'
							>
								Get Free Valuation →
							</Link>
						</div>

						{/* Upcoming Events */}
						<div className='sidebar-events'>
							<div className='se-title'>Upcoming Events</div>
							<div className='se-item'>
								<div className='se-date'>
									<div className='se-month'>Feb</div>
									<div className='se-day'>15</div>
								</div>
								<div className='se-content'>
									<div className='se-name'>
										Round Rock Express Opener
									</div>
									<div className='se-detail'>
										Dell Diamond · 7:05 PM
									</div>
								</div>
							</div>
							<div className='se-item'>
								<div className='se-date'>
									<div className='se-month'>Feb</div>
									<div className='se-day'>18</div>
								</div>
								<div className='se-content'>
									<div className='se-name'>
										Leander Farmers Market
									</div>
									<div className='se-detail'>
										Old Town Leander · 9 AM
									</div>
								</div>
							</div>
							<div className='se-item'>
								<div className='se-date'>
									<div className='se-month'>Feb</div>
									<div className='se-day'>22</div>
								</div>
								<div className='se-content'>
									<div className='se-name'>
										Georgetown Wine Walk
									</div>
									<div className='se-detail'>
										Downtown Square · 1 PM
									</div>
								</div>
							</div>
							<div className='se-item'>
								<div className='se-date'>
									<div className='se-month'>Mar</div>
									<div className='se-day'>1</div>
								</div>
								<div className='se-content'>
									<div className='se-name'>
										WilCo Small Biz Meetup
									</div>
									<div className='se-detail'>
										Amplify HQ · 6 PM
									</div>
								</div>
							</div>
							<Link
								href='#'
								className='se-see-all'
							>
								See All Events →
							</Link>
						</div>

						{/* WilCo Grind Promo */}
						<div className='grind-sidebar'>
							<div className='grind-sidebar-header'>
								<div className='grind-logo-sm'>G</div>
								<div className='grind-sidebar-title'>
									WilCo Grind
								</div>
							</div>
							<div className='grind-sidebar-desc'>
								Business news & career intel for Williamson
								County professionals. Free weekly newsletter.
							</div>
							<button className='grind-sidebar-btn'>
								Subscribe to Grind →
							</button>
						</div>

						{/* Hot Jobs */}
						<div className='sidebar-jobs'>
							<div className='sj-title'>Hot Jobs</div>
							<div className='sj-item'>
								<div className='sj-company'>
									Kalahari Resorts
								</div>
								<div className='sj-role'>
									Guest Experience Manager
								</div>
								<div className='sj-meta'>
									Round Rock · $55K–$65K
								</div>
							</div>
							<div className='sj-item'>
								<div className='sj-company'>
									Baylor Scott & White
								</div>
								<div className='sj-role'>
									Registered Nurse — ER
								</div>
								<div className='sj-meta'>
									Round Rock · $72K–$95K
								</div>
							</div>
							<div className='sj-item'>
								<div className='sj-company'>DataMesh</div>
								<div className='sj-role'>
									Senior Software Engineer
								</div>
								<div className='sj-meta'>
									Georgetown · $130K–$160K
								</div>
							</div>
							<div className='sj-item'>
								<div className='sj-company'>Leander ISD</div>
								<div className='sj-role'>
									Elementary Teacher (3rd Grade)
								</div>
								<div className='sj-meta'>
									Leander · $52K–$68K
								</div>
							</div>
							<Link
								href='#'
								className='sj-see-all'
							>
								Browse All Jobs →
							</Link>
						</div>
					</div>
				</div>

				{/* Newsletter Banner */}
				<div className='newsletter-bottom-banner'>
					<div className='nbb-content'>
						<div className='nbb-title'>
							Never miss what's happening in WilCo
						</div>
						<div className='nbb-sub'>
							Local news, business openings, events, jobs & more.
							Join 15,000+ subscribers.
						</div>
					</div>
					<div className='nbb-form'>
						<input
							type='email'
							className='nbb-input'
							placeholder='Your email address'
						/>
						<button className='nbb-btn'>Subscribe Free</button>
					</div>
				</div>

				{/* Trending Stories */}
				<div className='bottom-section'>
					<div className='bottom-section-header'>
						<div className='bottom-section-title'>
							Trending in WilCo
						</div>
						<Link
							href='/news'
							className='bottom-section-link'
						>
							All News →
						</Link>
					</div>
					<div className='bottom-grid-4'>
						<Link
							href='#'
							className='bottom-story-card'
						>
							<div className='bsc-img'>
								<img
									src='https://images.unsplash.com/photo-1582407947092-60a09dbb2dec?w=400&q=80'
									alt=''
								/>
							</div>
							<div className='bsc-body'>
								<div
									className='cat-tag'
									style={{ color: "var(--orange)" }}
								>
									<span
										className='cat-dot'
										style={{ background: "var(--orange)" }}
									></span>{" "}
									Development
								</div>
								<div className='bsc-title'>
									Kalahari Announces $250M Phase 2 Expansion
									in Round Rock
								</div>
								<div className='bsc-meta'>
									Feb 7 · 4 min read
								</div>
							</div>
						</Link>
						<Link
							href='#'
							className='bottom-story-card'
						>
							<div className='bsc-img'>
								<img
									src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'
									alt=''
								/>
							</div>
							<div className='bsc-body'>
								<div
									className='cat-tag'
									style={{ color: "var(--pink)" }}
								>
									<span
										className='cat-dot'
										style={{ background: "var(--pink)" }}
									></span>{" "}
									Food & Drink
								</div>
								<div className='bsc-title'>
									New Brewpub Opening in Downtown Leander This
									Spring
								</div>
								<div className='bsc-meta'>
									Feb 5 · 3 min read
								</div>
							</div>
						</Link>
						<Link
							href='#'
							className='bottom-story-card'
						>
							<div className='bsc-img'>
								<img
									src='https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80'
									alt=''
								/>
							</div>
							<div className='bsc-body'>
								<div
									className='cat-tag'
									style={{ color: "var(--yellow)" }}
								>
									<span
										className='cat-dot'
										style={{ background: "var(--yellow)" }}
									></span>{" "}
									Real Estate
								</div>
								<div className='bsc-title'>
									Median Home Prices Drop 4% in Cedar Park —
									What It Means
								</div>
								<div className='bsc-meta'>
									Feb 4 · 5 min read
								</div>
							</div>
						</Link>
						<Link
							href='#'
							className='bottom-story-card'
						>
							<div className='bsc-img'>
								<img
									src='https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80'
									alt=''
								/>
							</div>
							<div className='bsc-body'>
								<div
									className='cat-tag'
									style={{ color: "var(--blue)" }}
								>
									<span
										className='cat-dot'
										style={{ background: "var(--blue)" }}
									></span>{" "}
									Business
								</div>
								<div className='bsc-title'>
									Tech Startup Hiring 150 at New Georgetown
									Campus
								</div>
								<div className='bsc-meta'>
									Feb 3 · 3 min read
								</div>
							</div>
						</Link>
					</div>
				</div>

				{/* Popular Businesses Grid */}
				<div className='bottom-section'>
					<div className='bottom-section-header'>
						<div className='bottom-section-title'>
							Popular in the Directory
						</div>
						<Link
							href='/directory'
							className='bottom-section-link'
						>
							Browse Directory →
						</Link>
					</div>
					<div className='bottom-grid-4'>
						<Link
							href='#'
							className='bottom-biz-card'
						>
							<div className='bbc-header'>
								<div
									className='bbc-logo'
									style={{
										background:
											"linear-gradient(135deg,#fef3c7,#fde68a)",
										color: "#d97706",
									}}
								>
									RC
								</div>
								<div className='bbc-info'>
									<div className='bbc-name'>
										Rosalie's Kitchen & Bar
									</div>
									<div className='bbc-cat'>
										Italian Restaurant · Leander
									</div>
								</div>
							</div>
							<div className='bbc-rating'>
								<span className='bbc-stars'>★★★★★</span>{" "}
								<span className='bbc-num'>4.8</span>{" "}
								<span className='bbc-count'>(312 reviews)</span>
							</div>
						</Link>
						<Link
							href='#'
							className='bottom-biz-card'
						>
							<div className='bbc-header'>
								<div
									className='bbc-logo'
									style={{
										background:
											"linear-gradient(135deg,#dbeafe,#bfdbfe)",
										color: "#2563eb",
									}}
								>
									CF
								</div>
								<div className='bbc-info'>
									<div className='bbc-name'>
										CrossFit Leander
									</div>
									<div className='bbc-cat'>
										Gym & Fitness · Leander
									</div>
								</div>
							</div>
							<div className='bbc-rating'>
								<span className='bbc-stars'>★★★★★</span>{" "}
								<span className='bbc-num'>4.9</span>{" "}
								<span className='bbc-count'>(187 reviews)</span>
							</div>
						</Link>
						<Link
							href='#'
							className='bottom-biz-card'
						>
							<div className='bbc-header'>
								<div
									className='bbc-logo'
									style={{
										background:
											"linear-gradient(135deg,#d1fae5,#a7f3d0)",
										color: "#059669",
									}}
								>
									AC
								</div>
								<div className='bbc-info'>
									<div className='bbc-name'>
										Amplify Credit Union
									</div>
									<div className='bbc-cat'>
										Banking · Round Rock
									</div>
								</div>
							</div>
							<div className='bbc-rating'>
								<span className='bbc-stars'>★★★★☆</span>{" "}
								<span className='bbc-num'>4.6</span>{" "}
								<span className='bbc-count'>(89 reviews)</span>
							</div>
						</Link>
						<Link
							href='#'
							className='bottom-biz-card'
						>
							<div className='bbc-header'>
								<div
									className='bbc-logo'
									style={{
										background:
											"linear-gradient(135deg,#fce7f3,#fbcfe8)",
										color: "#db2777",
									}}
								>
									LS
								</div>
								<div className='bbc-info'>
									<div className='bbc-name'>
										Leander Station Bar
									</div>
									<div className='bbc-cat'>
										Bar & Grill · Leander
									</div>
								</div>
							</div>
							<div className='bbc-rating'>
								<span className='bbc-stars'>★★★★★</span>{" "}
								<span className='bbc-num'>4.7</span>{" "}
								<span className='bbc-count'>(256 reviews)</span>
							</div>
						</Link>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className='page'>
				<div className='footer'>
					<div className='footer-text'>
						© 2026 WilCo Guide · <Link href='#'>About</Link> ·{" "}
						<Link href='#'>Advertise</Link> ·{" "}
						<Link href='#'>Contact</Link> ·{" "}
						<Link href='#'>Privacy</Link>
					</div>
				</div>
			</div>
		</>
	);
}

// Result Card Component
function ResultCard({ result }: { result: SearchResult }) {
	switch (result.type) {
		case "article":
			return (
				<div className='result-article'>
					{result.image && (
						<div className='result-article-img'>
							<img
								src={result.image}
								alt={result.title}
							/>
						</div>
					)}
					<div className='result-article-content'>
						{result.category && (
							<div
								className={`cat-tag cat-${safeRender(result.category).toLowerCase()}`}
							>
								<span className='cat-dot'></span>{" "}
								{safeRender(result.category)}
							</div>
						)}
						<div className='result-article-title'>
							{safeRender(result.title)}
						</div>
						{result.excerpt && (
							<div className='result-article-excerpt'>
								{safeRender(result.excerpt)}
							</div>
						)}
						<div className='result-article-meta'>
							<span>WilCo Guide</span>
							{result.date && <span>{result.date}</span>}
							<span>3 min read</span>
						</div>
					</div>
				</div>
			);

		case "business":
			return (
				<div
					className={`result-business ${result.isFeatured ? "partner" : ""}`}
				>
					<div
						className='biz-logo'
						style={{ background: "#f0f4ff", color: "var(--blue)" }}
					>
						{result.title?.substring(0, 2).toUpperCase()}
					</div>
					<div className='biz-content'>
						<div className='biz-name-row'>
							<div className='biz-name'>
								{safeRender(result.title)}
							</div>
							{result.isFeatured && (
								<div className='partner-badge'>Partner</div>
							)}
						</div>
						{result.category && (
							<div className='biz-category'>
								{safeRender(result.category)}
							</div>
						)}
						{result.rating && (
							<div className='biz-rating'>
								<span className='stars'>
									{"★".repeat(Math.floor(result.rating))}
									{"☆".repeat(5 - Math.floor(result.rating))}
								</span>{" "}
								{result.rating} ({result.reviews} reviews)
							</div>
						)}
						{result.excerpt && (
							<div className='biz-desc'>
								{safeRender(result.excerpt)}
							</div>
						)}
						{result.tags && result.tags.length > 0 && (
							<div className='biz-tags'>
								{result.tags.map((tag, idx) => (
									<span
										key={idx}
										className='biz-tag'
									>
										{tag}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			);

		case "job":
			return (
				<div
					className={`result-job ${result.isFeatured ? "featured" : ""}`}
				>
					<div className='job-company-row'>
						<div className='job-logo'>
							{safeRender(result.company)
								.substring(0, 2)
								.toUpperCase()}
						</div>
						<div className='job-company-name'>
							{safeRender(result.company)}
						</div>
					</div>
					<div className='job-title'>{safeRender(result.title)}</div>
					{result.tags && result.tags.length > 0 && (
						<div className='job-details'>
							{result.tags.map((tag, idx) => (
								<span
									key={idx}
									className='job-tag'
								>
									{safeRender(tag)}
								</span>
							))}
						</div>
					)}
					{result.salary && (
						<div className='job-salary'>
							{safeRender(result.salary)}
						</div>
					)}
				</div>
			);

		case "event":
			return (
				<div className='result-event'>
					<div className='event-date-badge'>
						<div className='ecd-month'>
							{result.date?.split(" ")[0]}
						</div>
						<div className='ecd-day'>
							{result.date?.split(" ")[1]}
						</div>
						<div className='ecd-dow'>
							{result.date?.split(" ")[2]}
						</div>
					</div>
					<div className='event-content'>
						<div className='event-title'>
							{safeRender(result.title)}
						</div>
						{result.location && (
							<div className='event-detail'>
								{safeRender(result.location)}
							</div>
						)}
						{result.badge && (
							<span className='event-tag'>
								{safeRender(result.badge)}
							</span>
						)}
					</div>
				</div>
			);

		case "deal":
			return (
				<div className='result-deal'>
					<div className='deal-badge-box'>
						{safeRender(result.badge)}
					</div>
					<div className='deal-content'>
						{result.company && (
							<div className='deal-biz-name'>
								{safeRender(result.company)}
							</div>
						)}
						<div className='deal-title'>
							{safeRender(result.title)}
						</div>
						{result.excerpt && (
							<div className='deal-value'>
								{safeRender(result.excerpt)}
							</div>
						)}
						{result.date && (
							<div className='deal-expiry'>{result.date}</div>
						)}
					</div>
				</div>
			);

		case "re":
			return (
				<div className='result-re'>
					{result.image && (
						<div className='re-img'>
							<img
								src={result.image}
								alt={result.title}
							/>
						</div>
					)}
					<div className='re-content'>
						{result.badge && (
							<div className='re-badge'>{result.badge}</div>
						)}
						{result.price && (
							<div className='re-price'>{result.price}</div>
						)}
						<div className='re-address'>
							{safeRender(result.title)}
						</div>
						{result.excerpt && (
							<div
								style={{
									fontSize: "12px",
									color: "var(--text-muted)",
								}}
							>
								{safeRender(result.excerpt)}
							</div>
						)}
						{result.stats && result.stats.length > 0 && (
							<div className='re-stats'>
								{result.stats.map((stat, idx) => (
									<span key={idx}>{safeRender(stat)}</span>
								))}
							</div>
						)}
					</div>
				</div>
			);

		default:
			return null;
	}
}
