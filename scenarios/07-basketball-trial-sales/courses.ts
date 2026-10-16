import courseData from './courses.json';

export const COURSE_TIME_ZONE = courseData.courses[0].timeZone;

export interface Course {
  courseId: string;
  title: string;
  location: string;
  timeZone: string;
  minAge: number;
  maxAge: number;
  availableTimes: string[];
}

export function findCourse(childAge: number): Course[] {
  return (courseData.courses as Course[]).filter(
    (course) => childAge >= course.minAge && childAge <= course.maxAge,
  );
}
