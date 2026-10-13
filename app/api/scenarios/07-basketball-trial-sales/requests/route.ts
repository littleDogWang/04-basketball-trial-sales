import { NextResponse } from 'next/server';
import {
  findCourse,
  submitTrialRequest,
} from '@/scenarios/07-basketball-trial-sales/courses';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (
      typeof body.request_id !== 'string' ||
      typeof body.course_id !== 'string' ||
      typeof body.child_age !== 'number' ||
      typeof body.preferred_time !== 'string' ||
      typeof body.contact !== 'string'
    ) {
      return NextResponse.json({ error: 'request fields are required' }, { status: 400 });
    }
    const course = findCourse(body.child_age).find(
      (item) => item.courseId === body.course_id,
    );
    if (!course || !course.availableTimes.includes(body.preferred_time)) {
      return NextResponse.json({ error: 'course_time_unavailable' }, { status: 409 });
    }
    return NextResponse.json(
      submitTrialRequest({
        requestId: body.request_id,
        courseId: body.course_id,
        childAge: body.child_age,
        preferredTime: body.preferred_time,
        contact: body.contact,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'invalid request' },
      { status: 400 },
    );
  }
}
