import type { CollectionConfig } from "payload";
import { tenantAccess, franchiseFieldAccess } from "@/access/tenantAccess";
import { provenanceFields } from "./fields/provenance";

export const Businesses: CollectionConfig = {
	slug: "businesses",
	labels: {
		singular: "Business",
		plural: "Businesses",
	},
	admin: {
		useAsTitle: "name",
		defaultColumns: [
			"name",
			"category",
			"address.city",
			"partnerTier",
			"status",
			"franchise",
		],
		group: "Directory",
		listSearchableFields: ["name", "slug", "category", "subcategory"],
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
				description: "Franchise this business belongs to",
				hidden: true, // Hide from form - auto-filled from user context
			},
			access: {
				update: franchiseFieldAccess,
			},
		},
		{
			name: "name",
			type: "text",
			required: true,
			admin: {
				description: "Business name",
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
			name: "category",
			type: "text",
			required: true,
			admin: {
				description:
					'Primary business category (e.g., "Restaurants", "Home Services")',
			},
		},
		{
			name: "subcategory",
			type: "text",
			admin: {
				description:
					'Business subcategory (e.g., "Mexican", "Plumbing")',
			},
		},
		{
			name: "description",
			type: "textarea",
			admin: {
				description: "Business description",
			},
		},
		{
			name: "address",
			type: "group",
			label: "Address",
			fields: [
				{
					name: "street",
					type: "text",
					label: "Street Address",
				},
				{
					name: "city",
					type: "text",
					label: "City",
				},
				{
					name: "state",
					type: "text",
					label: "State",
					defaultValue: "TX",
				},
				{
					name: "zip",
					type: "text",
					label: "ZIP Code",
				},
				{
					name: "lat",
					type: "number",
					label: "Latitude",
					admin: {
						step: 0.000001,
					},
				},
				{
					name: "lng",
					type: "number",
					label: "Longitude",
					admin: {
						step: 0.000001,
					},
				},
			],
		},
		{
			name: "phone",
			type: "text",
			admin: {
				description: "Business phone number",
			},
		},
		{
			name: "email",
			type: "email",
			admin: {
				description: "Business contact email",
			},
		},
		{
			name: "website",
			type: "text",
			admin: {
				description: "Business website URL",
			},
		},
		{
			name: "hours",
			type: "group",
			label: "Business Hours",
			fields: [
				{
					name: "mon",
					type: "group",
					label: "Monday",
					fields: [
						{ name: "open", type: "text", label: "Open" },
						{ name: "close", type: "text", label: "Close" },
					],
				},
				{
					name: "tue",
					type: "group",
					label: "Tuesday",
					fields: [
						{ name: "open", type: "text", label: "Open" },
						{ name: "close", type: "text", label: "Close" },
					],
				},
				{
					name: "wed",
					type: "group",
					label: "Wednesday",
					fields: [
						{ name: "open", type: "text", label: "Open" },
						{ name: "close", type: "text", label: "Close" },
					],
				},
				{
					name: "thu",
					type: "group",
					label: "Thursday",
					fields: [
						{ name: "open", type: "text", label: "Open" },
						{ name: "close", type: "text", label: "Close" },
					],
				},
				{
					name: "fri",
					type: "group",
					label: "Friday",
					fields: [
						{ name: "open", type: "text", label: "Open" },
						{ name: "close", type: "text", label: "Close" },
					],
				},
				{
					name: "sat",
					type: "group",
					label: "Saturday",
					fields: [
						{ name: "open", type: "text", label: "Open" },
						{ name: "close", type: "text", label: "Close" },
					],
				},
				{
					name: "sun",
					type: "group",
					label: "Sunday",
					fields: [
						{ name: "open", type: "text", label: "Open" },
						{ name: "close", type: "text", label: "Close" },
					],
				},
			],
		},
		{
			name: "photos",
			type: "array",
			label: "Photos",
			maxRows: 5,
			admin: {
				description: "Business photos (max 5)",
			},
			fields: [
				{
					name: "photo",
					type: "upload",
					relationTo: "media",
					required: true,
				},
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "googleRating",
					type: "number",
					label: "Google Rating",
					min: 0,
					max: 5,
					admin: {
						step: 0.1,
						width: "50%",
						description: "Average Google review rating (0-5)",
					},
				},
				{
					name: "googleReviewCount",
					type: "number",
					label: "Google Review Count",
					min: 0,
					admin: {
						width: "50%",
						description: "Total number of Google reviews",
					},
				},
			],
		},
		{
			name: "reviews",
			type: "array",
			label: "Reviews",
			admin: {
				description: "Customer reviews",
			},
			fields: [
				{
					name: "author",
					type: "text",
					label: "Review Author",
				},
				{
					name: "text",
					type: "textarea",
					label: "Review Text",
				},
				{
					name: "rating",
					type: "number",
					label: "Rating",
					min: 1,
					max: 5,
				},
				{
					name: "date",
					type: "date",
					label: "Review Date",
				},
				{
					name: "googleReviewId",
					type: "text",
					label: "Google Review ID",
					admin: {
						description:
							"Google review identifier for deduplication",
					},
				},
			],
		},
		{
			name: "amenities",
			type: "array",
			label: "Amenities",
			admin: {
				description: "Business amenities and features",
			},
			fields: [
				{
					name: "amenity",
					type: "text",
					required: true,
				},
			],
		},
		{
			name: "priceRange",
			type: "select",
			label: "Price Range",
			options: [
				{ label: "$", value: "$" },
				{ label: "$$", value: "$$" },
				{ label: "$$$", value: "$$$" },
				{ label: "$$$$", value: "$$$$" },
			],
		},
		{
			name: "partnerTier",
			type: "select",
			label: "Partner Tier",
			defaultValue: "free",
			options: [
				{ label: "Free", value: "free" },
				{ label: "Partner", value: "partner" },
				{ label: "Partner Pro", value: "partner-pro" },
			],
			admin: {
				description: "Monetization tier for this business listing",
			},
		},
		{
			name: "stripeCustomerId",
			type: "text",
			label: "Stripe Customer ID",
			admin: {
				description:
					"Stripe customer ID for billing (partner/partner-pro only)",
				condition: (data) => data?.partnerTier !== "free",
			},
		},
		{
			name: "featured",
			type: "checkbox",
			label: "Featured",
			defaultValue: false,
			admin: {
				description: "Show this business in featured/promoted sections",
			},
		},
		{
			name: "status",
			type: "select",
			required: true,
			defaultValue: "active",
			options: [
				{ label: "Active", value: "active" },
				{ label: "Inactive", value: "inactive" },
				{ label: "Pending", value: "pending" },
			],
		},
		{
			name: "claimedBy",
			type: "relationship",
			relationTo: "users",
			label: "Claimed By",
			admin: {
				description: "User who claimed this business listing",
			},
		},
		{
			name: "googlePlaceId",
			type: "text",
			label: "Google Place ID",
			index: true,
			admin: {
				description:
					"Google Maps Place ID (dedupe key for Outscraper imports)",
			},
		},
		{
			name: "sourceOfTruth",
			type: "select",
			label: "Source of Truth",
			defaultValue: "outscraper",
			options: [
				{ label: "Outscraper", value: "outscraper" },
				{ label: "Manual", value: "manual" },
				{ label: "Claimed", value: "claimed" },
			],
			admin: {
				description:
					"Which system is the authority for this business data",
			},
		},
		...provenanceFields([
			{ label: "Manual", value: "manual" },
			{ label: "Outscraper", value: "outscraper" },
			{ label: "Google API", value: "google-api" },
			{ label: "CSV Import", value: "csv-import" },
		]),
	],
};

export default Businesses;
