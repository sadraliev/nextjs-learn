const { db, sql } = require("@vercel/postgres");
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
    const lessons = generateSchedule(
      new Date("2024-01-01"),
      new Date("2024-01-31"),
      [1, 3, 5],
      [9, 30],
      [10, 10]
    );
    const { id: firstGroupId } = groups[0];
    const insertedLessonsForFirstGroup = await Promise.all(
      lessons.map(async (lesson) => {
        return client.sql`
            INSERT INTO schedules (start_time, end_time, group_id)
            VALUES (${lesson.lessonStartTime}, ${lesson.lessonEndTime}, ${firstGroupId})
            ON CONFLICT (start_time, end_time, group_id) DO NOTHING;
            `;
      })
    );

    console.log(
      `Seeded ${insertedLessonsForFirstGroup.length} lessons for first group`
    );

    const { id: secondGroupId } = groups[1];
    const insertedLessonsForSecondGroup = await Promise.all(
      lessons.map(async (lesson) => {
        return client.sql`
            INSERT INTO schedules (start_time, end_time, group_id)
            VALUES (${lesson.lessonStartTime}, ${lesson.lessonEndTime}, ${secondGroupId})
            ON CONFLICT (start_time, end_time, group_id) DO NOTHING;
            `;
      })
    );

    console.log(
      `Seeded ${insertedLessonsForSecondGroup.length} lessons for second group`
    );

    return {
      createTable,
      groups: [insertedLessonsForFirstGroup, insertedLessonsForSecondGroup],
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

  try {
    const result = await sql`
    SELECT DATE_TRUNC('day', s.start_time) AS datetime,
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
    WHERE s.start_time >= '2024-01-01T00:00:00' AND s.end_time <= '2024-01-31T23:59:59'
    GROUP BY datetime
    ORDER BY datetime;
    `;

    console.log("Result", result);

    for (let lesson of result.rows) {
      console.log("item", lesson);
    }
  } catch (error) {
    console.error(error.message);
  }

  await client.end();
}

main().catch((err) => {
  console.error(
    "An error occurred while attempting to seed the database:",
    err
  );
});
