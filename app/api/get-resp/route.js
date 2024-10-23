import { NextResponse } from 'next/server';
import { getGroqResponse } from '@/app/utils/groq';

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ message: 'Query is required' }, { status: 400 });
    }

    console.log('Query:', query);

    const response = await getGroqResponse(query);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error fetching Groq response:', error);
    return NextResponse.json({ error: 'Something went wrong while processing the request' }, { status: 500 });
  }
}
