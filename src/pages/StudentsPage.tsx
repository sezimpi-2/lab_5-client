import { Link } from "react-router-dom";
import { useStudents } from "../hooks/useStudents";
import type { Student } from "../types/student";

export default function StudentsPage() {
  const {
    students,
    count,
    page,
    totalPages,
    setPage,
    loading,
    error,
    reload,
    removeStudent,
  } = useStudents(5);

  // Удаление студента
  async function handleDelete(student: Student): Promise<void> {
    const confirmed = window.confirm(
      `Удалить студента ${student.firstName} ${student.lastName}?`,
    );

    if (!confirmed) return;

    await removeStudent(student.id);
  }

  return (
    <main className="container">
      <header>
        <h1>Информационная система университета</h1>
        <p>Реестр студентов</p>
      </header>

      <section className="panel">
        <div className="panel-heading">
          <h2>Список студентов</h2>

          <Link className="primary-link" to="/students/new">
            Добавить студента
          </Link>
        </div>

        {loading && <p>Загрузка студентов...</p>}

        {error && (
          <div className="error">
            <p>{error}</p>
            <button onClick={reload}>Повторить</button>
          </div>
        )}

        {!loading && !error && students.length === 0 && (
          <p>Студенты не найдены.</p>
        )}

        {!loading && !error && students.length > 0 && (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Фамилия</th>
                    <th>Студенческий билет</th>
                    <th>Группа</th>
                    <th>Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.firstName}</td>
                      <td>{student.lastName}</td>
                      <td>{student.studentCard}</td>
                      <td>{student.groupId}</td>

                      <td>
                        <Link
                          className="edit-link"
                          to={`/students/${student.id}/edit`}
                        >
                          Изменить
                        </Link>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => void handleDelete(student)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage((previous) => previous - 1)
                }
              >
                ← Назад
              </button>

              <span>
                Страница <strong>{page}</strong> из{" "}
                <strong>{totalPages}</strong>
              </span>

              <button
                disabled={page >= totalPages || loading}
                onClick={() =>
                  setPage((previous) => previous + 1)
                }
              >
                Вперёд →
              </button>
            </div>

            <p className="student-count">
              Всего студентов: {count}
            </p>
          </>
        )}
      </section>
    </main>
  );
}
