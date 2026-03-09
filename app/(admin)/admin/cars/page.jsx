import React from 'react'
import CarsList from './_components/car-list'

export const metadata = {
    title: "cars | CarHub Admin",
    Description:"manage cars in your marketplace"
}
const CarsPage = () => {
  return (
    <div className='p-6'>
        <h1 className='text-2xl font-bold mb-6 '>Cars Manegement</h1>
        <CarsList />
    </div>
  )
}

export default CarsPage