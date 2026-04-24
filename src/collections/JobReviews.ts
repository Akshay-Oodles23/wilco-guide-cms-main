import type { CollectionConfig } from "payload";

export const JobReviews: CollectionConfig = {
	slug: "job-reviews",
	labels: {
		singular: "Job Review",
		plural: "Job Reviews",
	},
	admin: {
		useAsTitle: "reviewerName",
		defaultColumns: ["reviewerName", "job", "rating", "status", "createdAt"],
		group: "Content",
	},
	access: {
		read: () => true,
		create: () => false,
		update: ({ req }) => Boolean(req.user),
		delete: ({ req }) => Boolean(req.user),
	},
	timestamps: true,
	fields: [
		{
			name: "job",
			type: "relationship",
			relationTo: "jobs",
			required: true,
			index: true,
		},
		{
			name: "franchise",
			type: "relationship",
			relationTo: "franchises",
			required: true,
			index: true,
			admin: {
				description: "Inherited from the reviewed job.",
			},
		},
		{
			name: "reviewerName",
			type: "text",
			required: true,
			label: "Name",
			maxLength: 80,
		},
		{
			name: "reviewerEmail",
			type: "email",
			label: "Email",
			admin: {
				description: "Stored for follow-up only; not displayed publicly.",
			},
		},
		{
			name: "rating",
			type: "number",
			required: true,
			min: 1,
			max: 5,
		},
		{
			name: "title",
			type: "text",
			maxLength: 120,
		},
		{
			name: "body",
			type: "textarea",
			required: true,
			label: "Review",
			maxLength: 1200,
		},
		{
			name: "status",
			type: "select",
			required: true,
			defaultValue: "approved",
			options: [
				{ label: "Approved", value: "approved" },
				{ label: "Pending", value: "pending" },
				{ label: "Rejected", value: "rejected" },
			],
		},
	],
};

export default JobReviews;
