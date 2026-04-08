import path from "path";
import fs from "fs";

const SENIORS_DATA_DIR = path.join(process.cwd(), "src", "data", "seniors");

let faqsCache: Record<string, { question: string; answer: string }[]> | null =
	null;

function loadFAQs(): Record<string, { question: string; answer: string }[]> {
	if (faqsCache) return faqsCache;
	try {
		const filePath = path.join(SENIORS_DATA_DIR, "faqs.json");
		const data = fs.readFileSync(filePath, "utf-8");
		faqsCache = JSON.parse(data);
	} catch {
		faqsCache = {};
	}
	return faqsCache || {};
}

export function getFAQsByCategory(categorySlug: string) {
	const faqs = loadFAQs();
	return faqs[categorySlug] || [];
}
