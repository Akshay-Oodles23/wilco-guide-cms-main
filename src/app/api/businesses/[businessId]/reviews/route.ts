import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

const MAX_REVIEW_LENGTH = 1200;

function cleanText(value: unknown, maxLength: number): string {
	return String(value || "").trim().slice(0, maxLength);
}

function serializeReview(review: any) {
	return {
		id: review.id || review.googleReviewId || `${review.author}-${review.date}`,
		author: review.author || "Anonymous",
		text: review.text || "",
		rating: Number(review.rating || 5),
		date: review.date || new Date().toISOString(),
		googleReviewId: review.googleReviewId || "",
	};
}

export async function GET(
	_request: NextRequest,
	context: { params: Promise<{ businessId: string }> },
) {
	const { businessId } = await context.params;
	const payload = await getPayload({ config });

	const business = await payload.findByID({
		collection: "businesses",
		id: businessId,
		depth: 0,
		overrideAccess: true,
	});

	if (!business) {
		return NextResponse.json(
			{ error: "Business not found." },
			{ status: 404 },
		);
	}

	const reviews = Array.isArray(business.reviews) ? business.reviews : [];

	return NextResponse.json({
		reviews: reviews.map(serializeReview),
		total: reviews.length,
	});
}

export async function POST(
	request: NextRequest,
	context: { params: Promise<{ businessId: string }> },
) {
	try {
		const { businessId } = await context.params;
		const payload = await getPayload({ config });
		const body = await request.json();

		const author = cleanText(body.author, 80);
		const text = cleanText(body.text, MAX_REVIEW_LENGTH);
		const rating = Number(body.rating);

		if (!author || !text || !Number.isFinite(rating)) {
			return NextResponse.json(
				{ error: "Name, rating, and review are required." },
				{ status: 400 },
			);
		}

		if (rating < 1 || rating > 5) {
			return NextResponse.json(
				{ error: "Rating must be between 1 and 5." },
				{ status: 400 },
			);
		}

		const business = await payload.findByID({
			collection: "businesses",
			id: businessId,
			depth: 0,
			overrideAccess: true,
		});

		if (!business) {
			return NextResponse.json(
				{ error: "Business not found." },
				{ status: 404 },
			);
		}

		const existingReviews = Array.isArray(business.reviews)
			? business.reviews
			: [];
		const newReview = {
			author,
			text,
			rating,
			date: new Date().toISOString(),
			googleReviewId: `site-${Date.now()}`,
		};

		await payload.update({
			collection: "businesses",
			id: business.id,
			data: {
				reviews: [newReview, ...existingReviews],
			},
			overrideAccess: true,
		});

		return NextResponse.json(
			{ review: serializeReview(newReview) },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Failed to submit business review:", error);
		return NextResponse.json(
			{ error: "Could not submit the review. Please try again." },
			{ status: 500 },
		);
	}
}
