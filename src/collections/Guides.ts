import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { tenantAccess, franchiseFieldAccess } from "@/access/tenantAccess";

export const Guides: CollectionConfig = {
	slug: "guides",
	labels: {
		singular: "Guide",
		plural: "Guides",
	},
	admin: {
		useAsTitle: "title",
		defaultColumns: [
			"title",
			"guideType",
			"category",
			"city",
			"status",
			"franchise",
		],
		group: "Content",
		listSearchableFields: ["title", "slug", "category", "city"],
	},
	access: {
		read: tenantAccess.read,
		create: tenantAccess.create,
		update: tenantAccess.update,
		delete: tenantAccess.delete,
	},
	timestamps: true,
	fields: [
		{
			name: "franchise",
			type: "relationship",
			relationTo: "franchises",
			required: true,
			index: true,
			defaultValue: ({ user }: { user: any }) => {
				// Auto-populate with user's franchise
				return user?.franchise?.id || user?.franchise;
			},
			admin: {
				description: "Franchise this guide belongs to",
				hidden: true, // Hide from form - auto-filled from user context
			},
			access: {
				update: franchiseFieldAccess,
			},
		},
		{
			name: "title",
			type: "text",
			required: true,
			admin: {
				description:
					'Guide title (e.g., "Best Mexican Restaurants in Georgetown")',
			},
		},
		{
			name: "slug",
			type: "text",
			required: true,
			unique: true,
			index: true,
			admin: {
				description: "URL-friendly slug",
			},
		},
		{
			name: "guideType",
			type: "select",
			label: "Guide Type",
			required: true,
			options: [
				{ label: "Best Of", value: "best-of" },
				{ label: "Neighborhood Guide", value: "neighborhood" },
				{ label: "Seasonal", value: "seasonal" },
				{ label: "Event Guide", value: "event" },
				{ label: "Newcomer Guide", value: "newcomer" },
				{ label: "Listicle", value: "listicle" },
			],
			admin: {
				description: "Type of curated guide",
			},
		},
		{
			name: "category",
			type: "text",
			admin: {
				description:
					'Guide category (e.g., "Restaurants", "Outdoor Activities")',
			},
		},
		{
			name: "city",
			type: "text",
			admin: {
				description: "City this guide focuses on (if applicable)",
			},
		},
		{
			name: "occasion",
			type: "text",
			admin: {
				description:
					'Occasion or theme (e.g., "Date Night", "Family Weekend")',
			},
		},
		{
			name: "introContent",
			type: "richText",
			required: true,
			label: "Introduction Content",
			editor: lexicalEditor({}),
			admin: {
				description: "Introduction text for the guide",
			},
		},
		{
			name: "businesses",
			type: "relationship",
			relationTo: "businesses",
			hasMany: true,
			label: "Featured Businesses",
			admin: {
				description: "Businesses featured in this guide (ordered)",
			},
		},
		{
			type: "row",
			fields: [
				{
					name: "seoTitle",
					type: "text",
					label: "SEO Title",
					admin: {
						width: "50%",
						description: "Custom title for search engines",
					},
				},
				{
					name: "seoDescription",
					type: "textarea",
					label: "SEO Description",
					admin: {
						width: "50%",
						description:
							"Meta description for search engines (max 160 chars)",
					},
					maxLength: 160,
				},
			],
		},
		{
			name: "status",
			type: "select",
			required: true,
			defaultValue: "draft",
			options: [
				{ label: "Draft", value: "draft" },
				{ label: "Published", value: "published" },
				{ label: "Archived", value: "archived" },
			],
		},
		{
			name: "publishedAt",
			type: "date",
			label: "Published At",
			admin: {
				date: {
					pickerAppearance: "dayAndTime",
				},
			},
		},
		{
			name: "listingCountAtPublish",
			type: "number",
			label: "Listing Count at Publish",
			admin: {
				readOnly: true,
				description:
					"Number of businesses in the guide when it was published",
			},
		},
	],
};

export default Guides;
