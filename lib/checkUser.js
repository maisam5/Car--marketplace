import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./client";

export const checkuser = async () => {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const loggedInUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (loggedInUser) return loggedInUser;

    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!email) return null;

    const newUser = await prisma.user.create({
      data: {
        clerkUserId: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        imageUrl: user.imageUrl,
        email,
      },
    });

    return newUser;
  } catch (error) {
    console.error("checkuser error:", error);
    return null;
  }
};
