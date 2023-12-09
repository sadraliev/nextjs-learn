import { sql } from "@vercel/postgres";
import { ScheduleQueryResponse } from "../types";
import { unstable_noStore as noStore } from "next/cache";

interface IScheduleRepository {
  getScheduleByRange(
    startDate: string,
    endDate: string
  ): Promise<ScheduleQueryResponse[]>;
}

export default class ScheduleRepository implements IScheduleRepository {
  async getScheduleByRange(
    startDate: string,
    endDate: string
  ): Promise<ScheduleQueryResponse[]> {
    noStore();
    try {
      console.log("Fetching Schedule data...");
      const data = await sql<ScheduleQueryResponse>`
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
        FROM schedules s
        JOIN groups g ON s.group_id = g.id
        WHERE s.start_time >= ${startDate} AND s.end_time <= ${endDate}
        GROUP BY datetime
        ORDER BY datetime;
      `;

      return data.rows;
    } catch (error) {
      console.error("Database Error:", error);
      throw new Error("Failed to fetch Schedule data.");
    }
  }
}
