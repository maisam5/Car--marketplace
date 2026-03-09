import { getDashboardData } from '@/actions/admin'
import React from 'react'
import Dashboard from './_components/dashboard';

const AdminPage = async() => {
  const dashboardData = await getDashboardData();

  return (
    <div className='p-6'>
      <h1 className='text-xl font-bold mb-4'>Admin Dashboard</h1>
      <Dashboard initialData={dashboardData} />
    </div>
  )
}

export default AdminPage