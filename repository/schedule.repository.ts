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
        SELECT *
        FROM schedules
        WHERE start_time >= ${startDate.toISOString()} AND start_time <= ${endDate.toISOString()}
        ORDER BY start_time;
      `;

      return data.rows;
    } catch (error) {
      console.error("Database Error:", error);
      throw new Error("Failed to fetch revenue data.");
    }
  }
}
