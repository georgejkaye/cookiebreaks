/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${process.env.API || "http://localhost:8000"}/:path*`
            }
        ]
    }
}

module.exports = nextConfig
