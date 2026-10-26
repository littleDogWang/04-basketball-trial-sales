import { NextResponse } from 'next/server';
import { findCourse } from '@/lib/basketball-trial-sales/courses';

export async function GET(request: Request) {
  const age = Number(new URL(request.url).searchParams.get('child_age'));
  if (!Number.isInteger(age) || age < 1 || age > 17) {
    return NextResponse.json({ error: 'child_age is required' }, { status: 400 });
  }
  return NextResponse.json({ courses: findCourse(age) });
}
