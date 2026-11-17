import { getFeaturedCars } from "@/actions/home";
import CarCard from "@/components/car-card";
import HomeSearch from "@/components/home-search";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { bodyTypes, carMakes, faqItems } from "@/lib/data";
import { SignedOut } from "@clerk/nextjs";
import { Calendar, Car, ChevronRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
 const featuredCars = await getFeaturedCars();
  return (
    <div className="pt-18 flex flex-col">
      {/*hero*/}

      <section className="relative py-16 md:py-20 dotted-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl mb-4 gradient-title">
              find your dream car with car AI
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Advanced AI car search and test drive
            </p>
          </div>
          {/*search*/}

          <HomeSearch />
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between mb-8 items-center">
            <h1 className="font bold text-xl">Featured Cars</h1>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href={"/cars"}>
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => {
              return <CarCard key={car.id} car={car} />;
            })}
          </div>
        </div>
      </section>

      {/*browse by make section*/}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between mb-8 items-center">
            <h1 className="font bold text-xl">Featured Cars</h1>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href={"/cars"}>
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {carMakes.map((make) => {
              return (
                <Link
                  key={make.name}
                  href={`/cars?make=${make.name}`}
                  className="bg-white text-center shadow rounded-lg  hover:shadow-md transition cursor-pointer"
                >
                  <div
                    className="group relative h-20 w-full mb-3 mx-auto flex items-center justify-center 
                bg-gray-50 rounded-xl p-2 transition-all duration-300 
                hover:bg-white hover:shadow-xl hover:shadow-blue-500/10 border border-transparent hover:border-blue-100"
                  >
                    <Image
                      src={make.image}
                      alt={make.name}
                      fill
                      style={{ objectFit: "contain" }}
                      className="rounded-lg p-1 transition-transform duration-300 group-hover:scale-110"
                    />

                    {/* Optional: Subtle Glow effect on hover */}
                    <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-5 blur-2xl transition-opacity duration-300 rounded-full" />
                  </div>
                  <h3 className="font-medium">{make.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/*why chose us*/}

      <section className="py-16 px-4 bg-gray-50/50 font-sans">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Why Choose Our Platform
            </h2>
            <div className="mt-4 h-1 w-16 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Car size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Wide Selection
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                Thousands of verified vehicles from trusted dealerships and
                private sellers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Calendar size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Easy Test Drive
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                Book a test drive online in minutes, with flexible scheduling
                options.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <ShieldCheck size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Secure Process
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                Verified listings and secure booking process for peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*browse by bodytype*/}

      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between mb-8 items-center">
            <h1 className="font bold text-xl">Browse By Body Type</h1>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href={"/cars"}>
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4  gap-4">
            {bodyTypes.map((type) => {
              return (
                <Link
                  key={type.name}
                  href={`/cars?bodyType=${type.name}`}
                  className="relative group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-lg flex justify-end h-28 mb-4 relative">
                    <Image
                      src={type.image}
                      alt={type.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 transparent rounded-lg flex items-end">
                    <h3 className="text-gray-100 font-bold text-xl pb-2 pl-4">
                      {type.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      {/*faq*/}

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="font bold text-xl text-center mb-8">
            Frequently asked questions
          </h1>
          <Accordion type="single" collapsible defaultValue="item-1" 
          className='w-full'
          >
           {faqItems.map((faq, index)=>{
             return <AccordionItem  key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
           })}
          </Accordion>
        </div>
      </section>

      {/*section4*/}
      <section className="py-12 dotted-background text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready To Find Your Dream Car?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">Joint The Best Platform To find Your Dream Car Enjoy Your Luxury Drive</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button variant="secondary" size="lg" asChild>
              <Link href="/cars">
              View All Cars
              </Link>
             </Button>
             <SignedOut>
              <Button size="lg" asChild>
                <Link href="/sign-up">
                   Sign Up 
                </Link>
              </Button>
             </SignedOut>
          </div>
        </div>
      </section>
    </div>
  );
}
