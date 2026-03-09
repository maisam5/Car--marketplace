'use client'

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Sliders, X } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import CarFilterControls from './filter-controls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CarFilters = ({ filters }) => {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // ✅ URL is source of truth
  const make = searchParams.get("make") || "";
  const bodyType = searchParams.get("bodyType") || "";
  const fuelType = searchParams.get("fuelType") || "";
  const transmission = searchParams.get("transmission") || "";
  const minPrice = searchParams.get("minPrice") || filters.priceRange.min;
  const maxPrice = searchParams.get("maxPrice") || filters.priceRange.max;
  const sortBy = searchParams.get("sortBy") || "newest";

  const activeFilterCount = [
    make,
    bodyType,
    fuelType,
    transmission,
    minPrice != filters.priceRange.min,
    maxPrice != filters.priceRange.max,
  ].filter(Boolean).length;


  const updateURL = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  };


  const clearFilters = () => {
    router.push(pathname);
    setIsSheetOpen(false);
  };


  return (
    <div className="flex lg:flex-col justify-between gap-4">

      {/* Mobile */}
      <div className="lg:hidden mb-4">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>

            <div className="py-6">
              <CarFilterControls
                filters={filters}
                currentFilters={{
                  make,
                  bodyType,
                  fuelType,
                  transmission,
                  priceRange: [minPrice, maxPrice],
                }}
                onFilterChange={updateURL}
              />
            </div>

            <SheetFooter className="pt-4 border-t">
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                Reset
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>


      {/* Sort */}
      <Select
        value={sortBy}
        onValueChange={(value) => updateURL("sortBy", value)}
      >
        <SelectTrigger className="w-45 lg:w-full">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="priceAsc">Price: Low to High</SelectItem>
          <SelectItem value="priceDesc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>


      {/* Desktop Filters */}
      <div className="hidden lg:block sticky top-24">
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className='border-b p-4 flex items-center justify-between bg-gray-100'>
            <h3 className="font-medium flex items-center">
              <Sliders className="mr-2 h-4 w-4" />
              Filters
            </h3>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="mr-1 h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>

          <div className="p-4">
            <CarFilterControls
              filters={filters}
              currentFilters={{
                make,
                bodyType,
                fuelType,
                transmission,
                priceRange: [minPrice, maxPrice],
              }}
              onFilterChange={updateURL}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default CarFilters;