import { SignJWT } from "jose";

/**
 * Helper para gerar tokens JWT válidos em testes.
 * Lê JWT_SECRET em runtime (não em import-time) para casar com o verify das rotas.
 */
export async function generateValidToken(
	payload: { userId: number; email: string; exp?: number } = {
		userId: 1,
		email: "admin@test.com",
	},
): Promise<string> {
	const secret = process.env.JWT_SECRET || "test-secret-key-for-testing";
	const exp = payload.exp ?? Math.floor(Date.now() / 1000) + 3600;

	return new SignJWT({ userId: payload.userId, email: payload.email })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime(exp)
		.sign(new TextEncoder().encode(secret));
}
