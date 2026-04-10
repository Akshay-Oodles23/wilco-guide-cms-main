// @ts-nocheck
// TODO: Remove ts-nocheck after running 'payload generate:types' with live database
import { Metadata } from "next";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import "../../../styles/jobs.css";
import { Suspense } from "react";
import { IngestionTrigger } from "@/components/IngestionTrigger";
import { JobsSearchBar } from "@/components/wilco/JobsSearchBar";

export const metadata: Metadata = {
	title: "Jobs — WilCo Guide",
	description:
		"The best place to find and post jobs across Williamson County",
};

// Will be populated from CMS locations
let LOCATION_KEYWORDS: Record<string, string[]> = {};

// Pagination configuration
const JOBS_PER_PAGE = 20;

// Helper functions
function formatSalary(
	minSalary?: number,
	maxSalary?: number,
	isHourly?: boolean,
): string {
	if (!minSalary && !maxSalary) return "Competitive";

	const min = minSalary
		? isHourly
			? `$${minSalary.toFixed(0)}`
			: `$${(minSalary / 1000).toFixed(1)}K`
		: "";
	const max = maxSalary
		? isHourly
			? `$${maxSalary.toFixed(0)}`
			: `$${(maxSalary / 1000).toFixed(1)}K`
		: "";

	if (min && max) return `${min} – ${max}${isHourly ? "/hr" : ""}`;
	if (min) return `${min}${isHourly ? "/hr" : ""}`;
	if (max) return `${max}${isHourly ? "/hr" : ""}`;

	return "Competitive";
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function getImageUrl(image: any): string {
	if (!image)
		return "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80";
	if (typeof image === "string") return image;
	if (image.url) return image.url;
	return "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80";
}

function formatDate(date: string | Date): string {
	const d = new Date(date);
	const now = new Date();
	const diffTime = now.getTime() - d.getTime();
	if (diffTime < 0) return "Today";
	const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (diffHours < 1) return "Just now";
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays === 1) return "1d ago";
	if (diffDays < 7) return `${diffDays}d ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
	return d.toLocaleDateString();
}

function formatCategoryName(category: string): string {
	return category
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

interface Job {
	id: string;
	title: string;
	company?: { id: string; name: string; logo?: any } | string;
	category?: string;
	salaryMin?: number;
	salaryMax?: number;
	isHourly?: boolean;
	location?: string;
	jobType?: string;
	description?: string;
	featured?: boolean;
	premium?: boolean;
	tags?: string[];
	urgent?: boolean;
	workMode?: string;
	postedAt?: string;
	createdAt: string;
	image?: any;
	applicationUrl?: string;
}

/** Normalize Payload job doc (salary group, employmentType, location group) to Job shape used by the UI. */
function normalizeJob(doc: any): Job {
	const salary = doc.salary;
	const loc = doc.location;

	// Handle city as a relationship object
	let cityLabel: string | null = null;
	if (loc?.city) {
		if (typeof loc.city === "object") {
			// City is now a relationship object with 'name' and 'slug'
			cityLabel = loc.city.name;
		} else {
			// Fallback for old string format
			cityLabel = String(loc.city)
				.replace(/-/g, " ")
				.replace(/\b\w/g, (c: string) => c.toUpperCase());
		}
	}

	const locationStr =
		[cityLabel, loc?.state || "TX"].filter(Boolean).join(", ") || undefined;
	const employmentRaw = String(
		doc.employmentType ?? doc.jobType ?? "",
	).toLowerCase();
	const employmentDisplay =
		employmentRaw === "part-time"
			? "Part-time"
			: employmentRaw === "contract"
				? "Contract"
				: employmentRaw === "internship"
					? "Internship"
					: "Full-time";
	return {
		id: doc.id,
		title: doc.title,
		company:
			doc.company ??
			(typeof doc.company === "object" ? doc.company?.name : undefined),
		category: doc.category,
		salaryMin: salary?.min != null ? Number(salary.min) : doc.salaryMin,
		salaryMax: salary?.max != null ? Number(salary.max) : doc.salaryMax,
		isHourly: salary?.type === "hourly" || doc.isHourly,
		location: locationStr ?? doc.location,
		jobType: employmentDisplay,
		description: doc.description,
		featured: doc.featured,
		premium: doc.premium,
		tags: Array.isArray(doc.tags)
			? doc.tags
					.map((t: any) =>
						typeof t === "string" ? t : (t?.label ?? ""),
					)
					.filter(Boolean)
			: [],
		urgent: Boolean(doc.urgent),
		workMode: doc.workMode,
		postedAt: doc.postedAt ?? doc.createdAt ?? doc.created,
		createdAt: doc.createdAt ?? doc.created,
		image: doc.image,
		applicationUrl: doc.applicationUrl ?? doc.applyUrl ?? doc.url,
	};
}

interface Business {
	id: string;
	name: string;
	logo?: any;
	jobCount?: number;
	industry?: string;
}

interface Sponsor {
	id: string;
	name: string;
	logo?: any;
}

async function fetchJobs(): Promise<Job[]> {
	try {
		const payload = await getPayload({ config });
		console.log("📦 Fetching jobs from Payload CMS...");

		const result = await payload.find({
			collection: "jobs",
			sort: "-postedAt",
			limit: 500,
			depth: 1,
		});

		console.log("✅ Jobs fetch complete!");
		console.log(`📊 Total jobs found: ${result.docs.length}`);
		console.log("🔍 Raw jobs data:", result.docs);

		if (result.docs.length === 0) {
			console.warn(
				"⚠️  No jobs found in database. Run ingestion to populate data.",
			);
			console.info("💡 To ingest data: POST /api/ingest/jobs/adzuna");
		}

		const normalized = result.docs.map(normalizeJob);
		console.log("✨ Normalized jobs:", normalized);

		return normalized;
	} catch (error) {
		console.error("❌ Error fetching jobs:", error);
		return [];
	}
}

async function fetchBusinesses(): Promise<Business[]> {
	try {
		const payload = await getPayload({ config });
		console.log("📦 Fetching businesses from Payload CMS...");

		const result = await payload.find({
			collection: "businesses",
			sort: "-createdAt",
			limit: 5,
			depth: 1,
		});

		console.log(
			`✅ Businesses fetch complete! Found: ${result.docs.length}`,
		);
		console.log("🔍 Raw businesses data:", result.docs);

		return result.docs as Business[];
	} catch (error) {
		console.error("❌ Error fetching businesses:", error);
		return [];
	}
}

async function fetchSponsors(): Promise<Sponsor[]> {
	try {
		const payload = await getPayload({ config });
		console.log("📦 Fetching sponsors from Payload CMS...");

		const result = await payload.find({
			collection: "sponsors",
			sort: "-createdAt",
			limit: 1,
			depth: 1,
		});

		console.log(`✅ Sponsors fetch complete! Found: ${result.docs.length}`);
		console.log("🔍 Raw sponsors data:", result.docs);

		return result.docs as Sponsor[];
	} catch (error) {
		// TODO: Create sponsors collection when available
		console.warn(
			"⚠️  Sponsors collection not found. Using fallback.",
			error,
		);
		return [];
	}
}

async function fetchLocations(): Promise<
	Array<{ name: string; slug: string }>
> {
	try {
		const payload = await getPayload({ config });
		console.log("📦 Fetching locations from Payload CMS...");

		const result = await payload.find({
			collection: "locations",
			limit: 100,
			depth: 0,
		});

		console.log(
			`✅ Locations fetch complete! Found: ${result.docs.length}`,
		);

		const locations = (result.docs as any[])
			.filter((loc) => loc?.name && loc?.slug)
			.map((loc) => ({
				name: loc.name,
				slug: String(loc.slug).toLowerCase(),
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

		// Build location keyword mapping for filtering
		LOCATION_KEYWORDS = {};
		for (const loc of locations) {
			LOCATION_KEYWORDS[loc.slug] = [loc.name.toLowerCase()];
		}

		console.log("📍 Location keywords mapping:", LOCATION_KEYWORDS);
		return locations;
	} catch (error) {
		console.error("❌ Error fetching locations:", error);
		return [];
	}
}

export default async function JobsPage({
	searchParams,
}: {
	searchParams: Promise<{
		location?: string;
		search?: string;
		category?: string;
		page?: string;
	}>;
}) {
	const params = await searchParams;
	const jobs = await fetchJobs();
	const businesses = await fetchBusinesses();
	const sponsors = await fetchSponsors();
	const locations = await fetchLocations();

	// Get selected location from URL
	const selectedLocationSlug = params.location || "";
	const selectedLocationKeywords = selectedLocationSlug
		? LOCATION_KEYWORDS[selectedLocationSlug]
		: null;

	// Get search query from URL
	const searchQuery = params.search || "";
	const selectedCategory = params.category || "";

	// Use a fixed date for consistency (2 days ago from reference date)
	// This prevents hydration mismatches caused by Date.now() differences between server and client
	const refDate = new Date("2026-04-02").getTime();
	const twoDaysAgo = refDate - 2 * 24 * 60 * 60 * 1000;
	const threeDaysAgo = refDate - 3 * 24 * 60 * 60 * 1000;
	const fiveDaysAgo = refDate - 5 * 24 * 60 * 60 * 1000;
	const sevenDaysAgo = refDate - 7 * 24 * 60 * 60 * 1000;
	const fourDaysAgo = refDate - 4 * 24 * 60 * 60 * 1000;
	const sixDaysAgo = refDate - 6 * 24 * 60 * 60 * 1000;
	const fourteenDaysAgo = refDate - 14 * 24 * 60 * 60 * 1000;

	// Log data summary
	console.log("\n" + "=".repeat(60));
	console.log("📋 JOBS PAGE DATA SUMMARY");
	console.log("=".repeat(60));
	console.log(`Total jobs fetched: ${jobs.length}`);
	console.log(`Premium jobs: ${jobs.filter((j) => j.premium).length}`);
	console.log(
		`Featured jobs: ${jobs.filter((j) => j.featured && !j.premium).length}`,
	);
	console.log(`Total businesses: ${businesses.length}`);
	console.log(`Total sponsors: ${sponsors.length}`);
	console.log("=".repeat(60) + "\n");

	// Fallback data when CMS is empty
	const fallbackSponsors: Sponsor[] = [
		{ id: "1", name: "Baylor Scott & White", logo: undefined },
	];

	const fallbackPremiumJobs: Job[] = [
		{
			id: "p1",
			title: "Registered Nurse — Emergency Department",
			company: {
				id: "1",
				name: "St. David's Healthcare",
				logo: undefined,
			},
			salaryMin: 78000,
			salaryMax: 95000,
			isHourly: false,
			location: "Round Rock, TX",
			jobType: "Full-time",
			tags: ["Full-time", "Full Benefits", "Urgent Hire"],
			premium: true,
			featured: true,
			createdAt: new Date(twoDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "p2",
			title: "Senior Project Manager — Commercial Construction",
			company: {
				id: "2",
				name: "Vista Ridge Development",
				logo: undefined,
			},
			salaryMin: 110000,
			salaryMax: 135000,
			isHourly: false,
			location: "Cedar Park, TX",
			jobType: "Full-time",
			tags: ["Full-time", "Full Benefits"],
			premium: true,
			featured: true,
			createdAt: new Date(threeDaysAgo).toISOString(),
			description: "",
		},
	];

	const fallbackFeaturedJobs: Job[] = [
		{
			id: "f1",
			title: "High School Math Teacher",
			company: { id: "3", name: "Leander ISD", logo: undefined },
			salaryMin: 52000,
			salaryMax: 68000,
			isHourly: false,
			location: "Leander",
			jobType: "Full-time",
			tags: ["Full-time", "Benefits"],
			featured: true,
			createdAt: new Date(fiveDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "f2",
			title: "Branch Manager — Georgetown",
			company: { id: "4", name: "Amplify Credit Union", logo: undefined },
			salaryMin: 65000,
			salaryMax: 82000,
			isHourly: false,
			location: "Georgetown",
			jobType: "Full-time",
			tags: ["Full-time", "Benefits"],
			featured: true,
			createdAt: new Date(threeDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "f3",
			title: "Line Cook",
			company: {
				id: "5",
				name: "Rosalie's Kitchen & Bar",
				logo: undefined,
			},
			salaryMin: 18,
			salaryMax: 22,
			isHourly: true,
			location: "Leander",
			jobType: "Full-time",
			tags: ["Full-time"],
			featured: true,
			createdAt: new Date(sevenDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "f4",
			title: "Store Manager — Leander",
			company: { id: "6", name: "H-E-B", logo: undefined },
			salaryMin: 58000,
			salaryMax: 75000,
			isHourly: false,
			location: "Leander",
			jobType: "Full-time",
			tags: ["Full-time", "Benefits"],
			featured: true,
			createdAt: new Date(fourDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "f5",
			title: "Front Desk Supervisor",
			company: { id: "7", name: "Kalahari Resorts", logo: undefined },
			salaryMin: 42000,
			salaryMax: 50000,
			isHourly: false,
			location: "Round Rock",
			jobType: "Full-time",
			tags: ["Full-time"],
			featured: true,
			createdAt: new Date(sixDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "f6",
			title: "Parks & Rec Coordinator",
			company: { id: "8", name: "Williamson County", logo: undefined },
			salaryMin: 48000,
			salaryMax: 58000,
			isHourly: false,
			location: "Georgetown",
			jobType: "Full-time",
			tags: ["Full-time", "Benefits + Pension"],
			featured: true,
			createdAt: new Date(sevenDaysAgo).toISOString(),
			description: "",
		},
	];

	const fallbackStandardJobs: Job[] = [
		{
			id: "s1",
			title: "Physical Therapist Assistant",
			company: {
				id: "9",
				name: "Lone Star Physical Therapy",
				logo: undefined,
			},
			salaryMin: 55000,
			salaryMax: 65000,
			isHourly: false,
			location: "Cedar Park",
			jobType: "Full-time",
			tags: [],
			createdAt: new Date(twoDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s2",
			title: "Dental Hygienist",
			company: { id: "10", name: "Smile Dental Group", logo: undefined },
			salaryMin: 70000,
			salaryMax: 85000,
			isHourly: false,
			location: "Leander",
			jobType: "Full-time",
			tags: [],
			createdAt: new Date(threeDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s3",
			title: "HVAC Technician",
			company: { id: "11", name: "Aire Serv of WilCo", logo: undefined },
			salaryMin: 22,
			salaryMax: 32,
			isHourly: true,
			location: "Round Rock",
			jobType: "Full-time",
			tags: [],
			createdAt: new Date(threeDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s4",
			title: "Barista",
			company: { id: "12", name: "Summermoon Coffee", logo: undefined },
			salaryMin: 14,
			salaryMax: 16,
			isHourly: true,
			location: "Leander",
			jobType: "Part-time",
			tags: [],
			createdAt: new Date(fourDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s5",
			title: "Software Engineer",
			company: { id: "13", name: "Optum Technology", logo: undefined },
			salaryMin: 95000,
			salaryMax: 125000,
			isHourly: false,
			location: "Cedar Park (Hybrid)",
			jobType: "Full-time",
			tags: [],
			createdAt: new Date(fiveDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s6",
			title: "Veterinary Technician",
			company: {
				id: "14",
				name: "Crystal Falls Animal Hospital",
				logo: undefined,
			},
			salaryMin: 38000,
			salaryMax: 48000,
			isHourly: false,
			location: "Leander",
			jobType: "Full-time",
			tags: [],
			createdAt: new Date(fiveDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s7",
			title: "Electrician Apprentice",
			company: { id: "15", name: "WilCo Electric Co.", logo: undefined },
			salaryMin: 18,
			salaryMax: 24,
			isHourly: true,
			location: "Georgetown",
			jobType: "Full-time",
			tags: [],
			createdAt: new Date(sixDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s8",
			title: "Receptionist",
			company: {
				id: "16",
				name: "Liberty Hill Family Practice",
				logo: undefined,
			},
			salaryMin: 15,
			salaryMax: 18,
			isHourly: true,
			location: "Liberty Hill",
			jobType: "Part-time",
			tags: [],
			createdAt: new Date(sevenDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s9",
			title: "Marketing Coordinator",
			company: { id: "17", name: "Cedar Park Chamber", logo: undefined },
			salaryMin: 45000,
			salaryMax: 55000,
			isHourly: false,
			location: "Cedar Park",
			jobType: "Full-time",
			tags: [],
			createdAt: new Date(sevenDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s10",
			title: "Prep Cook",
			company: { id: "18", name: "Plank Seafood", logo: undefined },
			salaryMin: 15,
			salaryMax: 18,
			isHourly: true,
			location: "Round Rock",
			jobType: "Full-time",
			tags: [],
			createdAt: new Date(sevenDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s11",
			title: "CNA — Night Shift",
			company: {
				id: "19",
				name: "Baylor Scott & White",
				logo: undefined,
			},
			salaryMin: 34000,
			salaryMax: 42000,
			isHourly: false,
			location: "Round Rock",
			jobType: "Full-time",
			tags: [],
			createdAt: new Date(sevenDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s12",
			title: "Plumber Journeyman",
			company: {
				id: "20",
				name: "Hill Country Plumbing",
				logo: undefined,
			},
			salaryMin: 26,
			salaryMax: 35,
			isHourly: true,
			location: "Georgetown",
			jobType: "Full-time",
			tags: [],
			createdAt: new Date(fourteenDaysAgo).toISOString(),
			description: "",
		},
		{
			id: "s13",
			title: "Teaching Assistant",
			company: { id: "21", name: "Round Rock ISD", logo: undefined },
			salaryMin: 14,
			salaryMax: 17,
			isHourly: true,
			location: "Round Rock",
			jobType: "Part-time",
			tags: [],
			createdAt: new Date(fourteenDaysAgo).toISOString(),
			description: "",
		},
	];

	const fallbackBusinesses: Business[] = [
		{
			id: "b1",
			name: "Baylor Scott & White",
			jobCount: 18,
			industry: "Healthcare",
		},
		{ id: "b2", name: "H-E-B", jobCount: 12, industry: "Retail" },
		{ id: "b3", name: "Leander ISD", jobCount: 24, industry: "Education" },
		{
			id: "b4",
			name: "Kalahari Resorts",
			jobCount: 8,
			industry: "Hospitality",
		},
		{
			id: "b5",
			name: "St. David's Healthcare",
			jobCount: 21,
			industry: "Healthcare",
		},
	];

	const displaySponsors = sponsors.length > 0 ? sponsors : fallbackSponsors;
	const availableCategories = Array.from(
		new Set(
			jobs
				.map((job) => job.category)
				.filter((category): category is string => Boolean(category)),
		),
	)
		.sort((a, b) => a.localeCompare(b))
		.map((category) => ({
			name: formatCategoryName(category),
			slug: category,
		}));

	// Filter function for location
	const filterJobsByLocation = (jobsList: Job[]): Job[] => {
		if (!selectedLocationKeywords) {
			return jobsList; // Show all jobs if no location selected
		}
		return jobsList.filter((job) => {
			if (!job.location) return false;
			const jobLocationLower = job.location.toLowerCase();
			return selectedLocationKeywords.some((keyword) =>
				jobLocationLower.includes(keyword.toLowerCase()),
			);
		});
	};

	const filterJobsByCategory = (jobsList: Job[]): Job[] => {
		if (!selectedCategory) {
			return jobsList;
		}

		return jobsList.filter(
			(job) =>
				String(job.category || "").toLowerCase() ===
				selectedCategory.toLowerCase(),
		);
	};

	// NEW: Filter function for search keywords
	const filterJobsBySearch = (jobsList: Job[]): Job[] => {
		if (!searchQuery) {
			return jobsList; // Show all jobs if no search query
		}

		const query = searchQuery.toLowerCase().trim();
		return jobsList.filter((job) => {
			const title = String(job.title || "").toLowerCase();
			const company = getCompanyName(job.company).toLowerCase();
			const location = String(job.location || "").toLowerCase();
			const description = String(job.description || "").toLowerCase();
			const jobType = String(job.jobType || "").toLowerCase();

			// Match if query appears in title, company, location, description, or job type
			return (
				title.includes(query) ||
				company.includes(query) ||
				location.includes(query) ||
				description.includes(query) ||
				jobType.includes(query)
			);
		});
	};

	// Show real Adzuna jobs if available, otherwise show fallback jobs
	const hasRealJobs = jobs.length > 0;
	const allPremiumJobs = hasRealJobs
		? jobs.slice(0, 2) // Top 2 real jobs as "premium"
		: fallbackPremiumJobs;
	const allFeaturedJobs = hasRealJobs
		? jobs.slice(2, 8) // Next 6 real jobs as "featured"
		: fallbackFeaturedJobs;
	const allStandardJobs = hasRealJobs
		? jobs // All real jobs (no limit for now)
		: fallbackStandardJobs;

	// Apply both location and search filters
	const filteredByLocation = filterJobsByLocation(allPremiumJobs);
	const filteredByCategory = filterJobsByCategory(filteredByLocation);
	const displayPremiumJobs = filterJobsBySearch(filteredByCategory);

	const filteredByLocation2 = filterJobsByLocation(allFeaturedJobs);
	const filteredByCategory2 = filterJobsByCategory(filteredByLocation2);
	const displayFeaturedJobs = filterJobsBySearch(filteredByCategory2);

	const filteredByLocation3 = filterJobsByLocation(allStandardJobs);
	const filteredByCategory3 = filterJobsByCategory(filteredByLocation3);
	const allFilteredStandardJobs = filterJobsBySearch(filteredByCategory3);

	// Pagination for standard jobs
	const currentPage = Math.max(1, parseInt(params.page || "1", 10));
	const totalJobs = allFilteredStandardJobs.length;
	const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
	const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
	const endIndex = startIndex + JOBS_PER_PAGE;
	const displayStandardJobs = allFilteredStandardJobs.slice(
		startIndex,
		endIndex,
	);

	const displayBusinesses =
		businesses.length > 0 ? businesses : fallbackBusinesses;

	const featuredCompanies = displayBusinesses.slice(0, 5);
	const spotlightBusiness = displayBusinesses[0];

	function getCompanyName(company: any): string {
		if (typeof company === "string") return company;
		if (company?.name) return company.name;
		return "Company";
	}

	function getCompanyInitials(company: any): string {
		const name = getCompanyName(company);
		return getInitials(name);
	}

	function getCompanyLogo(company: any): string {
		if (!company)
			return "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80";
		if (typeof company === "string")
			return "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80";
		return getImageUrl(company.logo);
	}

	return (
		<div className='jobs-page'>
			{/* DEVELOPER TOOL: Show ingestion trigger if no jobs */}
			{jobs.length === 0 && (
				<>
					<IngestionTrigger />
					<hr style={{ margin: "20px 0", borderColor: "#ccc" }} />
				</>
			)}

			{/* HERO */}
			<div className='jobs-hero'>
				{/* Sponsor Banner */}
				<div className='sponsor-banner'>
					<span className='sponsor-label'>Presented by</span>
					<div className='sponsor-divider' />
					<div className='sponsor-logo-box'>
						{getInitials(displaySponsors[0].name)}
					</div>
					<span className='sponsor-name'>
						{displaySponsors[0].name}
					</span>
				</div>

				<h1 className='jobs-hero-title'>
					WilCo Guide <span>Job Board</span>
				</h1>
				<p className='jobs-hero-sub'>
					The best place to find and post jobs across Williamson
					County
				</p>

				{/* SEARCH BAR COMPONENT */}
				<JobsSearchBar
					locations={locations}
					categories={availableCategories}
				/>
			</div>

			{/* PREMIUM JOBS */}
			<div className='jobs-section-header'>
				<h2 className='jobs-section-title'>Top Opportunities</h2>
			</div>
			{displayPremiumJobs.length > 0 ? (
				<div className='jobs-premium-jobs'>
					{displayPremiumJobs.map((job) => (
						<div
							key={job.id}
							className='jobs-premium-card jobs-glow-border'
							style={{ position: "relative" }}
							data-job-id={job.id}
						>
							<Link
								href={`/jobs/${job.id}`}
								aria-label={`View job: ${job.title}`}
								style={{
									position: "absolute",
									inset: 0,
									zIndex: 2,
									textDecoration: "none",
								}}
							/>
							<div className='jobs-premium-inner'>
								<div className='jobs-premium-logo'>
									<img
										src={getCompanyLogo(job.company)}
										alt={getCompanyName(job.company)}
									/>
								</div>
								<div className='jobs-premium-info'>
									<div className='jobs-premium-company'>
										{getCompanyName(job.company)}
									</div>
									<div className='jobs-premium-title'>
										{job.title}
									</div>
									<div className='jobs-premium-tags'>
										{job.tags && job.tags.length > 0 ? (
											job.tags.map((tag, idx) => (
												<span
													key={idx}
													className={`jobs-ptag ${
														tag.includes(
															"Full-time",
														)
															? "jobs-ptag-ft"
															: tag.includes(
																		"Benefit",
																  )
																? "jobs-ptag-bn"
																: "jobs-ptag-ur"
													}`}
												>
													{tag}
												</span>
											))
										) : (
											<span className='jobs-ptag jobs-ptag-ft'>
												Full-time
											</span>
										)}
									</div>
									<div className='jobs-premium-meta'>
										{job.location && (
											<span className='jobs-premium-meta-item'>
												📍 {job.location}
											</span>
										)}
										<span className='jobs-premium-meta-item'>
											📅{" "}
											{formatDate(
												job.postedAt || job.createdAt,
											)}
										</span>
									</div>
								</div>
								<div className='jobs-premium-right'>
									<div>
										<div className='jobs-premium-salary'>
											{formatSalary(
												job.salaryMin,
												job.salaryMax,
												job.isHourly,
											)}
										</div>
										<div className='jobs-premium-salary-sub'>
											{job.isHourly
												? "per hour"
												: "per year" +
													(job.salaryMax
														? " + signing bonus"
														: "")}
										</div>
									</div>
									{job.applicationUrl ? (
										<a
											href={job.applicationUrl}
											target='_blank'
											rel='noopener noreferrer'
											className='jobs-premium-apply'
											style={{
												textDecoration: "none",
												display: "inline-block",
												position: "relative",
												zIndex: 3,
											}}
										>
											Apply Now
										</a>
									) : (
										<button
											className='jobs-premium-apply'
											disabled
											style={{
												opacity: 0.6,
												cursor: "not-allowed",
												position: "relative",
												zIndex: 3,
											}}
										>
											Apply Now
										</button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div
					style={{
						padding: "40px 20px",
						textAlign: "center",
						color: "#666",
						fontSize: "16px",
					}}
				>
					No jobs found.
				</div>
			)}

			{/* FEATURED JOBS */}
			<div className='jobs-section-header'>
				<h2 className='jobs-section-title'>Featured Positions</h2>
				<span className='jobs-section-count'>
					{displayFeaturedJobs.length} featured
				</span>
			</div>
			{displayFeaturedJobs.length > 0 ? (
				<div className='jobs-featured-grid'>
					{displayFeaturedJobs.map((job) => (
						<div
							key={job.id}
							className='jobs-featured-card jobs-glow-border'
							style={{ position: "relative" }}
							data-job-id={job.id}
						>
							<Link
								href={`/jobs/${job.id}`}
								aria-label={`View job: ${job.title}`}
								style={{
									position: "absolute",
									inset: 0,
									zIndex: 2,
									textDecoration: "none",
								}}
							/>
							<div className='jobs-featured-inner'>
								<div className='jobs-featured-top'>
									<div className='jobs-featured-logo'>
										<img
											src={getCompanyLogo(job.company)}
											alt={getCompanyName(job.company)}
										/>
									</div>
									<div>
										<div className='jobs-featured-company'>
											{getCompanyName(job.company)}
										</div>
										<div className='jobs-featured-posted-sm'>
											{formatDate(
												job.postedAt || job.createdAt,
											)}
										</div>
									</div>
								</div>
								<div className='jobs-featured-jobtitle'>
									{job.title}
								</div>
								<div className='jobs-featured-tags'>
									{job.tags && job.tags.length > 0 ? (
										job.tags.slice(0, 2).map((tag, idx) => (
											<span
												key={idx}
												className={`jobs-ftag ${
													tag.includes("Full-time")
														? "jobs-ftag-ft"
														: tag.includes(
																	"Benefit",
															  )
															? "jobs-ftag-bn"
															: "jobs-ftag-pt"
												}`}
											>
												{tag}
											</span>
										))
									) : (
										<span className='jobs-ftag jobs-ftag-ft'>
											Full-time
										</span>
									)}
								</div>
								<div className='jobs-featured-meta'>
									{job.location && (
										<span className='jobs-featured-meta-item'>
											📍 {job.location}
										</span>
									)}
								</div>
								<div className='jobs-featured-bottom'>
									<span className='jobs-featured-salary'>
										{formatSalary(
											job.salaryMin,
											job.salaryMax,
											job.isHourly,
										)}
									</span>
									{job.applicationUrl ? (
										<a
											href={job.applicationUrl}
											target='_blank'
											rel='noopener noreferrer'
											className='jobs-featured-apply-btn'
											style={{
												textDecoration: "none",
												position: "relative",
												zIndex: 3,
											}}
										>
											Apply
										</a>
									) : (
										<button
											className='jobs-featured-apply-btn'
											disabled
											style={{
												opacity: 0.6,
												cursor: "not-allowed",
												position: "relative",
												zIndex: 3,
											}}
										>
											Apply
										</button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div
					style={{
						padding: "40px 20px",
						textAlign: "center",
						color: "#666",
						fontSize: "16px",
					}}
				>
					No jobs found.
				</div>
			)}

			{/* TWO-COLUMN: STANDARD LISTINGS + SIDEBAR */}
			<div className='jobs-section-header'>
				<h2 className='jobs-section-title'>All Open Positions</h2>
				<span className='jobs-section-count'>{totalJobs} jobs</span>
			</div>
			{displayStandardJobs.length > 0 ? (
				<div className='jobs-listings-layout'>
					<div>
						<div className='jobs-standard-list'>
							{displayStandardJobs.map((job) => (
								<div
									key={job.id}
									className='jobs-standard-row'
									style={{ position: "relative" }}
									data-job-id={job.id}
								>
									<Link
										href={`/jobs/${job.id}`}
										aria-label={`View job: ${job.title}`}
										style={{
											position: "absolute",
											inset: 0,
											zIndex: 2,
											textDecoration: "none",
										}}
									/>
									<div className='jobs-standard-logo'>
										{getCompanyInitials(job.company)}
									</div>
									<div className='jobs-standard-info'>
										<div className='jobs-standard-title'>
											{job.title}
										</div>
										<div className='jobs-standard-company-row'>
											<span>
												{getCompanyName(job.company)}
											</span>
											{job.location && (
												<span>📍 {job.location}</span>
											)}
										</div>
									</div>
									<span
										className={`jobs-standard-type ${job.jobType === "Part-time" ? "jobs-ftag-pt" : "jobs-ftag-ft"}`}
									>
										{job.jobType || "Full-time"}
									</span>
									<span className='jobs-standard-salary'>
										{formatSalary(
											job.salaryMin,
											job.salaryMax,
											job.isHourly,
										)}
									</span>
									<span className='jobs-standard-date'>
										{formatDate(
											job.postedAt || job.createdAt,
										)}
									</span>
									{job.applicationUrl ? (
										<a
											href={job.applicationUrl}
											target='_blank'
											rel='noopener noreferrer'
											className='jobs-standard-apply'
											style={{
												textDecoration: "none",
												position: "relative",
												zIndex: 3,
											}}
										>
											Apply
										</a>
									) : (
										<button
											className='jobs-standard-apply'
											disabled
											style={{
												opacity: 0.6,
												cursor: "not-allowed",
												position: "relative",
												zIndex: 3,
											}}
										>
											Apply
										</button>
									)}
								</div>
							))}
						</div>
						{/* Pagination Controls */}
						{totalPages > 1 && (
							<div className='jobs-pagination'>
								{/* Previous Button */}
								<div className='jobs-pagination-left'>
									{currentPage > 1 ? (
										<Link
											href={`/jobs?${new URLSearchParams({
												...(params.location && {
													location: params.location,
												}),
												...(params.search && {
													search: params.search,
												}),
												...(params.category && {
													category: params.category,
												}),
												page: String(currentPage - 1),
											}).toString()}`}
											className='jobs-pagination-btn jobs-pagination-prev'
										>
											← Previous
										</Link>
									) : (
										<button
											className='jobs-pagination-btn jobs-pagination-disabled'
											disabled
										>
											← Previous
										</button>
									)}
								</div>

								{/* Page Numbers */}
								<div className='jobs-pagination-center'>
									{/* <div className='jobs-pagination-info'>
										Showing {startIndex + 1}-
										{Math.min(endIndex, totalJobs)} of{" "}
										{totalJobs} jobs
									</div> */}
									<div className='jobs-pagination-numbers'>
										{(() => {
											const pages: (number | string)[] =
												[];
											const showPages = 5; // Show first 5 pages
											const endPages = 4; // Show last 4 pages

											if (totalPages <= 10) {
												// Show all pages if total is 10 or less
												for (
													let i = 1;
													i <= totalPages;
													i++
												) {
													pages.push(i);
												}
											} else {
												// Show first pages
												for (
													let i = 1;
													i <= showPages;
													i++
												) {
													pages.push(i);
												}

												// Add ellipsis
												pages.push("ellipsis1");

												// Show last pages
												for (
													let i =
														totalPages -
														endPages +
														1;
													i <= totalPages;
													i++
												) {
													pages.push(i);
												}
											}

											return pages.map((page, idx) => {
												if (typeof page === "string") {
													return (
														<span
															key={page}
															className='jobs-pagination-ellipsis'
														>
															...
														</span>
													);
												}

												return (
													<Link
														key={page}
														href={`/jobs?${new URLSearchParams(
															{
																...(params.location && {
																	location:
																		params.location,
																}),
																...(params.search && {
																	search: params.search,
																}),
																...(params.category && {
																	category:
																		params.category,
																}),
																page: String(
																	page,
																),
															},
														).toString()}`}
														className={`jobs-pagination-number ${page === currentPage ? "jobs-pagination-active" : ""}`}
													>
														{page}
													</Link>
												);
											});
										})()}
									</div>
								</div>

								{/* Next Button */}
								<div className='jobs-pagination-right'>
									{currentPage < totalPages ? (
										<Link
											href={`/jobs?${new URLSearchParams({
												...(params.location && {
													location: params.location,
												}),
												...(params.search && {
													search: params.search,
												}),
												...(params.category && {
													category: params.category,
												}),
												page: String(currentPage + 1),
											}).toString()}`}
											className='jobs-pagination-btn jobs-pagination-next'
										>
											Next →
										</Link>
									) : (
										<button
											className='jobs-pagination-btn jobs-pagination-disabled'
											disabled
										>
											Next →
										</button>
									)}
								</div>
							</div>
						)}
					</div>

					{/* SIDEBAR */}
					<div className='jobs-sidebar'>
						{/* Featured Companies */}
						<div className='jobs-sidebar-widget-dark'>
							<div className='jobs-sidebar-widget-title'>
								Featured Companies{" "}
								<span className='jobs-sidebar-sponsored'>
									Sponsored
								</span>
							</div>
							{featuredCompanies.map((business) => (
								<div
									key={business.id}
									className='jobs-sidebar-company'
								>
									<div className='jobs-sidebar-co-logo'>
										{getInitials(business.name)}
									</div>
									<div>
										<div className='jobs-sidebar-co-name'>
											{business.name}
										</div>
										<div className='jobs-sidebar-co-count'>
											{business.jobCount || 0} open jobs
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Spotlight Job */}
						<div className='jobs-sidebar-widget'>
							<div className='jobs-sidebar-widget-title'>
								Spotlight{" "}
								<span className='jobs-sidebar-sponsored'>
									Sponsored
								</span>
							</div>
							<div className='jobs-sidebar-featured-job'>
								<div className='jobs-sfj-company'>
									{spotlightBusiness?.name ||
										"Featured Company"}
								</div>
								<div className='jobs-sfj-title'>
									Medical Assistant — Primary Care
								</div>
								<div className='jobs-sfj-meta'>
									📍 Round Rock · Full-time
								</div>
								<div className='jobs-sfj-salary'>
									$36,000 – $44,000/yr
								</div>
								<button className='jobs-sfj-apply'>
									Apply Now
								</button>
							</div>
						</div>

						{/* Newsletter */}
						<div className='jobs-sidebar-widget jobs-sidebar-newsletter'>
							<div className='jobs-sidebar-newsletter-icon'>
								📬
							</div>
							<div className='jobs-sidebar-newsletter-title'>
								Get jobs in your inbox
							</div>
							<div className='jobs-sidebar-newsletter-sub'>
								New local jobs delivered every week with the
								WilCo Guide newsletter
							</div>
							<button className='jobs-sidebar-newsletter-btn'>
								Subscribe Free
							</button>
						</div>

						{/* Post Job */}
						<div className='jobs-sidebar-post-cta'>
							<div className='jobs-sidebar-post-title'>
								Hiring locally?
							</div>
							<div className='jobs-sidebar-post-sub'>
								Post your job for free and reach 15,000+ WilCo
								residents
							</div>
							<button className='jobs-sidebar-post-btn'>
								Post a Job Free
							</button>
						</div>
					</div>
				</div>
			) : (
				<div
					style={{
						padding: "40px 20px",
						textAlign: "center",
						color: "#666",
						fontSize: "16px",
					}}
				>
					No jobs found.
				</div>
			)}

			{/* COMPANIES TO WATCH (bottom) */}
			<div className='jobs-companies-section'>
				<div className='jobs-companies-header'>
					<h2 className='jobs-companies-title'>
						Companies to Watch in WilCo
					</h2>
					<span className='jobs-companies-label'>Sponsored</span>
				</div>
				<div className='jobs-companies-watch-grid'>
					{displayBusinesses.slice(0, 4).map((business) => (
						<div
							key={business.id}
							className='jobs-company-watch-card'
						>
							<div className='jobs-cwc-logo'>
								{getInitials(business.name)}
							</div>
							<div className='jobs-cwc-name'>{business.name}</div>
							<div className='jobs-cwc-industry'>
								{business.industry || "Industry"} ·{" "}
								{business.id}
							</div>
							<span className='jobs-cwc-jobs'>
								{business.jobCount || 0} open jobs →
							</span>
						</div>
					))}
				</div>
			</div>

			{/* BOTTOM CTA */}
			<div className='jobs-post-job-cta'>
				<div>
					<div className='jobs-post-job-cta-title'>
						Hiring? Get in front of 15,000+ locals.
					</div>
					<div className='jobs-post-job-cta-sub'>
						Post your job for free — or feature it to reach more
						candidates faster.
					</div>
				</div>
				<button className='jobs-post-job-cta-btn'>
					Post a Job Free
				</button>
			</div>
		</div>
	);
}
