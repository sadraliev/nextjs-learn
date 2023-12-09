import { getAttendances } from "@/app/services/queries/attendances";
import { List } from "@/app/shared/components/List";
import ListItem from "@/app/shared/components/ListItem";
import { notFound } from "next/navigation";
import { FC } from "react";

type PageProps = {
  params: { id: string };
  searchParams: {};
};

const Page: FC<PageProps> = async ({ params: { id } }) => {
  const attendances = await getAttendances(id);

  if (!attendances) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4">
      <List title={attendances.groupName} />
      {attendances.students.length ? (
        <div className="space-y-4 rounded-xl p-6 border bg-card text-card-foreground">
          {attendances.students.map((student) => {
            return (
              <ListItem
                key={student.id}
                fullName={`${student.name} ${student.surname}`}
                age={student.age}
                imageSrc={student.image_source}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default Page;
