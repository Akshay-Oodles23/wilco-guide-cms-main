"use client";

import { useState } from "react";

export function IngestionTrigger() {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<any>(null);

	const handleIngest = async () => {
		setLoading(true);
		setResult(null);

		try {
			console.log("\n" + "=".repeat(80));
			console.log(
				"🚀 [CLIENT] YOU CLICKED THE BUTTON - Triggering Adzuna job ingestion...",
			);
			console.log("=".repeat(80));
			console.log("⏳ Sending request to: POST /api/ingest/jobs/adzuna");

			const response = await fetch("/api/ingest/jobs/adzuna", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					where: "round rock tx",
					maxPages: 3,
				}),
			});

			const data = await response.json();

			console.log("\n✅ [CLIENT] Response received from server:");
			console.log("📊 Ingestion Result:", data);
			setResult(data);

			if (data.ok) {
				console.log("\n🎉 [CLIENT] SUCCESS! Ingestion completed!");
				console.log(`   📈 Created: ${data.created} jobs`);
				console.log(`   🔄 Updated: ${data.updated} jobs`);
				console.log(`   ⏭️  Skipped: ${data.skipped} jobs`);
				console.log(
					"📝 Next step: REFRESH THE PAGE to see the 45 new jobs!",
				);
				console.log("=".repeat(80) + "\n");
				alert(
					`✅ Success! Created ${data.created} jobs from Adzuna API\n\n🔄 Refresh the page to see the new data!`,
				);
			} else {
				console.error("\n❌ [CLIENT] Ingestion failed:", data.error);
				console.log("=".repeat(80) + "\n");
				alert(`❌ Error: ${data.error}`);
			}
		} catch (error) {
			console.error("\n❌ [CLIENT] Network error:", error);
			console.log("=".repeat(80) + "\n");
			alert(
				`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{
				padding: "20px",
				margin: "20px",
				backgroundColor: "#f0f4f8",
				borderRadius: "8px",
				border: "2px solid #3b82f6",
				maxWidth: "500px",
			}}
		>
			<h3 style={{ marginTop: 0, color: "#1e40af" }}>
				🔧 Developer Tool: Ingest Jobs from Adzuna API
			</h3>
			<p style={{ color: "#475569", marginBottom: "10px" }}>
				Click the button below to fetch job data from Adzuna API and
				populate your database. This will create ~45 jobs for Williamson
				County area.
			</p>
			<button
				onClick={handleIngest}
				disabled={loading}
				style={{
					padding: "10px 20px",
					backgroundColor: loading ? "#9ca3af" : "#3b82f6",
					color: "white",
					border: "none",
					borderRadius: "4px",
					cursor: loading ? "not-allowed" : "pointer",
					fontSize: "14px",
					fontWeight: "bold",
				}}
			>
				{loading ? "⏳ Ingesting..." : "📥 Ingest Jobs Now"}
			</button>

			{result && (
				<div
					style={{
						marginTop: "15px",
						padding: "10px",
						backgroundColor: result.ok ? "#dcfce7" : "#fee2e2",
						border: `2px solid ${result.ok ? "#22c55e" : "#ef4444"}`,
						borderRadius: "4px",
					}}
				>
					<pre
						style={{
							margin: 0,
							fontSize: "12px",
							color: result.ok ? "#166534" : "#991b1b",
							overflow: "auto",
						}}
					>
						{JSON.stringify(result, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}
