"use client";

export function ApplyButton({ applicationUrl }: { applicationUrl?: string }) {
	return (
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
	);
}
