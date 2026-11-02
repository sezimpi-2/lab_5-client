import { Navigate, Route, Routes } from "react-router-dom";
import StudentsPage from "./pages/StudentsPage";
import StudentFormPage from "./pages/StudentFormPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/students" replace />}
      />

      <Route
        path="/students"
        element={<StudentsPage />}
      />

      <Route
        path="/students/new"
        element={<StudentFormPage />}
      />

      <Route
        path="/students/:id/edit"
        element={<StudentFormPage />}
      />

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}

export default App;
