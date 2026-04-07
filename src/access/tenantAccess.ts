import type { Access, FieldAccess } from "payload";

// Read access: super-admin sees all, others see only their franchise
export const tenantRead: Access = ({ req }) => {
	if (req.user?.role === "super-admin") return true;
	const franchiseId =
		req.headers?.get?.("x-franchise-id") || (req as any).franchiseId;
	if (!franchiseId) return false;
	return { franchise: { equals: franchiseId } };
};

// Create access: auto-assign franchise from request context or user's franchise
export const tenantCreate: Access = async ({ req, data }) => {
	// Priority 1: Use franchise from request headers (API calls)
	const franchiseId =
		req.headers?.get?.("x-franchise-id") || (req as any).franchiseId;

	// Priority 2: If user is authenticated, use their franchise (CMS form)
	const userFranchiseId =
		(req.user as any)?.franchise?.id || (req.user as any)?.franchise;

	const finalFranchiseId = franchiseId || userFranchiseId;

	if (!finalFranchiseId) {
		console.warn("⚠️ No franchise context available for create access");
		return false;
	}

	// Auto-assign franchise if not already set in the form
	if (data && !data.franchise) {
		data.franchise = finalFranchiseId;
	}

	return true;
};

// Update access: same as read (can only update own franchise)
export const tenantUpdate: Access = ({ req }) => {
	if (req.user?.role === "super-admin") return true;
	const franchiseId =
		req.headers?.get?.("x-franchise-id") || (req as any).franchiseId;
	if (!franchiseId) return false;
	return { franchise: { equals: franchiseId } };
};

// Delete access: super-admin only
export const tenantDelete: Access = ({ req }) => {
	return req.user?.role === "super-admin";
};

// Combined tenant access for easy application
export const tenantAccess = {
	read: tenantRead,
	create: tenantCreate,
	update: tenantUpdate,
	delete: tenantDelete,
};

// Anyone can read (for public pages), but still tenant-scoped
export const publicTenantRead: Access = ({ req }) => {
	const franchiseId =
		req.headers?.get?.("x-franchise-id") || (req as any).franchiseId;
	if (!franchiseId) return true; // Allow unauthenticated public reads with no filter (handled by page queries)
	return { franchise: { equals: franchiseId } };
};

// Field-level: franchise field is read-only (auto-set)
export const franchiseFieldAccess: FieldAccess = ({ req }) => {
	return req.user?.role === "super-admin";
};
