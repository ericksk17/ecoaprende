import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PATCH /api/reports/[id] — update report status (e.g. pending -> reviewed -> resolved)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({} as any));
    const status = String(body?.status || '').trim();

    const validStatuses = ['pending', 'reviewed', 'resolved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { ok: false, error: 'Estado no válido' },
        { status: 400 }
      );
    }

    const updated = await db.report.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    console.error('[PATCH /api/reports/[id]]', err);
    return NextResponse.json(
      { ok: false, error: 'No se pudo actualizar el reporte' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id] — delete a report
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.report.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/reports/[id]]', err);
    return NextResponse.json(
      { ok: false, error: 'No se pudo eliminar el reporte' },
      { status: 500 }
    );
  }
}
