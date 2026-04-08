"use client";

import { useEffect, useState } from "react";

interface LocationData {
	ip: string;
	city: string;
	country: string;
	countryCode: string;
	region: string;
	timezone: string;
	isp?: string;
	lat?: number;
	lon?: number;
	status?: string;
	error?: string;
	details?: string;
}

export default function LocationTest() {
	const [location, setLocation] = useState<LocationData | null>(null);
	const [loading, setLoading] = useState(true);
	const [debugInfo, setDebugInfo] = useState<any>(null);
	const [testIP, setTestIP] = useState("");
	const [testLoading, setTestLoading] = useState(false);
	const [testResult, setTestResult] = useState<any>(null);
	const [rawAPIResponse, setRawAPIResponse] = useState<any>(null);

	useEffect(() => {
		fetchLocationData();
	}, []);

	const fetchLocationData = async () => {
		try {
			// Fetch location data
			const res = await fetch("/api/location");
			const data = await res.json();
			setLocation(data);
			console.log("Location data:", data);

			// Also fetch debug info
			const debugRes = await fetch("/api/location/debug");
			const debug = await debugRes.json();
			setDebugInfo(debug);
			console.log("Debug info:", debug);
		} catch (error) {
			console.error("Error fetching location:", error);
			setLocation({
				error: `Failed to fetch location: ${error}`,
				ip: "",
				city: "",
				country: "",
				countryCode: "",
				region: "",
				timezone: "",
			});
		} finally {
			setLoading(false);
		}
	};

	const testWithIP = async () => {
		if (!testIP.trim()) return;

		setTestLoading(true);
		try {
			// Call ip-api.com directly to test
			const response = await fetch(
				`https://ip-api.com/json/${testIP}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,timezone,offset,isp,org,as,asname,lat,lon`,
			);
			const data = await response.json();

			setRawAPIResponse(data);
			console.log("Raw API Response:", data);

			setTestResult({
				ip: testIP,
				city: data.city || "Unknown",
				country: data.country || "Unknown",
				countryCode: data.countryCode || "Unknown",
				region: data.regionName || "Unknown",
				timezone: data.timezone || "Unknown",
				isp: data.isp || "Unknown",
				lat: data.lat,
				lon: data.lon,
				status: data.status,
			});
		} catch (error) {
			console.error("Error testing IP:", error);
			setTestResult({
				error: `Failed to fetch data for IP ${testIP}: ${error}`,
			});
		} finally {
			setTestLoading(false);
		}
	};

	if (loading) {
		return <div className='p-4'>Loading location data...</div>;
	}

	return (
		<div className='space-y-6 p-6 max-w-4xl mx-auto'>
			<h1 className='text-3xl font-bold'>IP Geolocation Tester</h1>

			{/* Current Location */}
			{location?.error && (
				<div className='p-4 bg-red-100 border border-red-400 rounded-lg'>
					<h3 className='font-bold text-red-800'>Error:</h3>
					<p className='text-red-700'>{location.error}</p>
					{location.details && (
						<p className='text-sm text-red-600'>
							{location.details}
						</p>
					)}
				</div>
			)}

			<div className='p-6 bg-white rounded-lg shadow-md'>
				<h2 className='text-2xl font-bold mb-4'>
					Your Current Location
				</h2>
				<div className='space-y-2'>
					<p>
						<strong>IP Address:</strong>{" "}
						<code className='bg-gray-100 px-2 py-1 rounded'>
							{location?.ip || "N/A"}
						</code>
					</p>
					<p>
						<strong>City:</strong> {location?.city || "Unknown"}
					</p>
					<p>
						<strong>Region:</strong> {location?.region || "Unknown"}
					</p>
					<p>
						<strong>Country:</strong> {location?.country} (
						{location?.countryCode})
					</p>
					<p>
						<strong>Timezone:</strong>{" "}
						{location?.timezone || "Unknown"}
					</p>
					{location?.isp && (
						<p>
							<strong>ISP:</strong> {location.isp}
						</p>
					)}
					{location?.lat && location?.lon && (
						<p>
							<strong>Coordinates:</strong>{" "}
							{location.lat.toFixed(4)}, {location.lon.toFixed(4)}
						</p>
					)}
				</div>
			</div>

			{/* Test with Custom IP */}
			<div className='p-6 bg-blue-50 rounded-lg border border-blue-200'>
				<h2 className='text-2xl font-bold mb-4'>Test with Custom IP</h2>
				<p className='text-sm text-gray-600 mb-4'>
					Enter any public IP address to test the geolocation service.
				</p>
				<div className='flex gap-2 mb-4'>
					<input
						type='text'
						placeholder='Enter IP address (e.g., 1.1.1.1, 8.8.8.8)'
						value={testIP}
						onChange={(e) => setTestIP(e.target.value)}
						className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
						onKeyPress={(e) => e.key === "Enter" && testWithIP()}
					/>
					<button
						onClick={testWithIP}
						disabled={testLoading || !testIP.trim()}
						className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400'
					>
						{testLoading ? "Testing..." : "Test"}
					</button>
				</div>

				{/* Test Results */}
				{testResult && (
					<div className='mt-4 p-4 bg-white rounded-lg border border-gray-200'>
						{testResult.error ? (
							<div className='text-red-600'>
								<strong>Error:</strong> {testResult.error}
							</div>
						) : (
							<div className='space-y-2'>
								<p>
									<strong>IP:</strong> {testResult.ip}
								</p>
								<p>
									<strong>City:</strong> {testResult.city}
								</p>
								<p>
									<strong>Region:</strong> {testResult.region}
								</p>
								<p>
									<strong>Country:</strong>{" "}
									{testResult.country} (
									{testResult.countryCode})
								</p>
								<p>
									<strong>ISP:</strong> {testResult.isp}
								</p>
								<p>
									<strong>Status:</strong> {testResult.status}
								</p>
							</div>
						)}
					</div>
				)}

				{/* Raw API Response */}
				{rawAPIResponse && (
					<details className='mt-4'>
						<summary className='cursor-pointer font-semibold text-blue-700'>
							View Raw API Response
						</summary>
						<pre className='mt-2 bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-64'>
							{JSON.stringify(rawAPIResponse, null, 2)}
						</pre>
					</details>
				)}
			</div>

			{/* Debug Info */}
			{debugInfo && (
				<div className='p-6 bg-gray-100 rounded-lg'>
					<h3 className='text-lg font-bold mb-4'>Debug Info</h3>
					<p className='mb-2'>
						<strong>Detected IP from Server:</strong>{" "}
						<code className='bg-gray-200 px-2 py-1 rounded'>
							{debugInfo.ip}
						</code>
					</p>
					<p className='mb-2 text-sm text-gray-600'>
						<strong>Timestamp:</strong> {debugInfo.timestamp}
					</p>
					<details className='mt-4'>
						<summary className='cursor-pointer font-semibold'>
							Headers Received by Server
						</summary>
						<pre className='mt-2 bg-gray-200 p-2 rounded text-xs overflow-auto max-h-64'>
							{JSON.stringify(debugInfo.headers, null, 2)}
						</pre>
					</details>
				</div>
			)}

			{/* Helpful Tips */}
			<div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-700'>
				<strong>💡 Tips:</strong>
				<ul className='mt-2 list-disc list-inside space-y-1'>
					<li>
						On localhost, your IP appears as "unknown" because
						there's no real IP header
					</li>
					<li>
						Try testing with these public IPs:{" "}
						<code className='bg-yellow-100 px-1'>1.1.1.1</code>{" "}
						(Cloudflare),{" "}
						<code className='bg-yellow-100 px-1'>8.8.8.8</code>{" "}
						(Google),{" "}
						<code className='bg-yellow-100 px-1'>13.107.42.14</code>{" "}
						(Microsoft)
					</li>
					<li>
						When deployed to production, you'll get the real user's
						location automatically
					</li>
					<li>
						Check the browser console (F12) for additional debugging
						information
					</li>
				</ul>
			</div>
		</div>
	);
}
