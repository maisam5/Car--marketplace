"use server"

import { prisma } from "@/lib/client";
import { serializeCarData } from "@/lib/helper";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";



export async function bookTestDrive({
  carId,
  bookingDate,
  startTime,
  endTime,
  notes,
}) {
  try {
    // 1. Authentication check
    const { userId } = await auth();
    if (!userId) throw new Error("You must be logged in to book a test drive");

    
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found in database");

    // 3. Complete logic: Booking create karna
   const car = await prisma.car.findUnique({
  where: { 
    id: carId, 
    status: "AVAILABLE" 
  },
});

if (!car) throw new Error("Car not available for test drive");

const existingBooking = await prisma.testDriveBooking.findFirst({
  where: {
    carId,
    bookingDate: new Date(bookingDate),
    startTime,
    status: { 
      in: ["PENDING", "CONFIRMED"] 
    },
  },
});

  if (existingBooking) {
  throw new Error(
    "This time slot is already booked. Please select another time."
  );
}

const booking = await prisma.testDriveBooking.create({
  data: {
    carId,
    userId: user.id,
    bookingDate: new Date(bookingDate),
    startTime,
    endTime,
    notes: notes || null,
    status: "PENDING",
  },
});

revalidatePath(`/test-drive/${carId}`)
revalidatePath(`/cars/${carId}`)
return {
    success:true,
    data:booking,
}

  } catch (error) {
    console.error("Booking Error:", error.message);
    return { 
      success: false, 
      message: error.message || "Failed to book test drive" 
    };
  }
}

export async function getUserTestDrives(){
    try {
         const { userId } = await auth();
    if (!userId) throw new Error("You must be logged in to book a test drive");

    
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found in database");

const bookings = await prisma.testDriveBooking.findMany({
  where: { userId: user.id },
  include: {
    car: true,
  },
  orderBy: { bookingDate: "desc" },
});

const formatedBookings = bookings.map((booking) => ({
  id: booking.id,
  carId: booking.carId,
  car: serializeCarData(booking.car),
  bookingDate: booking.bookingDate.toISOString(),
  startTime: booking.startTime,
  endTime: booking.endTime,
  status: booking.status,
  notes: booking.notes,
  createdAt: booking.createdAt.toISOString(),
  updatedAt: booking.updatedAt.toISOString(),
}));

return {
    success:true,
    data:formatedBookings,
}
    } catch (error) {
         console.error("Booking Error:", error.message);
    return { 
      success: false, 
      message: error.message || "Failed to book test drive" 
    };
  }
}

export async function cancelTestDrive(bookingId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be logged in");

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found in database");

    const booking = await prisma.testDriveBooking.findUnique({
      where: { id: bookingId }, 
    });

    if (!booking) return { success: false, error: "Booking not found" };

    if (booking.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized to cancel this booking" };
    }

    if (booking.status === "CANCELLED") {
      return { success: false, error: "Booking is already cancelled" };
    }

    if (booking.status === "COMPLETED") {
      return { success: false, error: "Cannot cancel a completed booking" };
    }

    await prisma.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/reservations");
    revalidatePath("/admin/test-drives");

    return { success: true, message: "Test drive cancelled" };
  } catch (error) {
    console.error("Booking Error:", error.message);
    return { success: false, message: error.message || "Failed to cancel test drive" };
  }
}
