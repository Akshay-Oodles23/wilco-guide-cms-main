/**
 * Adzuna Jobs API client for US job search.
 * Docs: https://developer.adzuna.com/docs/search
 */

const ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs";

export interface AdzunaLocation {
	__CLASS__?: string;
	area?: string[];
	display_name?: string;
}

export interface AdzunaCategory {
	__CLASS__?: string;
	label?: string;
	tag?: string;
}

export interface AdzunaCompany {
	__CLASS__?: string;
	display_name?: string;
}

export interface AdzunaJob {
	__CLASS__?: string;
	id: string;
	title: string;
	description?: string;
	created?: string;
	redirect_url?: string;
	salary_min?: number;
	salary_max?: number;
	salary_is_predicted?: number;
	location?: AdzunaLocation;
	category?: AdzunaCategory;
	company?: AdzunaCompany;
	contract_type?: string;
	contract_time?: string;
}

export interface AdzunaSearchResponse {
	__CLASS__?: string;
	results?: AdzunaJob[];
	count?: number;
}

const COUNTRY_US = "us";

export type AdzunaCountry =
	| "us"
	| "gb"
	| "au"
	| "de"
	| "fr"
	| "in"
	| "br"
	| "pl"
	| "nl"
	| "ru"
	| "es"
	| "it"
	| "mx"
	| "za";

/**
 * Fetch job listings from Adzuna API.
 * @param appId - ADZUNA_APP_ID
 * @param appKey - ADZUNA_API_KEY
 * @param options - what (keywords), where (location), page, resultsPerPage
 */
export async function fetchAdzunaJobs(
	appId: string,
	appKey: string,
	options: {
		what?: string;
		where?: string;
		page?: number;
		resultsPerPage?: number;
		country?: AdzunaCountry;
	} = {},
): Promise<AdzunaJob[]> {
	const {
		what = "",
		where = "texas",
		page = 1,
		resultsPerPage = 50,
		country = COUNTRY_US,
	} = options;

	const params = new URLSearchParams({
		app_id: appId,
		app_key: appKey,
		results_per_page: String(resultsPerPage),
	});
	if (what) params.set("what", what);
	if (where) params.set("where", where);

	const url = `${ADZUNA_BASE}/${country}/search/${page}?${params.toString()}`;
	console.log(`   📡 API URL: ${url}`);

	const res = await fetch(url, {
		next: { revalidate: 0 },
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Adzuna API error ${res.status}: ${text}`);
	}

	const data = (await res.json()) as AdzunaSearchResponse;
	return data.results ?? [];
}

/**
 * Fetch multiple pages of results (e.g. 5 pages x 50 = up to 250 Texas jobs).
 */
export async function fetchAdzunaJobsMultiPage(
	appId: string,
	appKey: string,
	options: {
		what?: string;
		where?: string;
		maxPages?: number;
		resultsPerPage?: number;
		country?: AdzunaCountry;
	} = {},
): Promise<AdzunaJob[]> {
	const maxPages = options.maxPages ?? 5;
	const resultsPerPage = options.resultsPerPage ?? 50;
	const all: AdzunaJob[] = [];
	const seen = new Set<string>();

	for (let page = 1; page <= maxPages; page++) {
		const batch = await fetchAdzunaJobs(appId, appKey, {
			...options,
			page,
			resultsPerPage,
		});
		for (const job of batch) {
			if (job.id && !seen.has(job.id)) {
				seen.add(job.id);
				all.push(job);
			}
		}
		if (batch.length < resultsPerPage) break;
	}

	return all;
}
