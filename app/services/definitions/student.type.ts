export type Student = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone_number: string;
  age: number;
  image_source: string;
};
export type StudentAndGroupName = Student & {
  groupName: string;
};
export type StudentWithGroup = {
  groupName: string;
  students: Student[];
};
