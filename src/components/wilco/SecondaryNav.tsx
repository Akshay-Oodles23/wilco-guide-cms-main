"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { LocationDropdown } from "./LocationDropdown";
import { NEWSLETTER_BRANDS } from "@/lib/site-config";

interface SecondaryNavProps {
	categories: Array<{ name: string; slug: string; color: string }>;
	locations: Array<{ id: string; name: string; slug: string }>;
}

export function SecondaryNav({ categories, locations }: SecondaryNavProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const activeCategory = searchParams.get("category") || "";
	const activeBrand = searchParams.get("brand") || "";

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
					{/* Location dropdown - Using LocationDropdown Component */}
					<LocationDropdown locations={locations} />

					{/* Search button */}
					<button className='py-[5px] px-3 rounded-lg border-[1.5px] border-border bg-white text-xs font-medium text-text-muted cursor-pointer whitespace-nowrap transition-all hover:border-blue hover:text-blue flex items-center gap-[5px] hidden'>
						<Search size={13} />
						<span className='hidden sm:inline'>Search</span>
					</button>
				</div>
			</div>
		</div>
	);
}
