import { NextResponse } from 'next/server'
import { getBarbers } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await getBarbers())
}
