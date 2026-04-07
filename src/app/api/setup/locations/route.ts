import { getPayloadHMR } from "@payloadcms/next/utilities";
import config from "@/payload.config";

const cities = [
	{ name: "Georgetown", slug: "georgetown" },
	{ name: "Round Rock", slug: "round-rock" },
	{ name: "Cedar Park", slug: "cedar-park" },
	{ name: "Leander", slug: "leander" },
	{ name: "Liberty Hill", slug: "liberty-hill" },
	{ name: "Hutto", slug: "hutto" },
	{ name: "Taylor", slug: "taylor" },
	{ name: "Jarrell", slug: "jarrell" },
	{ name: "Florence", slug: "florence" },
];

export async function GET() {
	try {
		const payload = await getPayloadHMR({ config });

		// Check if locations already exist
		const existing = await payload.find({
			collection: "locations",
			where: {
				name: {
					exists: true,
				},
			},
		});

		if (existing.totalDocs > 0) {
			return Response.json({
				success: true,
				message: `${existing.totalDocs} locations already exist`,
				locations: existing.docs,
			});
		}

		// Create all locations
		const created: any[] = [];
		for (const city of cities) {
			const doc = await payload.create({
				collection: "locations",
				data: {
					name: city.name,
					slug: city.slug,
				},
			});
			created.push(doc);
		}

		return Response.json({
			success: true,
			message: `Created ${created.length} locations`,
			locations: created,
		});
	} catch (error) {
		console.error("Error setting up locations:", error);
		return Response.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
