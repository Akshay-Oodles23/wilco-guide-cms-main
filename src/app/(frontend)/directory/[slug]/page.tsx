// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database
import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import "@/styles/business-detail.css";

interface Props {
	params: Promise<{
		slug: string;
	}>;
}

// Helper functions
function getImageUrl(image: any): string {
	if (!image)
		return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80";
	if (typeof image === "string") return image;
	if (image.url) return image.url;
	if (image.filename) return `/uploads/${image.filename}`;
	return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80";
}

function getLocationName(location: any): string {
	if (!location) return "Williamson County, TX";

	// If it's an object with city property
	if (typeof location === "object") {
		if (location.city) {
			const city =
				typeof location.city === "object"
					? location.city.name
					: location.city;
			const state = location.state || "TX";
			return `${city}, ${state}`;
		}
		return location.name || location.title || "Williamson County, TX";
	}

	// If it's a string
	return String(location);
}

function getAddressString(address: any): string {
	if (!address) return "";

	// If address is an object
	if (typeof address === "object") {
		const street = address.street || "";
		const city =
			typeof address.city === "object"
				? address.city?.name
				: address.city || "";
		const state = address.state || "TX";
		const zip = address.zip || "";

		return [street, city, state, zip].filter(Boolean).join(", ");
	}

	return String(address);
}

function generateStarRating(rating: number = 4.8): string {
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 !== 0;
	let stars = "★".repeat(fullStars);
	if (hasHalfStar) stars += "☆";
	stars += "☆".repeat(5 - Math.ceil(rating));
	return stars;
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

const avatarColors = [
	"var(--blue)",
	"var(--orange)",
	"var(--green)",
	"var(--purple)",
	"var(--pink)",
	"#64748b",
	"var(--yellow)",
];

function getAvatarColor(index: number): string {
	return avatarColors[index % avatarColors.length];
}

function getBusinessLocation(business: any): string {
	if (!business) return "Location";
	if (business.address?.city) {
		const city =
			typeof business.address.city === "object"
				? business.address.city.name
				: business.address.city;
		return city || "Location";
	}
	return "Location";
}

function formatReviewDate(date: string | Date): string {
	const reviewDate = new Date(date);
	const now = new Date();
	const diffInDays = Math.floor(
		(now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffInDays === 0) return "Today";
	if (diffInDays === 1) return "Yesterday";
	if (diffInDays < 7) return `${diffInDays} days ago`;
	if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
	if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
	return `${Math.floor(diffInDays / 365)} years ago`;
}

export async function generateMetadata({ params }: Props) {
	const { slug } = await params;
	try {
		const payload = await getPayload({ config });
		const business = await payload.find({
			collection: "businesses",
			where: {
				slug: {
					equals: slug,
				},
			},
			limit: 1,
		});

		if (business.docs.length === 0) {
			return {
				title: "Business Not Found — WilCo Guide Directory",
			};
		}

		const biz = business.docs[0];
		return {
			title: `${biz.name || "Business"} — WilCo Guide Directory`,
			description:
				biz.description ||
				"Explore this business on WilCo Guide Directory",
		};
	} catch (error) {
		return {
			title: "Business — WilCo Guide Directory",
		};
	}
}

export default async function BusinessDetailPage({ params }: Props) {
	const { slug } = await params;
	let business: any = null;
	let error: string | null = null;

	try {
		const payload = await getPayload({ config });
		const result = await payload.find({
			collection: "businesses",
			where: {
				slug: {
					equals: slug,
				},
			},
			limit: 1,
		});

		if (result.docs.length > 0) {
			business = result.docs[0];
		}
	} catch (err) {
		console.error("Error fetching business:", err);
		error = "Failed to load business";
	}

	// Use CMS data or fallback to placeholders
	const bizName = business?.name || "Business Name";
	const bizCategory = business?.category
		? typeof business.category === "object"
			? business.category.name
			: business.category
		: "Category";
	const bizDescription = business?.description || "No description available.";
	const bizLocation =
		getLocationName(business?.location || business?.address?.city) ||
		"Williamson County, TX";
	const bizRating = business?.googleRating || business?.rating || 4.8;
	const bizReviewCount =
		business?.googleReviewCount || business?.reviewCount || 0;
	const bizImage = getImageUrl(
		business?.image ||
			business?.featuredImage ||
			business?.photos?.[0]?.photo ||
			business?.images?.[0],
	);
	const bizPhone = business?.phone || "";
	const bizWebsite = business?.website || "";
	const bizAddress = getAddressString(business?.address) || "";

	// Extract CMS data for dynamic sections
	const bizDeals = business?.deals || [];
	const bizJobs = business?.jobs || [];
	const bizMenuItems = business?.menuItems || [];
	const bizEvents = business?.upcomingEvents || [];
	const bizSocial = business?.socialMedia || {};
	const relatedBusinesses = business?.relatedBusinesses || [];
	const bizTags = business?.tags || [];
	const bizHours = business?.hours || {};
	const bizReviews = business?.reviews || [];

	const descriptionParagraphs = bizDescription
		.split("\n\n")
		.filter((p: string) => p.trim());

	return (
		<>
			{/* BREADCRUMB */}
			<div className='breadcrumb'>
				<Link href='/directory'>Directory</Link>
				<span className='breadcrumb-sep'>›</span>
				<Link href='/directory'>{bizCategory}</Link>
				<span className='breadcrumb-sep'>›</span>
				<span>{bizName}</span>
			</div>

			<div className='profile-page'>
				{/* GALLERY */}
				<div className='gallery-section'>
					<div className='gallery-tabs'>
						<button className='gallery-tab active'>All</button>
						<button className='gallery-tab'>Photos</button>
						<button className='gallery-tab'>Videos</button>
					</div>
					<div className='gallery-grid'>
						<div className='gallery-item gallery-hero'>
							<img
								src={bizImage}
								alt={bizName}
							/>
							<div className='gallery-video-badge'>
								▶ Video Tour
							</div>
						</div>
						<div className='gallery-item'>
							<img
								src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80'
								alt=''
							/>
						</div>
						<div className='gallery-item'>
							<img
								src='https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80'
								alt=''
							/>
						</div>
						<div className='gallery-item'>
							<img
								src='https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80'
								alt=''
							/>
						</div>
						<div className='gallery-item'>
							<img
								src='https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80'
								alt=''
							/>
							<div className='gallery-count'>+12 more</div>
						</div>
					</div>
				</div>

				{/* HEADER */}
				<div className='biz-header'>
					<div className='biz-header-left'>
						<div className='biz-verified'>
							<svg
								width='14'
								height='14'
								viewBox='0 0 24 24'
								fill='currentColor'
							>
								<path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' />
							</svg>
							WilCo Guide Approved
						</div>
						<h1 className='biz-name'>{bizName}</h1>
						<div className='biz-meta'>
							<span className='biz-category'>{bizCategory}</span>
							<span className='biz-price'>
								$$ <span className='biz-price-muted'>$$</span>
							</span>
							<span className='biz-location'>
								📍 {bizLocation}
							</span>
						</div>
						<div className='biz-rating-row'>
							<StarRating
								rating={bizRating}
								size='md'
							/>
							<span className='biz-rating-num'>{bizRating}</span>
							<span className='biz-rating-count'>
								({bizReviewCount} reviews)
							</span>
						</div>
						<div className='biz-tags-row'>
							<span className='biz-tag biz-tag-deal'>
								15% Off Pasta
							</span>
							<span className='biz-tag biz-tag-hiring'>
								Hiring 2 Roles
							</span>
							<span className='biz-tag biz-tag-event'>
								Live Music Fridays
							</span>
						</div>
					</div>
					<div className='biz-header-actions'>
						<a
							href={bizPhone ? `tel:${bizPhone}` : "#"}
							className='action-btn action-btn-primary'
						>
							<svg
								width='14'
								height='14'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2.5'
							>
								<path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72' />
							</svg>
							Call
						</a>
						<a
							href={bizWebsite ? bizWebsite : "#"}
							target={bizWebsite ? "_blank" : undefined}
							rel={bizWebsite ? "noopener noreferrer" : undefined}
							className='action-btn'
						>
							<svg
								width='14'
								height='14'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2.5'
							>
								<circle
									cx='12'
									cy='12'
									r='10'
								/>
								<line
									x1='2'
									y1='12'
									x2='22'
									y2='12'
								/>
								<path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' />
							</svg>
							Website
						</a>
						<button className='action-btn'>
							<svg
								width='14'
								height='14'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2.5'
							>
								<polygon points='3 11 22 2 13 21 11 13 3 11' />
							</svg>
							Directions
						</button>
						<button className='action-btn'>
							<svg
								width='14'
								height='14'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2.5'
							>
								<path d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' />
								<polyline points='16 6 12 2 8 6' />
								<line
									x1='12'
									y1='2'
									x2='12'
									y2='15'
								/>
							</svg>
							Share
						</button>
					</div>
				</div>

				{/* DEAL BANNER - Now from CMS */}
				{bizDeals.length > 0 && (
					<div className='highlight-banner deal'>
						<div className='banner-content'>
							<div className='banner-label'>
								Limited Time Offer
							</div>
							<div className='banner-title'>
								{bizDeals[0].title}
							</div>
							<div className='banner-detail'>
								{bizDeals[0].discount}
								{bizDeals[0].conditions &&
									` • ${bizDeals[0].conditions}`}
							</div>
						</div>
						<button className='banner-btn'>Claim This Deal</button>
					</div>
				)}

				{/* JOBS INLINE - Now from CMS */}
				{bizJobs.length > 0 && (
					<div className='jobs-inline'>
						<div className='jobs-inline-header'>
							<div className='jobs-inline-icon'>💼</div>
							<div>
								<div className='jobs-inline-title'>
									Now Hiring
								</div>
								<div className='jobs-inline-count'>
									{bizJobs.length} open
									{bizJobs.length === 1
										? " position"
										: " positions"}
								</div>
							</div>
						</div>
						<div className='jobs-inline-list'>
							{bizJobs.map((job: any, idx: number) => (
								<div
									key={idx}
									className='jobs-inline-card flex justify-between'
								>
									<div className='flex flex-col items-start'>
										<div className='jobs-inline-role'>
											{job.title}
										</div>
										<div className='jobs-inline-detail'>
											{job.type} • {job.salary}
										</div>
									</div>

									<button className='jobs-inline-apply'>
										Apply Now
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* TWO COLUMNS */}
				<div className='profile-content'>
					{/* MAIN */}
					<div className='profile-main'>
						{/* ABOUT */}
						<div className='widget'>
							<div className='widget-header'>
								<h2 className='widget-title'>About</h2>
							</div>
							<div className='widget-body'>
								<div className='about-text'>
									{descriptionParagraphs.map(
										(paragraph: string, idx: number) => (
											<p key={idx}>{paragraph}</p>
										),
									)}
								</div>
							</div>
						</div>

						{/* POPULAR ITEMS - Now from CMS */}
						{bizMenuItems.length > 0 && (
							<div className='widget'>
								<div className='widget-header'>
									<h2 className='widget-title'>
										Popular Items
									</h2>
								</div>
								<div className='widget-body'>
									{bizMenuItems.map(
										(item: any, idx: number) => (
											<div
												key={idx}
												className='menu-item'
											>
												<div className='menu-item-img'>
													<img
														src={getImageUrl(
															item.image,
														)}
														alt={item.name}
													/>
												</div>
												<div className='menu-item-info'>
													<div className='menu-item-name'>
														{item.name}
													</div>
													<div className='menu-item-desc'>
														{item.description}
													</div>
												</div>
												<div className='menu-item-price'>
													{item.price}
												</div>
											</div>
										),
									)}
								</div>
							</div>
						)}

						{/* ARTICLES (SEO content - paid only) */}
						<div className='widget'>
							<div className='widget-header'>
								<h2 className='widget-title'>Articles</h2>
								<div className='widget-nav'>
									<span
										style={{
											fontSize: "12px",
											color: "var(--text-muted)",
											fontWeight: "500",
										}}
									>
										5 articles
									</span>
								</div>
							</div>
							<div className='widget-body'>
								<div className='article-card'>
									<div className='article-thumb'>
										<img
											src='https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&q=80'
											alt=''
										/>
									</div>
									<div className='article-info'>
										<div className='article-label'>
											WilCo Guide Feature
										</div>
										<div className='article-title'>
											5 Reasons Rosalie's Has the Best
											Pasta in Leander
										</div>
										<div className='article-meta'>
											Jan 28, 2026 • 4 min read
										</div>
									</div>
								</div>
								<div className='article-card'>
									<div className='article-thumb'>
										<img
											src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80'
											alt=''
										/>
									</div>
									<div className='article-info'>
										<div className='article-label'>
											WilCo Guide Feature
										</div>
										<div className='article-title'>
											Date Night in Leander: Inside
											Rosalie's New Cocktail Menu
										</div>
										<div className='article-meta'>
											Feb 3, 2026 • 3 min read
										</div>
									</div>
								</div>
								<div className='article-card'>
									<div className='article-thumb'>
										<img
											src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80'
											alt=''
										/>
									</div>
									<div className='article-info'>
										<div className='article-label'>
											WilCo Guide Feature
										</div>
										<div className='article-title'>
											Meet Chef Rosalie: From Naples to
											Leander
										</div>
										<div className='article-meta'>
											Dec 12, 2025 • 5 min read
										</div>
									</div>
								</div>
							</div>
							<div className='articles-more'>
								See 2 more articles →
							</div>
						</div>

						{/* REVIEWS */}
						<div className='widget'>
							<div className='widget-header'>
								<h2 className='widget-title'>Reviews</h2>
							</div>
							<div className='widget-body'>
								<div className='reviews-summary'>
									<div className='reviews-big-num'>
										{bizRating}
									</div>
									<div>
										<div className='reviews-stars-big'>
											<StarRating
												rating={bizRating}
												size='md'
											/>
										</div>
										<div className='reviews-count-text'>
											Based on {bizReviewCount} Google
											reviews
										</div>
									</div>
								</div>
								{bizReviews.length > 0 ? (
									bizReviews.map(
										(review: any, idx: number) => (
											<div
												key={idx}
												className='review-item'
											>
												<div className='review-header'>
													<div
														className='review-avatar'
														style={{
															background:
																getAvatarColor(
																	idx,
																),
														}}
													>
														{getInitials(
															review.author ||
																"User",
														)}
													</div>
													<span className='review-name'>
														{review.author ||
															"Anonymous"}
													</span>
													<span className='review-date'>
														{review.date
															? formatReviewDate(
																	review.date,
																)
															: "Recently"}
													</span>
												</div>
												<div className='review-stars'>
													<StarRating
														rating={
															review.rating || 5
														}
														size='sm'
													/>
												</div>
												<div className='review-text'>
													{review.text ||
														"Great experience at this business."}
												</div>
											</div>
										),
									)
								) : (
									<div className='review-item'>
										<div className='review-header'>
											<span className='review-name'>
												No reviews yet
											</span>
										</div>
										<div className='review-text'>
											Be the first to review this
											business!
										</div>
									</div>
								)}
							</div>
							{bizReviews.length > 10 && (
								<a
									href='#'
									className='reviews-see-all'
								>
									See all{" "}
									{bizReviewCount -
										Math.min(bizReviews.length, 10)}{" "}
									more reviews →
								</a>
							)}
							{bizReviews.length === 0 && bizReviewCount > 0 && (
								<a
									href='#'
									className='reviews-see-all'
								>
									See all {bizReviewCount} reviews →
								</a>
							)}
						</div>
					</div>

					{/* SIDEBAR */}
					<div className='profile-sidebar'>
						{/* UPCOMING EVENTS - Now from CMS */}
						{bizEvents.length > 0 && (
							<div className='widget'>
								<div className='widget-header'>
									<h2 className='widget-title'>
										Upcoming Events
									</h2>
									<span
										className='widget-badge'
										style={{
											background: "#fdf2f8",
											color: "var(--pink)",
										}}
									>
										{bizEvents.length} upcoming
									</span>
								</div>
								<div className='widget-body'>
									{bizEvents.map(
										(event: any, idx: number) => (
											<div
												key={idx}
												className='event-item flex gap-3'
											>
												<div className='event-date-box flex flex-col items-center justify-center w-14 h-14 bg-pink-50 rounded-lg'>
													<span className='event-date-month text-xs font-semibold text-pink-600'>
														{new Date(
															event.date,
														).toLocaleDateString(
															"en-US",
															{
																month: "short",
															},
														)}
													</span>
													<span className='event-date-day text-lg font-bold text-pink-700'>
														{new Date(
															event.date,
														).getDate()}
													</span>
												</div>
												<div className='event-info flex flex-col justify-center flex-1'>
													<div className='event-title font-semibold text-sm text-slate-900'>
														{event.title}
													</div>
													<div className='event-time text-xs text-slate-600 mt-1'>
														{event.startTime &&
															event.endTime &&
															`${event.startTime} – ${event.endTime}`}
														{event.startTime &&
															!event.endTime &&
															`${event.startTime}`}
													</div>
													{event.description && (
														<div className='event-description text-xs text-slate-500 mt-1'>
															{event.description}
														</div>
													)}
												</div>
											</div>
										),
									)}
								</div>
							</div>
						)}

						{/* INFO */}
						<div className='widget'>
							<div className='widget-header'>
								<h2 className='widget-title'>Info</h2>
							</div>
							<div className='widget-body'>
								<div className='info-row'>
									<div className='info-icon'>
										<svg
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
										>
											<circle
												cx='12'
												cy='12'
												r='10'
											/>
											<polyline points='12 6 12 12 16 14' />
										</svg>
									</div>
									<div>
										<div className='info-label'>Hours</div>
										<div className='info-value'>
											<span className='open-badge'>
												<span className='open-dot'></span>{" "}
												Open Now
											</span>{" "}
											{bizHours.mon?.close &&
												`— Closes ${bizHours.mon.close}`}
										</div>
										<div className='hours-grid'>
											{[
												{ key: "mon", label: "Mon" },
												{ key: "tue", label: "Tue" },
												{ key: "wed", label: "Wed" },
												{ key: "thu", label: "Thu" },
												{ key: "fri", label: "Fri" },
												{ key: "sat", label: "Sat" },
												{ key: "sun", label: "Sun" },
											].map((day) => {
												const dayData =
													bizHours[day.key];
												const isToday = false; // You can add logic to detect today if needed
												return (
													<>
														<span
															className={`hours-day ${isToday ? "hours-today" : ""}`}
														>
															{day.label}
														</span>
														<span
															className={`hours-time ${isToday ? "hours-today" : ""}`}
														>
															{dayData?.open &&
															dayData?.close
																? `${dayData.open} – ${dayData.close}`
																: "Closed"}
														</span>
													</>
												);
											})}
										</div>
									</div>
								</div>
								<div className='info-row'>
									<div className='info-icon'>
										<svg
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
										>
											<path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72' />
										</svg>
									</div>
									<div>
										<div className='info-label'>Phone</div>
										<div className='info-value'>
											{bizPhone ? (
												<a
													href={`tel:${bizPhone.replace(/\D/g, "")}`}
												>
													{bizPhone}
												</a>
											) : (
												<span
													style={{
														color: "var(--text-muted)",
													}}
												>
													Not provided
												</span>
											)}
										</div>
									</div>
								</div>
								<div className='info-row'>
									<div className='info-icon'>
										<svg
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
										>
											<circle
												cx='12'
												cy='12'
												r='10'
											/>
											<line
												x1='2'
												y1='12'
												x2='22'
												y2='12'
											/>
											<path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' />
										</svg>
									</div>
									<div>
										<div className='info-label'>
											Website
										</div>
										<div className='info-value'>
											{bizWebsite ? (
												<a
													href={`https://${bizWebsite}`}
													target='_blank'
													rel='noopener noreferrer'
												>
													{bizWebsite}
												</a>
											) : (
												<span
													style={{
														color: "var(--text-muted)",
													}}
												>
													Not provided
												</span>
											)}
										</div>
									</div>
								</div>
								<div className='info-row'>
									<div className='info-icon'>
										<svg
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
										>
											<path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
											<circle
												cx='12'
												cy='10'
												r='3'
											/>
										</svg>
									</div>
									<div>
										<div className='info-label'>
											Address
										</div>
										<div className='info-value'>
											{bizAddress ? (
												<>
													{bizAddress}
													<br />
													{bizLocation}
												</>
											) : (
												<span
													style={{
														color: "var(--text-muted)",
													}}
												>
													{bizLocation ||
														"Location not available"}
												</span>
											)}
										</div>
									</div>
								</div>
								<div className='info-row'>
									<div className='info-icon'>
										<svg
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
										>
											<rect
												x='2'
												y='2'
												width='20'
												height='20'
												rx='5'
											/>
											<circle
												cx='12'
												cy='12'
												r='5'
											/>
											<circle
												cx='17.5'
												cy='6.5'
												r='1.5'
												fill='currentColor'
											/>
										</svg>
									</div>
									<div>
										<div className='info-label'>Social</div>
										<div className='info-value'>
											{bizSocial.instagram ||
											bizSocial.facebook ||
											bizSocial.tiktok ? (
												<>
													{bizSocial.instagram && (
														<a
															href={`https://instagram.com/${bizSocial.instagram}`}
															target='_blank'
															rel='noopener noreferrer'
														>
															{
																bizSocial.instagram
															}
														</a>
													)}
													{bizSocial.facebook && (
														<>
															{" "}
															•{" "}
															<a
																href={
																	bizSocial.facebook
																}
																target='_blank'
																rel='noopener noreferrer'
															>
																Facebook
															</a>
														</>
													)}
													{bizSocial.tiktok && (
														<>
															{" "}
															•{" "}
															<a
																href={`https://tiktok.com/@${bizSocial.tiktok}`}
																target='_blank'
																rel='noopener noreferrer'
															>
																TikTok
															</a>
														</>
													)}
												</>
											) : (
												<span
													style={{
														color: "var(--text-muted)",
													}}
												>
													Not available
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* MAP */}
						<div className='widget'>
							<div
								className='widget-body'
								style={{ padding: "14px" }}
							>
								<div className='map-placeholder'>
									<div className='map-pin'>
										<div className='map-pin-icon'>
											<div className='map-pin-dot'></div>
										</div>
										<div className='map-address'>
											{bizAddress && bizLocation
												? `${bizAddress}, ${bizLocation}`
												: bizLocation ||
													"Location not available"}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* YOU MIGHT ALSO LIKE - Now from CMS */}
						{relatedBusinesses.length > 0 && (
							<div className='widget'>
								<div className='widget-header'>
									<h2 className='widget-title'>
										You Might Also Like
									</h2>
								</div>
								<div className='widget-body'>
									{relatedBusinesses.map(
										(related: any, idx: number) => (
											<div
												key={idx}
												className='sidebar-biz-card'
											>
												<div className='sidebar-biz-img'>
													<img
														src={getImageUrl(
															related.featuredImage ||
																related
																	.photos?.[0]
																	?.photo,
														)}
														alt={related.name}
													/>
												</div>
												<div className='sidebar-biz-info'>
													<div className='sidebar-biz-name'>
														<a
															href={`/directory/${related.slug}`}
														>
															{related.name}
														</a>
													</div>
													<div className='sidebar-biz-detail'>
														{related.category} •{" "}
														{related.priceRange ||
															"$$"}{" "}
														•{" "}
														{getBusinessLocation(
															related,
														)}
													</div>
													<div className='sidebar-biz-stars flex items-center gap-1'>
														<StarRating
															rating={
																related.googleRating ||
																4.5
															}
															size='sm'
														/>
														<span className='text-sm font-semibold text-slate-700'>
															{related.googleRating ||
																4.5}
														</span>
													</div>
												</div>
											</div>
										),
									)}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* RELATED BUSINESSES */}
				<div className='section-header-full'>
					<h2 className='section-title-full'>
						Other {bizCategory}s in {bizLocation.split(",")[0]}
					</h2>
					<a
						href='/directory'
						className='section-see-all'
					>
						See all →
					</a>
				</div>
				<div className='related-grid'>
					<div className='related-card'>
						<img
							src='https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600&q=80'
							alt=''
						/>
						<div className='related-overlay'></div>
						<div className='related-info'>
							<div className='related-name'>
								Nonna's Trattoria
							</div>
							<div className='related-detail'>
								Italian • $$ • Cedar Park
							</div>
							<div className='related-stars'>
								<StarRating
									rating={4.7}
									size='sm'
									showValue={true}
								/>
							</div>
						</div>
						<div className='related-sponsor'>Sponsored</div>
					</div>
					<div className='related-card'>
						<img
							src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'
							alt=''
						/>
						<div className='related-overlay'></div>
						<div className='related-info'>
							<div className='related-name'>
								Bella Vita Pizzeria
							</div>
							<div className='related-detail'>
								Pizza • $ • Leander
							</div>
							<div className='related-stars'>
								<StarRating
									rating={4.5}
									size='sm'
									showValue={true}
								/>
							</div>
						</div>
					</div>
					<div className='related-card'>
						<img
							src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80'
							alt=''
						/>
						<div className='related-overlay'></div>
						<div className='related-info'>
							<div className='related-name'>Olive & Vine</div>
							<div className='related-detail'>
								Mediterranean • $$$ • Round Rock
							</div>
							<div className='related-stars'>
								<StarRating
									rating={4.8}
									size='sm'
									showValue={true}
								/>
							</div>
						</div>
					</div>
					<div className='related-card'>
						<img
							src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80'
							alt=''
						/>
						<div className='related-overlay'></div>
						<div className='related-info'>
							<div className='related-name'>
								Russo's Italian Kitchen
							</div>
							<div className='related-detail'>
								Italian • $$ • Georgetown
							</div>
							<div className='related-stars'>
								<StarRating
									rating={4.4}
									size='sm'
									showValue={true}
								/>
							</div>
						</div>
						<div className='related-sponsor'>Sponsored</div>
					</div>
				</div>
			</div>
		</>
	);
}
