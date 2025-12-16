import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const filename = searchParams.get('filename');

    if (!url) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Fetch the file from S3 or CDN
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file' },
        { status: response.status }
      );
    }

    // Get the file data
    const fileData = await response.arrayBuffer();

    // Return with attachment headers to force download
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${filename || 'download'}"`);
    headers.set('Content-Length', fileData.byteLength.toString());
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    return new NextResponse(fileData, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
