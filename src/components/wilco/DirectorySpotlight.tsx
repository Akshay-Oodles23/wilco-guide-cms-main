"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SpotlightBusiness {
	name: string;
	slug?: string;
	href?: string;
	category: string;
	priceRange: string;
	description: string;
	location: string;
	rating: number;
	reviewCount: string;
	image: string;
	tags: {
		label: string;
		type: "deal" | "hiring" | "new" | "event" | "featured";
	}[];
}

interface SpotlightCardProps {
	businesses: SpotlightBusiness[];
	cycleSpeed?: number;
	isPremium?: boolean;
}

const DirectorySpotlight: React.FC<SpotlightCardProps> = ({
	businesses,
	cycleSpeed = 5000,
	isPremium = false,
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isHovered, setIsHovered] = useState(false);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Cycle through businesses on an interval
	useEffect(() => {
		if (businesses.length === 0) return;

		if (!isHovered) {
			intervalRef.current = setInterval(() => {
				setCurrentIndex(
					(prevIndex) => (prevIndex + 1) % businesses.length,
				);
			}, cycleSpeed);
		}

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [businesses.length, cycleSpeed, isHovered]);

	if (businesses.length === 0) {
		return (
			<div
				className={
					isPremium ? "card-premium biz-card" : "biz-card row-card"
				}
			>
				No businesses available
			</div>
		);
	}

	const currentBusiness = businesses[currentIndex];

	const getBusinessHref = (business: SpotlightBusiness): string => {
		if (business.href) return business.href;
		if (business.slug) return `/directory/${business.slug}`;
		const fallbackSlug = (business.name || "business")
			.toLowerCase()
			.replace(/[\u2019']/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
		return `/directory/${fallbackSlug}`;
	};

	const businessHref = getBusinessHref(currentBusiness);

	const getTagClass = (type: string): string => {
		switch (type) {
			case "deal":
				return "tag tag-deal";
			case "hiring":
				return "tag tag-hiring";
			case "new":
				return "tag tag-new";
			case "event":
				return "tag tag-event";
			case "featured":
				return "tag";
			default:
				return "tag";
		}
	};

	return (
		<div
			className={
				isPremium ? "card-premium biz-card" : "biz-card row-card"
			}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Link
				href={businessHref}
				className='block h-full'
				aria-label={`View details for ${currentBusiness.name}`}
			>
				{/* Card Content Set with fade transition */}
				<div
					className='card-content-set'
					style={{
						opacity: 1,
						transition: "opacity 0.6s ease-in-out",
					}}
				>
					{/* Card Media */}
					<div className='card-media'>
						<img
							src={currentBusiness.image}
							alt={currentBusiness.name}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
						/>
					</div>

					{/* Card Overlay */}
					<div className='card-overlay'>
						{/* Card Info */}
						<div className='card-info'>
							<div style={{ marginBottom: "8px" }}>
								<h3
									style={{
										margin: "0 0 4px 0",
										fontSize: "18px",
										fontWeight: "600",
									}}
								>
									{currentBusiness.name}
								</h3>
								<p
									style={{
										margin: "0 0 8px 0",
										fontSize: "12px",
										color: "#fff",
									}}
								>
									{currentBusiness.category} •{" "}
									{currentBusiness.priceRange}
								</p>
							</div>

							<p
								style={{
									margin: "0 0 12px 0",
									fontSize: "14px",
									lineHeight: "1.4",
								}}
							>
								{currentBusiness.description}
							</p>

							<div
								style={{
									fontSize: "12px",
									color: "#666",
									marginBottom: "12px",
								}}
							>
								<p
									style={{ margin: "0 0 4px 0" }}
									className='text-white'
								>
									📍 {currentBusiness.location}
								</p>
								<p
									style={{ margin: "0" }}
									className='text-white'
								>
									⭐ {currentBusiness.rating} (
									{currentBusiness.reviewCount})
								</p>
							</div>

							{/* Card Tags */}
							{currentBusiness.tags &&
								currentBusiness.tags.length > 0 && (
									<div
										className='card-tags'
										style={{
											display: "flex",
											gap: "6px",
											flexWrap: "wrap",
										}}
									>
										{currentBusiness.tags.map(
											(tag, idx) => (
												<span
													key={idx}
													className={getTagClass(
														tag.type,
													)}
												>
													{tag.label}
												</span>
											),
										)}
									</div>
								)}
						</div>

						{/* Premium Badge */}
						{isPremium && (
							<div
								className='premium-badge'
								style={{
									position: "absolute",
									top: "12px",
									right: "12px",
								}}
							>
								⭐ Premium
							</div>
						)}
					</div>
				</div>
			</Link>

			{/* Auto Scroll Indicator with Pips */}
			{businesses.length > 1 && (
				<div
					className='auto-scroll-indicator'
					style={{
						position: "absolute",
						bottom: "12px",
						right: "12px",
						display: "flex",
						gap: "4px",
					}}
				>
					{businesses.map((_, idx) => (
						<button
							key={idx}
							className='scroll-pip'
							onClick={() => setCurrentIndex(idx)}
							style={{
								width: "8px",
								height: "8px",
								borderRadius: "50%",
								border: "none",
								cursor: "pointer",
								position: "relative",
								zIndex: 2,
								backgroundColor:
									idx === currentIndex
										? "#fff"
										: "rgba(255, 255, 255, 0.4)",
								transition: "background-color 0.3s ease",
							}}
							aria-label={`Go to business ${idx + 1}`}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default DirectorySpotlight;
