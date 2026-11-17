"use server"
import { carformSchema } from "@/lib/carSchema";
import { deleteCarImages, uploadCarImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/client";
import { generateWithGemini } from "@/lib/gemini";
import { serializeCarData } from "@/lib/helper";
import { extractJson } from "@/lib/safeParse";
import { auth } from "@clerk/nextjs/server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const TRANSMISSIONS = ["Automatic", "Manual", "Semi-Automatic"];
const BODY_TYPES = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];

function matchOption(value, options, fallback) {
  if (!value) return fallback;
  const normalized = String(value).trim().toLowerCase();
  return (
    options.find((opt) => opt.toLowerCase() === normalized) ||
    options.find((opt) => normalized.includes(opt.toLowerCase())) ||
    fallback
  );
}

export async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

export async function extractCarWithAI({ base64, mimeType }) {
  try {
    if (!base64) throw new Error("Image missing");

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: mimeType || "image/jpeg",
      },
    };

    const prompt = `
Analyze this car image and extract its details as a single JSON object.
Return ONLY valid JSON, with no markdown or extra text.

Use these exact allowed values where applicable:
- bodyType: one of ${JSON.stringify(BODY_TYPES)}
- fuelType: one of ${JSON.stringify(FUEL_TYPES)}
- transmission: one of ${JSON.stringify(TRANSMISSIONS)}

{
  "make": "manufacturer name (e.g. Toyota)",
  "model": "model name (e.g. Corolla)",
  "year": "4-digit estimated year as string (e.g. 2022)",
  "color": "primary exterior color (e.g. White)",
  "bodyType": "SUV",
  "fuelType": "Petrol",
  "transmission": "Automatic",
  "seats": "estimated number of seats as string (e.g. 5)",
  "mileage": "estimated mileage number as string (e.g. 15000)",
  "price": "estimated USD price number as string (e.g. 25000)",
  "description": "short 1-2 sentence description of the car shown in the image",
  "confidence": 0.9
}
`;

    const text = await generateWithGemini([{ text: prompt }, imagePart]);
    const parsed = extractJson(text);

    const currentYear = new Date().getFullYear();
    const parsedYear = parseInt(parsed.year, 10);
    const safeYear =
      !isNaN(parsedYear) && parsedYear >= 1900 && parsedYear <= currentYear + 1
        ? String(parsedYear)
        : String(currentYear);

    const make = String(parsed.make || "Unknown").trim() || "Unknown";
    const model = String(parsed.model || "Unknown").trim() || "Unknown";
    const rawDesc = String(parsed.description || "").trim();
    const description =
      rawDesc.length >= 10
        ? rawDesc
        : `${safeYear} ${make} ${model} in good condition.`;

    const normalized = {
      make,
      model,
      year: safeYear,
      price: String(parsed.price ?? "0").replace(/[^0-9.]/g, "") || "0",
      mileage: String(parsed.mileage ?? "0").replace(/[^0-9]/g, "") || "0",
      color: String(parsed.color || "Unknown").trim() || "Unknown",
      fuelType: matchOption(parsed.fuelType, FUEL_TYPES, "Petrol"),
      transmission: matchOption(parsed.transmission, TRANSMISSIONS, "Automatic"),
      bodyType: matchOption(parsed.bodyType, BODY_TYPES, "Sedan"),
      seats: parsed.seats ? String(parsed.seats).replace(/[^0-9]/g, "") : "5",
      description,
      status: "AVAILABLE",
      featured: false,
    };

    const validated = carformSchema.parse(normalized);

    return {
      success: true,
      data: validated,
    };
  } catch (err) {
    console.error("Gemini error:", err);

    return {
      success: false,
      message: err.message || "Failed to extract car details",
    };
  }
}


export async function addCar({carData, images}){
  const uploadedUrls = [];

  try {
     const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized")
        const user = await prisma.user.findUnique({
          where:{
            clerkUserId:userId,
          },
        });
        if(!user) throw new Error("user not found")

          const carId = uuidv4();
          const folderPath = `carhub/cars/${carId}`;

          for (let i = 0; i < images.length; i++) {
            const base64Data = images[i];
            if (!base64Data || !base64Data.startsWith("data:image/")) {
              console.warn("skipping invalid image");
              continue;
            }

            const { url } = await uploadCarImage(base64Data, folderPath);
            uploadedUrls.push(url);
          }
      
      if(uploadedUrls.length === 0){
        throw new Error("Invalid image upload");
      }

  await prisma.car.create({
   data : {
  id: carId,
  make: carData.make,
  model: carData.model,
  year: carData.year,
  price: carData.price,
  mileage: carData.mileage,
  color: carData.color,
  fuelType: carData.fuelType,
  transmission: carData.transmission,
  bodyType: carData.bodyType,
  seats: carData.seats,
  description: carData.description,
  status: carData.status,
  featured: carData.featured,
  images: uploadedUrls,
},
   });

   revalidatePath('/admin/cars')

   return {
    success:true,
   };

  } catch (error) {
    // Rollback uploaded Cloudinary images if DB insert or later step fails
    if (uploadedUrls.length > 0) {
      await deleteCarImages(uploadedUrls).catch((cleanupErr) => {
        console.error("Cloudinary rollback cleanup failed:", cleanupErr);
      });
    }
    throw new Error("Failed to add car: " + error.message);
  }
}

export async function getCars(search=""){
try {
  const {userId} = await auth();
  if(!userId) throw new Error("Unathorized")
    const user = await prisma.user.findUnique({
  where:{clerkUserId:userId},
    });
    if(!user) throw new Error("user not found");

    let where = {};
    if(search) {
      where.OR=[
        {make:{contains:search,mode:"insensitive"}},
        {model:{contains:search,mode:"insensitive"}},
        {color:{contains:search,mode:"insensitive"}},
      ];
    }
    const cars = await prisma.car.findMany({
      where,
      orderBy:{createdAt:"desc"},
    })
    const serializedCars = cars.map(serializeCarData)
    return {
      success:true,
      data:serializedCars,
    }
} catch (error) {
  console.error("error fetching cars", error)
  return{
    success:false,
    error:error.message,
  }
}
}

export async function deleteCar(id){
  try {
    const {userId} = await auth();
    if(!userId) throw new Error("Unauthorized");
    
    const user = await prisma.user.findUnique({
      where:{clerkUserId:userId},
    });
    if(!user) throw new Error("User not found");
    
    // ✅ Admin check add kiya
    if(user.role !== "ADMIN") throw new Error("Unauthorized - Admins only");

    const car = await prisma.car.findUnique({
      where:{id},
      select:{images:true},
    });
    if(!car) return{
      success:false,
      error:"Car not found",
    };

    await prisma.car.delete({
      where:{id},
    });

    // ✅ Delete images from Cloudinary
    try {
      await deleteCarImages(car.images);
    } catch (storageError) {
      console.error("Cloudinary delete error:", storageError);
    }

    revalidatePath("/admin/cars");
    return{ success:true };

  } catch (error) {
    console.error("deleteCar error:", error.message); // ✅ log add kiya
    return{
      success:false,
      error:error.message,
    }
  }
}


export async function updateCar(id, {status,featured}){
try {
  const {userId} = await auth();
  if(!userId) throw new Error("Unathorized")
    const user = await prisma.user.findUnique({
  where:{clerkUserId:userId},
    });
    if(!user) throw new Error("user not found");

    const updateData = {};
    if(status !== undefined){
      updateData.status= status;
    }
    if(featured !== undefined){
      updateData.featured = featured;
    }
    await prisma.car.update({
      where:{id},
      data:updateData,
    });
    revalidatePath("/admin/cars");
    return {
      success:true,
    }

} catch (error) {
  console.error("failed to update car ", error)
  return {
    success:false,
    error:error.message,
  }
}
}