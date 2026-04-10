/**
 * Helpers for building Payload Lexical richText content programmatically.
 * Used when ingesting external content (e.g. Adzuna) that provides plain text.
 */

/** Strip HTML tags from string (e.g. from API descriptions). */
function stripHtml(html: string): string {
	return (
		(html || "")
			// Preserve basic line structure before stripping tags
			.replace(/<\s*br\s*\/?>/gi, "\n")
			.replace(
				/<\/(p|div|li|h1|h2|h3|h4|h5|h6|section|article)>/gi,
				"\n\n",
			)
			.replace(/<li[^>]*>/gi, "• ")
			.replace(/<[^>]*>/g, " ")
			// Decode a few common HTML entities
			.replace(/&nbsp;/gi, " ")
			.replace(/&amp;/gi, "&")
			.replace(/&quot;/gi, '"')
			.replace(/&#39;/gi, "'")
			// Normalize spacing while keeping newlines
			.replace(/\r\n?/g, "\n")
			.replace(/[ \t]+/g, " ")
			.replace(/\n{3,}/g, "\n\n")
			.trim()
	);
}

/**
 * Build minimal Lexical editor state JSON from plain text.
 * Splits on double newlines for paragraphs. HTML in input is stripped.
 */
export function plainTextToLexical(plainText: string): { root: unknown } {
	const trimmed = stripHtml((plainText || "").trim());
	if (!trimmed) {
		return {
			root: {
				type: "root",
				format: "",
				indent: 0,
				version: 1,
				children: [
					{
						type: "paragraph",
						format: "",
						indent: 0,
						version: 1,
						children: [
							{
								type: "text",
								format: 0,
								mode: "normal",
								text: "No description provided.",
								version: 1,
							},
						],
					},
				],
			},
		};
	}

	const paragraphs = trimmed
		.split(/\n\n+/)
		.map((p) => p.trim())
		.filter(Boolean);
	const children = paragraphs.map((para) => ({
		type: "paragraph",
		format: "",
		indent: 0,
		version: 1,
		children: [
			{
				type: "text",
				format: 0,
				mode: "normal",
				text: para.replace(/\n/g, " "),
				version: 1,
			},
		],
	}));

	return {
		root: {
			type: "root",
			format: "",
			indent: 0,
			version: 1,
			children,
		},
	};
}
