import type {
  Student,
  StudentsResponse,
  StudentResponse,
} from "./types/student";

// Проверка, что значение является объектом
export function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

// Проверка одного студента
export function isStudent(value: unknown): value is Student {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.firstName === "string" &&
    typeof value.lastName === "string" &&
    typeof value.studentCard === "string" &&
    typeof value.groupId === "string"
  );
}

// Проверка списка студентов
export function isStudentsResponse(
  value: unknown,
): value is StudentsResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.success === true &&
    typeof value.count === "number" &&
    Array.isArray(value.data) &&
    value.data.every(isStudent)
  );
}

// Проверка одного студента в ответе сервера
export function isStudentResponse(
  value: unknown,
): value is StudentResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.success === true &&
    isStudent(value.data)
  );
}
