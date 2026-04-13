import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "**.beehiiv.com",
			},
		],
	},
	experimental: {
		reactCompiler: false,
		// Configure Server Actions to allow requests from staging server
		serverActions: {
			allowedOrigins: [
				"localhost:3000",
				"localhost:3005",
				"127.0.0.1:3005",
				// Add your staging server IP
				process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
			],
		},
	},
};

export default withPayload(nextConfig);
