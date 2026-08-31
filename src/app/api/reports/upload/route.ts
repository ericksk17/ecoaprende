import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 8 * 1024 * 1024;
const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 70;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No se envió ninguna foto' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ ok: false, error: 'Formato no permitido. Usa JPG, PNG, WebP o GIF' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: 'La imagen es muy grande. Máximo 8 MB' }, { status: 400 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(rawBuffer);
    const metadata = await pipeline.metadata();
    const width = metadata.width || MAX_DIMENSION;
    const height = metadata.height || MAX_DIMENSION;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true });
    }

    const outputBuffer = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    const base64 = outputBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    console.log(`[upload] ${file.name}: ${(rawBuffer.length / 1024).toFixed(0)}KB -> ${(outputBuffer.length / 1024).toFixed(0)}KB`);

    return NextResponse.json({ ok: true, url: dataUrl });
  } catch (err) {
    console.error('[POST /api/reports/upload]', err);
    return NextResponse.json({ ok: false, error: 'Error al subir la foto' }, { status: 500 });
  }
}