const BASE_URL = "/api";

export class ApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

/**
 * Wrapper do fetch com credenciais (cookies httpOnly) e tratamento de erros.
 * - 401 → dispara evento `auth:unauthorized` (o AuthContext faz logout).
 * - 204 → retorna undefined (sem corpo).
 * - Nenhum token em localStorage: o token vive no cookie httpOnly.
 */
export async function apiFetch<T>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const headers: Record<string, string> = {
		...((options.headers as Record<string, string>) || {}),
	};
	if (options.body && !headers["Content-Type"]) {
		headers["Content-Type"] = "application/json";
	}

	const res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers,
		credentials: "include",
	});

	if (res.status === 401 && !path.startsWith("/auth/login")) {
		window.dispatchEvent(new Event("auth:unauthorized"));
	}

	if (!res.ok) {
		const body = (await res.json().catch(() => ({}))) as {
			error?: string;
		};
		throw new ApiError(body.error || `Erro ${res.status}`, res.status);
	}

	if (res.status === 204) {
		return undefined as T;
	}
	return res.json() as Promise<T>;
}
