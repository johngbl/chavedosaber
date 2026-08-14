import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { apiFetch } from "../api/client";

interface AuthContextType {
	/** true = autenticado; false = deslogado; null = ainda verificando (boot). */
	isAuthenticated: boolean | null;
	nome: string | null;
	login: (email: string, senha: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const [nome, setNome] = useState<string | null>(null);

	const logout = useCallback(() => {
		// Limpa o cookie no servidor (idempotente) e o estado local.
		apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
		setNome(null);
		setIsAuthenticated(false);
	}, []);

	// Valida a sessão no boot chamando /auth/me (cookie httpOnly).
	useEffect(() => {
		let cancelled = false;
		apiFetch<{ nome: string }>("/auth/me")
			.then((data) => {
				if (cancelled) return;
				setNome(data.nome);
				setIsAuthenticated(true);
			})
			.catch(() => {
				if (cancelled) return;
				setIsAuthenticated(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	// Qualquer 401 da API (token expirado etc.) encerra a sessão local.
	useEffect(() => {
		window.addEventListener("auth:unauthorized", logout);
		return () => window.removeEventListener("auth:unauthorized", logout);
	}, [logout]);

	async function login(email: string, senha: string) {
		// O servidor define o cookie httpOnly na resposta.
		const data = await apiFetch<{ nome: string }>("/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, senha }),
		});
		setNome(data.nome);
		setIsAuthenticated(true);
	}

	return (
		<AuthContext.Provider value={{ isAuthenticated, nome, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
