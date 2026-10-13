import courseData from './courses.json';

export interface Course {
  courseId: string;
  title: string;
  minAge: number;
  maxAge: number;
  availableTimes: string[];
}

export interface TrialRequest {
  requestId: string;
  courseId: string;
  childAge: number;
  preferredTime: string;
  contact: string;
  status: 'request_received';
}

const requests = new Map<string, TrialRequest>();

export function findCourse(childAge: number): Course[] {
  return (courseData.courses as Course[]).filter(
    (course) => childAge >= course.minAge && childAge <= course.maxAge,
  );
}

export function submitTrialRequest(
  request: Omit<TrialRequest, 'status'>,
): { request: TrialRequest; duplicate: boolean } {
  const previous = requests.get(request.requestId);
  if (previous) return { request: previous, duplicate: true };
  const result: TrialRequest = { ...request, status: 'request_received' };
  requests.set(request.requestId, result);
  return { request: result, duplicate: false };
}
