import { sql } from "@vercel/postgres";

import { unstable_noStore as noStore } from "next/cache";
import { StudentWithGroup } from "../definitions/student.type";
import { Attendance, NewAttendance } from "../definitions/attendance.type";

// export async function insertAttendance(
//   attendance: NewAttendance
// ): Promise<StudentWithGroup> {
//   noStore();

//   const { studentId, groupId, isPresent, attendanceDate } = attendance;
//   try {
//     const data = await sql<StudentWithGroup>`
//     INSERT INTO attendances (student_id, lesson_id, is_present, attendance_date)
//     VALUES (${studentId},${groupId}, ${isPresent}, ${attendanceDate});
//     `;
//     const students = data.rows[0];
//     return data as any;
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch students by group id.");
//   }
// }

export async function getAttendances(id: string): Promise<Attendance> {
  noStore();
  try {
    const data = await sql<Attendance>`
        SELECT
            g.name AS "groupName",
            s.start_time AS "lessonStart",
            s.end_time AS "lessonEnd",
            array_agg(
                jsonb_build_object(
                    'id', st.id,
                    'name', st.name,
                    'surname', st.surname,
                    'image_source', st.image_source,
                    'age', st.age,
                    'is_present', a.is_present
                    )
                ) AS students
        FROM
            schedules s
            LEFT JOIN student_group sg ON s.group_id = sg.group_id
            LEFT JOIN students st ON sg.student_id = st.id
            LEFT JOIN groups g ON s.group_id = g.id
            LEFT JOIN attendances a ON st.id = a.student_id AND s.id = a.lesson_id
        WHERE
            s.id = ${id}
        GROUP BY
            g.name, s.start_time, s.end_time;
      `;
    const students = data.rows[0];
    return students;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch students by group id.");
  }
}
