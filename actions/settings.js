"use server"

import { prisma } from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { success } from "zod";



export async function getDealershipInfo() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    let dealership = await prisma.dealershipInfo.findFirst({
        include:{
            workingHours:{
                orderBy:{
                    dayOfWeek:"asc"
                }
            }
        }
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
    include:{
        workingHours:{
            orderBy:{
                dayOfWeek:"asc"
            }
        }
    }
  });
}
return {
    success:true,
    data:{
        ...dealership,
      createdAt:dealership.createdAt.toISOString(),
      updatedAt:dealership.updatedAt.toISOString(),
    }
}

  } catch (error) {
    throw new Error("error fetching dealership info" + error.message);
  }
}

export async function saveWorkingHours(workingHours) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    const dealership = await prisma.dealershipInfo.findFirst();

    if (!dealership) {
    throw new Error("dealership info not found")
    }
 // update working hours

 await prisma.workingHour.deleteMany({
    where:{dealershipId:dealership.id},
 })
    for (const hour of workingHours) {
      await prisma.workingHour.create({
        data: {
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isOpen: hour.isOpen,
          dealershipId: dealership.id,
        },
      });
    }
    revalidatePath("/admin/settings");
    revalidatePath("/");

    return { success: true,  };

  } catch (error) {
    console.error("Error saving working hours:", error);
    throw error;
  }
}

export async function getUsers() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    
    const users = await prisma.user.findMany({
        orderBy:{createdAt:"desc"}
    });
  
   return {
    success:true,
    data: users.map((user)=>({
        ...user,
        createdAt:user.createdAt.toISOString(),
        updatedAt:user.updatedAt.toISOString(),
    })),
   };

  } catch (error) {
    throw new Error("error fetching user" + error.message)
  }
}

export async function updateUserRole(userId, role) {
  try {
    const { userId:adminId } = await auth();
    if (!adminId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { clerkUserId: adminId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    
    revalidatePath("/admin/settings");
 return{
    success:true,
 }
  } catch (error) {
throw new Error("error updating user" + error.message)  }
}