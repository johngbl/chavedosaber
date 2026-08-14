import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { login, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) navigate("/admin", { replace: true });
	}, [isAuthenticated, navigate]);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			await login(email, senha);
			navigate("/admin");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao fazer login");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
				<div className="text-center mb-6">
					<img
						src="/logo.png"
						alt="Escola Chave do Saber"
						className="h-14 mx-auto mb-3"
					/>
					<h1 className="text-xl font-bold text-gray-800">Acesso Admin</h1>
					<p className="text-sm text-gray-500 mt-1">
						Secretaria / Direção da Escola
					</p>
				</div>

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="loginEmail"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							E-mail
						</label>
						<input
							id="loginEmail"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
							placeholder="seu@email.com"
						/>
					</div>
					<div>
						<label
							htmlFor="loginSenha"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Senha
						</label>
						<input
							id="loginSenha"
							type="password"
							value={senha}
							onChange={(e) => setSenha(e.target.value)}
							required
							className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 text-sm font-medium text-white bg-brand-green rounded-lg hover:bg-brand-green-dark disabled:opacity-60 transition-colors"
					>
						{loading ? "Entrando..." : "Entrar"}
					</button>
				</form>

			</div>
		</div>
	);
}
