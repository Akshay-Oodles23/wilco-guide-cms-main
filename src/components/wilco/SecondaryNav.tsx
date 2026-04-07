"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, ChevronDown, Search } from "lucide-react";
import { NEWSLETTER_BRANDS } from "@/lib/site-config";

interface SecondaryNavProps {
	categories: Array<{ name: string; slug: string; color: string }>;
	locations: Array<{ name: string; slug: string }>;
}

export function SecondaryNav({ categories, locations }: SecondaryNavProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [locOpen, setLocOpen] = useState(false);
	const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
	const locRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const activeCategory = searchParams.get("category") || "";
	const activeBrand = searchParams.get("brand") || "";
	const activeLocation = searchParams.get("location") || "";

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (locRef.current && !locRef.current.contains(e.target as Node)) {
				setLocOpen(false);
			}
		}
		document.addEventListener("click", handleClick);
		return () => document.removeEventListener("click", handleClick);
	}, []);

	useEffect(() => {
		if (locOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setDropdownPos({
				top: rect.bottom + 6,
				right: window.innerWidth - rect.right,
			});
		}
	}, [locOpen]);

	function updateParam(key: string, value: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		router.push(`/news?${params.toString()}`);
	}

	function toggleBrand(slug: string) {
		updateParam("brand", activeBrand === slug ? "" : slug);
	}

	function selectCategory(slug: string) {
		updateParam("category", activeCategory === slug ? "" : slug);
	}

	function selectLocation(slug: string) {
		updateParam("location", activeLocation === slug ? "" : slug);
		setLocOpen(false);
	}

	const currentLocationLabel = activeLocation
		? locations.find((l) => l.slug === activeLocation)?.name || "All WilCo"
		: "All WilCo";

	return (
		<div className='bg-white border-b border-border shadow-sm'>
			<div className='max-w-page mx-auto w-full flex items-center gap-[5px] px-4 md:px-8 h-[48px] overflow-x-auto scrollbar-hide'>
				{/* Brand pills — hidden on very small screens */}
				<div className='hidden sm:flex gap-1 flex-shrink-0'>
					{NEWSLETTER_BRANDS.map((brand) => {
						const isActive = activeBrand === brand.slug;
						return (
							<button
								key={brand.slug}
								onClick={() => toggleBrand(brand.slug)}
								className='py-[5px] px-3 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all border-[1.5px]'
								style={{
									background: isActive
										? brand.color
										: brand.bgLight,
									color: isActive ? "#fff" : brand.color,
									borderColor: isActive
										? brand.color
										: brand.borderLight,
								}}
							>
								{brand.label}
							</button>
						);
					})}
				</div>

				{/* Divider */}
				<div className='hidden sm:block w-px h-5 bg-border mx-1 flex-shrink-0' />

				{/* Category filters */}
				<div className='flex gap-[5px] overflow-x-auto scrollbar-hide flex-1'>
					<button
						onClick={() => updateParam("category", "")}
						className={`py-[5px] px-3 rounded-lg border-[1.5px] text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
							!activeCategory
								? "bg-blue text-white border-blue"
								: "bg-white text-text-secondary border-border hover:border-blue hover:text-blue"
						}`}
					>
						All
					</button>
					{categories
						.filter(
							(c) =>
								c.slug !== "healthcare" &&
								c.slug !== "technology" &&
								c.slug !== "restaurant" &&
								c.slug !== "retail" &&
								c.slug !== "construction" &&
								c.slug !== "education" &&
								c.slug !== "finance",
						)
						.map((cat) => (
							<button
								key={cat.slug}
								onClick={() => selectCategory(cat.slug)}
								className={`py-[5px] px-3 rounded-lg border-[1.5px] text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
									activeCategory === cat.slug
										? "bg-blue text-white border-blue"
										: "bg-white text-text-secondary border-border hover:border-blue hover:text-blue"
								}`}
							>
								{cat.name}
							</button>
						))}
				</div>

				{/* Right side actions */}
				<div className='flex gap-[5px] flex-shrink-0 ml-auto'>
					{/* Location dropdown */}
					<div
						className='relative'
						ref={locRef}
					>
						<button
							ref={buttonRef}
							onClick={() => setLocOpen(!locOpen)}
							className='py-[5px] px-3 rounded-lg border-[1.5px] border-border bg-white text-xs font-medium text-text-secondary cursor-pointer whitespace-nowrap transition-all hover:border-blue hover:text-blue flex items-center gap-[5px]'
						>
							<MapPin size={13} />
							<span className='hidden sm:inline'>
								{currentLocationLabel}
							</span>
							<ChevronDown
								size={12}
								className={`transition-transform ${locOpen ? "rotate-180" : ""}`}
							/>
						</button>
						{locOpen && (
							<div
								className='fixed bg-white border-[1.5px] border-border rounded-[10px] shadow-lg z-[9999] p-[5px] min-w-[180px] animate-in fade-in slide-in-from-top-1'
								style={{
									top: `${dropdownPos.top}px`,
									right: `${dropdownPos.right}px`,
								}}
							>
								<button
									onClick={() => selectLocation("")}
									className={`w-full px-3 py-2 text-[13px] font-medium rounded-md cursor-pointer flex items-center justify-between transition-colors ${
										!activeLocation
											? "text-blue font-semibold"
											: "text-text-secondary hover:bg-bg hover:text-text-primary"
									}`}
								>
									All WilCo
									{!activeLocation && (
										<span className='text-blue text-xs'>
											✓
										</span>
									)}
								</button>
								{locations.map((loc) => (
									<button
										key={loc.slug}
										onClick={() => selectLocation(loc.slug)}
										className={`w-full px-3 py-2 text-[13px] font-medium rounded-md cursor-pointer flex items-center justify-between transition-colors ${
											activeLocation === loc.slug
												? "text-blue font-semibold"
												: "text-text-secondary hover:bg-bg hover:text-text-primary"
										}`}
									>
										{loc.name}
										{activeLocation === loc.slug && (
											<span className='text-blue text-xs'>
												✓
											</span>
										)}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Search button */}
					<button className='py-[5px] px-3 rounded-lg border-[1.5px] border-border bg-white text-xs font-medium text-text-muted cursor-pointer whitespace-nowrap transition-all hover:border-blue hover:text-blue flex items-center gap-[5px]'>
						<Search size={13} />
						<span className='hidden sm:inline'>Search</span>
					</button>
				</div>
			</div>
		</div>
	);
}
