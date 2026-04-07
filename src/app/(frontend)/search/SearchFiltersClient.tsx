"use client";

export function SearchFiltersClient() {
	return (
		<div
			className='loc-dropdown-wrap'
			id='locWrap'
		>
			<button
				className='loc-trigger'
				onClick={() => {
					const dd = document.getElementById("locDD");
					dd?.classList.toggle("open");
				}}
			>
				<svg
					width='13'
					height='13'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2.5'
				>
					<path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
					<circle
						cx='12'
						cy='10'
						r='3'
					/>
				</svg>
				<span id='locLabel'>All WilCo</span>
				<svg
					className='loc-chevron'
					width='12'
					height='12'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='3'
				>
					<polyline points='6 9 12 15 18 9' />
				</svg>
			</button>
			<div
				className='loc-dd'
				id='locDD'
			>
				<div className='loc-list'>
					<a
						href='/search?location=all'
						className='loc-item active'
					>
						All WilCo
					</a>
					<a
						href='/search?location=leander'
						className='loc-item'
					>
						Leander
					</a>
					<a
						href='/search?location=cedar-park'
						className='loc-item'
					>
						Cedar Park
					</a>
					<a
						href='/search?location=round-rock'
						className='loc-item'
					>
						Round Rock
					</a>
					<a
						href='/search?location=georgetown'
						className='loc-item'
					>
						Georgetown
					</a>
				</div>
			</div>
		</div>
	);
}
