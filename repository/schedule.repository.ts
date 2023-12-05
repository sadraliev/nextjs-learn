import { Schedule } from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";

interface IScheduleRepository {
  getScheduleByRange(startDate: Date, endDate: Date): Promise<Schedule[]>;
}

export default class ScheduleRepository implements IScheduleRepository {
  async getScheduleByRange(
    startDate: Date,
    endDate: Date
  ): Promise<Schedule[]> {
    try {
      console.log("Fetching Schedule data...");

      const data = await sql<Schedule>`
        SELECT DATE_TRUNC('day', start_time) AS datetime,
          ARRAY_AGG(
            jsonb_build_object(
              'id', s.id,
              'startTime', s.start_time,
              'endTime', s.end_time,
              'groupId', s.group_id,
              'groupName', g.name
            )
          ) AS lessons
        FROM schedules
        JOIN groups g ON s.group_id = g.id
        WHERE start_time >= ${startDate.toISOString()} AND start_time <= ${endDate.toISOString()}
        GROUP BY datetime
        ORDER BY datetime;
      `;

      return data.rows;
    } catch (error) {
      console.error("Database Error:", error);
      throw new Error("Failed to fetch revenue data.");
    }
  }
}
