import { NextResponse } from "next/server";
import { ingestAdzunaJobs } from "@/lib/ingest-adzuna-jobs";

const DEFAULT_KEYWORDS = [
	"software",
	"teacher",
	"retail",
	"construction",
	"logistics",
	"finance",
	"nursing",
];

/**
 * POST /api/ingest/jobs/adzuna
 * Triggers Adzuna job ingestion for Texas.
 * Optional: pass JSON body { where?: string, maxPages?: number, resultsPerPage?: number } to customize.
 *
 * Protection: set INGEST_SECRET in .env.local and send header:
 *   x-ingest-secret: <your-secret>
 * If INGEST_SECRET is not set, ingestion is only allowed in development.
 */
export async function POST(request: Request) {
	const ingestSecret = process.env.INGEST_SECRET;
	const isDev = process.env.NODE_ENV === "development";

	if (ingestSecret) {
		const headerSecret = request.headers.get("x-ingest-secret");
		if (headerSecret !== ingestSecret) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}
	} else if (!isDev) {
		return NextResponse.json(
			{ error: "Set INGEST_SECRET in production to enable ingestion" },
			{ status: 403 },
		);
	}

	let body: {
		where?: string;
		what?: string;
		maxPages?: number;
		resultsPerPage?: number;
		keywords?: string[];
	} = {};
	try {
		const text = await request.text();
		if (text) body = JSON.parse(text);
	} catch {
		// ignore
	}

	try {
		const keywordsToUse =
			body.keywords && body.keywords.length > 0
				? body.keywords
				: !body.what
					? DEFAULT_KEYWORDS
					: [];

		// If keywords are provided, ingest multiple keyword searches
		if (keywordsToUse.length > 0) {
			let totalCreated = 0;
			let totalUpdated = 0;
			let totalSkipped = 0;
			const allErrors: string[] = [];

			for (const keyword of keywordsToUse) {
				console.log(
					`\n📌 Searching for "${keyword}" jobs in ${body.where ?? "texas"}...`,
				);
				const result = await ingestAdzunaJobs({
					where: body.where ?? "texas",
					what: keyword,
					maxPages: body.maxPages ?? 3,
					resultsPerPage: body.resultsPerPage ?? 50,
				});
				totalCreated += result.created;
				totalUpdated += result.updated;
				totalSkipped += result.skipped;
				allErrors.push(...result.errors);
			}

			return NextResponse.json({
				ok: true,
				created: totalCreated,
				updated: totalUpdated,
				skipped: totalSkipped,
				errors: allErrors.length ? allErrors : undefined,
				message: `Searched ${keywordsToUse.length} keywords`,
			});
		}

		// Single search
		const result = await ingestAdzunaJobs({
			where: body.where ?? "texas",
			what: body.what,
			maxPages: body.maxPages ?? 5,
			resultsPerPage: body.resultsPerPage ?? 50,
		});
		return NextResponse.json({
			ok: true,
			created: result.created,
			updated: result.updated,
			skipped: result.skipped,
			errors: result.errors.length ? result.errors : undefined,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("[ingest-adzuna]", message);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
