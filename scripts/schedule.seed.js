const { db, sql } = require("@vercel/postgres");
const bcrypt = require("bcrypt");
const { groups, students } = require("./schedule.placeholder");
const { generateSchedule } = require("./schedule.generator");

async function clearDB(client) {
  // remove records if "attendances" exists
  await client.sql`DROP TABLE IF EXISTS attendances;`;
  console.log(`removed attendances table`);
  // remove records if "student_group" exists because groups depend on groups & students
  await client.sql`DROP TABLE IF EXISTS student_group;`;
  console.log(`removed student_group table`);
  // remove records if "schedules" exists, because groups depend on groups
  await client.sql`DROP TABLE IF EXISTS schedules;`;
  console.log(`removed schedules table`);
  // remove records if "groups" exists
  await client.sql`DROP TABLE IF EXISTS groups;`;
  console.log(`removed groups table`);
  // remove records if "students" exists
  await client.sql`DROP TABLE IF EXISTS students;`;
  console.log(`removed students table`);
}

async function seedGroups(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

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
      [9, 0],
      [10, 0]
    );

    const lessonsAfternoon = generateSchedule(
      new Date("2024-01-01"),
      new Date("2024-01-31"),
      [1, 3, 5],
      [17, 30],
      [18, 30]
    );
    const { id: firstGroupId } = groups[0];
    const { id: secondGroupId } = groups[4];
    const insertedLessonsForFirstGroup = await Promise.all(
      lessons.map(async (lesson) => {
        return client.sql`
            INSERT INTO schedules (start_time, end_time, group_id)
            VALUES (${lesson.lessonStartTime}, ${lesson.lessonEndTime}, ${firstGroupId})
            ON CONFLICT (start_time, end_time, group_id) DO NOTHING;
            `;
      }),
      lessonsAfternoon.map(async (lesson) => {
        return client.sql`
            INSERT INTO schedules (start_time, end_time, group_id)
            VALUES (${lesson.lessonStartTime}, ${lesson.lessonEndTime}, ${secondGroupId})
            ON CONFLICT (start_time, end_time, group_id) DO NOTHING;
            `;
      })
    );

    console.log(
      `Seeded ${insertedLessonsForFirstGroup.length} lessons for first group`
    );

    // const { id: secondGroupId } = groups[1];
    // const insertedLessonsForSecondGroup = await Promise.all(
    //   lessons.map(async (lesson) => {
    //     return client.sql`
    //         INSERT INTO schedules (start_time, end_time, group_id)
    //         VALUES (${lesson.lessonStartTime}, ${lesson.lessonEndTime}, ${secondGroupId})
    //         ON CONFLICT (start_time, end_time, group_id) DO NOTHING;
    //         `;
    //   })
    // );

    // console.log(
    //   `Seeded ${insertedLessonsForSecondGroup.length} lessons for second group`
    // );

    return {
      createTable,
      groups: [insertedLessonsForFirstGroup],
      // groups: [insertedLessonsForFirstGroup, insertedLessonsForSecondGroup],
    };
  } catch (error) {
    console.error("Error seeding groups:", error);
    throw error;
  }
}

async function seedStudents(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "students" table if it doesn't exist
    const createTable = await client.sql`
        CREATE TABLE IF NOT EXISTS students (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          surname VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone_number VARCHAR(20),
          age INT,
          image_source VARCHAR(255)
        );
        `;

    console.log(`Created "students" table`);

    // Insert data into the "students" table

    const insertedStudents = await Promise.all(
      students.map(async (student) => {
        return client.sql`
          INSERT INTO students (id, name, surname, email, phone_number, age, image_source)
          VALUES (
            ${student.id}, 
            ${student.name}, 
            ${student.surname}, 
            ${student.email},
            ${student.phoneNumber},
            ${student.age},
            ${student.imageSrc})
          `;
      })
    );

    console.log(`Seeded ${insertedStudents.length} students`);

    return {
      createTable,
      groups: [insertedStudents],
    };
  } catch (error) {
    console.error("Error seeding students:", error);
    throw error;
  }
}

async function addStudentsToGroups(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "student_group" table if it doesn't exist
    const createTable = await client.sql`
        CREATE TABLE IF NOT EXISTS student_group (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          student_id UUID REFERENCES students(id),
          group_id UUID REFERENCES groups(id)
      );
        `;

    console.log(`Created "student_group" table`);

    // Insert data into the "student_group" table
    const firstGroup = groups[0];
    const firstGroupStudents = students;
    // const firstGroupStudents = students.slice(0, 4);

    const insertedFirstGroup = await Promise.all(
      firstGroupStudents.map(async (student) => {
        return client.sql`
          INSERT INTO student_group (student_id, group_id)
          VALUES (${student.id}, ${firstGroup.id})
          `;
      })
    );

    console.log(
      `Seeded ${insertedFirstGroup.length} inserted first group of students`
    );

    // const secondGroup = groups[1];
    // const secondGroupStudents = students.slice(4);

    // const insertedSecondGroup = await Promise.all(
    //   secondGroupStudents.map(async (student) => {
    //     return client.sql`
    //       INSERT INTO student_group (student_id, group_id)
    //       VALUES (${student.id}, ${secondGroup.id})
    //       `;
    //   })
    // );

    // console.log(
    //   `Seeded ${insertedSecondGroup.length} inserted second group of students`
    // );

    return {
      createTable,
      // groups: [insertedFirstGroup, insertedSecondGroup],
      groups: [insertedFirstGroup],
    };
  } catch (error) {
    console.error("Error seeding student_group:", error);
    throw error;
  }
}

async function createAttendance(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "attendances" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS attendances (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        student_id UUID REFERENCES students(id),
        lesson_id UUID REFERENCES schedules(id),
        is_present BOOLEAN DEFAULT false NOT NULL,
        attendance_date TIMESTAMPTZ NOT NULL,
        CONSTRAINT unique_attendance_entry UNIQUE (student_id, lesson_id, attendance_date)
    );
        `;

    console.log(`Created "attendances" table`);

    return {
      createTable,
    };
  } catch (error) {
    console.error("Error seeding attendances:", error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  try {
    await clearDB(client);

    await seedGroups(client);
    await seedSchedules(client);
    await seedStudents(client);
    await addStudentsToGroups(client);
    await createAttendance(client);

    // const result = await sql`
    // SELECT DATE_TRUNC('day', s.start_time) AS datetime,
    //    ARRAY_AGG(
    //        jsonb_build_object(
    //            'id', s.id,
    //            'startTime', s.start_time,
    //            'endTime', s.end_time,
    //            'groupId', s.group_id,
    //            'groupName', g.name
    //        )
    //    ) AS lessons
    // FROM schedules s
    // JOIN groups g ON s.group_id = g.id
    // WHERE s.start_time >= '2024-01-01T00:00:00' AND s.end_time <= '2024-01-31T23:59:59'
    // GROUP BY datetime
    // ORDER BY datetime;
    // `;

    // console.log("Result", result);

    // for (let lesson of result.rows) {
    //   console.log("item", lesson);
    // }
  } catch (error) {
    console.error(error);
  }

  await client.end();
}

main().catch((err) => {
  console.error(
    "An error occurred while attempting to seed the database:",
    err
  );
});
