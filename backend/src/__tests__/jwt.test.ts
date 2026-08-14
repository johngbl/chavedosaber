import { describe, expect, it } from "bun:test";
import { generateValidToken } from "./helpers";

// Configuração do ambiente (mesma do setup.ts)
process.env.JWT_SECRET = "test-secret-key-for-testing";

describe("Auth: verificação de token (jose)", () => {
	it("should verify a valid non-expired token", async () => {
		const { verifyAccessToken } = await import("../middleware/auth");
		const token = await generateValidToken();

		const user = await verifyAccessToken(token);
		expect(user).not.toBeNull();
		expect(user?.userId).toBe(1);
		expect(user?.email).toBe("admin@test.com");
	});

	it("should return null for an expired token", async () => {
		const { verifyAccessToken } = await import("../middleware/auth");
		const token = await generateValidToken({
			userId: 1,
			email: "admin@test.com",
			exp: Math.floor(Date.now() / 1000) - 3600, // expirado há 1 hora
		});

		const user = await verifyAccessToken(token);
		expect(user).toBeNull();
	});

	it("should return null for a tampered token", async () => {
		const { verifyAccessToken } = await import("../middleware/auth");
		const token = await generateValidToken();
		const tampered = `${token.slice(0, -3)}abc`;

		const user = await verifyAccessToken(tampered);
		expect(user).toBeNull();
	});

	it("should return null for an empty or garbage token", async () => {
		const { verifyAccessToken } = await import("../middleware/auth");
		expect(await verifyAccessToken("")).toBeNull();
		expect(await verifyAccessToken("not-a-jwt")).toBeNull();
	});
});

describe("Auth: extração de token do request", () => {
	it("should extract from Authorization Bearer header", async () => {
		const { getTokenFromRequest } = await import("../middleware/auth");
		const request = new Request("http://localhost/api/matriculas", {
			headers: { Authorization: "Bearer abc.def.ghi" },
		});
		expect(getTokenFromRequest(request)).toBe("abc.def.ghi");
	});

	it("should extract from the httpOnly cookie", async () => {
		const { getTokenFromRequest } = await import("../middleware/auth");
		const request = new Request("http://localhost/api/matriculas", {
			headers: { Cookie: "other=1; token=xyz.123; theme=dark" },
		});
		expect(getTokenFromRequest(request)).toBe("xyz.123");
	});

	it("should return null when no token is present", async () => {
		const { getTokenFromRequest } = await import("../middleware/auth");
		const request = new Request("http://localhost/api/matriculas");
		expect(getTokenFromRequest(request)).toBeNull();
	});
});
