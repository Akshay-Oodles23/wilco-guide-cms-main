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
		},
		{
			name: "slug",
			type: "text",
			required: true,
		},
		{
			name: "state",
			type: "text",
			required: true,
		},
		{
			name: "country",
			type: "text",
			required: true,
			defaultValue: "US",
		},
		{
			name: "isDefault",
			type: "checkbox",
			defaultValue: false,
		},
		{
			name: "description",
			type: "textarea",
		},
	],
};
