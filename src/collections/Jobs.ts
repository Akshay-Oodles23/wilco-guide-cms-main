import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { tenantAccess, franchiseFieldAccess } from "@/access/tenantAccess";
import { provenanceFields } from "./fields/provenance";

export const Jobs: CollectionConfig = {
	slug: "jobs",
	labels: {
		singular: "Job",
		plural: "Jobs",
	},
	admin: {
		useAsTitle: "title",
		defaultColumns: [
			"title",
			"company",
			"category",
			"employmentType",
			"status",
			"postedAt",
		],
		group: "Content",
		listSearchableFields: ["title", "slug", "company"],
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
				description: "Franchise this job posting belongs to",
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
				description: "Job title",
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
			name: "company",
			type: "text",
			required: true,
			admin: {
				description: "Hiring company name",
			},
		},
		{
			name: "business",
			type: "relationship",
			relationTo: "businesses",
			admin: {
				description:
					"Link to a business listing in the directory (optional)",
			},
		},
		{
			name: "description",
			type: "richText",
			required: true,
			editor: lexicalEditor({}),
			admin: {
				description: "Full job description",
			},
		},
		{
			name: "requirements",
			type: "array",
			label: "Requirements",
			admin: {
				description: "Job requirements and qualifications",
			},
			fields: [
				{
					name: "requirement",
					type: "text",
					required: true,
				},
			],
		},
		{
			name: "salary",
			type: "group",
			label: "Salary",
			fields: [
				{
					name: "min",
					type: "number",
					label: "Minimum",
					admin: {
						description: "Minimum salary/rate",
					},
				},
				{
					name: "max",
					type: "number",
					label: "Maximum",
					admin: {
						description: "Maximum salary/rate",
					},
				},
				{
					name: "type",
					type: "select",
					label: "Pay Type",
					defaultValue: "not-specified",
					options: [
						{ label: "Hourly", value: "hourly" },
						{ label: "Salary", value: "salary" },
						{ label: "Not Specified", value: "not-specified" },
					],
				},
			],
		},
		{
			name: "employmentType",
			type: "select",
			label: "Employment Type",
			required: true,
			options: [
				{ label: "Full-Time", value: "full-time" },
				{ label: "Part-Time", value: "part-time" },
				{ label: "Contract", value: "contract" },
				{ label: "Internship", value: "internship" },
			],
		},
		{
			name: "location",
			type: "group",
			label: "Location",
			fields: [
				{
					name: "city",
					type: "relationship",
					relationTo: "locations",
					label: "City",
					required: true,
					index: true,
				},
				{
					name: "remote",
					type: "checkbox",
					label: "Remote",
					defaultValue: false,
					admin: {
						description: "Is this a remote position?",
					},
				},
			],
		},
		{
			name: "applicationUrl",
			type: "text",
			label: "Application URL",
			admin: {
				description: "External URL to apply for the job",
			},
		},
		{
			name: "applicationEmail",
			type: "email",
			label: "Application Email",
			admin: {
				description: "Email to send applications to",
			},
		},
		{
			name: "category",
			type: "select",
			required: true,
			options: [
				{ label: "Technology", value: "technology" },
				{ label: "Healthcare", value: "healthcare" },
				{ label: "Education", value: "education" },
				{ label: "Retail", value: "retail" },
				{ label: "Food & Hospitality", value: "food-hospitality" },
				{
					label: "Construction & Trades",
					value: "construction-trades",
				},
				{
					label: "Professional Services",
					value: "professional-services",
				},
				{ label: "Government", value: "government" },
				{ label: "Nonprofit", value: "nonprofit" },
				{ label: "Manufacturing", value: "manufacturing" },
				{ label: "Transportation", value: "transportation" },
				{ label: "Real Estate", value: "real-estate" },
				{ label: "Finance", value: "finance" },
				{ label: "Other", value: "other" },
			],
			admin: {
				description: "Job category",
			},
		},
		{
			name: "workMode",
			type: "select",
			label: "Work Mode",
			defaultValue: "On-site",
			options: [
				{ label: "On-site", value: "On-site" },
				{ label: "Hybrid", value: "Hybrid" },
				{ label: "Remote", value: "Remote" },
			],
		},
		{
			name: "urgent",
			type: "checkbox",
			label: "Urgent Hire",
			defaultValue: false,
		},
		{
			name: "tags",
			type: "array",
			label: "Display Tags",
			fields: [
				{
					name: "label",
					type: "text",
					required: true,
				},
			],
		},
		{
			name: "featured",
			type: "checkbox",
			label: "Featured",
			defaultValue: false,
			admin: {
				description: "Show this job in featured sections",
			},
		},
		{
			name: "status",
			type: "select",
			required: true,
			defaultValue: "active",
			options: [
				{ label: "Active", value: "active" },
				{ label: "Expired", value: "expired" },
				{ label: "Filled", value: "filled" },
			],
		},
		{
			name: "postedAt",
			type: "date",
			label: "Posted At",
			admin: {
				date: {
					pickerAppearance: "dayAndTime",
				},
				description: "When the job was originally posted",
			},
		},
		{
			name: "expiresAt",
			type: "date",
			label: "Expires At",
			admin: {
				date: {
					pickerAppearance: "dayAndTime",
				},
				description: "When the job posting expires",
			},
		},
		{
			name: "dedupeHash",
			type: "text",
			label: "Dedupe Hash",
			index: true,
			admin: {
				description: "Hash for deduplication of imported jobs",
				readOnly: true,
			},
		},
		...provenanceFields([
			{ label: "Manual", value: "manual" },
			{ label: "Adzuna API", value: "adzuna-api" },
			{ label: "Partner Submitted", value: "partner-submitted" },
			{ label: "CSV Import", value: "csv-import" },
		]),
	],
};

export default Jobs;
