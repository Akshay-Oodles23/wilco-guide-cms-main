"use client";

export function JobActionButtons({
	applicationUrl,
}: {
	applicationUrl?: string;
}) {
	return (
		<div className='job-header-actions'>
			<button
				className='job-apply-btn'
				onClick={() => {
					if (applicationUrl) {
						window.open(applicationUrl, "_blank");
					} else {
						alert("Application URL not available");
					}
				}}
			>
				Apply Now
			</button>
			<button
				className='job-save-btn'
				onClick={() => {
					// TODO: Implement save functionality
					alert("Save functionality to be implemented");
				}}
			>
				<svg
					width='16'
					height='16'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
				>
					<path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' />
				</svg>
				Save
			</button>
			<button
				className='job-share-btn'
				onClick={() => {
					// TODO: Implement share functionality
					if (navigator.share) {
						navigator.share({
							title: "Check out this job",
							text: "Check out this job on WilCo Guide",
							url:
								typeof window !== "undefined"
									? window.location.href
									: "",
						});
					} else {
						alert("Share functionality to be implemented");
					}
				}}
			>
				<svg
					width='16'
					height='16'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
				>
					<circle
						cx='18'
						cy='5'
						r='3'
					/>
					<circle
						cx='6'
						cy='12'
						r='3'
					/>
					<circle
						cx='18'
						cy='19'
						r='3'
					/>
					<line
						x1='8.59'
						y1='13.51'
						x2='15.42'
						y2='17.49'
					/>
					<line
						x1='15.41'
						y1='6.51'
						x2='8.59'
						y2='10.49'
					/>
				</svg>
				Share
			</button>
		</div>
	);
}
