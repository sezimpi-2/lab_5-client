
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentCard: string;
  groupId: string;
}

export interface StudentInput {
  firstName: string;
  lastName: string;
  studentCard: string;
  groupId: string;
}

export interface StudentsResponse {
  success: boolean;
  count: number;
  page: number;
  limit: number;
  data: Student[];
}

export interface StudentResponse {
  success: boolean;
  data: Student;
}

export type Result<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: {
        status: number;
        message: string;
      };
    };
