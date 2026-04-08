"use client";

import { useEffect, useState } from "react";

interface LocationData {
	status: string;
	country: string;
	countryCode: string;
	region: string;
	regionName: string;
	city: string;
	zip: string;
	lat: number;
	lon: number;
	timezone: string;
	isp: string;
	org: string;
	as: string;
	query: string;
}

export default function LocationTest() {
	const [location, setLocation] = useState<LocationData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLocation = async () => {
			try {
				const res = await fetch("/api/location");
				const data = await res.json();
				console.log("Location Data:", data);

				if (data.error) {
					setError(data.error);
				} else {
					setLocation(data);
				}
			} catch (err) {
				console.error("Error:", err);
				setError("Failed to fetch location");
			} finally {
				setLoading(false);
			}
		};

		fetchLocation();
	}, []);

	if (loading) {
		return <div className='p-6 text-center'>Loading location data...</div>;
	}

	if (error) {
		return (
			<div className='p-6 text-center text-red-600'>Error: {error}</div>
		);
	}

	return (
		<div className='p-6 bg-white rounded-lg shadow-md max-w-2xl w-full'>
			<h1 className='text-3xl font-bold mb-6'>Your Location Details</h1>

			{location && (
				<div className='space-y-4'>
					{/* IP Address */}
					<div className='border-b pb-3'>
						<p className='text-gray-600'>IP Address</p>
						<p className='text-2xl font-semibold text-blue-600'>
							{location.query}
						</p>
					</div>

					{/* City and Country */}
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<p className='text-gray-600'>City</p>
							<p className='text-xl font-semibold'>
								{location.city}
							</p>
						</div>
						<div>
							<p className='text-gray-600'>Country</p>
							<p className='text-xl font-semibold'>
								{location.country} ({location.countryCode})
							</p>
						</div>
					</div>

					{/* Region and Timezone */}
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<p className='text-gray-600'>Region</p>
							<p className='text-xl font-semibold'>
								{location.regionName}
							</p>
						</div>
						<div>
							<p className='text-gray-600'>Timezone</p>
							<p className='text-xl font-semibold'>
								{location.timezone}
							</p>
						</div>
					</div>

					{/* Coordinates */}
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<p className='text-gray-600'>Latitude</p>
							<p className='text-lg font-semibold'>
								{location.lat}
							</p>
						</div>
						<div>
							<p className='text-gray-600'>Longitude</p>
							<p className='text-lg font-semibold'>
								{location.lon}
							</p>
						</div>
					</div>

					{/* ZIP Code */}
					<div>
						<p className='text-gray-600'>ZIP Code</p>
						<p className='text-lg font-semibold'>{location.zip}</p>
					</div>

					{/* ISP */}
					<div>
						<p className='text-gray-600'>
							ISP (Internet Service Provider)
						</p>
						<p className='text-lg font-semibold'>{location.isp}</p>
					</div>

					{/* Organization */}
					<div>
						<p className='text-gray-600'>Organization</p>
						<p className='text-lg font-semibold'>{location.org}</p>
					</div>

					{/* AS (Autonomous System) */}
					<div className='border-t pt-3'>
						<p className='text-gray-600'>Autonomous System</p>
						<p className='text-sm font-semibold text-gray-700'>
							{location.as}
						</p>
					</div>

					{/* Status */}
					<div className='mt-4 p-3 bg-green-100 rounded-lg'>
						<p className='text-green-800'>
							✅ Status:{" "}
							<span className='font-semibold'>
								{location.status}
							</span>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
