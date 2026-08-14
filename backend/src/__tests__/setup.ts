// IMPORTANTE: define env ANTES de qualquer import de rotas/plugins
// (preload roda este arquivo; beforeAll chega tarde demais)
process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";
process.env.JWT_SECRET = "test-secret-key-for-testing";
process.env.ADMIN_EMAIL ??= "admin@test.com";
process.env.ADMIN_PASSWORD ??= "test123";
process.env.ADMIN_NAME ??= "Test Admin";
// Rate limit: testes enviam x-forwarded-for explicitamente para simular proxy.
process.env.TRUST_PROXY = "true";
process.env.NODE_ENV = "test";

// Mock global do drizzle-orm (registrado ANTES de qualquer arquivo de teste,
// evita o erro "Export named 'desc' not found" quando arquivos registram
// factories diferentes para o mesmo módulo).
import { mock } from "bun:test";

mock.module("drizzle-orm", () => ({
	eq: mock((..._args: unknown[]) => "eq-result"),
	count: mock(() => "count()"),
	desc: mock(() => "desc-result"),
}));
