import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CarHub",
  description: "Get your dream car",
};

export default function RootLayout({ children }) {
  return (
   <ClerkProvider>
     <html lang="en">
      <body
        className={`${inter.className}`}
      >
      {/*header comp here*/}
      <Header />
       <main className="min-h-screen">
         {children}
       </main>
       <Toaster richColors />
       <Footer />
      </body>
    </html>
   </ClerkProvider>
  );
}
