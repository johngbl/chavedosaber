import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { SignJWT } from "jose";
import { db } from "../db/connection";
import { users } from "../db/schema";
import { env } from "../env";
import {
	AUTH_COOKIE_NAME,
	getTokenFromRequest,
	verifyAccessToken,
} from "../middleware/auth";
import { createRateLimitGuard } from "../middleware/rateLimit";

const loginRateLimit = createRateLimitGuard({
	windowMs: 60_000,
	max: 20,
	message: "Muitas tentativas de login, aguarde 1 minuto",
});

const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24; // 24 horas

function buildCookieHeader(value: string, maxAge: number): string {
	const parts = [
		`${AUTH_COOKIE_NAME}=${value}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		`Max-Age=${maxAge}`,
	];
	if (env.NODE_ENV === "production") parts.push("Secure");
	return parts.join("; ");
}

export const authRoutes = new Elysia({ prefix: "/api/auth" })
	.post(
		"/login",
		async ({ body, set }) => {
			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.email, body.email))
				.limit(1);

			if (!user) {
				set.status = 401;
				return { error: "Credenciais inválidas" };
			}

			const valid = await Bun.password.verify(body.senha, user.senha);
			if (!valid) {
				set.status = 401;
				return { error: "Credenciais inválidas" };
			}

			const token = await new SignJWT({ userId: user.id, email: user.email })
				.setProtectedHeader({ alg: "HS256" })
				.setExpirationTime(
					Math.floor(Date.now() / 1000) + JWT_EXPIRES_IN_SECONDS,
				)
				.sign(new TextEncoder().encode(env.JWT_SECRET));

			set.headers["Set-Cookie"] = buildCookieHeader(
				token,
				JWT_EXPIRES_IN_SECONDS,
			);

			return { nome: user.nome };
		},
		{
			beforeHandle: loginRateLimit,
			body: t.Object({
				email: t.String({ format: "email" }),
				senha: t.String({ minLength: 6 }),
			}),
		},
	)
	.get("/me", async ({ request, set }) => {
		const token = getTokenFromRequest(request);
		const payload = token ? await verifyAccessToken(token) : null;
		if (!payload) {
			set.status = 401;
			return { error: "Token inválido ou expirado" };
		}

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, payload.userId))
			.limit(1);

		if (!user) {
			set.status = 401;
			return { error: "Usuário não encontrado" };
		}
		return { nome: user.nome, email: user.email };
	})
	.post("/logout", ({ set }) => {
		// Max-Age=0 + valor vazio expira o cookie no browser (idempotente).
		set.headers["Set-Cookie"] = buildCookieHeader("", 0);
		return { ok: true };
	});
