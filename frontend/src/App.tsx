import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { DetalhePage } from "./pages/DetalhePage";
import { FormularioPage } from "./pages/FormularioPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function ProtectedRoute({ children }: { children: ReactNode }) {
	const { isAuthenticated } = useAuth();
	if (isAuthenticated === null) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-gray-400">Carregando...</p>
			</div>
		);
	}
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}
	return <>{children}</>;
}

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/" element={<FormularioPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route
						path="/admin"
						element={
							<ProtectedRoute>
								<DashboardPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/:id"
						element={
							<ProtectedRoute>
								<DetalhePage />
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
