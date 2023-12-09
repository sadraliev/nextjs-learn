import { sql } from "@vercel/postgres";

import { unstable_noStore as noStore } from "next/cache";
import { StudentWithGroup } from "../definitions/student.type";

export async function fetchStudentByGroupId(
  id: string
): Promise<StudentWithGroup> {
  noStore();

  try {
    const data = await sql<StudentWithGroup>`
      SELECT
      groups.name AS "groupName",
        json_agg(students.*) AS students
      FROM
        students
      LEFT JOIN student_group ON students.id = student_group.student_id
      LEFT JOIN groups ON student_group.group_id = groups.id
      WHERE
        student_group.group_id = ${id}
      GROUP BY
        groups.name;
    `;
    const students = data.rows[0];
    return students;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch students by group id.");
  }
}
