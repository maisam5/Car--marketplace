"use client"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Car, CheckCircle, CheckCircle2, Clock, DollarSign, Info, TrendingUp, XCircle } from 'lucide-react';
import React, { useState } from 'react'

const Dashboard = ({ initialData }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!initialData || !initialData.success) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {initialData?.error || "Failed to load dashboard data"}
        </AlertDescription>
      </Alert>
    );
  }

  const { cars, testDrives } = initialData.data;

  const inventoryUtilization = cars.total > 0
    ? ((cars.sold / cars.total) * 100).toFixed(1)
    : 0;

  const testDriveSuccess = testDrives.total > 0
    ? ((testDrives.completed / testDrives.total) * 100).toFixed(0)
    : 0;

  const upcomingTestDrives = testDrives.pending + testDrives.confirmed;

  return (
    <div>
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test-drives">Test Drives</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* ── Stats Cards ── */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cars.total}</div>
                <p className="text-xs text-muted-foreground">
                  {cars.available} available, {cars.sold} sold
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Test Drives</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.total}</div>
                <p className="text-xs text-muted-foreground">
                  {testDrives.pending} pending, {testDrives.confirmed} confirmed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  From test drives to sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cars Sold</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cars.sold}</div>
                <p className="text-xs text-muted-foreground">
                  {((cars.sold / cars.total) * 100).toFixed(1)}% of inventory
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Dealership Summary ── */}
          <Card>
            <CardHeader>
              <CardTitle>Dealership Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bars */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Car Inventory */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Car Inventory</span>
                    <span className="text-muted-foreground">{cars.available} available</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{
                        width: cars.total > 0
                          ? `${(cars.available / cars.total) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Available inventory capacity</p>
                </div>

                {/* Test Drive Success */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Test Drive Success</span>
                    <span className="text-muted-foreground">{testDriveSuccess}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${testDriveSuccess}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Completed test drives</p>
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{cars.sold}</p>
                  <p className="text-xs text-muted-foreground mt-1">Cars Sold</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{upcomingTestDrives}</p>
                  <p className="text-xs text-muted-foreground mt-1">Upcoming Test Drives</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{inventoryUtilization}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Inventory Utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
{/*test drives tab */}
<TabsContent value="test-drives" className="space-y-6">
  
  {/* ── Top Booking Cards ── */}
  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
    {/* Total Bookings */}
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{testDrives.total}</div>
      </CardContent>
    </Card>

    {/* Pending */}
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pending</CardTitle>
        <Clock className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{testDrives.pending}</div>
        <p className="text-xs text-muted-foreground">
          {testDrives.total > 0
            ? ((testDrives.pending / testDrives.total) * 100).toFixed(1)
            : 0}% of bookings
        </p>
      </CardContent>
    </Card>

    {/* Confirmed */}
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
        <CheckCircle className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{testDrives.confirmed}</div>
        <p className="text-xs text-muted-foreground">
          {testDrives.total > 0
            ? ((testDrives.confirmed / testDrives.total) * 100).toFixed(1)
            : 0}% of bookings
        </p>
      </CardContent>
    </Card>

    {/* Completed */}
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Completed</CardTitle>
        <CheckCircle2 className="h-4 w-4 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{testDrives.completed}</div>
        <p className="text-xs text-muted-foreground">
          {testDrives.total > 0
            ? ((testDrives.completed / testDrives.total) * 100).toFixed(1)
            : 0}% of bookings
        </p>
      </CardContent>
    </Card>

    {/* Cancelled */}
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
        <XCircle className="h-4 w-4 text-red-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{testDrives.cancelled}</div>
        <p className="text-xs text-muted-foreground">
          {testDrives.total > 0
            ? ((testDrives.cancelled / testDrives.total) * 100).toFixed(1)
            : 0}% of bookings
        </p>
      </CardContent>
    </Card>
  </div>

  {/* ── Test Drive Statistics ── */}
  <Card>
    <CardHeader>
      <CardTitle>Test Drive Statistics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Conversion Rate */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Conversion Rate</p>
          <p className="text-3xl font-bold text-blue-500">
            {testDrives.conversionRate}%
          </p>
          <p className="text-xs text-muted-foreground">
            Test drives resulting in car purchases
          </p>
        </div>

        {/* Completion Rate */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Completion Rate</p>
          <p className="text-3xl font-bold text-green-500">
            {testDriveSuccess}%
          </p>
          <p className="text-xs text-muted-foreground">
            Test drives successfully completed
          </p>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* ── Booking Status Breakdown ── */}
  <Card>
    <CardHeader>
      <CardTitle>Booking Status Breakdown</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {[
        { label: "Pending", value: testDrives.pending, color: "bg-yellow-500" },
        { label: "Confirmed", value: testDrives.confirmed, color: "bg-green-500" },
        { label: "Completed", value: testDrives.completed, color: "bg-blue-500" },
        { label: "Cancelled", value: testDrives.cancelled, color: "bg-red-500" },
        { label: "No Show", value: testDrives.noShow, color: "bg-gray-400" },
      ].map(({ label, value, color }) => (
        <div key={label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{label}</span>
            <span className="text-muted-foreground">
              {value} ({testDrives.total > 0
                ? ((value / testDrives.total) * 100).toFixed(1)
                : 0}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full ${color} transition-all`}
              style={{
                width: testDrives.total > 0
                  ? `${(value / testDrives.total) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>

</TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;