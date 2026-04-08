import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategories, getCategoryBySlug } from "@/lib/seniors/getCategories";
import { getCityBySlug } from "@/lib/seniors/getCities";
import {
	getBusinessesByCategory,
	getBusinessesByCity,
	getBusinessesByCityAndCategory,
} from "@/lib/seniors/getBusinesses";
import { getFAQsByCategory } from "@/lib/seniors/getFAQs";
import {
	generateCollectionPageSchema,
	generateBreadcrumbSchema,
	generateFAQSchema,
} from "@/lib/seniors/schema";
import { SITE_URL } from "@/lib/site-config";

interface Props {
	params: Promise<{ cityOrCategory: string }>;
}

export async function generateStaticParams() {
	const { getCategories } = await import("@/lib/seniors/getCategories");
	const { getCities } = await import("@/lib/seniors/getCities");
	const categories = getCategories();
	const cities = getCities();
	const { getBusinesses } = await import("@/lib/seniors/getBusinesses");
	const allBusinesses = getBusinesses();
	const categorySlugsWithBusinesses = new Set(
		allBusinesses.map((b: any) => b.category),
	);
	const nonEmptyCategories = categories.filter((c: any) =>
		categorySlugsWithBusinesses.has(c.slug),
	);
	return [
		...nonEmptyCategories.map((c: any) => ({ cityOrCategory: c.slug })),
		...cities.map((c: any) => ({ cityOrCategory: c.slug })),
	];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { cityOrCategory } = await params;
	const category = getCategoryBySlug(cityOrCategory);
	if (category) {
		return {
			title: (
				category.seoTitle ||
				`${category.name} for Seniors in Williamson County`
			).replace(/\s*\|\s*WilCo Seniors\s*$/, ""),
			description:
				category.metaDescription ||
				`Find ${category.name.toLowerCase()} for seniors in Williamson County, TX.`,
			alternates: { canonical: `${SITE_URL}/seniors/${category.slug}` },
		};
	}
	const city = getCityBySlug(cityOrCategory);
	if (city) {
		return {
			title: (
				city.seoTitle || `Senior Services in ${city.name}, TX`
			).replace(/\s*\|\s*WilCo Seniors\s*$/, ""),
			description:
				city.metaDescription ||
				`Find senior services and resources in ${city.name}, TX.`,
			alternates: { canonical: `${SITE_URL}/seniors/${city.slug}` },
		};
	}
	return {};
}

export default async function CityOrCategoryPage({ params }: Props) {
	const { cityOrCategory } = await params;
	const category = getCategoryBySlug(cityOrCategory);
	const city = getCityBySlug(cityOrCategory);

	if (category) {
		return <CategoryPageContent category={category} />;
	}
	if (city) {
		return <CityPageContent city={city} />;
	}
	notFound();
}

function CategoryPageContent({ category }: { category: any }) {
	const businesses = getBusinessesByCategory(category.slug);
	const categories = getCategories();
	const faqs = getFAQsByCategory(category.slug);
	const relatedCategories = (category.relatedCategories || [])
		.map((slug: string) => categories.find((c: any) => c.slug === slug))
		.filter(Boolean);

	return (
		<div className='directory-page'>
			<div className='category-page-header'>
				<h1
					className='section-title'
					style={{ marginBottom: 8 }}
				>
					{category.name} for Seniors in Williamson County
				</h1>
				{category.shortDescription && (
					<p className='category-intro'>
						{category.shortDescription}
					</p>
				)}
			</div>
			<div className='listing-grid'>
				{businesses.map((b: any) => (
					<div
						key={b.slug}
						className='listing-card'
					>
						<h3>
							<Link href={`/seniors/directory/${b.slug}`}>
								{b.name}
							</Link>
						</h3>
						<p>{b.description}</p>
					</div>
				))}
			</div>
			{businesses.length === 0 && (
				<p
					style={{
						textAlign: "center",
						color: "#8e8ea0",
						padding: "40px 0",
					}}
				>
					No businesses listed in this category yet.
				</p>
			)}
			{relatedCategories.length > 0 && (
				<div className='related-categories'>
					<h2
						className='section-title'
						style={{ marginBottom: 16 }}
					>
						Related Categories
					</h2>
					{relatedCategories.map((rc: any) => (
						<Link
							key={rc.slug}
							href={`/seniors/${rc.slug}`}
							className='related-cat-link'
						>
							{rc.icon} {rc.name}
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

function CityPageContent({ city }: { city: any }) {
	const businesses = getBusinessesByCity(city.slug);
	const categories = getCategories();
	const byCategory: Record<string, any[]> = {};
	businesses.forEach((b: any) => {
		if (!byCategory[b.category]) byCategory[b.category] = [];
		byCategory[b.category].push(b);
	});

	return (
		<div className='directory-page'>
			<div className='category-page-header'>
				<h1
					className='section-title'
					style={{ marginBottom: 8 }}
				>
					Senior Services in {city.name}, TX
				</h1>
				{city.description && (
					<p className='category-intro'>{city.description}</p>
				)}
			</div>
			{Object.entries(byCategory).map(([catSlug, catBusinesses]) => {
				const cat = categories.find((c: any) => c.slug === catSlug);
				const catDisplayName = cat
					? cat.name
					: catBusinesses[0]?.categoryName ||
						catSlug
							.replace(/-/g, " ")
							.replace(/\b\w/g, (c: string) => c.toUpperCase());
				return (
					<div
						key={catSlug}
						className='category-row'
					>
						<div className='section-header'>
							<div className='section-title-group'>
								<h2 className='section-title'>
									{catDisplayName}
								</h2>
								<span className='section-count'>
									{catBusinesses.length} businesses
								</span>
							</div>
							<Link
								href={`/seniors/${catSlug}`}
								className='section-see-all'
							>
								See all →
							</Link>
						</div>
						<div className='row-grid'>
							{catBusinesses.slice(0, 4).map((b: any) => (
								<div
									key={b.slug}
									className='business-card'
								>
									<h3>
										<Link
											href={`/seniors/directory/${b.slug}`}
										>
											{b.name}
										</Link>
									</h3>
									<p>{b.description}</p>
								</div>
							))}
						</div>
					</div>
				);
			})}
			{businesses.length === 0 && (
				<p
					style={{
						textAlign: "center",
						color: "#8e8ea0",
						padding: "40px 0",
					}}
				>
					No businesses listed in {city.name} yet.
				</p>
			)}
			<div
				style={{
					marginTop: 32,
					padding: 24,
					background: "#f0f4ff",
					borderRadius: 12,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 16,
				}}
			>
				<div>
					<h3 style={{ marginBottom: 4 }}>
						🏡 Relocating to {city.name}?
					</h3>
					<p style={{ margin: 0, fontSize: 14, color: "#5a5a7a" }}>
						Read our complete guide to retiring in {city.name}.
					</p>
				</div>
				<Link
					href={`/seniors/relocating/${city.slug}`}
					className='seniors-btn-primary'
				>
					Relocation Guide →
				</Link>
			</div>
		</div>
	);
}
