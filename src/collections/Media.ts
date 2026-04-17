import type { CollectionConfig } from "payload";
import path from "path";
import { tenantAccess, franchiseFieldAccess } from "@/access/tenantAccess";

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
		read: () => true,
		create: tenantAccess.create,
		update: tenantAccess.update,
		delete: tenantAccess.delete,
	},
	upload: {
		staticDir: path.join(process.cwd(), "media"),
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
