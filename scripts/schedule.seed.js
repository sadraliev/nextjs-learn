const { db } = require("@vercel/postgres");
const bcrypt = require("bcrypt");
const { groups } = require("./schedule.placeholder");
const { generateSchedule } = require("./schedule.generator");

async function seedGroups(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // remove records if "schedules" exists, because groups depend on it
    await client.sql`DROP TABLE IF EXISTS schedules;`;
    // remove records if "groups" exists
    await client.sql`DROP TABLE IF EXISTS groups;`;

    // Create the "groups" table if it doesn't exist
    const createTable = await client.sql`
        CREATE TABLE IF NOT EXISTS groups (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          amount INT NOT NULL
        );
      `;

    console.log(`Created "group" table`);

    // Insert data into the "groups" table
    const insertedGroups = await Promise.all(
      groups.map(async (group) => {
        return client.sql`
          INSERT INTO groups (id, name, amount)
          VALUES (${group.id}, ${group.name}, ${group.amount})
          ON CONFLICT (id) DO NOTHING;
        `;
      })
    );

    console.log(`Seeded ${groups.length} groups`);

    return {
      createTable,
      groups: insertedGroups,
    };
  } catch (error) {
    console.error("Error seeding groups:", error);
    throw error;
  }
}

async function seedSchedules(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "schedules" table if it doesn't exist
    const createTable = await client.sql`
        CREATE TABLE IF NOT EXISTS schedules (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            start_time TIMESTAMPTZ NOT NULL,
            end_time TIMESTAMPTZ NOT NULL,
            group_id UUID REFERENCES groups(id),
            CONSTRAINT unique_schedule_entry UNIQUE (start_time, end_time, group_id)
        );
        `;

    console.log(`Created "schedules" table`);

    // Insert data into the "schedules" table
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-01-31");
    const daysOfWeek = [1, 3, 5];
    const startTime = [9, 30];
    const endTime = [10, 10];

    const lessons = generateSchedule(
      startDate,
      endDate,
      daysOfWeek,
      startTime,
      endTime
    );
    const { id } = groups[0];
    const insertedLessons = await Promise.all(
      lessons.map(async (lesson) => {
        return client.sql`
            INSERT INTO schedules (start_time, end_time, group_id)
            VALUES (${lesson.lessonStartTime}, ${lesson.lessonEndTime}, ${id})
            ON CONFLICT (start_time, end_time, group_id) DO NOTHING;
            `;
      })
    );

    console.log(`Seeded ${insertedLessons.length} lessons`);

    return {
      createTable,
      groups: insertedLessons,
    };
  } catch (error) {
    console.error("Error seeding groups:", error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  await seedGroups(client);
  await seedSchedules(client);

  await client.end();
}

main().catch((err) => {
  console.error(
    "An error occurred while attempting to seed the database:",
    err
  );
});
