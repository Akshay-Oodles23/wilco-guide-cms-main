import type { CollectionConfig } from "payload";
import path from "path";
import { tenantAccess, franchiseFieldAccess } from "@/access/tenantAccess";

/**
 * Get upload path based on environment
 * Mirrors the getUploadPath from payload.config.ts
 */
const getUploadPath = () => {
	// On internal staging server - use persistent shared folder
	if (process.env.ENVIRONMENT === "staging") {
		return "/var/www/wilco-cms/shared/media";
	}

	// Fallback for local development
	return path.join(process.cwd(), "media");
};

export const Media: CollectionConfig = {
	slug: "media",
	labels: {
		singular: "Media",
		plural: "Media",
	},
	admin: {
		useAsTitle: "alt",
		defaultColumns: [
			"filename",
			"alt",
			"franchise",
			"mimeType",
			"updatedAt",
		],
		group: "Content",
	},
	access: {
		read: () => true, // Public read for images
		create: tenantAccess.create,
		update: tenantAccess.update,
		delete: tenantAccess.delete,
	},
	upload: {
		// Use persistent folder on staging, local folder on development
		staticDir: getUploadPath(),
		mimeTypes: ["image/*", "application/pdf"],
		imageSizes: [
			{
				name: "thumbnail",
				width: 400,
				height: 300,
				position: "centre",
			},
			{
				name: "card",
				width: 768,
				height: 1024,
				position: "centre",
			},
			{
				name: "tablet",
				width: 1024,
				height: undefined,
				position: "centre",
			},
		],
	},
	timestamps: true,
	fields: [
		{
			name: "franchise",
			type: "relationship",
			relationTo: "franchises",
			required: true,
			index: true,
			admin: {
				description: "Franchise this media belongs to",
			},
			access: {
				update: franchiseFieldAccess,
			},
		},
		{
			name: "alt",
			type: "text",
			required: true,
			label: "Alt Text",
			admin: {
				description: "Accessible description of the image",
			},
		},
	],
};

export default Media;
