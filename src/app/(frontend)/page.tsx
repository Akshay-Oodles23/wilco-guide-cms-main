// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database
import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import "@/styles/home.css";
import { HomeWidgetsFilter } from "@/components/wilco/HomeWidgetsFilter";
import { LocationDropdown } from "@/components/wilco/LocationDropdown";

/* ═══════════════════════════════════════
   HOME PAGE — WilCo Guide
   Matches the "WilCo Guide - Home Page.html" design exactly.
   ═══════════════════════════════════════ */

export const metadata: Metadata = {
	title: "WilCo Guide — Your Williamson County Home Page",
	description:
		"Your home page for everything Williamson County. Local news, jobs, businesses, events, real estate, and deals — all in one place.",
};

function timeAgo(dateStr: string): string {
	if (!dateStr) return "";

	const now = new Date();
	const date = new Date(dateStr);

	// Check if date is valid
	if (isNaN(date.getTime())) {
		console.warn("⚠️ Invalid date format:", dateStr);
		return "";
	}

	const diffMs = now.getTime() - date.getTime();
	const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffHrs < 1) return "Just now";
	if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? "" : "s"} ago`;
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 30) return `${diffDays} days ago`;
	if (diffDays < 365)
		return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? "" : "s"} ago`;
	return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? "" : "s"} ago`;
}

function formatEventDate(dateStr: string): {
	month: string;
	day: string;
	full: string;
} {
	const date = new Date(dateStr);
	const months = [
		"JAN",
		"FEB",
		"MAR",
		"APR",
		"MAY",
		"JUN",
		"JUL",
		"AUG",
		"SEP",
		"OCT",
		"NOV",
		"DEC",
	];
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	return {
		month: months[date.getMonth()],
		day: String(date.getDate()),
		full: `${days[date.getDay()]}, ${months[date.getMonth()].charAt(0) + months[date.getMonth()].slice(1).toLowerCase()} ${date.getDate()}`,
	};
}

function getImageUrl(media: any): string | null {
	if (!media) return null;
	if (typeof media === "string") return media;
	if (media.url) return media.url;
	if (media.filename) return `/media/${media.filename}`;
	return null;
}

function getCatInfo(article: any): { name: string; color: string } {
	const cat = article.category;
	if (!cat) return { name: "News", color: "var(--blue)" };
	const name =
		typeof cat === "object" ? cat.name || cat.title || "News" : String(cat);
	const colorMap: Record<string, string> = {
		development: "var(--orange)",
		business: "var(--blue)",
		schools: "var(--green)",
		education: "var(--green)",
		"food & drink": "var(--pink)",
		food: "var(--pink)",
		community: "var(--red)",
		"real estate": "var(--yellow)",
		crime: "var(--red)",
		politics: "var(--purple)",
	};
	return { name, color: colorMap[name.toLowerCase()] || "var(--blue)" };
}

function formatSalary(job: any): string {
	if (job.salary && typeof job.salary === "string") return job.salary;

	let min = job.salaryMin || job.salaryRangeMin;
	let max = job.salaryMax || job.salaryRangeMax;

	if (typeof min === "object" && min?.min) min = min.min;
	if (typeof max === "object" && max?.max) max = max.max;

	const minNum = typeof min === "number" ? min : null;
	const maxNum = typeof max === "number" ? max : null;

	if (minNum && maxNum)
		return `$${Math.round(minNum / 1000)}K – $${Math.round(maxNum / 1000)}K/yr`;
	if (minNum) return `$${Math.round(minNum / 1000)}K+/yr`;
	if (maxNum) return `Up to $${Math.round(maxNum / 1000)}K/yr`;
	return "";
}

function getLocationName(item: any): string {
	if (!item.location) return "";
	if (typeof item.location === "object")
		return (
			item.location.name ||
			item.location.title ||
			item.location.city ||
			""
		);
	return String(item.location);
}

function getCompanyName(job: any): string {
	if (!job.company) return "Company";
	if (typeof job.company === "object")
		return job.company.name || job.company.title || "Company";
	return String(job.company);
}

function getVenueName(event: any): string {
	if (!event.venue) return "";
	if (typeof event.venue === "object")
		return (
			event.venue.name || event.venue.title || event.venue.address || ""
		);
	return String(event.venue);
}

function getPriceText(event: any): string {
	if (!event.price) return "";
	if (typeof event.price === "object")
		return event.price.amount || event.price.value || String(event.price);
	return String(event.price);
}

function getTimeText(event: any): string {
	if (!event.time) return "";
	if (typeof event.time === "object")
		return event.time.start || event.time.value || String(event.time);
	return String(event.time);
}

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

/* ── Page Component ──────────────────── */

export default function HomePage(props: {
	searchParams: Promise<Record<string, string | undefined>>;
}) {
	return (
		<Suspense fallback={<div className='min-h-screen bg-bg' />}>
			<HomePageContent searchParamsPromise={props.searchParams} />
		</Suspense>
	);
}

async function HomePageContent({
	searchParamsPromise,
}: {
	searchParamsPromise: Promise<Record<string, string | undefined>>;
}) {
	const searchParams = await searchParamsPromise;
	const payload = await getPayload({ config });
	const selectedCity = searchParams.location?.trim().toLowerCase();
	const selectedCityName = selectedCity
		? selectedCity
				.split("-")
				.map((part) =>
					part ? part.charAt(0).toUpperCase() + part.slice(1) : part,
				)
				.join(" ")
		: "";

	const articleWhere: any = {
		status: { equals: "published" },
	};
	const jobWhere: any = {
		status: { equals: "active" },
	};
	const businessWhere: any = {
		status: { not_equals: "inactive" },
	};

	if (selectedCity) {
		articleWhere.city = { equals: selectedCity };
		jobWhere["location.city"] = { equals: selectedCity };
		businessWhere.or = [
			{ "address.city": { equals: selectedCity } },
			...(selectedCityName
				? [{ "address.city": { equals: selectedCityName } }]
				: []),
		];

		console.log("📍 Home city filter applied:", selectedCity);
	}

	let articles: any[] = [];
	let filteredArticles: any[] = [];
	let jobs: any[] = [];
	let events: any[] = [];
	let businesses: any[] = [];
	let sponsors: any[] = [];
	let locations: any[] = [];

	// ═══ FETCH ALL ARTICLES (without city filter for hero) ═══
	try {
		const r = await payload.find({
			collection: "articles",
			limit: 12,
			sort: "-publishedAt",
			depth: 2,
			where: { status: { equals: "published" } },
		});
		articles = r.docs || [];
	} catch (e) {
		console.error("Home: failed to fetch articles", e);
	}

	// ═══ FETCH FILTERED ARTICLES (for sidebar only) ═══
	if (selectedCity) {
		try {
			const r = await payload.find({
				collection: "articles",
				limit: 50,
				sort: "-publishedAt",
				depth: 2,
				where: articleWhere,
			});
			filteredArticles = r.docs || [];
		} catch (e) {
			console.error("Home: failed to fetch filtered articles", e);
		}
	}
	try {
		const r = await payload.find({
			collection: "jobs",
			limit: 8,
			sort: "-postedAt",
			depth: 1,
			where: jobWhere,
		});
		jobs = r.docs || [];
	} catch (e) {
		console.error("Home: failed to fetch jobs", e);
	}
	try {
		const r = await payload.find({
			collection: "events",
			limit: 6,
			sort: "date",
			depth: 1,
		});
		events = r.docs || [];
	} catch (e) {
		console.error("Home: failed to fetch events", e);
	}
	try {
		const r = await payload.find({
			collection: "businesses",
			limit: 8,
			depth: 2,
			where: businessWhere,
		});
		businesses = r.docs || [];
	} catch (e) {
		console.error("Home: failed to fetch businesses", e);
	}

	try {
		const r = await payload.find({
			collection: "locations",
			sort: "name",
			limit: 20,
		});
		locations = r.docs || [];
	} catch (e) {
		console.error("❌ Error fetching locations:", e);
	}

	const heroArticle = articles[0] || null;
	const sidebarArticles = selectedCity
		? filteredArticles.slice(0, 5)
		: articles.slice(1, 6);
	const sectionArticles = articles.slice(0, 4);
	const sidebarJobs = jobs.slice(0, 3);
	const featuredJobs = jobs.slice(0, 4);
	const featuredEvent = events[0] || null;
	const upcomingEvents = events.slice(1, 5);
	const mainSponsor = sponsors[0] || null;

	return (
		<>
			<div className='home-page'>
				{/* ═══════════════════════════════════════
            LOCATION FILTER DROPDOWN
            ═══════════════════════════════════════ */}
				<LocationDropdown locations={locations} />

				{/* ═══════════════════════════════════════
            HERO 3-COLUMN GRID — ABOVE THE FOLD
            ═══════════════════════════════════════ */}
				<div className='hero-grid'>
					{/* ═══ LEFT: Latest News + Jobs ═══ */}
					<div className='left-col'>
						<div className='widget-header'>
							<div className='widget-title'>Latest News</div>
							<Link
								href='/news'
								className='widget-link'
							>
								All News →
							</Link>
						</div>

						{sidebarArticles.length > 0 ? (
							sidebarArticles.map((article: any, i: number) => {
								const cat = getCatInfo(article);
								return (
									<Link
										href={`/news/${article.slug}`}
										key={article.id || i}
										className='news-item'
										style={{
											textDecoration: "none",
											color: "inherit",
											display: "block",
										}}
									>
										<div
											className='cat-tag'
											style={{ color: cat.color }}
										>
											<span
												className='cat-dot'
												style={{
													background: cat.color,
												}}
											/>
											{safeRender(cat.name)}
										</div>
										<div className='ni-title'>
											{safeRender(article.title)}
										</div>
										<div className='ni-time'>
											{article.publishedAt
												? timeAgo(article.publishedAt)
												: article.publishedDate
													? timeAgo(
															article.publishedDate,
														)
													: ""}
										</div>
									</Link>
								);
							})
						) : (
							<div className='news-item'>
								<div className='ni-title'>No news found.</div>
							</div>
						)}

						{/* Jobs Widget */}
						<div className='jobs-widget'>
							<div className='widget-header'>
								<div className='widget-title'>New Jobs</div>
								<Link
									href='/jobs'
									className='widget-link'
								>
									All Jobs →
								</Link>
							</div>
							{sidebarJobs.length > 0 ? (
								sidebarJobs.map((job: any, i: number) => (
									<Link
										href={`/jobs/${job.slug || job.id}`}
										key={job.id || i}
										className='job-item'
										style={{
											textDecoration: "none",
											color: "inherit",
											display: "block",
										}}
									>
										<div className='ji-company'>
											{getCompanyName(job)}
										</div>
										<div className='ji-title'>
											{safeRender(job.title)}
										</div>
										<div className='ji-meta'>
											{getLocationName(job)}
											{formatSalary(job) &&
												` · ${formatSalary(job)}`}
										</div>
									</Link>
								))
							) : (
								<div className='job-item'>
									<div className='ji-title'>
										No jobs found.
									</div>
								</div>
							)}
						</div>
					</div>

					{/* ═══ CENTER: Hero Story + Filterable Widgets ═══ */}
					<div className='center-col'>
						{heroArticle ? (
							<Link
								href={`/news/${heroArticle.slug}`}
								style={{
									textDecoration: "none",
									color: "inherit",
								}}
							>
								{getImageUrl(
									heroArticle.featuredImage ||
										heroArticle.image ||
										heroArticle.heroImage,
								) ? (
									<div className='hero-img'>
										<img
											src={
												getImageUrl(
													heroArticle.featuredImage ||
														heroArticle.image ||
														heroArticle.heroImage,
												)!
											}
											alt={heroArticle.title}
										/>
									</div>
								) : (
									<div
										className='hero-img'
										style={{
											background: "var(--bg)",
											height: 220,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<span
											style={{
												color: "var(--text-muted)",
												fontSize: 14,
											}}
										>
											WilCo Guide
										</span>
									</div>
								)}
								<div
									className='cat-tag hero-cat'
									style={{
										color: getCatInfo(heroArticle).color,
									}}
								>
									<span
										className='cat-dot'
										style={{
											background:
												getCatInfo(heroArticle).color,
										}}
									/>
									{getCatInfo(heroArticle).name}
								</div>
								<h2 className='hero-title'>
									{safeRender(heroArticle.title)}
								</h2>
								<p className='hero-excerpt'>
									{safeRender(heroArticle.excerpt) ||
										safeRender(heroArticle.description) ||
										safeRender(heroArticle.summary) ||
										""}
								</p>
								<div className='hero-meta'>
									By{" "}
									{safeRender(heroArticle.author) ||
										"WilCo Guide Staff"}{" "}
									·{" "}
									{heroArticle.publishedAt
										? timeAgo(heroArticle.publishedAt)
										: heroArticle.publishedDate
											? timeAgo(heroArticle.publishedDate)
											: ""}
								</div>
							</Link>
						) : (
							<div className='hero-img'>
								<div
									style={{
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "var(--text-muted)",
										fontSize: 14,
									}}
								>
									No news found.
								</div>
							</div>
						)}

						{/* Filterable Widgets — Client Component */}
						<HomeWidgetsFilter
							businesses={businesses.slice(0, 8).map((b: any) => {
								// Extract first photo from photos array
								const firstPhoto = b.photos?.[0]?.photo;
								const photoUrl = getImageUrl(firstPhoto);

								return {
									id: b.id,
									name: b.name || b.title || "Business",
									slug: b.slug || String(b.id),
									category:
										typeof b.category === "object"
											? b.category?.name || "Business"
											: b.category || "Business",
									location:
										b.address?.city || getLocationName(b),
									image: photoUrl,
									rating: b.googleRating || b.rating || null,
									type: b.type || "business",
									dealText:
										b.deals?.[0]?.discount ||
										b.dealText ||
										null,
								};
							})}
						/>
					</div>

					{/* ═══ RIGHT: Events + Premium House ═══ */}
					<div className='right-col'>
						{/* Featured Event */}
						{featuredEvent ? (
							<Link
								href='/events'
								className='featured-event'
								style={{
									textDecoration: "none",
									color: "inherit",
									display: "block",
								}}
							>
								<div className='fe-label'>Featured Event</div>
								<div className='fe-date'>
									{
										formatEventDate(
											featuredEvent.date ||
												featuredEvent.startDate ||
												new Date().toISOString(),
										).full
									}
								</div>
								<div className='fe-title'>
									{safeRender(featuredEvent.title) ||
										safeRender(featuredEvent.name)}
								</div>
								<div className='fe-meta'>
									{getVenueName(featuredEvent) ||
										getLocationName(featuredEvent)}
									{getPriceText(featuredEvent)
										? ` · ${getPriceText(featuredEvent)}`
										: ""}
								</div>
								{getTimeText(featuredEvent) && (
									<div className='fe-time'>
										{getTimeText(featuredEvent)}
									</div>
								)}
							</Link>
						) : (
							<div className='featured-event'>
								<div className='fe-label'>Featured Event</div>
								<div className='fe-date'>Saturday, Feb 15</div>
								<div className='fe-title'>
									Round Rock Express Season Opener — Fireworks
									Night
								</div>
								<div className='fe-meta'>
									Dell Diamond, Round Rock · $12+
								</div>
								<div className='fe-time'>
									7:05 PM → Gates at 6:00 PM
								</div>
							</div>
						)}

						{/* Ad Card */}
						<div className='ad-card'>
							<div className='ad-badge'>Advertisement</div>
							<div className='ad-image'>
								<img
									src='https://images.unsplash.com/photo-1579027974112-70eb878806c7?q=80&w=2410&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
									alt='Advertisement'
								/>
							</div>
							<div className='ad-content'>
								<div className='ad-title'>
									Discover Local Businesses
								</div>
								<div className='ad-description'>
									Connect with 150+ WilCo businesses featured
									in our directory.
								</div>
								<Link
									href='/directory'
									className='ad-button'
								>
									Browse Directory →
								</Link>
							</div>
						</div>

						{/* Upcoming Events List */}
						<div className='events-list'>
							<div className='widget-header'>
								<div className='widget-title'>Upcoming</div>
								<Link
									href='/events'
									className='widget-link'
								>
									All Events →
								</Link>
							</div>
							{upcomingEvents.length > 0
								? upcomingEvents.map((evt: any, i: number) => {
										const d = formatEventDate(
											evt.date ||
												evt.startDate ||
												new Date().toISOString(),
										);
										return (
											<div
												className='event-row'
												key={evt.id || i}
											>
												<div className='er-date-box'>
													<div className='er-month'>
														{d.month}
													</div>
													<div className='er-day'>
														{d.day}
													</div>
												</div>
												<div>
													<div className='er-title'>
														{safeRender(
															evt.title,
														) ||
															safeRender(
																evt.name,
															)}
													</div>
													<div className='er-time'>
														{getTimeText(evt) || ""}{" "}
														·{" "}
														{getVenueName(evt) ||
															getLocationName(
																evt,
															)}
													</div>
												</div>
											</div>
										);
									})
								: /* Static fallback */
									[
										{
											month: "FEB",
											day: "16",
											title: "Leander Farmers Market",
											time: "9:00 AM · Old Town Leander",
										},
										{
											month: "FEB",
											day: "18",
											title: "WilCo Business Networking Mixer",
											time: "5:30 PM · Kalahari Convention Center",
										},
										{
											month: "FEB",
											day: "20",
											title: "LISD School Board Meeting",
											time: "6:00 PM · LISD Admin Building",
										},
										{
											month: "FEB",
											day: "22",
											title: "Georgetown Wine Walk",
											time: "2:00 PM · Downtown Square",
										},
									].map((evt, i) => (
										<div
											className='event-row'
											key={i}
										>
											<div className='er-date-box'>
												<div className='er-month'>
													{evt.month}
												</div>
												<div className='er-day'>
													{evt.day}
												</div>
											</div>
											<div>
												<div className='er-title'>
													{evt.title}
												</div>
												<div className='er-time'>
													{evt.time}
												</div>
											</div>
										</div>
									))}
						</div>

						{/* Premium House Listing (static — no RE collection yet) */}
						<div className='premium-house'>
							<div className='ph-img'>
								<img
									src='https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&q=80'
									alt='Featured Home'
								/>
								<div className='ph-badge'>PREMIUM</div>
								<div className='ph-video'>▶ VIDEO TOUR</div>
							</div>
							<div className='ph-body'>
								<div className='ph-price'>$489,900</div>
								<div className='ph-details'>
									4 bed · 3 bath · 2,850 sqft · 0.18 acres
								</div>
								<div className='ph-address'>
									1247 Crystal Falls Dr, Leander
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ═══════ NEWSLETTER BANNER ═══════ */}
				<div className='newsletter-banner'>
					<div className='nb-content'>
						<div className='nb-title'>
							Get WilCo news free every Tuesday
						</div>
						<div className='nb-sub'>
							Join 15,000+ Williamson County residents. Local
							news, jobs, events &amp; more.
						</div>
					</div>
					<div className='nb-form'>
						<input
							type='email'
							className='nb-input'
							placeholder='Your email address'
						/>
						<button className='nb-btn'>Subscribe Free</button>
					</div>
				</div>

				{/* ═══════ FOOD & DRINK SECTION ═══════ */}
				<div className='section'>
					<div className='section-header'>
						<div className='section-title'>Food &amp; Drink</div>
						<Link
							href='/news'
							className='section-link'
						>
							All Food News →
						</Link>
					</div>
					<div className='grid-4'>
						{sectionArticles.length > 0
							? sectionArticles.map((article: any, i: number) => {
									const cat = getCatInfo(article);
									const img = getImageUrl(
										article.featuredImage ||
											article.image ||
											article.heroImage,
									);
									return (
										<Link
											href={`/news/${article.slug}`}
											className='article-card'
											key={article.id || i}
										>
											<div className='ac-img'>
												{img ? (
													<img
														src={img}
														alt={article.title}
													/>
												) : (
													<div
														style={{
															width: "100%",
															height: "100%",
															background:
																"var(--bg)",
														}}
													/>
												)}
											</div>
											<div className='ac-body'>
												<div
													className='cat-tag'
													style={{ color: cat.color }}
												>
													<span
														className='cat-dot'
														style={{
															background:
																cat.color,
														}}
													/>
													{safeRender(cat.name)}
												</div>
												<div className='ac-title'>
													{safeRender(article.title)}
												</div>
												<div className='ac-meta'>
													{article.publishedAt
														? timeAgo(
																article.publishedAt,
															)
														: article.publishedDate
															? timeAgo(
																	article.publishedDate,
																)
															: ""}
												</div>
											</div>
										</Link>
									);
								})
							: [
									<div
										className='article-card'
										key='no-articles'
									>
										<div className='ac-body'>
											<div className='ac-title'>
												No news found.
											</div>
										</div>
									</div>,
								]}
					</div>
				</div>

				{/* ═══════ FEATURED JOBS SECTION ═══════ */}
				<div className='section'>
					<div className='section-header'>
						<div className='section-title'>Featured Jobs</div>
						<Link
							href='/jobs'
							className='section-link'
						>
							All Jobs →
						</Link>
					</div>
					<div className='grid-4'>
						{featuredJobs.length > 0
							? featuredJobs.map((job: any, i: number) => (
									<Link
										href={`/jobs/${job.slug || job.id}`}
										className='job-card'
										key={job.id || i}
										style={{
											textDecoration: "none",
											color: "inherit",
										}}
									>
										<div className='jc-company'>
											<div className='jc-logo'>
												{getCompanyName(job)
													.substring(0, 3)
													.toUpperCase()}
											</div>
											<div className='jc-name'>
												{getCompanyName(job)}
											</div>
										</div>
										<div className='jc-title'>
											{safeRender(job.title)}
										</div>
										{formatSalary(job) && (
											<div className='jc-salary'>
												{formatSalary(job)}
											</div>
										)}
										<div className='jc-tags'>
											<span className='jc-tag'>
												{typeof job.type === "object"
													? job.employmentType ||
														"Full-time"
													: job.type ||
														job.employmentType ||
														"Full-time"}
											</span>
											{getLocationName(job) && (
												<span className='jc-tag'>
													{getLocationName(job)}
												</span>
											)}
										</div>
									</Link>
								))
							: [
									<div
										className='job-card'
										key='no-jobs'
									>
										<div className='jc-title'>
											No jobs found.
										</div>
									</div>,
								]}
					</div>
				</div>

				{/* ═══════ INLINE SPONSOR ═══════ */}
				<div className='inline-sponsor'>
					<div className='is-logo'>
						{mainSponsor
							? (mainSponsor.name || "SP")
									.substring(0, 2)
									.toUpperCase()
							: "SF"}
					</div>
					<div>
						<div className='is-label'>Sponsored</div>
						<div className='is-name'>
							{mainSponsor
								? mainSponsor.name
								: "State Farm — Mike Chen"}
						</div>
						<div className='is-desc'>
							{mainSponsor
								? mainSponsor.description ||
									mainSponsor.tagline ||
									""
								: "Protecting WilCo families for 22 years. Home, auto & life insurance."}
						</div>
					</div>
					<a
						href={mainSponsor?.url || "#"}
						className='is-cta'
					>
						{mainSponsor?.ctaText || "Get a Quote →"}
					</a>
				</div>

				{/* ═══════ REAL ESTATE SECTION (static — no collection yet) ═══════ */}
				<div className='section'>
					<div className='section-header'>
						<div className='section-title'>Real Estate</div>
						<Link
							href='/search'
							className='section-link'
						>
							Browse Listings →
						</Link>
					</div>
					<div className='grid-4'>
						{[
							{
								img: "photo-1580587771525-78b9dba3b914",
								badge: "For Sale",
								badgeClass: "rec-badge-sale",
								price: "$489,900",
								addr: "1247 Crystal Falls Dr, Leander",
								details: "4 bd · 3 ba · 2,850 sqft",
							},
							{
								img: "photo-1564013799919-ab600027ffc6",
								badge: "For Sale",
								badgeClass: "rec-badge-sale",
								price: "$375,000",
								addr: "802 Teravista Club Dr, Round Rock",
								details: "3 bd · 2 ba · 1,950 sqft",
							},
							{
								img: "photo-1600596542815-ffad4c1539a9",
								badge: "New Build",
								badgeClass: "rec-badge-sale",
								price: "$425,000",
								addr: "Bryson Phase 3, Leander",
								details: "4 bd · 2.5 ba · 2,400 sqft",
							},
							{
								img: "photo-1600585154340-be6161a56a0c",
								badge: "For Rent",
								badgeClass: "rec-badge-rent",
								price: "$2,150",
								priceSuffix: "/mo",
								addr: "The Oaks at Lakeline, Cedar Park",
								details: "2 bd · 2 ba · 1,100 sqft",
							},
						].map((re, i) => (
							<div
								className='re-card'
								key={i}
							>
								<div className='rec-img'>
									<img
										src={`https://images.unsplash.com/${re.img}?w=400&q=80`}
										alt=''
									/>
									<div
										className={`rec-badge ${re.badgeClass}`}
									>
										{re.badge}
									</div>
								</div>
								<div className='rec-body'>
									<div className='rec-price'>
										{re.price}
										{re.priceSuffix && (
											<span
												style={{
													fontSize: 12,
													fontWeight: 400,
													color: "var(--text-muted)",
												}}
											>
												{re.priceSuffix}
											</span>
										)}
									</div>
									<div className='rec-address'>{re.addr}</div>
									<div className='rec-details'>
										{re.details}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* ═══════ DEALS & OFFERS SECTION (static — no collection yet) ═══════ */}
				<div className='section'>
					<div className='section-header'>
						<div className='section-title'>Deals &amp; Offers</div>
						<Link
							href='/search'
							className='section-link'
						>
							All Deals →
						</Link>
					</div>
					<div className='grid-4'>
						{[
							{
								badge: "20% OFF",
								img: "photo-1534438327276-14e5300c3a48",
								biz: "CrossFit Leander",
								title: "20% Off First Month Membership",
								exp: "Expires Mar 15",
							},
							{
								badge: "BOGO",
								img: "photo-1414235077428-338989a2e8c0",
								biz: "Rosalie's Italian",
								title: "Buy One Entrée, Get One Free",
								exp: "Tue–Thu only · Ends Feb 28",
							},
							{
								badge: "$50 OFF",
								img: "photo-1562322140-8baeececf3df",
								biz: "Jane's Hair Studio",
								title: "$50 Off Color + Cut for New Clients",
								exp: "Ends Mar 1",
							},
							{
								badge: "FREE",
								img: "photo-1571902943202-507ec2618e8f",
								biz: "Orangetheory Fitness",
								title: "Free Trial Class — No Commitment",
								exp: "Ongoing",
							},
						].map((deal, i) => (
							<div
								className='deal-card'
								key={i}
							>
								<div className='dc-badge'>{deal.badge}</div>
								<div className='dc-img'>
									<img
										src={`https://images.unsplash.com/${deal.img}?w=400&q=80`}
										alt=''
									/>
								</div>
								<div className='dc-body'>
									<div className='dc-biz'>{deal.biz}</div>
									<div className='dc-title'>{deal.title}</div>
									<div className='dc-exp'>{deal.exp}</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* ═══════ GRIND CROSS-PROMO ═══════ */}
				<div className='grind-section'>
					<div className='grind-header'>
						<div>
							<div className='grind-brand'>
								<div className='grind-logo'>G</div>
								<div className='grind-name'>WilCo Grind</div>
							</div>
							<div className='grind-sub'>
								Business news &amp; career intel for WilCo
								professionals
							</div>
						</div>
						<button className='grind-btn'>
							Subscribe to Grind →
						</button>
					</div>
					<div className='grind-cards'>
						{[
							{
								tag: "BUSINESS",
								title: "How This Leander Founder Built a $2M Agency Without VC Funding",
								meta: "Feb 10 · 4 min read",
							},
							{
								tag: "HIRING",
								title: "WilCo's Top 10 Companies Hiring Right Now — 400+ Open Roles",
								meta: "Feb 9 · 3 min read",
							},
							{
								tag: "GROWTH",
								title: "Round Rock Named #3 Best City for Small Business in Texas",
								meta: "Feb 7 · 2 min read",
							},
						].map((card, i) => (
							<div
								className='grind-card'
								key={i}
							>
								<div className='gc-tag'>{card.tag}</div>
								<div className='gc-title'>{card.title}</div>
								<div className='gc-meta'>{card.meta}</div>
							</div>
						))}
					</div>
				</div>

				{/* ═══════ FEATURED BUSINESSES ═══════ */}
				<div className='section'>
					<div className='section-header'>
						<div className='section-title'>Featured Businesses</div>
						<Link
							href='/directory'
							className='section-link'
						>
							Browse Directory →
						</Link>
					</div>
					<div className='grid-4'>
						{businesses.length > 0
							? businesses
									.slice(0, 4)
									.map((biz: any, i: number) => {
										const catName =
											typeof biz.category === "object"
												? biz.category?.name ||
													"Business"
												: biz.category || "Business";
										const locName = getLocationName(biz);
										const initials = (biz.name || "B")
											.split(" ")
											.map((w: string) => w[0])
											.join("")
											.substring(0, 3)
											.toUpperCase();
										return (
											<Link
												href={`/directory/${biz.slug || biz.id}`}
												className={`dir-card${biz.partner || biz.isPremium ? " partner" : ""}`}
												key={biz.id || i}
												style={{
													textDecoration: "none",
													color: "inherit",
												}}
											>
												<div className='dir-logo'>
													{initials}
												</div>
												<div className='dir-name'>
													{biz.name || biz.title}
												</div>
												<div className='dir-category'>
													{catName}
													{locName && ` · ${locName}`}
												</div>
												{biz.rating && (
													<div className='dir-rating'>
														<span className='stars'>
															{"★".repeat(
																Math.round(
																	biz.rating,
																),
															)}
														</span>{" "}
														{biz.rating}
													</div>
												)}
												{(biz.partner ||
													biz.isPremium) && (
													<div className='partner-badge'>
														Partner
													</div>
												)}
											</Link>
										);
									})
							: [
									<div
										className='dir-card'
										key='no-businesses'
									>
										<div className='dir-name'>
											No business found.
										</div>
									</div>,
								]}
					</div>
				</div>
			</div>

			{/* ═══════ FOOTER ═══════ */}
			<footer className='site-footer'>
				<div className='footer-inner'>
					<div className='footer-grid'>
						<div>
							<Link
								href='/'
								style={{
									display: "flex",
									alignItems: "center",
									gap: 10,
									textDecoration: "none",
									marginBottom: 8,
								}}
							>
								<div
									style={{
										width: 32,
										height: 32,
										background: "var(--blue)",
										borderRadius: 8,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#fff",
										fontWeight: 700,
										fontSize: 14,
									}}
								>
									W
								</div>
								<div
									style={{
										fontFamily: "'Fraunces', serif",
										fontWeight: 700,
										fontSize: 20,
										color: "var(--text-primary)",
									}}
								>
									WilCo{" "}
									<span style={{ color: "var(--blue)" }}>
										Guide
									</span>
								</div>
							</Link>
							<div className='footer-brand-desc'>
								Your home page for everything Williamson County.
								Local news, jobs, businesses, events, real
								estate, and deals — all in one place.
							</div>
							<div className='footer-social'>
								<a href='#'>f</a>
								<a href='#'>in</a>
								<a href='#'>X</a>
								<a href='#'>ig</a>
							</div>
						</div>
						<div className='footer-col'>
							<div className='footer-col-title'>Sections</div>
							<Link href='/news'>News</Link>
							<Link href='/jobs'>Jobs</Link>
							<Link href='/directory'>Directory</Link>
							<Link href='/events'>Events</Link>
							<Link href='/search'>Real Estate</Link>
							<Link href='/search'>Deals</Link>
							<Link href='/search'>Crime</Link>
						</div>
						<div className='footer-col'>
							<div className='footer-col-title'>Newsletters</div>
							<a href='#'>Leander Scoop</a>
							<a href='#'>Round Rock Scoop</a>
							<a href='#'>WilCo Grind</a>
							<a href='#'>Manage Preferences</a>
						</div>
						<div className='footer-col'>
							<div className='footer-col-title'>
								For Businesses
							</div>
							<a href='#'>Add Your Business</a>
							<a href='#'>Become a Partner</a>
							<a href='#'>Advertise With Us</a>
							<a href='#'>Post a Job</a>
							<a href='#'>Post a Deal</a>
						</div>
						<div className='footer-col'>
							<div className='footer-col-title'>Company</div>
							<a href='#'>About</a>
							<a href='#'>Contact</a>
							<a href='#'>Careers</a>
							<a href='#'>Privacy Policy</a>
							<a href='#'>Terms of Service</a>
						</div>
					</div>
					<div className='footer-bottom'>
						<div className='footer-copy'>
							© 2026 WilCo Guide. All rights reserved. A
							LocalScoop Media brand.
						</div>
						<div className='footer-legal'>
							<a href='#'>Privacy</a>
							<a href='#'>Terms</a>
							<a href='#'>Accessibility</a>
						</div>
					</div>
				</div>
			</footer>
		</>
	);
}
