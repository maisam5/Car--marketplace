import z from "zod";

export  const carformSchema = z.object({
    make:z.string().min(1, "make is required"),
    model:z.string().min(1, "model is required"),
    year:z.string().refine((val)=>{
      const year = parseInt(val);
      return (
        !isNaN(year) && year >= 1900 && year <= new Date().getFullYear()+1
      );
    }, "valid year is required"),
    price: z.string().min(1, "Price is required"),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    seats: z.string().optional(),
    description: z.string().min(10, "description must be at least 10 chars"),
    status:z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
    featured:z.boolean().default(false),
    bodyType: z.string().min(1, "Body type is required"),
  });