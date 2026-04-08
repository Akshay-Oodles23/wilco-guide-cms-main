import path from "path";
import fs from "fs";

const SENIORS_DATA_DIR = path.join(process.cwd(), "src", "data", "seniors");

let categories: any[] | null = null;

function loadCategories(): any[] {
	if (!categories) {
		const filePath = path.join(SENIORS_DATA_DIR, "categories.json");
		const fileContents = fs.readFileSync(filePath, "utf8");
		categories = JSON.parse(fileContents);
	}
	return categories || [];
}

export function getCategories() {
	return loadCategories();
}

export function getCategoryBySlug(slug: string) {
	const all = loadCategories();
	return all.find((c: any) => c.slug === slug);
}

export function getCategoryGroups() {
	const all = loadCategories();
	const groups: Record<string, any[]> = {};
	for (const category of all) {
		const groupName = category.group || "Other";
		if (!groups[groupName]) groups[groupName] = [];
		groups[groupName].push(category);
	}
	return groups;
}
