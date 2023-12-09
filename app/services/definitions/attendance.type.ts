import { Student } from "./student.type";

type AttendanceStudent = Pick<
  Student,
  "id" | "image_source" | "name" | "surname" | "age"
> & {
  is_present?: boolean;
};

export type Attendance = {
  id: string;
  groupName: string;
  lessonStart: string;
  lenssonEnd: boolean;
  students: AttendanceStudent[];
};

export type NewAttendance = Omit<Attendance, "id">;
