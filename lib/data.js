export const featuredCars = [
  {
    id: 1,
    make: "Toyota",
    model: "Camry",
    year: 2023,
    price: 28999,
    images: ["/car3.png"],
    transmission: "Automatic",
    fuelType: "Gasoline",
    bodyType: "Sedan",
    mileage: 15000,
    color: "White",
    wishlisted: false,
  },
  {
    id: 2,
    make: "Honda",
    model: "Civic",
    year: 2023,
    price: 26499,
    images: ["/car2.png"],
    transmission: "Manual",
    fuelType: "Gasoline",
    bodyType: "Sedan",
    mileage: 12000,
    color: "Blue",
    wishlisted: true,
  },
  {
    id: 3,
    make: "Tesla",
    model: "Model 3",
    year: 2022,
    price: 42999,
    images: ["/car4.jpg"],
    transmission: "Automatic",
    fuelType: "Electric",
    bodyType: "Sedan",
    mileage: 8000,
    color: "Red",
    wishlisted: false,
  },
];

export const carMakes = [
  { id: 1, name: "Hyundai", image: "/hyundai.png" },
  { id: 2, name: "Honda", image: "/honda.png" },
  { id: 3, name: "BMW", image: "/bmw.png" },
  { id: 4, name: "Suzuki", image: "/suzuki.png" },
  { id: 5, name: "Mercedez", image: "/mercedez.png" },
  { id: 6, name: "Ford", image: "/ford.png" },
];

export const bodyTypes = [
  { id: 1, name: "SUV", image: "/car3.png" },
  { id: 2, name: "Sedan", image: "/car5.png" },
  { id: 3, name: "Hatchback", image: "/carhub.png" },
  { id: 4, name: "Convertible", image: "/car2.png" },
];

export const faqItems = [
  {
    question: "How does the test drive booking work?",
    answer:
      "Simply find a car you're interested in, click the 'Test Drive' button, and select an available time slot. Our system will confirm your booking and provide all necessary details.",
  },
  {
    question: "Can I search for cars using an image?",
    answer:
      "Yes! Our AI-powered image search lets you upload a photo of a car you like, and we'll find similar models in our inventory.",
  },
  {
    question: "Are all cars certified and verified?",
    answer:
      "All cars listed on our platform undergo a verification process. We are a trusted dealerships and verified private seller.",
  },
  {
    question: "What happens after I book a test drive?",
    answer:
      "After booking, you'll receive a confirmation email with all the details. We will also contact you to confirm and provide any additional information.",
  },
];