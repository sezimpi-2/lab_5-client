
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { studentsApi } from "../api/client";
import type { StudentInput } from "../types/student";

const emptyForm: StudentInput = {
  firstName: "",
  lastName: "",
  studentCard: "",
  groupId: "",
};

export default function StudentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<StudentInput>(emptyForm);
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных студента для редактирования
  useEffect(() => {
    let cancelled = false;

    async function loadStudent(): Promise<void> {
      if (!id) {
        setFormData(emptyForm);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await studentsApi.getById(id);

      if (cancelled) return;

      if ("error" in result) {
        setError(result.error.message);
      } else {
        setFormData({
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          studentCard: result.data.studentCard,
          groupId: result.data.groupId,
        });
      }

      setLoading(false);
    }

    void loadStudent();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Изменение полей формы
  function handleChange(
    field: keyof StudentInput,
    value: string,
  ): void {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError(null);
  }

  // Сохранение студента
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.studentCard.trim() ||
      !formData.groupId.trim()
    ) {
      setError("Заполните все обязательные поля");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const result = id
        ? await studentsApi.update(id, formData)
        : await studentsApi.create(formData);

      if ("error" in result) {
        setError(result.error.message);
        return;
      }

      navigate("/students");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось сохранить студента",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="container">
        <header>
          <h1>Информационная система университета</h1>
          <p>Реестр студентов</p>
        </header>
        <section className="panel">
          <p>Загрузка данных студента...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <header>
        <h1>Информационная система университета</h1>
        <p>Реестр студентов</p>
      </header>

      <section className="panel">
        <h2>
          {isEditing
            ? "Редактирование студента"
            : "Добавление студента"}
        </h2>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <form className="student-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Имя"
            value={formData.firstName}
            onChange={(e) =>
              handleChange("firstName", e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={(e) =>
              handleChange("lastName", e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Студенческий билет"
            value={formData.studentCard}
            onChange={(e) =>
              handleChange("studentCard", e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Группа"
            value={formData.groupId}
            onChange={(e) =>
              handleChange("groupId", e.target.value)
            }
            required
          />

          <button type="submit" disabled={saving}>
            {saving
              ? "Сохранение..."
              : isEditing
                ? "Сохранить изменения"
                : "Добавить студента"}
          </button>

          <Link className="secondary-link" to="/students">
            Вернуться к списку
          </Link>
        </form>
      </section>
    </main>
  );
}
