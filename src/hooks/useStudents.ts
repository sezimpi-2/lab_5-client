
import { useCallback, useEffect, useState } from "react";
import { studentsApi } from "../api/client";
import type {
  StudentInput,
  StudentsResponse,
} from "../types/student";

export function useStudents(limit: number = 5) {
  const [data, setData] = useState<StudentsResponse | null>(null);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  // Повторная загрузка данных
  const reload = useCallback(() => {
    setVersion((previous) => previous + 1);
  }, []);

  // Загрузка студентов с пагинацией
  useEffect(() => {
    const controller = new AbortController();

    async function loadStudents(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const result = await studentsApi.getAll(
          page,
          limit,
          controller.signal,
        );

        // Проверяем, не был ли запрос отменён
        if (controller.signal.aborted) {
          return;
        }

        // Проверяем результат API
        if ("error" in result) {
          setError(result.error.message);
        } else {
          setData(result.data);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Не удалось загрузить студентов",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadStudents();

    // Отмена предыдущего запроса
    return () => {
      controller.abort();
    };
  }, [page, limit, version]);

  // Добавление студента
  async function createStudent(
    input: StudentInput,
  ): Promise<boolean> {
    setError(null);

    try {
      const result = await studentsApi.create(input);

      if ("error" in result) {
        setError(result.error.message);
        return false;
      }

      const newCount = (data?.count ?? 0) + 1;
      const lastPage = Math.max(1, Math.ceil(newCount / limit));

      if (lastPage !== page) {
        setPage(lastPage);
      } else {
        reload();
      }

      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось добавить студента",
      );

      return false;
    }
  }

  // Редактирование студента
  async function updateStudent(
    id: string,
    input: StudentInput,
  ): Promise<boolean> {
    setError(null);

    try {
      const result = await studentsApi.update(id, input);

      if ("error" in result) {
        setError(result.error.message);
        return false;
      }

      setData((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          data: previous.data.map((student) =>
            student.id === id ? result.data : student,
          ),
        };
      });

      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось изменить студента",
      );

      return false;
    }
  }

  // Удаление студента
  async function removeStudent(id: string): Promise<boolean> {
    setError(null);

    try {
      const result = await studentsApi.remove(id);

      if ("error" in result) {
        setError(result.error.message);
        return false;
      }

      if (data && data.data.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        reload();
      }

      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось удалить студента",
      );

      return false;
    }
  }

  // Очистка сообщения об ошибке
  function clearError(): void {
    setError(null);
  }

  // Общее количество страниц
  const totalPages = Math.max(
    1,
    Math.ceil((data?.count ?? 0) / limit),
  );

  return {
    students: data?.data ?? [],
    count: data?.count ?? 0,
    page,
    limit,
    totalPages,
    setPage,
    loading,
    error,
    reload,
    loadStudents: reload,
    createStudent,
    updateStudent,
    removeStudent,
    clearError,
  };
}
