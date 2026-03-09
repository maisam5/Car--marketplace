import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./client";

export const checkuser = async () => {
  const user = await currentUser();

  if (!user) return null;

  try {
    const loggedInUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) return loggedInUser;

    const newUser = await prisma.user.create({
      data: {
        clerkUserId: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return null;
  }
};
