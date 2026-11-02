
import type {
  Student,
  StudentInput,
  StudentsResponse,
  StudentResponse,
  Result,
} from "../types/student";

import {
  isStudentsResponse,
  isStudentResponse,
  isRecord,
} from "../guards";

const API_URL = "http://localhost:5000/api/v1";

// Получение сообщения об ошибке сервера
async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (isRecord(body)) {
      if (
        isRecord(body.error) &&
        typeof body.error.message === "string"
      ) {
        return body.error.message;
      }

      if (typeof body.message === "string") {
        return body.message;
      }
    }
  } catch {
    // Сервер вернул пустой или некорректный JSON
  }

  return response.statusText || "Ошибка сервера";
}

// Универсальная функция HTTP-запросов
async function request<T>(
  path: string,
  guard: (value: unknown) => value is T,
  options: RequestInit = {},
): Promise<Result<T>> {
  let response: Response;

  try {
    const headers = new Headers(options.headers);

    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    return {
      ok: false,
      error: {
        status: 0,
        message: "Нет связи с сервером",
      },
    };
  }

  // Проверка HTTP-ошибки
  if (!response.ok) {
    return {
      ok: false,
      error: {
        status: response.status,
        message: await getErrorMessage(response),
      },
    };
  }

  // Получение JSON
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      error: {
        status: 422,
        message: "Сервер вернул некорректный JSON",
      },
    };
  }

  // Проверка структуры ответа
  if (!guard(body)) {
    return {
      ok: false,
      error: {
        status: 422,
        message: "Неожиданный формат ответа сервера",
      },
    };
  }

  return {
    ok: true,
    data: body,
  };
}

// Отдельная функция DELETE
async function requestDelete(path: string): Promise<Result<void>> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
    });
  } catch {
    return {
      ok: false,
      error: {
        status: 0,
        message: "Нет связи с сервером",
      },
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: {
        status: response.status,
        message: await getErrorMessage(response),
      },
    };
  }

  return {
    ok: true,
    data: undefined,
  };
}

// API для работы со студентами
export const studentsApi = {
  // Получить всех студентов

async getAll(
  page: number = 1,
  limit: number = 5,
  signal?: AbortSignal,
): Promise<Result<StudentsResponse>> {
  return request<StudentsResponse>(
    `/students?page=${page}&limit=${limit}`,
    isStudentsResponse,
    { signal },
  );
},

      // Получить студента по ID
  async getById(id: string): Promise<Result<Student>> {
    const result = await request<StudentResponse>(
      `/students/${id}`,
      isStudentResponse,
    );

    if (result.ok === false) {
      return {
        ok: false,
        error: result.error,
      };
    }

    return {
      ok: true,
      data: result.data.data,
    };
  },

  // Добавить студента
  async create(input: StudentInput): Promise<Result<Student>> {
    const result = await request<StudentResponse>(
      "/students",
      isStudentResponse,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

    if (result.ok === false) {
      return {
        ok: false,
        error: result.error,
      };
    }

    return {
      ok: true,
      data: result.data.data,
    };
  },

  // Редактировать студента
  async update(
    id: string,
    input: StudentInput,
  ): Promise<Result<Student>> {
    const result = await request<StudentResponse>(
      `/students/${id}`,
      isStudentResponse,
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
    );

    if (result.ok === false) {
      return {
        ok: false,
        error: result.error,
      };
    }

    return {
      ok: true,
      data: result.data.data,
    };
  },

  // Удалить студента
  async remove(id: string): Promise<Result<void>> {
    return requestDelete(`/students/${id}`);
  },
};
