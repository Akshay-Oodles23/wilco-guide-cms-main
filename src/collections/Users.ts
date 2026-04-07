import type { CollectionConfig } from "payload";
import { tenantAccess, franchiseFieldAccess } from "@/access/tenantAccess";

export const Users: CollectionConfig = {
	slug: "users",
	labels: {
		singular: "User",
		plural: "Users",
	},
	auth: true,
	admin: {
		useAsTitle: "email",
		defaultColumns: ["email", "firstName", "lastName", "role", "franchise"],
		group: "System",
	},
	access: {
		read: tenantAccess.read,
		create: ({ req }) => {
			// Allow creation during initial setup (no user yet) OR if super-admin
			return !req.user || req.user?.role === "super-admin";
		},
		update: ({ req }): any => {
			if (req.user?.role === "super-admin") return true;
			if (req.user?.role === "franchise-admin") {
				const franchiseId =
					req.headers?.get?.("x-franchise-id") ||
					(req as any).franchiseId;
				if (!franchiseId) return false;
				return { franchise: { equals: franchiseId } };
			}
			// Users can update their own record
			if (req.user?.id) return { id: { equals: req.user.id } };
			return false;
		},
		delete: tenantAccess.delete,
	},
	timestamps: true,
	fields: [
		{
			name: "role",
			type: "select",
			required: true,
			defaultValue: "franchise-editor",
			options: [
				{ label: "Super Admin", value: "super-admin" },
				{ label: "Franchise Admin", value: "franchise-admin" },
				{ label: "Franchise Editor", value: "franchise-editor" },
			],
			access: {
				update: franchiseFieldAccess,
			},
			admin: {
				description: "User role determines access permissions",
			},
		},
		{
			name: "franchise",
			type: "relationship",
			relationTo: "franchises",
			required: true,
			index: true,
			admin: {
				description: "Franchise this user belongs to",
			},
			access: {
				create: () => true, // Allow reading franchises during creation
				update: franchiseFieldAccess,
			},
		},
		{
			name: "firstName",
			type: "text",
			label: "First Name",
		},
		{
			name: "lastName",
			type: "text",
			label: "Last Name",
		},
		{
			name: "lastLoggedIn",
			type: "date",
			label: "Last Logged In",
			admin: {
				readOnly: true,
				date: {
					pickerAppearance: "dayAndTime",
				},
			},
		},
	],
};

export default Users;
