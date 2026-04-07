/**
 * Simple function to trigger Adzuna job ingestion
 * Call this from an API route or client-side
 * Usage: await triggerAdzunaIngestion()
 */

export async function triggerAdzunaIngestion(options?: {
	where?: string;
	maxPages?: number;
}) {
	try {
		console.log("🚀 Starting Adzuna job ingestion...");

		const response = await fetch("/api/ingest/jobs/adzuna", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				where: options?.where || "round rock tx",
				maxPages: options?.maxPages || 3,
			}),
		});

		const data = await response.json();

		if (data.ok) {
			console.log("✅ Ingestion successful!");
			console.log(`   Created: ${data.created}`);
			console.log(`   Updated: ${data.updated}`);
			console.log(`   Skipped: ${data.skipped}`);
			if (data.errors?.length) {
				console.warn("   Errors:", data.errors);
			}
		} else {
			console.error("❌ Ingestion failed:", data.error);
		}

		return data;
	} catch (error) {
		console.error("❌ Ingestion error:", error);
		throw error;
	}
}
