import { NextResponse } from 'next/server';
import { findCourse } from '@/scenarios/07-basketball-trial-sales/courses';

export async function GET(request: Request) {
  const age = Number(new URL(request.url).searchParams.get('child_age'));
  if (!Number.isInteger(age) || age < 0) {
    return NextResponse.json({ error: 'child_age is required' }, { status: 400 });
  }
  return NextResponse.json({ courses: findCourse(age) });
}
