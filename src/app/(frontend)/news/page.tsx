// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { WILCO_SITE_ID, SITE_NAME } from "@/lib/site-config";
import { SecondaryNav } from "@/components/wilco/SecondaryNav";
import { PresentingSponsor } from "@/components/wilco/PresentingSponsor";
import { ArticleCardHero } from "@/components/wilco/ArticleCardHero";
import { ArticleCardSide } from "@/components/wilco/ArticleCardSide";
import { ArticleCardFeatured } from "@/components/wilco/ArticleCardFeatured";
import { ArticleCardHeadline } from "@/components/wilco/ArticleCardHeadline";
import { ArticleCardGrid } from "@/components/wilco/ArticleCardGrid";
import { InlineSubscribeCTA } from "@/components/wilco/InlineSubscribeCTA";
import { SponsorWidget } from "@/components/wilco/SponsorWidget";
import { EventsWidget } from "@/components/wilco/EventsWidget";
import { GrindCrossPromo } from "@/components/wilco/GrindCrossPromo";
import { NewsletterBanner } from "@/components/wilco/NewsletterBanner";
import type {
	Article,
	Sponsor,
	Category as CategoryType,
	Location as LocationType,
} from "@/payload-types";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: `News | ${SITE_NAME}`,
	description:
		"Latest local news from Williamson County, Texas. Business, development, schools, food & drink, real estate, and community coverage.",
};

// Wrap in Suspense for search params
export default function NewsPage(props: {
	searchParams: Promise<Record<string, string | undefined>>;
}) {
	return (
		<Suspense fallback={<div className='min-h-screen bg-bg' />}>
			<NewsPageContent searchParamsPromise={props.searchParams} />
		</Suspense>
	);
}

async function NewsPageContent({
	searchParamsPromise,
}: {
	searchParamsPromise: Promise<Record<string, string | undefined>>;
}) {
	const searchParams = await searchParamsPromise;
	const payload = await getPayload({ config });

	// Build article where clause based on filters
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const articleWhere: any = {
		status: { equals: "published" },
	};

	let selectedLocationId: string | null = null;

	// Fetch locations first (we'll need it for all cases)
	let locationsResult = { docs: [] };
	try {
		locationsResult = await payload.find({
			collection: "locations",
			sort: "name",
			limit: 50,
			overrideAccess: true,
		});
		console.log(
			"✅ Locations fetched:",
			locationsResult.docs.length,
			locationsResult.docs.map((l: any) => ({
				name: l.name,
				slug: l.slug,
			})),
		);
	} catch (e) {
		console.error("❌ Error fetching locations:", e);
	}

	// Handle location filter - convert slug to ID
	if (searchParams.location) {
		const locationDoc = locationsResult.docs.find(
			(loc: any) => loc.slug === searchParams.location,
		);
		if (locationDoc) {
			selectedLocationId = locationDoc.id;
			articleWhere.city = {
				equals: selectedLocationId,
			};
			console.log(
				`✅ Location filter applied: "${searchParams.location}" (ID: ${selectedLocationId})`,
			);
		} else {
			console.warn(
				`⚠️ Location slug "${searchParams.location}" not found`,
			);
		}
	}

	if (searchParams.category) {
		// Find category by slug
		try {
			const catResult = await payload.find({
				collection: "categories",
				where: { slug: { equals: searchParams.category } },
				limit: 1,
			});
			if (catResult.docs[0]) {
				articleWhere.category = { equals: catResult.docs[0].id };
			}
		} catch (e) {
			console.warn(
				"News: categories collection not found, skipping category filter",
			);
		}
	}

	if (searchParams.brand) {
		articleWhere.newsletterBrand = { equals: searchParams.brand };
	}

	// Fetch data in parallel
	const [
		heroResult,
		featuredResult,
		latestResult,
		sponsorsResult,
		eventsResult,
		categoriesResult,
	] = await Promise.all([
		// Hero article - no placement field, just get first published article
		(async () => {
			try {
				return await payload.find({
					collection: "articles",
					where: articleWhere,
					sort: "-publishedAt",
					limit: 1,
					depth: 2,
				});
			} catch (e) {
				console.warn("News: Error fetching hero article", e);
				return { docs: [] };
			}
		})(),
		// Featured articles - get next batch
		(async () => {
			try {
				return await payload.find({
					collection: "articles",
					where: articleWhere,
					sort: "-publishedAt",
					limit: 4,
					depth: 2,
				});
			} catch (e) {
				console.warn("News: Error fetching featured articles", e);
				return { docs: [] };
			}
		})(),
		// Latest articles
		(async () => {
			try {
				return await payload.find({
					collection: "articles",
					where: articleWhere,
					sort: "-publishedAt",
					limit: 20,
					depth: 2,
				});
			} catch (e) {
				console.warn("News: Error fetching latest articles", e);
				return { docs: [] };
			}
		})(),
		// TODO: Create sponsors collection and uncomment fetch below
		(async () => {
			try {
				return await payload.find({
					collection: "sponsors",
					where: { status: { equals: "active" } },
					limit: 10,
					depth: 1,
				});
			} catch (e) {
				console.warn("News: sponsors collection not found", e);
				return { docs: [] };
			}
		})(),
		// TODO: Create events collection and uncomment fetch below
		(async () => {
			try {
				return await payload.find({
					collection: "events",
					where: { status: { equals: "upcoming" } },
					sort: "eventDate",
					limit: 5,
					depth: 1,
				});
			} catch (e) {
				console.warn("News: events collection not found", e);
				return { docs: [] };
			}
		})(),
		// Fetch categories
		(async () => {
			try {
				return await payload.find({
					collection: "categories",
					sort: "name",
					limit: 20,
				});
			} catch (e) {
				console.warn("News: categories collection not found", e);
				return { docs: [] };
			}
		})(),
	]);

	const heroArticle = heroResult.docs[0] || null;
	const featuredArticles = featuredResult.docs;
	const allArticles = latestResult.docs;

	// Log article structure for debugging
	if (allArticles.length > 0) {
		console.log("📰 Article Response Sample:", {
			total: allArticles.length,
			firstArticle: {
				id: allArticles[0].id,
				title: allArticles[0].title,
				city: allArticles[0].city,
				category: allArticles[0].category,
				status: allArticles[0].status,
				publishedAt: allArticles[0].publishedAt,
			},
		});
	}

	// Exclude hero and featured from the general pool
	const usedIds = new Set<number>();
	if (heroArticle) usedIds.add(heroArticle.id);
	featuredArticles.forEach((a) => usedIds.add(a.id));

	const remainingArticles = allArticles.filter((a) => !usedIds.has(a.id));
	const headlineArticles = remainingArticles.slice(0, 6);
	const subStories = remainingArticles.slice(6, 12);

	// If no hero, use the first article
	const displayHero = heroArticle || remainingArticles[0] || null;
	if (!heroArticle && remainingArticles[0]) {
		usedIds.add(remainingArticles[0].id);
	}

	// Find presenting sponsor
	const presentingSponsor =
		sponsorsResult.docs.find((s) =>
			s.placements?.some(
				(p) =>
					(p.page === "news" || p.page === "all") &&
					p.position === "presenting" &&
					p.isActive,
			),
		) || null;

	// Find sidebar sponsor
	const sidebarSponsor =
		sponsorsResult.docs.find((s) =>
			s.placements?.some(
				(p) =>
					(p.page === "news" || p.page === "all") &&
					p.position === "sidebar-featured" &&
					p.isActive,
			),
		) || null;

	// Category data for secondary nav
	const categories = categoriesResult.docs
		.filter((c) => c.applicableTo?.includes("articles"))
		.map((c) => ({ name: c.name, slug: c.slug, color: c.color }));

	const locations = locationsResult.docs.map((l) => ({
		name: l.name,
		slug: l.slug,
	}));

	// Group articles by category for section grids
	const categoryGroups = getCategorySections(remainingArticles, categories);

	console.log("🗺️ Secondary Nav Data:", {
		totalLocations: locations.length,
		locations: locations,
		totalCategories: categories.length,
		categories: categories,
	});
	return (
		<>
			{/* Secondary Nav */}
			<SecondaryNav
				categories={categories}
				locations={locations}
			/>

			{/* Presenting Sponsor */}
			<div className='max-w-page mx-auto px-4 md:px-6'>
				<PresentingSponsor sponsor={presentingSponsor} />
			</div>

			{/* Three-Column Layout */}
			<div className='max-w-page mx-auto px-4 md:px-20 mt-5'>
				<div className='grid grid-cols-1 lg:grid-cols-[340px_1fr_380px] gap-7'>
					{/* Left Column — Latest Headlines (hidden on mobile, shown below hero) */}
					<aside className='hidden lg:block'>
						<h3 className='text-sm font-bold text-text-primary mb-3 pb-2 border-b-2 border-text-primary'>
							Latest
						</h3>
						{headlineArticles.length > 0 ? (
							headlineArticles.map((article) => (
								<ArticleCardHeadline
									key={article.id}
									article={article}
								/>
							))
						) : (
							<div className='text-text-secondary text-sm py-4'>
								No data found.
							</div>
						)}

						{/* Events Widget */}
						{eventsResult.docs.length > 0 && (
							<div className='mt-5'>
								<EventsWidget events={eventsResult.docs} />
							</div>
						)}
					</aside>

					{/* Center Column */}
					<div className='min-w-0'>
						{/* Hero Article */}
						{displayHero ? (
							<ArticleCardHero article={displayHero} />
						) : (
							<div className='text-text-secondary text-sm py-8 text-center'>
								No data found.
							</div>
						)}

						{/* Inline Subscribe CTA */}
						<InlineSubscribeCTA />

						{/* Mobile: Latest Headlines (horizontal scroll strip) */}
						<div className='lg:hidden my-4'>
							<h3 className='text-sm font-bold text-text-primary mb-3 pb-2 border-b-2 border-text-primary'>
								Latest
							</h3>
							{headlineArticles.slice(0, 4).length > 0 ? (
								headlineArticles.slice(0, 4).map((article) => (
									<ArticleCardHeadline
										key={article.id}
										article={article}
									/>
								))
							) : (
								<div className='text-text-secondary text-sm py-4'>
									No data found.
								</div>
							)}
						</div>

						{/* Sub-stories */}
						{subStories.length > 0 ? (
							<div className='mt-2'>
								<h3 className='text-sm font-bold text-text-primary mb-2 pb-2 border-b-2 border-text-primary'>
									More Stories
								</h3>
								{subStories.map((article) => (
									<ArticleCardSide
										key={article.id}
										article={article}
									/>
								))}
							</div>
						) : (
							<div className='text-text-secondary text-sm py-4 mt-2'>
								No data found.
							</div>
						)}
					</div>

					{/* Right Column — Featured */}
					<aside className='hidden lg:block'>
						<h3 className='text-sm font-bold text-text-primary mb-3 pb-2 border-b-2 border-text-primary'>
							Featured
						</h3>
						{featuredArticles.length > 0 ? (
							featuredArticles.map((article) => (
								<ArticleCardFeatured
									key={article.id}
									article={article}
								/>
							))
						) : (
							<div className='text-text-secondary text-sm py-4'>
								No data found.
							</div>
						)}

						{/* Sponsor Widget */}
						{sidebarSponsor && (
							<div className='mt-5'>
								<SponsorWidget sponsor={sidebarSponsor} />
							</div>
						)}
					</aside>
				</div>

				{/* Mobile: Featured + Events (stacked below) */}
				<div className='lg:hidden mt-6'>
					{featuredArticles.length > 0 ? (
						<>
							<h3 className='text-sm font-bold text-text-primary mb-3 pb-2 border-b-2 border-text-primary'>
								Featured
							</h3>
							{featuredArticles.map((article) => (
								<ArticleCardFeatured
									key={article.id}
									article={article}
								/>
							))}
						</>
					) : (
						<div className='text-text-secondary text-sm py-4'>
							No data found.
						</div>
					)}

					{eventsResult.docs.length > 0 && (
						<div className='mt-5'>
							<EventsWidget events={eventsResult.docs} />
						</div>
					)}
				</div>
			</div>

			{/* Newsletter Banner */}
			<div className='max-w-page mx-auto px-4 md:px-6'>
				<NewsletterBanner />
			</div>

			{/* Category Sections */}
			{categoryGroups.map((group) => (
				<div
					key={group.slug}
					className='max-w-page mx-auto px-4 md:px-6 mt-10'
				>
					<div className='flex items-center justify-between mb-4'>
						<h2 className='font-serif text-xl font-bold text-text-primary'>
							{group.name}
						</h2>
						<a
							href={`/news?category=${group.slug}`}
							className='text-[13px] font-semibold text-blue no-underline hover:underline'
						>
							All {group.name} →
						</a>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						{group.articles.map((article) => (
							<ArticleCardGrid
								key={article.id}
								article={article}
							/>
						))}
					</div>
				</div>
			))}

			{/* Grind Cross Promo */}
			<div className='mt-12'>
				<GrindCrossPromo />
			</div>

			{/* Events strip - if we have events */}
			{eventsResult.docs.length > 0 && (
				<div className='max-w-page mx-auto px-4 md:px-6 mt-10'>
					<div className='flex items-center justify-between mb-4'>
						<h2 className='font-serif text-xl font-bold text-text-primary'>
							Upcoming Events
						</h2>
						<a
							href='/events'
							className='text-[13px] font-semibold text-blue no-underline hover:underline'
						>
							All Events →
						</a>
					</div>
					<EventsWidget events={eventsResult.docs} />
				</div>
			)}
		</>
	);
}

/** Group remaining articles by category for section grids */
function getCategorySections(
	articles: Article[],
	categories: Array<{ name: string; slug: string; color: string }>,
) {
	const groups: Array<{ name: string; slug: string; articles: Article[] }> =
		[];
	const seen = new Set<number>();

	// Only show sections with 2+ articles
	for (const cat of categories) {
		const catArticles = articles.filter((a) => {
			if (seen.has(a.id)) return false;
			const articleCat =
				typeof a.category === "object" ? a.category : null;
			return articleCat?.slug === cat.slug;
		});

		if (catArticles.length >= 2) {
			const sectionArticles = catArticles.slice(0, 4);
			sectionArticles.forEach((a) => seen.add(a.id));
			groups.push({
				name: cat.name,
				slug: cat.slug,
				articles: sectionArticles,
			});
		}

		if (groups.length >= 3) break; // Max 3 category sections
	}

	return groups;
}
