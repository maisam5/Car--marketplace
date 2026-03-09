"use server";
import { prisma } from "@/lib/client";
import { serializeCarData } from "@/lib/helper";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


export async function getAdmin(){
    const {userId} = await auth();
    if(!userId) throw new Error("Unathorized")
    const user = await prisma.user.findUnique({
      where:{
        clerkUserId:userId,
      },
    });
    if(!user || user.role !== "ADMIN"){
        return {authorized:false, reason:"not-admin"}
    }
    return {authorized:true, user}
}
export async function getAdminTestDrives({ search = "", status = "" }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify admin status
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    let where = {};

    // Status filter
    if (status) {
      where.status = status;
    }

    // Search filter (Car make/model and User name/email)
    if (search) {
      where.OR = [
        {
          car: {
            OR: [
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Fetching data from database
    const bookings = await prisma.testDriveBooking.findMany({
      where,
      include: {
        car: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            phone: true,
          },
        },
      },
      orderBy: [{ bookingDate: "desc" }, { startTime: "asc" }],
    });

   const formattedBookings = bookings.map((booking) => ({
  id: booking.id,
  carId: booking.carId,
  car: serializeCarData(booking.car),
  userId: booking.userId,
  user: booking.user,
  bookingDate: booking.bookingDate.toISOString(),
  startTime: booking.startTime,
  endTime: booking.endTime,
  status: booking.status,
  notes: booking.notes,
  createdAt: booking.createdAt.toISOString(),
  updatedAt: booking.updatedAt.toISOString(),
}));
return { success: true, data: formattedBookings };
  } catch (error) {
    console.error("Error fetching admin test drives:", error);
    return { success: false, error: error.message || "Failed to fetch test drives" };
  }
}

export async function updateTestDriveStatus(bookingId, newStatus) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify admin status
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    // Get the booking
    const booking = await prisma.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Valid status values check
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Invalid status value");
    }

    // Update the booking status
    const updatedBooking = await prisma.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    // Revalidate relevant paths
    revalidatePath("/admin/test-drives");
    revalidatePath(`/bookings/${bookingId}`);

    return { success: true, data: updatedBooking };

  } catch (error) {
    console.error("Error updating test drive status:", error);
    throw new Error("Failed to update test drive status: " + error.message);
  }
}



export async function getDashboardData() {
  try {
    // ── Auth & Authorization ──────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // ── Parallel Data Fetching ────────────────────────────────────────────
    const [
      totalCars,
      availableCars,
      soldCars,
      unavailableCars,
      featuredCars,
      totalTestDrives,
      pendingTestDrives,
      confirmedTestDrives,
      completedTestDrives,
      cancelledTestDrives,
      noShowTestDrives,
      completedTestDriveCarIds,
    ] = await Promise.all([
      prisma.car.count(),
      prisma.car.count({ where: { status: "AVAILABLE" } }),
      prisma.car.count({ where: { status: "SOLD" } }),
      prisma.car.count({ where: { status: "UNAVAILABLE" } }),
      prisma.car.count({ where: { featured: true } }),
      prisma.testDriveBooking.count(),
      prisma.testDriveBooking.count({ where: { status: "PENDING" } }),
      prisma.testDriveBooking.count({ where: { status: "CONFIRMED" } }),
      prisma.testDriveBooking.count({ where: { status: "COMPLETED" } }),
      prisma.testDriveBooking.count({ where: { status: "CANCELLED" } }),
      prisma.testDriveBooking.count({ where: { status: "NO_SHOW" } }),
      prisma.testDriveBooking.findMany({
        where: { status: "COMPLETED" },
        select: { carId: true },
      }),
    ]);

    
    const completedCarIds = completedTestDriveCarIds.map((item) => item.carId);

    const soldCarsAfterTestDrive = await prisma.car.count({
      where: {
        id: { in: completedCarIds },
        status: "SOLD",
      },
    });

    const conversionRate =
      completedTestDrives > 0
        ? parseFloat(((soldCarsAfterTestDrive / completedTestDrives) * 100).toFixed(2))
        : 0;

    
    return {
      success: true,
      data: {
        cars: {
          total: totalCars,
          available: availableCars,
          sold: soldCars,
          unavailable: unavailableCars,
          featured: featuredCars,
        },
        testDrives: {
          total: totalTestDrives,
          pending: pendingTestDrives,
          confirmed: confirmedTestDrives,
          completed: completedTestDrives,
          cancelled: cancelledTestDrives,
          noShow: noShowTestDrives,
          conversionRate,
        },
      },
    };
  } catch (error) {
    console.error("[getDashboardData] Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to fetch dashboard data",
    };
  }
}
