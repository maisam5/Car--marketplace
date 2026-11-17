import Image from "next/image";
import Link from "next/link";
import { Car, Mail, MapPin, Phone } from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse Cars", href: "/cars" },
  { label: "Saved Cars", href: "/saved-cars" },
  { label: "My Bookings", href: "/bookings" },
];

const BODY_TYPES = [
  { label: "SUV", href: "/cars?bodyType=SUV" },
  { label: "Sedan", href: "/cars?bodyType=Sedan" },
  { label: "Hatchback", href: "/cars?bodyType=Hatchback" },
  { label: "Coupe", href: "/cars?bodyType=Coupe" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/carhub.png"
                alt="CarHub Logo"
                width={150}
                height={45}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered car marketplace to discover, compare, and book test
              drives for your next dream vehicle with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Popular Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              {BODY_TYPES.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Car className="h-3.5 w-3.5 text-blue-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact Dealership
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>89 Car Street, Autoville, CA 69420</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span>+1 (555) 143-4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>contact@carhub.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {year} CarHub Motors. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/cars" className="hover:text-slate-300 transition-colors">
              Inventory
            </Link>
            <Link href="/bookings" className="hover:text-slate-300 transition-colors">
              Test Drives
            </Link>
            <Link href="/saved-cars" className="hover:text-slate-300 transition-colors">
              Wishlist
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
