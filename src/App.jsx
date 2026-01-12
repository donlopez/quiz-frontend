import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail"; // ✅ ADD THIS
import SelectTest from "./pages/SelectTest";
import QuizRunner from "./pages/QuizRunner";
import Results from "./pages/Results";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/select-test" replace />} />

                {/* ✅ Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* ✅ Protected routes */}
                <Route
                    path="/select-test"
                    element={
                        <ProtectedRoute>
                            <SelectTest />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/quiz/:sessionId"
                    element={
                        <ProtectedRoute>
                            <QuizRunner />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/results/:sessionId"
                    element={
                        <ProtectedRoute>
                            <Results />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
