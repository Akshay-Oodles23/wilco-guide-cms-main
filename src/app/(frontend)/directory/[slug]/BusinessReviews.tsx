"use client";

import { FormEvent, useMemo, useState } from "react";
import StarRating from "@/components/StarRating";

type BusinessReview = {
	id?: string;
	author?: string;
	text?: string;
	rating?: number;
	date?: string;
	googleReviewId?: string;
};

type BusinessReviewsProps = {
	businessId?: string | number;
	initialReviews: BusinessReview[];
	googleRating: number;
	googleReviewCount: number;
};

const avatarColors = [
	"var(--blue)",
	"var(--orange)",
	"var(--green)",
	"var(--purple)",
	"var(--pink)",
	"#64748b",
	"var(--yellow)",
];

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((word) => word[0])
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

export function BusinessReviews({
	businessId,
	initialReviews,
	googleRating,
	googleReviewCount,
}: BusinessReviewsProps) {
	const [reviews, setReviews] = useState<BusinessReview[]>(initialReviews);
	const [showAll, setShowAll] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");
	const [form, setForm] = useState({
		author: "",
		rating: "5",
		text: "",
	});

	const displayedReviews = showAll ? reviews : reviews.slice(0, 3);
	const storedReviewCount = reviews.length;
	const visibleReviewCount = Math.max(googleReviewCount, storedReviewCount);
	const averageRating = useMemo(() => {
		if (!reviews.length) return googleRating;
		const sum = reviews.reduce(
			(total, review) => total + Number(review.rating || 0),
			0,
		);
		return Math.round((sum / reviews.length) * 10) / 10;
	}, [googleRating, reviews]);

	async function loadAllReviews() {
		setShowAll(true);
		if (!businessId || reviews.length <= 3) return;

		setIsLoading(true);
		setMessage("");

		try {
			const response = await fetch(`/api/businesses/${businessId}/reviews`, {
				cache: "no-store",
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Could not load reviews.");
			}

			setReviews(data.reviews || []);
		} catch (error) {
			setMessage(
				error instanceof Error
					? error.message
					: "Could not load reviews.",
			);
		} finally {
			setIsLoading(false);
		}
	}

	async function submitReview(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!businessId) {
			setMessage("This business is not ready for reviews yet.");
			return;
		}

		setIsSubmitting(true);
		setMessage("");

		try {
			const response = await fetch(`/api/businesses/${businessId}/reviews`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(form),
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Could not submit review.");
			}

			setReviews((current) => [data.review, ...current]);
			setShowAll(true);
			setMessage("Thanks. Your review has been added.");
			setForm({
				author: "",
				rating: "5",
				text: "",
			});
		} catch (error) {
			setMessage(
				error instanceof Error
					? error.message
					: "Could not submit review.",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className='widget' id='reviews'>
			<div className='widget-header'>
				<h2 className='widget-title'>Reviews</h2>
			</div>
			<div className='widget-body'>
				<div className='reviews-summary'>
					<div className='reviews-big-num'>{averageRating || "N/A"}</div>
					<div>
						<div className='reviews-stars-big'>
							<StarRating rating={averageRating || 0} size='md' />
						</div>
						<div className='reviews-count-text'>
							Based on {visibleReviewCount} review
							{visibleReviewCount === 1 ? "" : "s"}
						</div>
					</div>
				</div>

				{displayedReviews.length > 0 ? (
					displayedReviews.map((review, idx) => (
						<div
							key={review.id || review.googleReviewId || idx}
							className='review-item'
						>
							<div className='review-header'>
								<div
									className='review-avatar'
									style={{ background: getAvatarColor(idx) }}
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
								{review.text || "Great experience at this business."}
							</div>
						</div>
					))
				) : (
					<div className='review-item'>
						<div className='review-header'>
							<span className='review-name'>No reviews yet</span>
						</div>
						<div className='review-text'>
							Be the first to review this restaurant.
						</div>
					</div>
				)}

				{reviews.length > 3 && !showAll && (
					<button
						type='button'
						className='reviews-see-all reviews-see-all-button'
						onClick={loadAllReviews}
						disabled={isLoading}
					>
						{isLoading
							? "Loading reviews..."
							: `See all ${reviews.length} reviews`}
					</button>
				)}

				<form className='add-review-form' onSubmit={submitReview}>
					<div className='add-review-title'>Add a review</div>
					<div className='add-review-grid'>
						<label>
							Name
							<input
								required
								value={form.author}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										author: event.target.value,
									}))
								}
							/>
						</label>
						<label>
							Rating
							<select
								value={form.rating}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										rating: event.target.value,
									}))
								}
							>
								<option value='5'>5 stars</option>
								<option value='4'>4 stars</option>
								<option value='3'>3 stars</option>
								<option value='2'>2 stars</option>
								<option value='1'>1 star</option>
							</select>
						</label>
					</div>
					<label>
						Review
						<textarea
							required
							rows={4}
							value={form.text}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									text: event.target.value,
								}))
							}
						/>
					</label>
					<div className='add-review-actions'>
						<button type='submit' disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Submit review"}
						</button>
						{message && <span>{message}</span>}
					</div>
				</form>
			</div>
		</div>
	);
}
