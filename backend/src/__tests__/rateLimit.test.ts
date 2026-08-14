import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import {
	clearRateLimitStore,
	createRateLimitGuard,
	rateLimit,
} from "../middleware/rateLimit";

describe("Rate Limit Middleware", () => {
	beforeEach(() => {
		clearRateLimitStore();
	});
	afterEach(() => {
		clearRateLimitStore();
	});

	it("should allow requests within limit (plugin)", async () => {
		const app = new Elysia()
			.use(rateLimit({ windowMs: 60000, max: 5 }))
			.get("/test", () => "ok");

		const responses = await Promise.all(
			Array.from({ length: 3 }, () =>
				app.handle(new Request("http://localhost/test")),
			),
		);

		for (const response of responses) {
			expect(response.status).toBe(200);
		}
	});

	it("should block requests exceeding limit (beforeHandle guard)", async () => {
		const guard = createRateLimitGuard({ windowMs: 60000, max: 2 });
		const app = new Elysia().get("/test", () => "ok", {
			beforeHandle: guard,
		});

		const r1 = await app.handle(new Request("http://localhost/test"));
		const r2 = await app.handle(new Request("http://localhost/test"));
		const r3 = await app.handle(new Request("http://localhost/test"));
		const r4 = await app.handle(new Request("http://localhost/test"));

		expect(r1.status).toBe(200);
		expect(r2.status).toBe(200);
		expect(r3.status).toBe(429);
		expect(r4.status).toBe(429);

		const errorBody = await r3.json();
		expect(errorBody.error).toBe(
			"Muitas requisições, tente novamente mais tarde",
		);
	});

	it("should reset after window expires", async () => {
		const guard = createRateLimitGuard({ windowMs: 100, max: 1 });
		const app = new Elysia().get("/test", () => "ok", {
			beforeHandle: guard,
		});

		const firstResponse = await app.handle(
			new Request("http://localhost/test"),
		);
		expect(firstResponse.status).toBe(200);

		const blockedResponse = await app.handle(
			new Request("http://localhost/test"),
		);
		expect(blockedResponse.status).toBe(429);

		await new Promise((resolve) => setTimeout(resolve, 150));

		const resetResponse = await app.handle(
			new Request("http://localhost/test"),
		);
		expect(resetResponse.status).toBe(200);
	});

	it("should use custom error message", async () => {
		const customMessage = "Limite atingido!";
		const guard = createRateLimitGuard({
			windowMs: 60000,
			max: 1,
			message: customMessage,
		});
		const app = new Elysia().get("/test", () => "ok", {
			beforeHandle: guard,
		});

		await app.handle(new Request("http://localhost/test"));
		const response = await app.handle(new Request("http://localhost/test"));

		expect(response.status).toBe(429);
		const body = await response.json();
		expect(body.error).toBe(customMessage);
	});

	it("should track requests by IP from x-forwarded-for header", async () => {
		const guard = createRateLimitGuard({ windowMs: 60000, max: 2 });
		const app = new Elysia().get("/test", () => "ok", {
			beforeHandle: guard,
		});

		const responses = await Promise.all(
			Array.from({ length: 3 }, () =>
				app.handle(
					new Request("http://localhost/test", {
						headers: { "x-forwarded-for": "192.168.1.1" },
					}),
				),
			),
		);

		// Promise.all contadores em paralelo podem intercalizar — sequencial é determinístico
		clearRateLimitStore();
		const s1 = await app.handle(
			new Request("http://localhost/test", {
				headers: { "x-forwarded-for": "192.168.1.1" },
			}),
		);
		const s2 = await app.handle(
			new Request("http://localhost/test", {
				headers: { "x-forwarded-for": "192.168.1.1" },
			}),
		);
		const s3 = await app.handle(
			new Request("http://localhost/test", {
				headers: { "x-forwarded-for": "192.168.1.1" },
			}),
		);

		expect(s1.status).toBe(200);
		expect(s2.status).toBe(200);
		expect(s3.status).toBe(429);
		expect(responses.length).toBe(3);
	});

	it("should track different IPs separately", async () => {
		const guard = createRateLimitGuard({ windowMs: 60000, max: 1 });
		const app = new Elysia().get("/test", () => "ok", {
			beforeHandle: guard,
		});

		const response1 = await app.handle(
			new Request("http://localhost/test", {
				headers: { "x-forwarded-for": "192.168.1.1" },
			}),
		);

		const response2 = await app.handle(
			new Request("http://localhost/test", {
				headers: { "x-forwarded-for": "192.168.1.2" },
			}),
		);

		expect(response1.status).toBe(200);
		expect(response2.status).toBe(200);
	});

	it("should ignore paths outside pathPrefix (plugin)", async () => {
		const app = new Elysia()
			.use(
				rateLimit({
					windowMs: 60000,
					max: 1,
					pathPrefix: "/api/auth",
				}),
			)
			.get("/other", () => "ok")
			.get("/api/auth/login", () => "login");

		// /other nunca é rate-limited
		const a = await app.handle(new Request("http://localhost/other"));
		const b = await app.handle(new Request("http://localhost/other"));
		expect(a.status).toBe(200);
		expect(b.status).toBe(200);

		// /api/auth/login sofre o limite
		const c = await app.handle(new Request("http://localhost/api/auth/login"));
		const d = await app.handle(new Request("http://localhost/api/auth/login"));
		expect(c.status).toBe(200);
		expect(d.status).toBe(429);
	});

	it("should NOT trust x-forwarded-for when trustProxy is false (anti-spoofing)", async () => {
		// Sem proxy confiável, todos os headers forjados caem no mesmo bucket.
		const guard = createRateLimitGuard({
			windowMs: 60000,
			max: 2,
			trustProxy: false,
		});
		const app = new Elysia().get("/test", () => "ok", {
			beforeHandle: guard,
		});

		// IPs forjados diferentes na mesma janela → todos bloqueados juntos.
		const r1 = await app.handle(
			new Request("http://localhost/test", {
				headers: { "x-forwarded-for": "1.2.3.4" },
			}),
		);
		const r2 = await app.handle(
			new Request("http://localhost/test", {
				headers: { "x-forwarded-for": "5.6.7.8" },
			}),
		);
		const r3 = await app.handle(
			new Request("http://localhost/test", {
				headers: { "x-forwarded-for": "9.9.9.9" },
			}),
		);

		expect(r1.status).toBe(200);
		expect(r2.status).toBe(200);
		expect(r3.status).toBe(429);
	});

	it("should use the last x-forwarded-for entry when trustProxy is true", async () => {
		const guard = createRateLimitGuard({
			windowMs: 60000,
			max: 1,
			trustProxy: true,
		});
		const app = new Elysia().get("/test", () => "ok", {
			beforeHandle: guard,
		});

		// Mesmo IP real no final da cadeia (adicionado pelo proxy) → mesmo bucket
		const a = await app.handle(
			new Request("http://localhost/test", {
				headers: { "x-forwarded-for": "1.2.3.4, 192.168.0.10" },
			}),
		);
		const b = await app.handle(
			new Request("http://localhost/test", {
				headers: { "x-forwarded-for": "5.6.7.8, 192.168.0.10" },
			}),
		);

		expect(a.status).toBe(200);
		expect(b.status).toBe(429);
	});
});
