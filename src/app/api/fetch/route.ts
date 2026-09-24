import { NextResponse } from 'next/server';
// @ts-ignore
import { instagramGetUrl } from 'instagram-url-direct';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Attempt to fetch Instagram details
    const result = await instagramGetUrl(url);

    if (!result || !result.url_list || result.url_list.length === 0) {
      return NextResponse.json({ error: 'Could not fetch media. The link might be private or invalid.' }, { status: 404 });
    }

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching instagram url:', error);
    return NextResponse.json({ error: 'Internal server error or blocked by Instagram.' }, { status: 500 });
  }
}
