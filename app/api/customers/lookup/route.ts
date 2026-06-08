import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone')?.trim()

  if (!phone || phone.length < 8) {
    return NextResponse.json(null)
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('customers')
    .select('name, instagram')
    .eq('phone', phone)
    .single()

  // Devolvemos solo nombre e instagram — nunca el ID ni datos sensibles
  if (!data) return NextResponse.json(null)
  return NextResponse.json({ name: data.name, instagram: data.instagram })
}