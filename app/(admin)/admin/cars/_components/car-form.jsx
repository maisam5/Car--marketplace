"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form';

import{zodResolver} from '@hookform/resolvers/zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import useFetch from '@/custom-hooks/use-fetch';
import { addCar, extractCarWithAI } from '@/actions/cars';
import { useRouter } from 'next/navigation';
import { carformSchema } from '@/lib/carSchema';


const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissions = ["Automatic", "Manual", "Semi-Automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];
const carStatuses = ["AVAILABLE", "UNAVAILABLE", "SOLD"];


const AddCarForm = () => {
  const [activeTab, setActiveTab] =useState("ai")
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageError, setImageError] = useState("")
  const [uploadAiImage, setUplaodAiImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const router = useRouter();


  const {data:addCarResult, loading:addCarLoading, fn:addCarFn} = useFetch(addCar);
  
  useEffect(()=>{
 if(addCarResult?.success){
  toast.success("car added successfully")
  router.push("/admin/cars")
 }
  },[addCarResult, router])
  const onSubmit = async(data)=>{
  if(uploadedImages.length===0){
     setImageError("please select an image");
     return;
  }
  const carData = {
  ...data,
  year: parseInt(data.year),
  price: parseFloat(data.price),
  mileage: parseInt(data.mileage),
  seats: data.seats ? parseInt(data.seats) : null,
};
await addCarFn({
  carData,
  images:uploadedImages,
})
  }

   const onMultiImagesDrop = (acceptedFiles) => {
  const validFiles = acceptedFiles.filter((file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} exceeds 5MB limit and will be skipped`);
      return false;
    }
    return true;
  });
  if(validFiles.length === 0) return;

  const newImages = [];

validFiles.forEach((file) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    newImages.push(e.target.result);
    if(newImages.length ===validFiles.length){
      setUploadedImages((prev) => [...prev, ...newImages]);
      setImageError("");
      toast.success(` successfully uploaded ${validFiles.length} images`);
    } 
  };
  reader.readAsDataURL(file);
});

 
};

    const { 
      getRootProps: getMultiImageRootProps,
      getInputProps: getMultiImageInputProps,
     } =
      useDropzone({
        onDrop:onMultiImagesDrop,
        accept: {
          "image/*": [".jpeg", ".jpg", ".png",".webp"],
        },
        multiple:true,
      });

      const removeImage = (index)=>{
        setUploadedImages((prev)=> prev.filter((_, i)=> i !== index));
      }

 

 const {register,setValue, getValues, formState:{errors}, handleSubmit, watch} =  useForm({
    resolver: zodResolver(carformSchema),
  defaultValues: {
  featured: false,
  make: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  color: "",
  fuelType: "",
  transmission: "",
  bodyType: "",
  seats: "",
  description: "",
  status: "AVAILABLE",
  
},
  })
  // ai car details extraction
   const onAiDrop = (files) => {
  const file = files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Max 5MB");
    return;
  }

  const reader = new FileReader();

  reader.onloadend = () => {
    const base64 = reader.result.split(",")[1];

    setUplaodAiImage({
      base64,
      mimeType: file.type,
    });

    setImagePreview(reader.result);
  };

  reader.readAsDataURL(file);
};
const {
  getRootProps:getAiRootProps,
  getInputProps:getAiInputProps,
  
} = useDropzone({
  onDrop: onAiDrop,
  accept: {
    "image/*": [".jpg", ".jpeg", ".png", ".webp"],
  },
  multiple: false,
});
const { fn, data, loading, error } = useFetch(extractCarWithAI);

const isProcessingRef = useRef(false);
const processWithAi = async () => {
    if (isProcessingRef.current) return;
  if (!uploadAiImage) return toast.error("Select image");

  try {
    isProcessingRef.current = true;
    await fn(uploadAiImage);
  } finally {
    isProcessingRef.current = false;
  }
};
useEffect(() => {
  if (!data?.success) return;

  const c = data.data;

  setValue("make", c.make || "");
  setValue("model", c.model || "");
  setValue("year", c.year?.toString() || "");
  setValue("color", c.color || "");
  setValue("bodyType", c.bodyType || "");
  setValue("fuelType", c.fuelType || "");
  setValue("price", c.price || "");
  setValue("mileage", c.mileage || "");
  setValue("transmission", c.transmission || "");
  setValue("description", c.description || "");

  toast.success("Car detected with AI");
}, [data, setValue]);

useEffect(() => {
  if (!error) return;

  toast.error(error.message || "AI failed");
}, [error]);



  return (
    <div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="ai"
        className="mt-6"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="ai">Ai Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
              <CardDescription>Enter the details of car</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      placeholder="e.g. BMW"
                      {...register("make")}
                      className={errors.make ? "border-red-500" : ""}
                    />
                    {errors.make && (
                      <p className="text-xs text-red-500">
                        {errors.make.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g. BMW-x1"
                      {...register("model")}
                      className={errors.model ? "border-red-500" : ""}
                    />
                    {errors.model && (
                      <p className="text-xs text-red-500">
                        {errors.model.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      placeholder="e.g. 2001"
                      {...register("year")}
                      className={errors.year ? "border-red-500" : ""}
                    />
                    {errors.year && (
                      <p className="text-xs text-red-500">
                        {errors.year.message}
                      </p>
                    )}
                  </div>

                  {/*price*/}

                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      placeholder="$40000"
                      {...register("price")}
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/*mileage*/}

                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage</Label>
                    <Input
                      id="mileage"
                      placeholder="e.g. 20km"
                      {...register("mileage")}
                      className={errors.mileage ? "border-red-500" : ""}
                    />
                    {errors.mileage && (
                      <p className="text-xs text-red-500">
                        {errors.mileage.message}
                      </p>
                    )}
                  </div>

                  {/*color*/}
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      placeholder="e.g. Red"
                      {...register("color")}
                      className={errors.color ? "border-red-500" : ""}
                    />
                    {errors.color && (
                      <p className="text-xs text-red-500">
                        {errors.color.message}
                      </p>
                    )}
                  </div>

                  {/*fueltype*/}
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">fuelType</Label>
                    <Select
                      onValueChange={(value) => setValue("fuelType", value)}
                      defaultValue={getValues("fuelType")}
                    >
                      <SelectTrigger
                        className={errors.fuelType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.fuelType && (
                      <p className="text-xs text-red-500">
                        {errors.fuelType.message}
                      </p>
                    )}
                  </div>

                  {/*transmission*/}
                  <div className="space-y-2">
                    <Label>Transmission</Label>

                    <Select
                      value={watch("transmission") || ""}
                      onValueChange={(value) =>
                        setValue("transmission", value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger
                        className={errors.transmission ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="select transmission" />
                      </SelectTrigger>

                      <SelectContent>
                        {transmissions.map((ttype) => (
                          <SelectItem key={ttype} value={ttype}>
                            {ttype}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {errors.transmission && (
                      <p className="text-xs text-red-500">
                        {errors.transmission.message}
                      </p>
                    )}
                  </div>

                  {/*body types*/}
                  <div className="space-y-2">
                    <Label htmlFor="bodyType">Body Type</Label>
                    <Select
                      onValueChange={(value) => setValue("bodyType", value)}
                      defaultValue={getValues("bodyType")}
                    >
                      <SelectTrigger
                        className={errors.bodyType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bodyType && (
                      <p className="text-xs text-red-500">
                        {errors.bodyType.message}
                      </p>
                    )}
                  </div>
                  {/*seats*/}
                  <div className="space-y-2">
                    <Label htmlFor="seats">
                      Number of Seats{" "}
                      <span className="text-sm text-gray-500 font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      id="seats"
                      placeholder="e.g. 5"
                      {...register("seats")}
                      className={errors.seats ? "border-red-500" : ""}
                    />
                  </div>
                  {/*status*/}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={(value) => setValue("status", value)}
                      defaultValue={getValues("status")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {carStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/*description*/}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter detailed description of the car..."
                    className={`min-h-32 ${
                      errors.description ? "border-red-500" : ""
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>
                {/*checkbox*/}

                {/* Featured Checkbox */}
                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <Checkbox
                    id="featured"
                    {...register("featured")}
                    onCheckedChange={(val) => setValue("featured", val)}
                  />

                  <div className="space-y-1 leading-none">
                    <Label htmlFor="featured">Feature this Car</Label>
                    <p className="text-sm text-gray-500">
                      Featured cars appear on the homepage
                    </p>
                  </div>
                </div>
                {/*dropzone*/}
                <div>
                  <Label
                    htmlFor="images"
                    className={imageError ? "text-red-500" : ""}
                  >
                    Images{""}
                    {imageError && <span className="text-red-500">*</span>}
                  </Label>
                  <div
                    {...getMultiImageRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mt-2 hover:bg-gray-50 transition ${
                      imageError ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <input {...getMultiImageInputProps()} />
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="text-gray-400 h-12 w-12 mb-2" />
                      <p className="text-gray-700 mb-2">
                        Drag & drop a car image or click to select multiple
                        images
                      </p>

                      <p className="text-xs mt-1 text-gray-500">
                        (JPG,PNG,WEBP, max 5MB each)
                      </p>
                    </div>
                  </div>
                  {imageError && (
                    <p className="text-sm text-red-500 mt-1">{imageError}</p>
                  )}
                </div>
                {/*imges show*/}
                {uploadedImages.length > 0 && (
                  <div className="mt-4 ">
                    <h3 className="font-medium mb-2 text-sm">
                      Uploaded Images ({uploadedImages.length})
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      {uploadedImages.map((image, index) => {
                        return (
                          <div key={index} className="relative group">
                            <Image
                              src={image}
                              alt={`Car image ${index + 1}`}
                              height={50}
                              width={50}
                              className="h-28 w-full object-cover rounded-md"
                              priority
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3 cursor-pointer" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={addCarLoading}
                  
                >
                  {addCarLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding
                      Car...
                    </>
                  ) : (
                    "Add Car"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent defaultValue="ai" value={activeTab} >
          <Card>
        <CardHeader>
          <CardTitle>Ai Powerd Car Details Extraction</CardTitle>
          <CardDescription>
            Upload a car image to extract details using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border-dashed border-2 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <Image
                    src={imagePreview}
                    alt="car"
                    width={300}
                    height={160}
                    className="object-contain mb-4"
                  />
                  <div className="gap-2 flex">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImagePreview(null);
                        setUplaodAiImage("");
                        toast.info("image removed");
                      }}
                    >
                      Remove Image
                    </Button>
                    <Button
                      size="sm"
                      onClick={processWithAi}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 w-4 animate-spin" />
                          processing..
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Extract Details
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  {...getAiRootProps()}
                  className="cursor-pointer hover:bg-gray-100 transition"
                >
                  <input {...getAiInputProps()} />
                  <div className="flex flex-col items-center justify-center">
                    <Camera className="text-gray-400 h-12 w-12 mb-2" />
                    <p className="text-gray-600 text-sm">
                      Drag & drop or select an image
                    </p>

                    <p className="mt-1 text-gray-500 text-xs">
                      Supports: JPG, PNG,WEBP (max 5mb)
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">How it works</h3>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-4">
                <li>Upload a clear image of the car</li>
                <li>Click Extract Details to analyze with Gemini AI</li>
                <li>Review the extracted information</li>
                <li>Fill in any missing details manually</li>
                <li>Add the car to your inventory</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
          
          </TabsContent>
      </Tabs>
    </div>
  );
}

export default AddCarForm