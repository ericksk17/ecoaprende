import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROJECT_ROOT = existsSync(path.join(process.cwd(), 'server.js')) && existsSync(path.join(process.cwd(), '.next'))
  ? path.resolve(process.cwd(), '..', '..')
  : process.cwd();

const UPLOAD_DIR = path.join(PROJECT_ROOT, 'public', 'uploads');

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Sanitize filename - prevent directory traversal
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);

    // Check file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ ok: false, error: 'Imagen no encontrada' }, { status: 404 });
    }

    // Read file
    const buffer = await readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('[GET /api/uploads]', err);
    return NextResponse.json({ ok: false, error: 'Error al leer imagen' }, { status: 500 });
  }
}
