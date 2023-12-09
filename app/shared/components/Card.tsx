import Link from "next/link";
import { FC } from "react";

export function formatISO8601Date(iso8601: string) {
  const dateObject = new Date(iso8601);

  const daysOfWeek = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
  const dayOfWeek = daysOfWeek[dateObject.getDay()];

  const months = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];
  const month = months[dateObject.getMonth()];
  const dayOfMonth = dateObject.getDate();

  return {
    dayOfWeek,
    month,
    dayOfMonth,
  };
}

function formatISO8601TimeToHHMM(iso8601: string): string {
  const dateObject = new Date(iso8601);
  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
  return formattedTime;
}

type CardProps = {
  title: string;
  start: string;
  end: string;
  lessonId: string;
};

export const Card: FC<CardProps> = ({
  title = "Title",
  start,
  end,
  lessonId,
}) => {
  return (
    <div className="rounded-xl border bg-card text-card-foreground p-6 mb-2">
      <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
      <div className="flex justify-between items-center ">
        <div>
          <p className="mt-1 text-sm text-muted-foreground">{`${formatISO8601TimeToHHMM(
            start
          )} - ${formatISO8601TimeToHHMM(end)}`}</p>
          <p className="mt-1 text-xs text-muted-foreground">Obiwan Kenobi</p>
        </div>
        <div>
          <Link href={`/attendances/${lessonId}`}>
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              type="submit"
            >
              открыть журнал
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

type DayTitle = {
  datetime: string;
};

export const DayTitle: FC<DayTitle> = ({ datetime }) => {
  const { dayOfMonth, dayOfWeek, month } = formatISO8601Date(datetime);
  return (
    <h2 className="my-4 text-lg font-semibold leading-none tracking-tight">
      {` ${dayOfMonth} ${month} `}{" "}
      <span className="font-light pl-2 text-sm text-muted-foreground">{`${dayOfWeek}`}</span>
    </h2>
  );
};
