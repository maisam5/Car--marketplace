import { auth } from '@clerk/nextjs/server';
import React from 'react'
import BookingListPage from './_components/booking-list';


export const metadata = {
  title: "My Bookings | carhub",
  description: "Manage your test drive bookings",
};

const BookingsPage = async () => {
    const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect=/reservations");
  }

  const reservationsResult = await getUserTestDrives();
  return (
   <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-6 gradient-title">Your Bookings</h1>
     <BookingListPage initialData={reservationsResult} />
    </div>
  )
}

export default BookingsPage