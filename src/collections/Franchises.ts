import type { CollectionConfig } from "payload";

export const Franchises: CollectionConfig = {
	slug: "franchises",
	labels: {
		singular: "Franchise",
		plural: "Franchises",
	},
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "franchiseId", "domain"],
		group: "System",
	},
	access: {
		read: () => true, // Always allow reads (needed for dropdowns in admin)
		create: ({ req }) => {
			// Allow creation during initial setup (no user yet) OR if super-admin
			return !req.user || req.user.role === "super-admin";
		},
		update: ({ req }) => req.user?.role === "super-admin",
		delete: ({ req }) => req.user?.role === "super-admin",
	},
	timestamps: true,
	fields: [
		{
			name: "franchiseId",
			type: "text",
			required: true,
			unique: true,
			index: true,
			admin: {
				description:
					'Unique identifier for the franchise (e.g., "williamson-county")',
			},
		},
		{
			name: "name",
			type: "text",
			required: true,
			admin: {
				description: "Display name of the franchise",
			},
		},
		{
			name: "domain",
			type: "text",
			required: true,
			index: true,
			admin: {
				description:
					'Primary domain for this franchise (e.g., "thewilcoguide.com")',
			},
		},
		{
			name: "cities",
			type: "array",
			label: "Cities",
			admin: {
				description: "Cities covered by this franchise",
			},
			fields: [
				{
					name: "city",
					type: "text",
					required: true,
				},
			],
		},
		{
			name: "settings",
			type: "group",
			label: "Franchise Settings",
			fields: [
				{
					name: "logoUrl",
					type: "text",
					label: "Logo URL",
				},
				{
					name: "primaryColor",
					type: "text",
					label: "Primary Color",
					admin: {
						description: 'Hex color code (e.g., "#1a5276")',
					},
				},
				{
					name: "tagline",
					type: "text",
					label: "Tagline",
				},
				{
					name: "newsletterBrands",
					type: "array",
					label: "Newsletter Brands",
					admin: {
						description:
							"Beehiiv newsletter brand identifiers for this franchise",
					},
					fields: [
						{
							name: "brand",
							type: "text",
							required: true,
						},
					],
				},
			],
		},
	],
};

export default Franchises;
