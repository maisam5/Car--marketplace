"use server";


import { prisma } from "@/lib/client";
import { serializeCarData } from "@/lib/helper";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";




export async function getCarFilters() {
  try {
    const [makes, bodyTypes, fuelTypes, transmissions, priceAggregations] =
      await Promise.all([
        // 1. Get unique makes
        prisma.car.findMany({
          where: { status: "AVAILABLE" },
          select: { make: true },
          distinct: ["make"],
          orderBy: { make: "asc" },
        }),

        // 2. Get unique body types
        prisma.car.findMany({
          where: { status: "AVAILABLE" },
          select: { bodyType: true },
          distinct: ["bodyType"],
          orderBy: { bodyType: "asc" },
        }),

        // 3. Get unique fuel types
        prisma.car.findMany({
          where: { status: "AVAILABLE" },
          select: { fuelType: true },
          distinct: ["fuelType"],
          orderBy: { fuelType: "asc" },
        }),

        // 4. Get unique transmissions
        prisma.car.findMany({
          where: { status: "AVAILABLE" },
          select: { transmission: true },
          distinct: ["transmission"],
          orderBy: { transmission: "asc" },
        }),

        // 5. Get price min and max
        prisma.car.aggregate({
          where: { status: "AVAILABLE" },
          _min: { price: true },
          _max: { price: true },
        }),
      ]);

   return {
      success: true,
      data: {
        makes: makes.map((item) => item.make),
        bodyTypes: bodyTypes.map((item) => item.bodyType),
        fuelTypes: fuelTypes.map((item) => item.fuelType),
        transmissions: transmissions.map((item) => item.transmission),
        priceRange: {
          min: priceAggregations._min.price
            ? parseFloat(priceAggregations._min.price.toString())
            : 0,
          max: priceAggregations._max.price
            ? parseFloat(priceAggregations._max.price.toString())
            : 100000,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching car filters:", error);
    throw new Error("error loading flters .");
  }
}

export async function getCars({
    search = "",
  make = "",
  bodyType = "",
  fuelType = "",
  transmission = "",
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  sortBy = "newest", // Options: newest, priceAsc, priceDesc
  page = 1,
  limit = 6,
}){
    try {
      const { userId } = await auth();
      let dbUser = null;

      if (userId) {
        dbUser = await prisma.user.findUnique({
          where: { clerkUserId: userId },
        });
      }

      let where = {
        status: "AVAILABLE",
      };
      if (search) {
  where.OR = [
    { make: { contains: search, mode: "insensitive" } },
    { model: { contains: search, mode: "insensitive" } },
    { description: { contains: search, mode: "insensitive" } },
  ];
}

if (make) where.make = { equals: make, mode: "insensitive" };
if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" };
if (transmission)
  where.transmission = { equals: transmission, mode: "insensitive" };

where.price = {
  gte: parseFloat(minPrice) || 0,
};

if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
  where.price.lte = parseFloat(maxPrice);
}

const skip = (page - 1) * limit;

let orderBy = {};
    switch (sortBy) {
      case "priceAsc":
        orderBy = { price: "asc" };
        break;
      case "priceDesc":
        orderBy = { price: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }
    const totalCars = await prisma.car.count({where})

    const cars = await prisma.car.findMany({
        where,
        take:limit,
        skip,
        orderBy,
    })

let wishlisted = new Set();
if (dbUser) {
  const savedCars = await prisma.userSavedCar.findMany({
    where: { userId: dbUser.id },
    select: { carId: true },
  });

  wishlisted = new Set(savedCars.map((saved) => saved.carId));
}
 // Serialize and check wishlist status
const serializedCars = cars.map((car) =>
  serializeCarData(car, wishlisted.has(car.id))
);

return {
  success: true,
  data: serializedCars,
  pagination: {
    total: totalCars,
    page,
    limit,
    pages: Math.ceil(totalCars / limit),
  },
};

    } catch (error) {
        throw new Error("error fetching cars" + error.message)
    }
}

export async function toggleSavedCar(carId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Check if car exists
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });
    if(!car){
        return {
            success:false,
            error:"car not existed"
        }
    }
    const existingSave = await prisma.userSavedCar.findUnique({
        where:{
            userId_carId:{
                userId:user.id,
                carId,
            },
        },
    });
    //remove if car already saved
    if (existingSave) {
  await prisma.userSavedCar.delete({
    where: {
      userId_carId: {
        userId: user.id,
        carId,
      },
    },
  });
  revalidatePath(`/saved-cars`);
  return {
  success:true,
  saved:false,
  message:"car removed "
  };

  
}
// If car is not saved, add it
await prisma.userSavedCar.create({
  data: {
    userId: user.id,
    carId,
  },
});

revalidatePath(`/saved-cars`);
return {
  success: true,
  saved: true,
  message: "Car added to favorites",
};
  } catch (error) {
    throw new Error("error toggling saved cars" + error.message)
  }
}

export async function getSavedCars() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

   const savedCars = await prisma.userSavedCar.findMany({
    where:{userId:user.id},
    include:{
      car:true
    },
    orderBy:{
      savedAt:"desc"
    }
   });
   const cars = savedCars.map((saved)=> serializeCarData(saved.car));

   return {
    success:true,
    data:cars,
   }
   

  } catch (error) {
    console.error("Error fetching saved cars:", error);
    return {
      success: false,
      error: "Internal Server Error",
    };
  }
}

export async function getCarById(carId) {
  try {
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await prisma.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    const car = await prisma.car.findUnique({
      where: { id: carId },
     
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    let isWishlisted = false;
    let userTestDrive = null;

    if (dbUser) {
      const [savedCar, existingTestDrive] = await Promise.all([
        prisma.userSavedCar.findUnique({
          where: {
            userId_carId: {
              userId: dbUser.id,
              carId,
            },
          },
        }),
        prisma.testDriveBooking.findFirst({
          where: {
            carId,
            userId: dbUser.id,
            status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
      ]);

      isWishlisted = !!savedCar;

      if (existingTestDrive) {
        userTestDrive = {
          id: existingTestDrive.id,
          status: existingTestDrive.status,
          bookingDate: existingTestDrive.bookingDate.toISOString(),
        };
      }
    }

    let dealership = await prisma.dealershipInfo.findFirst({
      include: {
        workingHours: true,
      },
    });

    if (!dealership) {
      dealership = await prisma.dealershipInfo.create({
        data: {
          workingHours: {
            create: [
              { dayOfWeek: "MONDAY", openTime: "09:00", closeTime: "18:00", isOpen: true },
              { dayOfWeek: "TUESDAY", openTime: "09:00", closeTime: "18:00", isOpen: true },
              { dayOfWeek: "WEDNESDAY", openTime: "09:00", closeTime: "18:00", isOpen: true },
              { dayOfWeek: "THURSDAY", openTime: "09:00", closeTime: "18:00", isOpen: true },
              { dayOfWeek: "FRIDAY", openTime: "09:00", closeTime: "18:00", isOpen: true },
              { dayOfWeek: "SATURDAY", openTime: "10:00", closeTime: "16:00", isOpen: true },
              { dayOfWeek: "SUNDAY", openTime: "00:00", closeTime: "00:00", isOpen: false },
            ],
          },
        },
        include: {
          workingHours: true,
        },
      });
    }

    const existingBookings = await prisma.testDriveBooking.findMany({
      where: {
        carId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: {
        bookingDate: true,
        startTime: true,
      },
    });

    return {
      success: true,
      data: {
        ...serializeCarData(car, isWishlisted),
        testDriveInfo: {
          userTestDrive,
          existingBookings: existingBookings.map((b) => ({
            bookingDate: b.bookingDate.toISOString().split("T")[0],
            startTime: b.startTime,
          })),
          dealership: dealership
            ? {
                ...dealership,
                createdAt: dealership.createdAt.toISOString(),
                updatedAt: dealership.updatedAt.toISOString(),
                workingHours: dealership.workingHours.map((hour) => ({
                  ...hour,
                  createdAt: hour.createdAt.toISOString(),
                  updatedAt: hour.updatedAt.toISOString(),
                })),
              }
            : null,
        },
      },
    };
   
  } catch (error) {
   throw new Error("error fetching car details" + error.message)
  }
}