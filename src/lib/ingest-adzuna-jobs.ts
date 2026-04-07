/**
 * Adzuna → Payload jobs ingestion.
 * Fetches jobs from Adzuna API for Williamson County area and upserts into jobs collection.
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
	austin: "round-rock", // treat Austin area as Round Rock for simplicity
};

function inferCity(displayName?: string, area?: string[]): string | undefined {
	const raw = [displayName, ...(area || [])].join(" ").toLowerCase();
	for (const [key, value] of Object.entries(CITY_MAP)) {
		if (raw.includes(key)) return value;
	}
	return undefined;
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

function mapCategory(adzunaLabel?: string, tag?: string): string {
	const l = (adzunaLabel || "").toLowerCase();
	const t = (tag || "").toLowerCase();
	if (l.includes("it") || l.includes("tech") || t.includes("it"))
		return "technology";
	if (l.includes("health") || l.includes("care") || t.includes("health"))
		return "healthcare";
	if (
		l.includes("teach") ||
		l.includes("education") ||
		t.includes("education")
	)
		return "education";
	if (l.includes("retail") || t.includes("retail")) return "retail";
	if (
		l.includes("hospitality") ||
		l.includes("food") ||
		t.includes("hospitality")
	)
		return "food-hospitality";
	if (
		l.includes("construction") ||
		l.includes("trade") ||
		t.includes("construction")
	)
		return "construction-trades";
	if (l.includes("government") || t.includes("government"))
		return "government";
	if (l.includes("nonprofit") || t.includes("charity")) return "nonprofit";
	if (l.includes("manufacturing") || t.includes("manufacturing"))
		return "manufacturing";
	if (l.includes("transport") || t.includes("logistics"))
		return "transportation";
	if (l.includes("real estate") || t.includes("property"))
		return "real-estate";
	if (l.includes("account") || l.includes("finance") || t.includes("finance"))
		return "finance";
	return "other";
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
	/** Location query for Adzuna (default: round rock tx for Williamson County) */
	where?: string;
	maxPages?: number;
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

	const result: IngestAdzunaJobsResult = {
		created: 0,
		updated: 0,
		skipped: 0,
		errors: [],
	};

	let jobs: AdzunaJob[] = [];
	try {
		const where = options.where ?? "round rock tx";
		console.log(
			`🌐 Step 4: Calling Adzuna API for location: "${where}"...`,
		);
		jobs = await fetchAdzunaJobsMultiPage(appId, appKey, {
			where,
			maxPages: options.maxPages ?? 3,
			resultsPerPage: 20,
			country: "us",
		});
		console.log(`✅ Step 4: Got ${jobs.length} jobs from Adzuna API`);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error(`❌ Adzuna API error: ${msg}`);
		result.errors.push(`Adzuna fetch failed: ${msg}`);
		return result;
	}

	for (const ad of jobs) {
		if (!ad.id || !ad.title) {
			result.skipped += 1;
			continue;
		}

		const companyName = ad.company?.display_name ?? "Unknown Company";
		const slug = slugify(ad.title, ad.id);
		const dedupeHash = `adzuna-${ad.id}`;
		const descriptionLexical = plainTextToLexical(ad.description ?? "");
		const employmentType = mapEmploymentType(
			ad.contract_time,
			ad.contract_type,
		);
		const category = mapCategory(ad.category?.label, ad.category?.tag);
		const city = inferCity(ad.location?.display_name, ad.location?.area);

		const jobPayload = {
			franchise: franchiseDoc.id,
			title: ad.title.slice(0, 255),
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
				city: city ?? undefined,
				state: "TX",
				remote: false,
			},
			applicationUrl: ad.redirect_url ?? undefined,
			category,
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
	}

	console.log(`\n📊 Step 5: Database save complete!`);
	console.log(`   ✅ Created: ${result.created}`);
	console.log(`   🔄 Updated: ${result.updated}`);
	console.log(`   ⏭️  Skipped: ${result.skipped}`);
	if (result.errors.length > 0) {
		console.log(`   ❌ Errors: ${result.errors.length}`);
		result.errors.forEach((e) => console.error(`      - ${e}`));
	}
	console.log("=".repeat(80));
	console.log("✅ INGESTION COMPLETE\n");

	return result;
}
