"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import ClistingLoader from './carlisting-loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useFetch from '@/custom-hooks/use-fetch';
import CarCard from '@/components/car-card';

const CarListing = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const limit = 6;

  // Extract filter values from searchParams
  const search = searchParams.get("search") || "";
  const make = searchParams.get("make") || "";
  const bodyType = searchParams.get("bodyType") || "";
  const fuelType = searchParams.get("fuelType") || "";
  const transmission = searchParams.get("transmission") || "";
  const minPrice = searchParams.get("minPrice") || 0;
  const maxPrice = searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER;
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  const fetchCarsFromApi = async (filters) => {
    const res = await fetch("/api/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    });
    return res.json();
  };

  const { loading, fn: fetchCars, data: result, error } = useFetch(fetchCarsFromApi);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCars({
        search,
        make,
        bodyType,
        fuelType,
        transmission,
        minPrice,
        maxPrice,
        sortBy,
        page,
        limit,
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, make, bodyType, fuelType, transmission, minPrice, maxPrice, sortBy, page, limit,fetchCars]);

  // ✅ Loading state
  if (loading) {
    return <ClistingLoader />;
  }

  // ✅ Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load cars</AlertDescription>
      </Alert>
    );
  }

  // ✅ Data not ready yet (initial render)
  if (!result || !result?.data) return null;

  const { data: cars, pagination } = result;

  // ✅ No cars found UI — exactly matching the screenshot
  if (cars.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-white border border-gray-200 p-4 rounded-full mb-4 shadow-sm">
          <Info className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">No cars found</h3>
        <p className="text-gray-500 mb-6 max-w-md text-sm">
          We couldn&apos;t find any cars matching your search criteria.{" "}
          Try adjusting your filters or search term.
        </p>
        <Button variant="outline" asChild>
          <Link href="/cars">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  // ✅ Cars found — render grid
  return (
   <div>
      {/* Showing X-Y of Z cars */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total)}
          </span>{" "}
          of <span className="font-medium">{pagination.total}</span> cars
        </p>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  );
};

export default CarListing;
