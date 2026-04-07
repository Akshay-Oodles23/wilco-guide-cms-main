import type { CollectionConfig } from "payload";

export const Locations: CollectionConfig = {
	slug: "locations",
	labels: {
		singular: "Location",
		plural: "Locations",
	},
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "slug"],
		group: "Content",
	},
	access: {
		read: () => true,
		create: () => true,
		update: () => true,
		delete: () => true,
	},
	fields: [
		{
			name: "name",
			type: "text",
			required: true,
			label: "Location Name",
			admin: {
				description: "e.g., Round Rock, Georgetown, Leander",
			},
		},
		{
			name: "slug",
			type: "text",
			required: true,
			unique: true,
			label: "URL Slug",
			admin: {
				description:
					"Auto-generated, e.g., round-rock, georgetown, leander",
			},
		},
		{
			name: "description",
			type: "text",
			label: "Description",
			admin: {
				description: "Optional short description of the city",
			},
		},
	],
};
