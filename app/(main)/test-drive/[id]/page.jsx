import { getCarById } from '@/actions/car-listing';
import { notFound } from 'next/navigation';
import React from 'react'
import TestDriveForm from '../_components/testdrive-form';

export async function generateMetadata({ params }) {
  const { id } = await params;
  // use id if needed
  return {
    title: "Book Test Drive | CarHub",
    description: `schedule a test drive`,
  };
}
const TestDrivePage = async({params}) => {
  const {id} = await params;
  const result = await getCarById(id);
  if(!result.success){
    notFound();
  }
  return (
    <div className='container mx-auto py-12 px-4'>
     <h1 className='text-4xl mb-6 gradient-title'>Book a Test Drive</h1>
     <TestDriveForm car={result.data} testDriveInfo={result.data.testDriveInfo} />
    </div>
  )
}

export default TestDrivePage