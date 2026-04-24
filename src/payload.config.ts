import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import { Franchises } from "./collections/Franchises";
import { Users } from "./collections/Users";
import { Articles } from "./collections/Articles";
import { Businesses } from "./collections/Businesses";
import { Jobs } from "./collections/Jobs";
import { JobReviews } from "./collections/JobReviews";
import { Guides } from "./collections/Guides";
import { Media } from "./collections/Media";
import { Locations } from "./collections/Locations";
import { IngestionSources } from "./collections/IngestionSources";
import { IngestionRuns } from "./collections/IngestionRuns";
import { ReviewQueue } from "./collections/ReviewQueue";
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
		Franchises,
		Users,
		Articles,
		Businesses,
		Jobs,
		JobReviews,
		Guides,
		Media,
		Locations,
		IngestionSources,
		IngestionRuns,
		ReviewQueue,
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
