"use server"
import { carformSchema } from "@/lib/carSchema";
import { prisma } from "@/lib/client";
import { getGemini } from "@/lib/gemini";
import { serializeCarData } from "@/lib/helper";
import { extractJson } from "@/lib/safeParse";
import { createClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { useId } from "react";
import {v4 as uuidv4} from "uuid"


const TIMEOUT = 20000;

export async function fileToBase64(file){
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
return buffer.toString("base64")
}
export async function extractCarWithAI({ base64, mimeType }) {
  try {
    if (!base64) throw new Error("Image missing");

    const genAI = getGemini();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType,
      },
    };

    const prompt = `
You are a car recognition AI.
Return ONLY JSON.

{
  "make": "",
  "model": "",
  "year": number,
  "color": "",
  "bodyType": "",
  "fuelType": "",
  "transmission": "",
  "mileage": number,
  "price": number,
  "description": "",
  "confidence": number
}
`;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 20000);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, imagePart],
        },
      ],
    });

    clearTimeout(id);

    const text = result.response.text();

    const parsed = extractJson(text);
    const validated = carformSchema.parse(parsed);

    return {
      success: true,
      data: validated,
    };
  } catch (err) {
    console.error("Gemini error:", err);

    return {
      success: false,
      message: err.message,
    };
  }
}


export async function addCar({carData, images}){
  try {
     const {userId} = await auth();
        if(!userId) throw new Error("Unathorized")
        const user = await prisma.user.findUnique({
          where:{
            clerkUserId:userId,
          },
        });
        if(!user) throw new Error("user not found")

          const carId = uuidv4()
          const folderPath = `cars/${carId}`

          const cookieStore = await cookies();
          const supabase = createClient(cookieStore);

          const imageUrls = [];

          for(let i = 0; i < images.length; i++){
            const base64Data = images[i];
            if(!base64Data || !base64Data.startsWith("data:image/")){
              console.warn("skiping invalid images");
              continue;
            }
            // extract base64 part

            const base64 = base64Data.split(",")[1];
            const imageBuffer = Buffer.from(base64, "base64");

            // check file extension from data url

            const mimeMatch = base64Data.match(/data:image\/([a-za-z0-9]+);/);
            const fileExtention = mimeMatch ? mimeMatch[1]:"jpeg"

            // create filename

          const fileName = `image-${Date.now()}-${i}-${fileExtention}`;
          const filePath = `${folderPath}/${fileName}`;

       const {data, error} =    await supabase.storage.from("car-images").upload(filePath, imageBuffer,{
            contentType:`image/${fileExtention}`,
          });

          if(error){
            console.error("error uploading image:", error);
            throw new Error(`image upload failed: ${error.message}`)
          }
          const publickUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images/${filePath}`;
          imageUrls.push(publickUrl);
          }
      
      if(imageUrls.length === 0){
        throw new Error("in valid image upload");;
      }

  const car = await prisma.car.create({
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
  images: imageUrls, // Store the array of image URLs
},
   });

   revalidatePath('/admin/cars')

   return {
    success:true,
   };

  } catch (error) {
    throw new Error("faild to add car:" + error.message)
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

    // ✅ Supabase images delete
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      const filePaths = car.images.map((imageUrl)=>{
        const url = new URL(imageUrl);
        const pathMatch = url.pathname.match(/\/car-images\/(.*)/);
        return pathMatch ? pathMatch[1] : null;
      }).filter(Boolean);

      if(filePaths.length > 0){
        const {error} = await supabase.storage
          .from("car-images")
          .remove(filePaths);
        if(error){
          console.error("Image delete failed", error);
        }
      }
    } catch (storageError) {
      console.error("Storage error", storageError);
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