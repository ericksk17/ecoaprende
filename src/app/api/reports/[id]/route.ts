import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const withPhoto = searchParams.get('photo') === 'true';

    const report = await db.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ ok: false, error: 'Reporte no encontrado' }, { status: 404 });
    }

    if (!withPhoto) {
      const { photoUrl: _, ...rest } = report;
      return NextResponse.json({ ok: true, data: { ...rest, hasPhoto: !!_ } });
    }

    return NextResponse.json({ ok: true, data: { ...report, hasPhoto: !!report.photoUrl } });
  } catch (err) {
    console.error('[GET /api/reports/[id]]', err);
    return NextResponse.json({ ok: false, error: 'Error al obtener el reporte' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({} as any));

    const report = await db.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ ok: false, error: 'Reporte no encontrado' }, { status: 404 });
    }

    const updates: any = {};
    if (body.status !== undefined) updates.status = String(body.status);
    if (body.description !== undefined) updates.description = String(body.description);
    if (body.location !== undefined) updates.location = body.location ? String(body.location) : null;
    if (body.directedTo !== undefined) updates.directedTo = body.directedTo ? String(body.directedTo) : null;

    const updated = await db.report.update({ where: { id }, data: updates });
    const { photoUrl: _, ...rest } = updated;
    return NextResponse.json({ ok: true, data: { ...rest, hasPhoto: !!_ } });
  } catch (err) {
    console.error('[PATCH /api/reports/[id]]', err);
    return NextResponse.json({ ok: false, error: 'Error al actualizar el reporte' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await db.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ ok: false, error: 'Reporte no encontrado' }, { status: 404 });
    }
    await db.report.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/reports/[id]]', err);
    return NextResponse.json({ ok: false, error: 'Error al eliminar el reporte' }, { status: 500 });
  }
}