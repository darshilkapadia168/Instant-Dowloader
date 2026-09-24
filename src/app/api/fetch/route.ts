import { NextResponse } from 'next/server';
// @ts-ignore
import { ultraigdl } from 'ultra-igdl';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Initialize ultra-igdl
    const ig = new ultraigdl();
    
    // Attempt to fetch Instagram details
    const result = await ig.download(url) as any;

    if (!result || !result.media || result.media.length === 0) {
      return NextResponse.json({ error: 'Could not fetch media. The link might be private or invalid.' }, { status: 404 });
    }

    // Frontend expects: { data: { media_list: {url: string, type: string}[] } }
    const media_list = result.media.map((m: any) => ({ 
      url: m.url.replace(/&amp;/g, '&'), 
      type: m.type || (m.url.includes('.mp4') ? 'video' : 'image') 
    }));

    return NextResponse.json({ data: { media_list } }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching instagram url:', error);
    return NextResponse.json({ error: 'Internal server error or blocked by Instagram.' }, { status: 500 });
  }
}
