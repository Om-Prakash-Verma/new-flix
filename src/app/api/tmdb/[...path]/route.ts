
import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  if (!API_KEY) {
    return new NextResponse('TMDB_API_KEY is not configured', { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const path = params.path.join('/');

  const url = new URL(`${API_BASE_URL}/${path}`);
  url.searchParams.append('api_key', API_KEY);

  searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return new NextResponse(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error proxying TMDB request for path ${path}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}