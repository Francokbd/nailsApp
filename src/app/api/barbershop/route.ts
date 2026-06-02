import { NextResponse } from 'next/server'
import { getBarbershop } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await getBarbershop())
}
