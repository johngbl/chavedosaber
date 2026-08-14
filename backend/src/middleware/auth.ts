import { jwtVerify } from "jose";
import { env } from "../env";

export interface AuthUser {
	userId: number;
	email: string;
}

/** Nome do cookie httpOnly que carrega o token JWT. */
export const AUTH_COOKIE_NAME = "token";

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

/**
 * Verifica um JWT assinado com HS256 (jose puro, sem instância Elysia por
 * request). Retorna o payload tipado ou null para token inválido/expirado.
 */
export async function verifyAccessToken(
	token: string,
): Promise<AuthUser | null> {
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, secretKey, {
			algorithms: ["HS256"],
		});
		if (
			typeof payload.userId !== "number" ||
			typeof payload.email !== "string"
		) {
			return null;
		}
		return { userId: payload.userId, email: payload.email };
	} catch {
		return null;
	}
}

/**
 * Extrai o token do request: primeiro do cookie httpOnly, depois do header
 * `Authorization: Bearer` (compatível com clientes programáticos).
 */
export function getTokenFromRequest(request: Request): string | null {
	const authHeader = request.headers.get("authorization");
	if (authHeader) {
		const bearer = authHeader.replace(/^Bearer\s+/i, "");
		if (bearer) return bearer;
	}

	const cookieHeader = request.headers.get("cookie");
	if (cookieHeader) {
		for (const part of cookieHeader.split(";")) {
			const eq = part.indexOf("=");
			if (eq === -1) continue;
			const name = part.slice(0, eq).trim();
			if (name === AUTH_COOKIE_NAME) {
				return part.slice(eq + 1).trim() || null;
			}
		}
	}
	return null;
}

/** Guard reutilizável de autenticação (401 se ausente/inválido/expirado). */
export async function authBeforeHandle({
	request,
	set,
}: {
	request: Request;
	set: { status?: number | string };
}) {
	const token = getTokenFromRequest(request);
	if (!token) {
		set.status = 401;
		return { error: "Token não fornecido" };
	}
	const user = await verifyAccessToken(token);
	if (!user) {
		set.status = 401;
		return { error: "Token inválido ou expirado" };
	}
	// Sucesso: não retorna nada para o handler prosseguir normalmente.
}
