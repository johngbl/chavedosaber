import { describe, expect, it, mock } from "bun:test";

// Mock do banco de dados
const mockDb = {
	select: mock(() => ({
		from: mock(() => ({
			where: mock(() => ({
				limit: mock(() => Promise.resolve([])),
			})),
		})),
	})),
	insert: mock(() => ({
		values: mock(() => Promise.resolve()),
	})),
};

mock.module("../db/connection", () => ({
	db: mockDb,
}));

mock.module("../db/schema", () => ({
	users: {
		id: "id",
		nome: "nome",
		email: "email",
		senha: "senha",
	},
}));

describe("Seed Script", () => {
	it("should hash password using Bun.password", async () => {
		const password = "test123";
		const hashedPassword = await Bun.password.hash(password);

		expect(hashedPassword).toBeDefined();
		expect(hashedPassword).not.toBe(password);
		expect(hashedPassword.length).toBeGreaterThan(password.length);
	});

	it("should verify password against hash", async () => {
		const password = "test123";
		const hashedPassword = await Bun.password.hash(password);

		const isValid = await Bun.password.verify(password, hashedPassword);
		expect(isValid).toBe(true);

		const isInvalid = await Bun.password.verify(
			"wrongpassword",
			hashedPassword,
		);
		expect(isInvalid).toBe(false);
	});

	it("should generate different hashes for same password", async () => {
		const password = "test123";
		const hash1 = await Bun.password.hash(password);
		const hash2 = await Bun.password.hash(password);

		expect(hash1).not.toBe(hash2);

		// Mas ambos devem validar a mesma senha
		expect(await Bun.password.verify(password, hash1)).toBe(true);
		expect(await Bun.password.verify(password, hash2)).toBe(true);
	});
});
