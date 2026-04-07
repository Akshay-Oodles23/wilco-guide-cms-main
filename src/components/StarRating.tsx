"use client";

interface StarRatingProps {
	rating: number;
	size?: "sm" | "md" | "lg";
	showValue?: boolean;
	className?: string;
}

export default function StarRating({
	rating,
	size = "md",
	showValue = false,
	className = "",
}: StarRatingProps) {
	// Clamp rating between 0 and 5
	const clampedRating = Math.max(0, Math.min(5, rating));
	const fullStars = Math.floor(clampedRating);
	const decimalPart = clampedRating % 1;
	const hasPartialStar = decimalPart > 0;
	// Cap max fill at 85% so high ratings like 4.9 don't look identical to 5.0
	const rawFillPercentage = decimalPart * 100;
	const fillPercentage = Math.min(rawFillPercentage, 85).toFixed(1);
	const emptyStars = 5 - Math.ceil(clampedRating);

	// Size classes
	const sizeClasses = {
		sm: "w-3 h-3",
		md: "w-4 h-4",
		lg: "w-6 h-6",
	};

	const textSizeClasses = {
		sm: "text-xs",
		md: "text-sm",
		lg: "text-base",
	};

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<div className='flex items-center gap-0.5'>
				{/* Full Stars */}
				{Array.from({ length: fullStars }).map((_, i) => (
					<div
						key={`full-${i}`}
						className='relative'
					>
						<svg
							className={`${sizeClasses[size]} text-[#eab308] fill-current`}
							viewBox='0 0 20 20'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
						</svg>
					</div>
				))}

				{/* Partial Star - fills based on decimal value */}
				{hasPartialStar && (
					<div
						key='partial'
						className='relative'
					>
						<svg
							className={`${sizeClasses[size]} text-gray-300 fill-current`}
							viewBox='0 0 20 20'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
						</svg>
						<div
							className='absolute left-0 top-0 overflow-hidden h-full'
							style={{ width: `${fillPercentage}%` }}
						>
							<svg
								className={`${sizeClasses[size]} text-[#eab308] fill-current`}
								viewBox='0 0 20 20'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
							</svg>
						</div>
					</div>
				)}

				{/* Empty Stars */}
				{Array.from({ length: emptyStars }).map((_, i) => (
					<div
						key={`empty-${i}`}
						className='relative'
					>
						<svg
							className={`${sizeClasses[size]} text-gray-300 fill-current`}
							viewBox='0 0 20 20'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
						</svg>
					</div>
				))}
			</div>

			{/* Rating Value */}
			{showValue && (
				<span
					className={`${textSizeClasses[size]} font-semibold text-slate-700`}
				>
					{clampedRating.toFixed(1)}
				</span>
			)}
		</div>
	);
}
