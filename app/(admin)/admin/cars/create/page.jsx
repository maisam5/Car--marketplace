import React from 'react'
import AddCarForm from '../_components/car-form'


export const metadata = {
    title: "cars | CarHub Admin",
    Description:"Add new cars to market place"
}
const AddCarPage = () => {
  return (
     <div className='p-6'>
            <h1 className='text-2xl font-bold mb-6 '>Add cars</h1>
           <AddCarForm />
        </div>
  )
}

export default AddCarPage