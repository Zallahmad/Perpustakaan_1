import { NextResponse } from 'next/server';
import { monthlyDetailQuery, monthlyReportQuery } from '@/lib/report-queries';

export async function GET() {
  // Integrasi nyata: panggil Supabase RPC / query SQL via Edge Function.
  // Endpoint ini menyiapkan payload yang bisa dipakai untuk export PDF/Excel di frontend.
  return NextResponse.json({
    message: 'Monthly report template',
    summary_query: monthlyReportQuery,
    detail_query: monthlyDetailQuery,
    export_formats: ['pdf', 'xlsx']
  });
}
