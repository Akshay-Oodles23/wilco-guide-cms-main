"use client";

import { useState } from "react";
import StarRating from "@/components/StarRating";

type Review = {
	id?: string | number;
	author?: string;
	text?: string;
	rating?: number;
	date?: string;
	googleReviewId?: string;
};

type JobReviewsProps = {
	initialReviews: Review[];
	googleRating?: number;
	googleReviewCount?: number;
};

const INITIAL_REVIEW_COUNT = 3;

const avatarColors = [
	"var(--blue)",
	"var(--orange)",
	"var(--green)",
	"var(--purple)",
	"var(--red)",
	"var(--yellow)",
	"#64748b",
];

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((word) => word[0])
		.filter(Boolean)
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function getAvatarColor(index: number): string {
	return avatarColors[index % avatarColors.length];
}

function formatReviewDate(date?: string | Date): string {
	if (!date) return "Recently";

	const reviewDate = new Date(date);
	if (Number.isNaN(reviewDate.getTime())) return "Recently";

	const now = new Date();
	const diffInDays = Math.floor(
		(now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffInDays <= 0) return "Today";
	if (diffInDays === 1) return "Yesterday";
	if (diffInDays < 7) return `${diffInDays} days ago`;
	if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
	if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

	return `${Math.floor(diffInDays / 365)} years ago`;
}

export function JobReviews({
	initialReviews,
	googleRating = 0,
	googleReviewCount = 0,
}: JobReviewsProps) {
	const [showAll, setShowAll] = useState(false);

	const reviews = Array.isArray(initialReviews) ? initialReviews : [];
	const displayedReviews = showAll
		? reviews
		: reviews.slice(0, INITIAL_REVIEW_COUNT);
	const visibleReviewCount = Math.max(googleReviewCount, reviews.length);

	if (!visibleReviewCount) return null;

	return (
		<div className='job-section job-reviews-section' id='reviews'>
			<div className='job-reviews-header'>
				<h2 className='job-section-title'>Reviews</h2>
				<div className='job-reviews-count'>
					{visibleReviewCount.toLocaleString()} review
					{visibleReviewCount === 1 ? "" : "s"}
				</div>
			</div>

			<div className='reviews-summary'>
				<div className='reviews-big-num'>
					{googleRating ? googleRating.toFixed(1) : "N/A"}
				</div>
				<div>
					<div className='reviews-stars-big'>
						<StarRating rating={googleRating || 0} size='md' />
					</div>
					<div className='reviews-count-text'>
						Based on {visibleReviewCount.toLocaleString()} review
						{visibleReviewCount === 1 ? "" : "s"}
					</div>
				</div>
			</div>

			{displayedReviews.length > 0 ? (
				<>
					{displayedReviews.map((review, index) => (
						<div
							key={
								review.id ||
								review.googleReviewId ||
								`${review.author}-${index}`
							}
							className='review-item'
						>
							<div className='review-header'>
								<div
									className='review-avatar'
									style={{
										background: getAvatarColor(index),
									}}
								>
									{getInitials(review.author || "User")}
								</div>
								<span className='review-name'>
									{review.author || "Anonymous"}
								</span>
								<span className='review-date'>
									{formatReviewDate(review.date)}
								</span>
							</div>
							<div className='review-stars'>
								<StarRating rating={review.rating || 5} size='sm' />
							</div>
							<div className='review-text'>
								{review.text || "No review text provided."}
							</div>
						</div>
					))}

					{reviews.length > INITIAL_REVIEW_COUNT && (
						<button
							type='button'
							className='reviews-see-all reviews-see-all-button'
							onClick={() => setShowAll((current) => !current)}
						>
							{showAll
								? "Show fewer reviews"
								: `View more reviews (${reviews.length - INITIAL_REVIEW_COUNT} more)`}
						</button>
					)}
				</>
			) : (
				<div className='review-item'>
					<div className='review-header'>
						<span className='review-name'>No written reviews yet</span>
					</div>
					<div className='review-text'>
						This listing shows a review count, but no review text is
						available yet.
					</div>
				</div>
			)}
		</div>
	);
}
