import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/reports — list reports, optionally filtered by ?status= or ?category=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

    const reports = await db.report.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ ok: true, data: reports });
  } catch (err) {
    console.error('[GET /api/reports]', err);
    return NextResponse.json(
      { ok: false, error: 'No se pudieron obtener los reportes' },
      { status: 500 }
    );
  }
}

// POST /api/reports — create a new report
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const category = String(body?.category || '').trim();
    const description = String(body?.description || '').trim();
    const location = String(body?.location || '').trim() || null;
    const photoUrl = String(body?.photoUrl || '').trim() || null;
    const reporter = String(body?.reporter || '').trim() || null;
    const directedTo = String(body?.directedTo || '').trim() || null;

    if (!category) {
      return NextResponse.json(
        { ok: false, error: 'La categoría es obligatoria' },
        { status: 400 }
      );
    }
    if (!description) {
      return NextResponse.json(
        { ok: false, error: 'La descripción es obligatoria' },
        { status: 400 }
      );
    }

    const validCategories = ['basura', 'incendio', 'tala', 'contaminacion', 'otro'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { ok: false, error: 'Categoría no válida' },
        { status: 400 }
      );
    }

    const report = await db.report.create({
      data: {
        category,
        description,
        location,
        photoUrl,
        reporter,
        directedTo,
        status: 'pending',
      },
    });

    return NextResponse.json({ ok: true, data: report }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/reports]', err);
    return NextResponse.json(
      { ok: false, error: 'No se pudo crear el reporte' },
      { status: 500 }
    );
  }
}
