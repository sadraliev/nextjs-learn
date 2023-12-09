export type Group = {
  id: string;
  name: string;
  amount: number;
};
export type Schedule = {
  id: string;
  startTime: string;
  endTime: string;
  groupId: string;
  groupName: string;
};

export type ScheduleQueryResponse = {
  datetime: string;
  lessons: Schedule[];
};
