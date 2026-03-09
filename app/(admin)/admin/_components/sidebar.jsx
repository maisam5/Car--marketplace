"use client";

import { cn } from "@/lib/utils";
import { Calendar, Car, Cog, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Cars", icon: Car, href: "/admin/cars" },
  { label: "Test Drives", icon: Calendar, href: "/admin/test-drives" },
  { label: "Settings", icon: Cog, href: "/admin/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* 📱 MOBILE BOTTOM NAVBAR  */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex justify-around items-center h-16 px-2">
        {routes.map((route) => {
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-100/50 h-12",
                pathname === route.href
                  ? "text-blue-700 bg-blue-100/50 hover:bg-blue-100 hover:text-blue-700"
                  : "",
              )}
            >
              {route.label}
            </Link>
          );
        })}
      </div>

      {/* 🖥️ DESKTOP SIDEBAR */}
      <div className="hidden md:flex border-r bg-white h-full flex-col overflow-y-auto shadow-sm">
        <h2 className="text-xl font-bold mb-6">CarHub Admin</h2>
        <div className="space-y-1">
          {routes.map((route) => {
            const Icon = route.icon;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-100/50 h-12",
                  pathname === route.href
                    ? "text-blue-700 bg-blue-100/50 hover:bg-blue-100 hover:text-blue-700"
                    : "",
                )}
              >
                <Icon size={18} />
                {route.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Spacer for Desktop */}
      <div className="hidden md:block w-64 shrink-0" />
    </>
  );
}