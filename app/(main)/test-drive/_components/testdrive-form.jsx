"use client"
import { bookTestDrive } from '@/actions/test-drive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useFetch from '@/custom-hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar, Car, Clock, Mail, Phone, Send, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';


const testDriveSchema = z.object({
  date: z.date({
    required_error: "Please select a date for your test drive",
  }),
  timeSlot: z.string({
    required_error: "Please select a time slot",
  }),
  notes: z.string().optional(),
});

const TestDriveForm = ({ car, testDriveInfo }) => {

  const router = useRouter();
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(testDriveSchema),
    defaultValues: {
      date: undefined,
      timeSlot: undefined,
      notes: "",
    },
  });

  const {
    loading: bookingInProcess,
    error: bookingError,
    data: bookingResult,
    fn: bookTestDriveFn,
  } = useFetch(bookTestDrive);

  const dealership = testDriveInfo?.dealership;
  // useMemo mein wrap kiya — useEffect exhaustive-deps ESLint warning fix
  const existingBookings = useMemo(
    () => testDriveInfo?.existingBookings ?? [],
    [testDriveInfo?.existingBookings]
  );

  const selectedDate = useWatch({
    control,
    name: "date",
  });

  // Jab date change ho, available time slots update karo
  useEffect(() => {
    if (!selectedDate || !dealership?.workingHours) return;

    const dayOfWeek = format(selectedDate, "EEEE").toUpperCase();
    const workingHoursForDay = dealership.workingHours.find(
      (h) => h.dayOfWeek === dayOfWeek
    );

    if (!workingHoursForDay || workingHoursForDay.isClosed) {
      setAvailableTimeSlots([]);
      setValue("timeSlot", undefined);
      return;
    }

    // Existing bookings ko filter karo selected date ke liye
    const bookedSlotsForDay = existingBookings
      .filter((b) => b.bookingDate === format(selectedDate, "yyyy-MM-dd"))
      .map((b) => b.startTime);

    // Time slots generate karo working hours se
    const slots = generateTimeSlots(
      workingHoursForDay.openTime,
      workingHoursForDay.closeTime,
      bookedSlotsForDay
    );

    setAvailableTimeSlots(slots);
    setValue("timeSlot", undefined); // Reset slot when date changes
  }, [selectedDate, dealership, existingBookings, setValue]);

  // ✅ PRO onSubmit - react-hook-form ke handleSubmit ke sath use karo
  const onSubmit = async (data) => {
    // 1. Find selected time slot from available slots
    const selectedSlot = availableTimeSlots.find(
      (slot) => slot.id === data.timeSlot
    );

    if (!selectedSlot) {
      toast.error("Please select a valid time slot.");
      return;
    }

    // 2. Loading toast
    const loadingToastId = toast.loading("Booking your test drive...");

    try {
      // 3. Server Action call
      const response = await bookTestDriveFn({
        carId: car.id,
        bookingDate: format(data.date, "yyyy-MM-dd"),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: data.notes?.trim() || "",
      });

      // 4. Success handling
      if (response?.success) {
        toast.success(
          response.message || "Test drive booked successfully! 🎉",
          { id: loadingToastId }
        );
        setShowConfirmation(true);
        reset();
        setAvailableTimeSlots([]);

        // Optional: Redirect after delay
        // setTimeout(() => router.push("/bookings"), 2000);
      } else {
        // 5. Server-side error handling
        throw new Error(response?.error || "Booking failed. Please try again.");
      }

    } catch (error) {
      // 6. Network / unexpected error handling
      console.error("Test Drive Booking Error:", error);
      toast.error(
        error.message || "Something went wrong. Please try again.",
        { id: loadingToastId }
      );
    }
  };

  // Booking confirmation screen
  if (showConfirmation) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Car className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-500 mb-6">
          Your test drive has been scheduled. Check your email for details.
        </p>
        <button
          onClick={() => {
            setShowConfirmation(false);
            router.push("/bookings");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
        >
          View My Bookings
        </button>
      </div>
    );
  }

  const isLoading = bookingInProcess || isSubmitting;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Car Details */}
      <div className="md:col-span-1">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Car Details</h2>
            <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
              {car.images && car.images.length > 0 ? (
                <Image
                  src={car.images[0]}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Car className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold">
              {car.year} {car.make} {car.model}
            </h3>
            <div className="mt-2 text-xl font-bold text-blue-700">
              {car.price.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <div className="flex justify-between py-1 border-b">
                <span>Mileage</span>
                <span className="font-medium">{car.mileage.toLocaleString()} miles</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Fuel Type</span>
                <span className="font-medium">{car.fuelType}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Transmission</span>
                <span className="font-medium">{car.transmission}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Body Type</span>
                <span className="font-medium">{car.bodyType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Color</span>
                <span className="font-medium">{car.color}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dealership Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Dealership Info</h2>
            <div className="text-sm">
              <p className="font-medium">{dealership?.name || "CarHub"}</p>
              <p className="text-gray-600 mt-1">{dealership?.address || "Address not available"}</p>
              <p className="text-gray-600 mt-3">
                <span className="font-medium">Phone:</span>{" "}
                {dealership?.phone || "Not available"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span>{" "}
                {dealership?.email || "Not available"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Form */}
      <Card className="mt-6 md:col-span-2 shadow-lg border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Calendar className="text-blue-600" />
            Book a Test Drive
          </CardTitle>
          <p className="text-sm text-gray-500">
            Schedule your drive with Carhub and experience the road.
          </p>
        </CardHeader>

        <CardContent>
          {/* ✅ handleSubmit wraps onSubmit — yahi sahi tarika hai */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

            {/* Date Picker */}
            <div className="space-y-1">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Calendar size={16} /> Preferred Date
              </label>
              <input
                type="date"
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => {
                  const val = e.target.value;
                  setValue("date", val ? new Date(val) : undefined, {
                    shouldValidate: true,
                  });
                }}
              />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-1">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Clock size={16} /> Available Time Slots
              </label>
              {!selectedDate ? (
                <p className="text-sm text-gray-400 italic">Select a date to see available slots</p>
              ) : availableTimeSlots.length === 0 ? (
                <p className="text-sm text-orange-500 italic">
                  No slots available for this date. Try another day.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableTimeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() =>
                        setValue("timeSlot", slot.id, { shouldValidate: true })
                      }
                      className={`p-2 text-sm rounded-lg border font-medium transition-all ${
                        watch("timeSlot") === slot.id
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 text-gray-700 hover:border-blue-400"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
              {errors.timeSlot && (
                <p className="text-xs text-red-500">{errors.timeSlot.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-sm font-semibold">
                Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Any special requests or questions..."
                className="w-full p-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                {...(control.register ? control.register("notes") : {})}
                onChange={(e) => setValue("notes", e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-md"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Confirm Booking
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-widest">
              Secure & Private • No Commitment Required
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDriveForm;


// ─── Helper: Time Slots Generator ──────────────────────────────────────────────
/**
 * Working hours se 30-min slots generate karta hai
 * @param {string} openTime  - "09:00"
 * @param {string} closeTime - "18:00"
 * @param {string[]} bookedSlots - ["09:00", "10:30"]
 */
function generateTimeSlots(openTime, closeTime, bookedSlots = []) {
  const slots = [];
  const [openHour, openMin] = openTime.split(":").map(Number);
  const [closeHour, closeMin] = closeTime.split(":").map(Number);

  let currentHour = openHour;
  let currentMin = openMin;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMin < closeMin)
  ) {
    const startTime = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;

    // 30 min add karo
    let endHour = currentHour;
    let endMin = currentMin + 30;
    if (endMin >= 60) {
      endHour += 1;
      endMin -= 60;
    }
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

    // Check: slot already booked toh skip
    if (!bookedSlots.includes(startTime)) {
      slots.push({
        id: startTime,
        label: `${formatTime12hr(startTime)} – ${formatTime12hr(endTime)}`,
        startTime,
        endTime,
      });
    }

    currentHour = endHour;
    currentMin = endMin;
  }

  return slots;
}

/** "14:30" → "2:30 PM" */
function formatTime12hr(time) {
  const [hour, min] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(min).padStart(2, "0")} ${period}`;
}