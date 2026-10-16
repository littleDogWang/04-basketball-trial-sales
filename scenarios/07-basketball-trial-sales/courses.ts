import courseData from './courses.json';

export interface Course {
  courseId: string;
  title: string;
  minAge: number;
  maxAge: number;
  availableTimes: string[];
}

export function findCourse(childAge: number): Course[] {
  return (courseData.courses as Course[]).filter(
    (course) => childAge >= course.minAge && childAge <= course.maxAge,
  );
}
