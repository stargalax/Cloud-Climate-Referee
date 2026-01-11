/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development experience
    reactStrictMode: true,

    // Environment variables
    env: {
        CUSTOM_KEY: 'region-arbitrator-dashboard',
    },

    // Build configuration
    output: 'standalone',

    // Image optimization
    images: {
        domains: [],
        unoptimized: false,
    },

    // TypeScript configuration
    typescript: {
        // Allow production builds to complete even if there are type errors
        ignoreBuildErrors: false,
    },

    // ESLint configuration
    eslint: {
        // Allow production builds to complete even if there are lint errors
        ignoreDuringBuilds: false,
    },

    // Headers for security and performance
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig