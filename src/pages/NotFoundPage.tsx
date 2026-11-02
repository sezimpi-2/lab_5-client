
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="container">
      <section className="panel not-found">
        <h1>404</h1>
        <h2>Страница не найдена</h2>
        <p>
          Извините, такой страницы не существует.
        </p>

        <Link className="primary-link" to="/students">
          Вернуться к списку студентов
        </Link>
      </section>
    </main>
  );
}
