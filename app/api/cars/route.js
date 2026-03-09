import { getCars } from "@/actions/car-listing";

export async function POST(req) {
  const body = await req.json();

  try {
    const data = await getCars(body);
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}