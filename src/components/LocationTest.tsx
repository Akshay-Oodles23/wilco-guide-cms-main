"use client";

import { useEffect, useState } from "react";

export default function LocationTest() {
	const [ip, setIp] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchIP = async () => {
			try {
				const res = await fetch("/api/location");
				const data = await res.json();
				console.log("IP Address:", data.ip);
				setIp(data.ip);
			} catch (error) {
				console.error("Error:", error);
				setIp("Error fetching IP");
			} finally {
				setLoading(false);
			}
		};

		fetchIP();
	}, []);

	if (loading) {
		return <div className="p-6">Loading...</div>;
	}

	return (
		<div className="p-6 bg-white rounded-lg shadow-md">
			<h1 className="text-2xl font-bold mb-4">Your IP Address</h1>
			<p className="text-lg">
				<strong>IP:</strong> {ip}
			</p>
		</div>
	);
}
