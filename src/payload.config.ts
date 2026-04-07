import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

// Collections — MVP (build UI for these)
import { Franchises } from "./collections/Franchises";
import { Users } from "./collections/Users";
import { Articles } from "./collections/Articles";
import { Businesses } from "./collections/Businesses";
import { Jobs } from "./collections/Jobs";
import { Guides } from "./collections/Guides";
import { Media } from "./collections/Media";
import { Locations } from "./collections/Locations";

// Collections — Ingestion pipeline
import { IngestionSources } from "./collections/IngestionSources";
import { IngestionRuns } from "./collections/IngestionRuns";
import { ReviewQueue } from "./collections/ReviewQueue";

// Collections — Future (schema only, no UI)
import { Obituaries } from "./collections/Obituaries";
import { RealEstate } from "./collections/RealEstate";
import { Events } from "./collections/Events";
import { Deals } from "./collections/Deals";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
	admin: {
		user: Users.slug,
		importMap: {
			baseDir: path.resolve(dirname),
		},
	},

	collections: [
		// MVP collections
		Franchises,
		Users,
		Articles,
		Businesses,
		Jobs,
		Guides,
		Media,
		Locations,
		// Ingestion pipeline
		IngestionSources,
		IngestionRuns,
		ReviewQueue,
		// Future collections (schema defined, no UI yet)
		Obituaries,
		RealEstate,
		Events,
		Deals,
	],

	editor: lexicalEditor(),

	secret: process.env.PAYLOAD_SECRET || "CHANGE-ME-IN-PRODUCTION",

	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},

	db: postgresAdapter({
		pool: {
			connectionString: process.env.DATABASE_URL || "",
		},
	}),

	sharp,

	plugins: [],
});
