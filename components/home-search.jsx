'use client'
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Camera, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useFetch from '@/custom-hooks/use-fetch'
import { processImageSearch } from '@/actions/home'

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [imageSearchActive, setImageSearchActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);


  const router = useRouter();
 
  const {
    loading:isProcessing,
    fn:processImageFn,
    data:processResult,
    error:processError
  } = useFetch(processImageSearch);


  const handleTextSubmit = (e) => {
 e.preventDefault();
 if(!searchTerm.trim()){
  toast.error("please enter a search term")
  return;
 }
 router.push(`/cars?search=${encodeURIComponent(searchTerm)}`);

  };

  const handleImageSearch = async(e) => {
    e.preventDefault();
    if(!searchImage){
      toast.error("please select an image")
      return;
    }
    //add ai logic after this
    await processImageFn(searchImage)
    
  };
  useEffect(()=>{
    if(processError){
      toast.error("failed to analyze image" + (processError.message || "unknown error")
    );
    }
  },[processError])

  useEffect(() => {
  if (processResult?.success) {
    const params = new URLSearchParams();

    if (processResult.data.make) params.set("make", processResult.data.make);
    if (processResult.data.bodyType)
      params.set("bodyType", processResult.data.bodyType);
    if (processResult.data.color)
      params.set("color", processResult.data.color);

     router.push(`/cars?${params.toString()}`);
  }
}, [processResult,router]);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setSearchImage(file); // ✅ store actual file

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setIsUploading(false);
      toast.success("Image Uploaded Successfully");
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to upload image");
    };

    reader.readAsDataURL(file);
  };
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png"],
      },
      maxFiles: 1,
    });
  return (
    <div>
      <form onSubmit={handleTextSubmit}>
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Enter make, model or use Ai image search.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 pr-12 w-full rounded-full border-gray-300 bg-white/85 backdrop-blur-sm"
          />
          <div className="absolute right-25">
            <Camera
              size={35}
              onClick={() => setImageSearchActive(!imageSearchActive)}
              className="cursor-pointer rounded-xl p-1.5"
              style={{
                background: imageSearchActive ? "black" : "",
                color: imageSearchActive ? "white" : "",
              }}
            />
          </div>
          <Button type="submit" className="absolute right-2 rounded-full">
            Search
          </Button>
        </div>
      </form>
      {imageSearchActive && (
        <div className="mt-4">
          <form onSubmit={handleImageSearch}>
            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6">
              {imagePreview ? (
                <div>
                  <Image
                    src={imagePreview}
                    alt="car"
                    width={300}
                    height={160}
                    className="object-contain mb-4"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchImage(null);
                      setImagePreview("");
                      toast.info("image removed");
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Upload className="text-gray-400 h-12 w-12 mb-2" />
                    <p className='text-gray-500 mb-2'>
                      {isDragActive && !isDragReject
                        ? "leave the file here to upload"
                        : "Drag & drop a car image or click to select"}
                    </p>
                    {isDragReject && (
                      <p className="text-red-500 mb-2">Invalid Image type</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Supports: JPG, PNG (max 5mb)
                    </p>
                  </div>
                </div>
              )}
            </div>
            {imagePreview && <Button type="submit" className="mt-2 w-full" 
            disabled={isUploading || isProcessing }
            >
              {isUploading ? "uploading" : isProcessing?"analyzing image": "search with this image"}
              </Button>}
          </form>
        </div>
      )}
    </div>
  );
}

export default HomeSearch