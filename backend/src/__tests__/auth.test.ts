import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { clearRateLimitStore } from "../middleware/rateLimit";
import { generateValidToken } from "./helpers";

// Configuração do ambiente antes de qualquer import
process.env.JWT_SECRET = "test-secret-key-for-testing";
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";

// Mock do drizzle-orm e do schema registrados no setup.ts (preload global).

// Helpers para criar db mockado
function createMockDb() {
	return {
		select: mock(() => ({
			from: mock((..._args: unknown[]) => ({
				where: mock((..._args: unknown[]) => ({
					limit: mock((..._args: unknown[]) => Promise.resolve([])),
				})),
			})),
		})),
	};
}

let mockDb = createMockDb();

mock.module("../db/connection", () => ({
	get db() {
		return mockDb;
	},
}));

describe("Auth Routes", () => {
	beforeEach(() => {
		clearRateLimitStore();
		mockDb = createMockDb();
		mock.module("../db/connection", () => ({
			get db() {
				return mockDb;
			},
		}));
	});

	it("should return 401 when user not found", async () => {
		mockDb.select.mockReturnValue({
			from: mock(() => ({
				where: mock(() => ({
					limit: mock(() => Promise.resolve([])),
				})),
			})),
		} as any);

		const { authRoutes } = await import("../routes/auth");
		const app = new Elysia().use(authRoutes);

		const response = await app.handle(
			new Request("http://localhost/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: "test@test.com", senha: "test123" }),
			}),
		);

		expect(response.status).toBe(401);
		const body = await response.json();
		expect(body.error).toBe("Credenciais inválidas");
	});

	it("should return 401 when password is invalid", async () => {
		const hashedPassword = await Bun.password.hash("correctpassword");

		mockDb.select.mockReturnValue({
			from: mock(() => ({
				where: mock(() => ({
					limit: mock(() =>
						Promise.resolve([
							{
								id: 1,
								nome: "Test User",
								email: "test@test.com",
								senha: hashedPassword,
							},
						]),
					),
				})),
			})),
		} as any);

		const { authRoutes } = await import("../routes/auth");
		const app = new Elysia().use(authRoutes);

		const response = await app.handle(
			new Request("http://localhost/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "test@test.com",
					senha: "wrongpassword",
				}),
			}),
		);

		expect(response.status).toBe(401);
		const body = await response.json();
		expect(body.error).toBe("Credenciais inválidas");
	});

	it("should set httpOnly cookie and return nome when credentials are valid", async () => {
		const hashedPassword = await Bun.password.hash("test123");

		mockDb.select.mockReturnValue({
			from: mock(() => ({
				where: mock(() => ({
					limit: mock(() =>
						Promise.resolve([
							{
								id: 1,
								nome: "Test User",
								email: "test@test.com",
								senha: hashedPassword,
							},
						]),
					),
				})),
			})),
		} as any);

		const { authRoutes } = await import("../routes/auth");
		const app = new Elysia().use(authRoutes);

		const response = await app.handle(
			new Request("http://localhost/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: "test@test.com", senha: "test123" }),
			}),
		);

		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.nome).toBe("Test User");
		// O token não deve estar no corpo da resposta — apenas no cookie httpOnly.
		expect(body.token).toBeUndefined();

		const setCookie = response.headers.get("set-cookie") ?? "";
		expect(setCookie).toContain("token=");
		expect(setCookie).toContain("HttpOnly");
		expect(setCookie).toContain("SameSite=Lax");
		expect(setCookie).toContain("Path=/");
		expect(setCookie).toContain("Max-Age=86400");
	});

	it("should validate email format", async () => {
		const { authRoutes } = await import("../routes/auth");
		const app = new Elysia().use(authRoutes);

		const response = await app.handle(
			new Request("http://localhost/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: "invalid-email", senha: "test123" }),
			}),
		);

		expect(response.status).toBe(422);
	});

	it("should validate password minimum length", async () => {
		const { authRoutes } = await import("../routes/auth");
		const app = new Elysia().use(authRoutes);

		const response = await app.handle(
			new Request("http://localhost/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: "test@test.com", senha: "123" }),
			}),
		);

		expect(response.status).toBe(422);
	});

	it("should include expiration in the JWT stored in the cookie", async () => {
		const hashedPassword = await Bun.password.hash("test123");

		mockDb.select.mockReturnValue({
			from: mock(() => ({
				where: mock(() => ({
					limit: mock(() =>
						Promise.resolve([
							{
								id: 1,
								nome: "Test User",
								email: "test@test.com",
								senha: hashedPassword,
							},
						]),
					),
				})),
			})),
		} as any);

		const { authRoutes } = await import("../routes/auth");
		const app = new Elysia().use(authRoutes);

		const response = await app.handle(
			new Request("http://localhost/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: "test@test.com", senha: "test123" }),
			}),
		);

		expect(response.status).toBe(200);

		// Extrai o JWT do cookie de resposta
		const setCookie = response.headers.get("set-cookie") ?? "";
		const token = setCookie.match(/token=([^;]+)/)?.[1];
		expect(token).toBeDefined();

		// Decodifica o JWT (base64url) para verificar o payload
		const parts = token!.split(".");
		const payload = JSON.parse(atob(parts[1]));
		expect(payload.exp).toBeDefined();
		expect(payload.userId).toBe(1);
		expect(payload.email).toBe("test@test.com");

		// Verifica que exp é ~24h no futuro
		const now = Math.floor(Date.now() / 1000);
		expect(payload.exp).toBeGreaterThan(now + 60 * 60 * 23);
		expect(payload.exp).toBeLessThanOrEqual(now + 60 * 60 * 24 + 5);
	});
});

describe("Auth Routes - Token Generation", () => {
	it("should generate valid token directly", async () => {
		const token = await generateValidToken();
		expect(token).toBeDefined();
		expect(typeof token).toBe("string");
	});
});

describe("Auth Routes - /me e /logout", () => {
	beforeEach(() => {
		clearRateLimitStore();
		mockDb = createMockDb();
		mock.module("../db/connection", () => ({
			get db() {
				return mockDb;
			},
		}));
	});

	it("should return user info from /me with valid cookie", async () => {
		const token = await generateValidToken();

		mockDb.select.mockReturnValue({
			from: mock(() => ({
				where: mock(() => ({
					limit: mock(() =>
						Promise.resolve([
							{ id: 1, nome: "Test User", email: "admin@test.com" },
						]),
					),
				})),
			})),
		} as any);

		const { authRoutes } = await import("../routes/auth");
		const app = new Elysia().use(authRoutes);

		const response = await app.handle(
			new Request("http://localhost/api/auth/me", {
				headers: { Cookie: `token=${token}` },
			}),
		);

		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.nome).toBe("Test User");
		expect(body.email).toBe("admin@test.com");
	});

	it("should return 401 from /me without token", async () => {
		const { authRoutes } = await import("../routes/auth");
		const app = new Elysia().use(authRoutes);

		const response = await app.handle(
			new Request("http://localhost/api/auth/me"),
		);

		expect(response.status).toBe(401);
	});

	it("should return 401 from /me with expired token", async () => {
		const expiredToken = await generateValidToken({
			userId: 1,
			email: "admin@test.com",
			exp: Math.floor(Date.now() / 1000) - 3600,
		});

		const { authRoutes } = await import("../routes/auth");
		const app = new Elysia().use(authRoutes);

		const response = await app.handle(
			new Request("http://localhost/api/auth/me", {
				headers: { Cookie: `token=${expiredToken}` },
			}),
		);

		expect(response.status).toBe(401);
	});

	it("should clear the cookie on logout", async () => {
		const { authRoutes } = await import("../routes/auth");
		const app = new Elysia().use(authRoutes);

		const response = await app.handle(
			new Request("http://localhost/api/auth/logout", {
				method: "POST",
			}),
		);

		expect(response.status).toBe(200);
		const setCookie = response.headers.get("set-cookie") ?? "";
		expect(setCookie).toContain("token=");
		expect(setCookie).toContain("Max-Age=0");
	});
});
