/**
 * Adzuna → Payload jobs ingestion.
 * Fetches jobs from Adzuna API for Texas and upserts into jobs collection.
 */

import { getPayload } from "payload";
import config from "@payload-config";
import { fetchAdzunaJobsMultiPage, type AdzunaJob } from "@/lib/adzuna";
import { plainTextToLexical } from "@/lib/lexical";

const WILCO_FRANCHISE_ID = "wilco";
const ADZUNA_SOURCE_ID = "adzuna-api";

const CITY_MAP: Record<string, string> = {
	georgetown: "georgetown",
	"round rock": "round-rock",
	"round rock, tx": "round-rock",
	"cedar park": "cedar-park",
	leander: "leander",
	"liberty hill": "liberty-hill",
	hutto: "hutto",
	taylor: "taylor",
	jarrell: "jarrell",
	florence: "florence",
	austin: "austin",
	"san antonio": "san-antonio",
	houston: "houston",
	dallas: "dallas",
	"fort worth": "fort-worth",
	"el paso": "el-paso",
	arlington: "arlington",
	"corpus christi": "corpus-christi",
	lubbock: "lubbock",
	plano: "plano",
};

function cleanJobTitle(rawTitle?: string): string {
	const title = (rawTitle || "").trim();
	if (!title) return "Untitled Role";

	// Remove bracket/pipe suffix noise often appended by feeds
	let cleaned = title
		.replace(
			/\s*[|•·]\s*(?:\$?\d[\d,.kK\s\/-]*|remote|hybrid|on[-\s]?site|tx|texas|usa|us|expires?.*)$/i,
			"",
		)
		.replace(
			/\s*[-–—]\s*(?:\$?\d[\d,.kK\s\/-]*|remote|hybrid|on[-\s]?site|[a-z\s]+,\s*tx|expires?.*)$/i,
			"",
		)
		.replace(
			/\s*\((?:remote|hybrid|on[-\s]?site|[a-z\s]+,\s*tx|\$?\d[\d,.kK\s\/-]*)\)\s*$/i,
			"",
		)
		.replace(/\s*\b(?:expires?|apply by|closing date)\b.*$/i, "")
		.replace(/\s+/g, " ")
		.trim();

	// If we removed too much, safely fall back to first useful segment.
	if (cleaned.length < 3) {
		cleaned = title.split(/[|•·]/)[0]?.trim() || title;
	}

	return cleaned.slice(0, 255);
}

function inferCity(displayName?: string, area?: string[]): string | undefined {
	const raw = [displayName, ...(area || [])].join(" ").toLowerCase();
	for (const [key, value] of Object.entries(CITY_MAP)) {
		if (raw.includes(key)) return value;
	}
	return undefined;
}

function inferWorkMode(description?: string): "Remote" | "Hybrid" | "On-site" {
	const text = (description || "").toLowerCase();
	if (text.includes("hybrid")) return "Hybrid";
	if (text.includes("remote") || text.includes("work from home"))
		return "Remote";
	return "On-site";
}

function inferUrgent(title?: string, description?: string): boolean {
	const text = `${title || ""} ${description || ""}`.toLowerCase();
	return (
		text.includes("urgent") ||
		text.includes("immediate start") ||
		text.includes("asap") ||
		text.includes("hiring now")
	);
}

function buildTags(input: {
	employmentType: "full-time" | "part-time" | "contract" | "internship";
	description?: string;
	urgent: boolean;
	workMode: "Remote" | "Hybrid" | "On-site";
}): string[] {
	const tags = new Set<string>();
	const text = (input.description || "").toLowerCase();

	if (input.employmentType === "full-time") tags.add("Full-time");
	if (input.employmentType === "part-time") tags.add("Part-time");
	if (input.employmentType === "contract") tags.add("Contract");
	if (input.employmentType === "internship") tags.add("Internship");

	if (
		text.includes("benefits") ||
		text.includes("health insurance") ||
		text.includes("medical") ||
		text.includes("dental") ||
		text.includes("401k")
	) {
		tags.add("Full Benefits");
	}

	if (input.urgent) tags.add("Urgent Hire");
	if (input.workMode === "Remote") tags.add("Remote");
	if (input.workMode === "Hybrid") tags.add("Hybrid");

	return Array.from(tags);
}

function mapEmploymentType(
	contractTime?: string,
	contractType?: string,
): "full-time" | "part-time" | "contract" | "internship" {
	const t = (contractTime || "").toLowerCase();
	const p = (contractType || "").toLowerCase();
	if (t.includes("full") || p === "permanent") return "full-time";
	if (t.includes("part")) return "part-time";
	if (
		t.includes("contract") ||
		p.includes("contract") ||
		p.includes("freelance")
	)
		return "contract";
	if (t.includes("intern") || p.includes("intern")) return "internship";
	return "full-time";
}

function mapCategory(input: {
	adzunaLabel?: string;
	tag?: string;
	title?: string;
	description?: string;
}): string {
	const blob = [input.adzunaLabel, input.tag, input.title, input.description]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();

	const score = (keywords: string[]): number =>
		keywords.reduce((acc, k) => (blob.includes(k) ? acc + 1 : acc), 0);

	const ranked: Array<{ category: string; score: number }> = [
		{
			category: "technology",
			score: score([
				"software",
				"engineer",
				"developer",
				"it ",
				"tech",
				"data",
				"cyber",
			]),
		},
		{
			category: "healthcare",
			score: score([
				"healthcare",
				"nurse",
				"rn",
				"clinical",
				"hospital",
				"medical",
				"physician",
			]),
		},
		{
			category: "education",
			score: score([
				"teacher",
				"education",
				"school",
				"faculty",
				"professor",
				"instructor",
			]),
		},
		{
			category: "retail",
			score: score([
				"retail",
				"store",
				"cashier",
				"merchandise",
				"customer service",
			]),
		},
		{
			category: "food-hospitality",
			score: score([
				"restaurant",
				"hospitality",
				"server",
				"cook",
				"barista",
				"hotel",
			]),
		},
		{
			category: "construction-trades",
			score: score([
				"construction",
				"electrician",
				"plumber",
				"hvac",
				"trade",
				"welder",
			]),
		},
		{
			category: "professional-services",
			score: score([
				"project manager",
				"consultant",
				"operations",
				"analyst",
				"administrative",
			]),
		},
		{
			category: "government",
			score: score([
				"government",
				"county",
				"city of",
				"public sector",
				"state of",
			]),
		},
		{
			category: "nonprofit",
			score: score([
				"nonprofit",
				"non-profit",
				"charity",
				"foundation",
				"ngo",
			]),
		},
		{
			category: "manufacturing",
			score: score([
				"manufacturing",
				"production",
				"assembly",
				"plant",
				"machinist",
			]),
		},
		{
			category: "transportation",
			score: score([
				"transport",
				"logistics",
				"delivery",
				"driver",
				"warehouse",
				"cdl",
			]),
		},
		{
			category: "real-estate",
			score: score([
				"real estate",
				"property management",
				"leasing",
				"realtor",
			]),
		},
		{
			category: "finance",
			score: score([
				"finance",
				"accounting",
				"bookkeeper",
				"controller",
				"tax",
				"auditor",
			]),
		},
	];

	ranked.sort((a, b) => b.score - a.score);
	return ranked[0].score > 0 ? ranked[0].category : "other";
}

function slugify(title: string, id: string): string {
	const base = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
	return base ? `${base}-${id.slice(-6)}` : `job-${id}`;
}

export interface IngestAdzunaJobsOptions {
	/** Override env; if not set uses process.env.ADZUNA_APP_ID / ADZUNA_API_KEY */
	appId?: string;
	appKey?: string;
	/** Keyword search for Adzuna (e.g., "technology", "nursing", "sales") */
	what?: string;
	/** Location query for Adzuna (default: texas) */
	where?: string;
	maxPages?: number;
	resultsPerPage?: number;
	/** Franchise document id (optional; resolved from franchiseId if not provided) */
	franchiseId?: string;
}

export interface IngestAdzunaJobsResult {
	created: number;
	updated: number;
	skipped: number;
	errors: string[];
}

export async function ingestAdzunaJobs(
	options: IngestAdzunaJobsOptions = {},
): Promise<IngestAdzunaJobsResult> {
	console.log("\n" + "=".repeat(80));
	console.log("🔵 STARTING ADZUNA JOB INGESTION");
	console.log("=".repeat(80));

	const appId = options.appId ?? process.env.ADZUNA_APP_ID;
	const appKey = options.appKey ?? process.env.ADZUNA_API_KEY;
	if (!appId || !appKey) {
		console.error("❌ Missing API credentials");
		return {
			created: 0,
			updated: 0,
			skipped: 0,
			errors: ["Missing ADZUNA_APP_ID or ADZUNA_API_KEY"],
		};
	}
	console.log("✅ Step 1: API credentials found");

	const payload = await getPayload({ config });
	console.log("✅ Step 2: Connected to Payload CMS");

	// Resolve franchise (WilCo)
	console.log('🔍 Step 3: Looking for "wilco" franchise in database...');
	const franchiseResult = await payload.find({
		collection: "franchises",
		where: {
			franchiseId: { equals: options.franchiseId ?? WILCO_FRANCHISE_ID },
		},
		limit: 1,
		overrideAccess: true,
	});
	const franchiseDoc = franchiseResult.docs[0];
	if (!franchiseDoc?.id) {
		console.error("❌ Franchise not found in database");
		return {
			created: 0,
			updated: 0,
			skipped: 0,
			errors: [
				'Franchise "wilco" not found. Create it in Payload admin.',
			],
		};
	}
	console.log(`✅ Step 3: Found franchise: ${franchiseDoc.id}`);

	console.log(
		"🔍 Step 3.1: Loading locations for city relationship mapping...",
	);
	const locationResult = await payload.find({
		collection: "locations",
		limit: 300,
		overrideAccess: true,
	});
	const locationSlugToId = new Map<string, string>();
	for (const loc of locationResult.docs as any[]) {
		if (loc?.slug && loc?.id) {
			locationSlugToId.set(
				String(loc.slug).toLowerCase(),
				String(loc.id),
			);
		}
	}
	console.log(`✅ Step 3.1: Loaded ${locationSlugToId.size} locations`);

	const result: IngestAdzunaJobsResult = {
		created: 0,
		updated: 0,
		skipped: 0,
		errors: [],
	};

	let jobs: AdzunaJob[] = [];
	try {
		const where = options.where ?? "texas";
		const what = options.what ?? "";
		console.log(
			`🌐 Step 4: Calling Adzuna API for location: "${where}"${what ? ` with keyword: "${what}"` : ""}...`,
		);
		jobs = await fetchAdzunaJobsMultiPage(appId, appKey, {
			what,
			where,
			maxPages: options.maxPages ?? 5,
			resultsPerPage: options.resultsPerPage ?? 50,
			country: "us",
		});
		console.log(`✅ Step 4: Got ${jobs.length} jobs from Adzuna API`);
		if (jobs.length === 0) {
			console.warn("⚠️  WARNING: No jobs returned from Adzuna API");
			result.errors.push("No jobs returned from Adzuna API");
		}
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error(`❌ Adzuna API error: ${msg}`);
		result.errors.push(`Adzuna fetch failed: ${msg}`);
		return result;
	}

	let processedCount = 0;
	let skippedNoId = 0;
	let skippedNoCity = 0;

	for (const ad of jobs) {
		if (!ad.id || !ad.title) {
			skippedNoId++;
			result.skipped += 1;
			continue;
		}

		const companyName = ad.company?.display_name ?? "Unknown Company";
		const cleanTitle = cleanJobTitle(ad.title);
		const slug = slugify(cleanTitle, ad.id);
		const dedupeHash = `adzuna-${ad.id}`;
		const descriptionLexical = plainTextToLexical(ad.description ?? "");
		const employmentType = mapEmploymentType(
			ad.contract_time,
			ad.contract_type,
		);
		const category = mapCategory({
			adzunaLabel: ad.category?.label,
			tag: ad.category?.tag,
			title: cleanTitle,
			description: ad.description,
		});
		const citySlug = inferCity(
			ad.location?.display_name,
			ad.location?.area,
		);
		const cityId = citySlug ? locationSlugToId.get(citySlug) : undefined;
		const cityIdNumber = cityId ? parseInt(cityId, 10) : undefined;
		const workMode = inferWorkMode(ad.description);
		const urgent = inferUrgent(ad.title, ad.description);
		const tags = buildTags({
			employmentType,
			description: ad.description,
			urgent,
			workMode,
		}).map((label) => ({ label }));

		const jobPayload = {
			franchise: franchiseDoc.id,
			title: cleanTitle,
			slug,
			company: companyName,
			description: descriptionLexical,
			salary: {
				min: ad.salary_min ?? undefined,
				max: ad.salary_max ?? undefined,
				type:
					ad.salary_min != null || ad.salary_max != null
						? ("salary" as const)
						: ("not-specified" as const),
			},
			employmentType,
			location: {
				city: cityIdNumber,
				remote: workMode === "Remote",
			},
			applicationUrl: ad.redirect_url ?? undefined,
			category,
			workMode,
			urgent,
			tags,
			featured: false,
			status: "active" as const,
			postedAt: ad.created
				? new Date(ad.created).toISOString()
				: new Date().toISOString(),
			dedupeHash,
			provenance: {
				source: ADZUNA_SOURCE_ID,
				sourceUrl: ad.redirect_url ?? undefined,
				sourceId: ad.id,
				ingestedAt: new Date().toISOString(),
				syncStatus: "synced" as const,
			},
		};

		if (!jobPayload.location.city) {
			const locDisplay = ad.location?.display_name ?? "unknown";
			console.log(
				`   ⏭️  Skipping job "${ad.title}" - unrecognized city: "${locDisplay}" (inferred: "${citySlug || "none"}")`,
			);
			skippedNoCity++;
			result.skipped += 1;
			continue;
		}

		try {
			const existing = await payload.find({
				collection: "jobs",
				where: {
					or: [
						{ "provenance.sourceId": { equals: ad.id } },
						{ dedupeHash: { equals: dedupeHash } },
					],
				},
				limit: 1,
				overrideAccess: true,
			});

			if (existing.docs.length > 0) {
				await payload.update({
					collection: "jobs",
					id: existing.docs[0].id,
					data: jobPayload as any,
					overrideAccess: true,
				});
				result.updated += 1;
			} else {
				await payload.create({
					collection: "jobs",
					data: jobPayload as any,
					overrideAccess: true,
				});
				result.created += 1;
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			result.errors.push(`Job ${ad.id} (${ad.title}): ${msg}`);
		}

		processedCount += 1;
	}

	console.log(`\n📊 Step 5: Database save complete!`);
	console.log(`   Total jobs processed: ${processedCount}`);
	console.log(`   ✅ Created: ${result.created}`);
	console.log(`   🔄 Updated: ${result.updated}`);
	console.log(`   ⏭️  Skipped: ${result.skipped}`);
	console.log(`      - No ID/Title: ${skippedNoId}`);
	console.log(`      - Unrecognized city: ${skippedNoCity}`);
	if (result.errors.length > 0) {
		console.log(`   ❌ Errors: ${result.errors.length}`);
		result.errors.forEach((e) => console.error(`      - ${e}`));
	}
	console.log("=".repeat(80));
	console.log("✅ INGESTION COMPLETE\n");

	return result;
}
