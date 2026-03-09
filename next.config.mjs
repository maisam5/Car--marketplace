/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental:{
    serverActions:{
      bodySizeLimit:"10mb",
    },
    serverComponentsHmrCache:false,
    
  },
  images:{
    remotePatterns:[
      {
        protocol:"https",
        hostname: "xcrflpqizpobdafhjvqb.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ]
  },
  reactCompiler: true,
};

export default nextConfig;
