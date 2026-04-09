import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { tenantAccess, franchiseFieldAccess } from "@/access/tenantAccess";
import { provenanceFields } from "./fields/provenance";

export const Articles: CollectionConfig = {
	slug: "articles",
	labels: {
		singular: "Article",
		plural: "Articles",
	},
	admin: {
		useAsTitle: "title",
		defaultColumns: [
			"title",
			"category",
			"city",
			"status",
			"publishedAt",
			"franchise",
		],
		group: "Content",
		listSearchableFields: ["title", "slug", "excerpt"],
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
				description: "Franchise this article belongs to",
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
				description: "Article headline",
			},
		},
		{
			name: "slug",
			type: "text",
			required: true,
			unique: true,
			index: true,
			admin: {
				description: "URL-friendly slug (unique per franchise)",
			},
		},
		{
			name: "excerpt",
			type: "textarea",
			admin: {
				description:
					"Short summary for cards and previews (max 280 chars)",
			},
			maxLength: 280,
		},
		{
			name: "content",
			type: "richText",
			required: true,
			editor: lexicalEditor({}),
			admin: {
				description: "Full article body",
			},
		},
		{
			name: "featuredImage",
			type: "upload",
			relationTo: "media",
			label: "Featured Image",
			admin: {
				description: "Primary image displayed with the article",
			},
		},
		{
			name: "category",
			type: "select",
			required: true,
			options: [
				{ label: "News", value: "news" },
				{ label: "Food & Drink", value: "food-drink" },
				{ label: "Things to Do", value: "things-to-do" },
				{ label: "Real Estate", value: "real-estate" },
				{ label: "Business", value: "business" },
				{ label: "Education", value: "education" },
				{ label: "Health & Wellness", value: "health-wellness" },
				{ label: "Community", value: "community" },
				{ label: "Sports", value: "sports" },
				{ label: "Opinion", value: "opinion" },
				{ label: "Lifestyle", value: "lifestyle" },
			],
			admin: {
				description: "Primary content category",
			},
		},
		{
			name: "tags",
			type: "array",
			label: "Tags",
			admin: {
				description: "Tags for filtering and SEO",
			},
			fields: [
				{
					name: "tag",
					type: "text",
					required: true,
				},
			],
		},
		{
			name: "city",
			type: "relationship",
			relationTo: "locations",
			index: true,
			admin: {
				description: "City this article is primarily about",
			},
		},
		{
			name: "newsletterSource",
			type: "select",
			label: "Newsletter Source",
			options: [
				{ label: "WilCo Wednesday", value: "wilco-wednesday" },
				{ label: "Sun City Sun", value: "sun-city-sun" },
				{ label: "Cedar Park Cedar", value: "cedar-park-cedar" },
				{ label: "Round Rock Rocket", value: "round-rock-rocket" },
				{ label: "None", value: "none" },
			],
			admin: {
				description:
					"Which newsletter this article originated from (if any)",
			},
		},
		{
			name: "author",
			type: "relationship",
			relationTo: "users",
			admin: {
				description: "Author of the article",
			},
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
			admin: {
				description: "Publication status",
			},
		},
		{
			name: "publishedAt",
			type: "date",
			label: "Published At",
			admin: {
				date: {
					pickerAppearance: "dayAndTime",
				},
				description: "Date and time the article was published",
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
						description:
							"Custom title for search engines (defaults to article title)",
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
			name: "mentionedBusinesses",
			type: "relationship",
			relationTo: "businesses",
			hasMany: true,
			label: "Mentioned Businesses",
			admin: {
				description: "Businesses mentioned or featured in this article",
			},
		},
		...provenanceFields([
			{ label: "Manual", value: "manual" },
			{ label: "Beehiiv API", value: "beehiiv-api" },
			{ label: "Beehiiv RSS", value: "beehiiv-rss" },
			{ label: "Scraper", value: "scraper" },
		]),
	],
};

export default Articles;
