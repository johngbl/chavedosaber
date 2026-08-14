import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Carrega variáveis de ambiente a partir do `.env` da raiz do monorepo
 * (e de `backend/.env` como fallback). Variáveis já presentes no processo
 * têm prioridade — não sobrescrevem o ambiente real (Dokploy injeta env).
 */
function loadDotEnv(): void {
	const candidates = [
		resolve(import.meta.dir, "../../.env"),
		resolve(import.meta.dir, "../.env"),
	];
	for (const envPath of candidates) {
		try {
			const text = readFileSync(envPath, "utf8");
			for (const line of text.split("\n")) {
				const trimmed = line.trim();
				if (!trimmed || trimmed.startsWith("#")) continue;
				const [key, ...rest] = trimmed.split("=");
				if (key && !process.env[key]) {
					process.env[key] = rest.join("=").trim();
				}
			}
		} catch {
			// Arquivo inexistente é esperado em produção (env injetada).
		}
	}
}

function required(name: string, minLength = 1): string {
	const value = process.env[name]?.trim() ?? "";
	if (value.length < minLength) {
		throw new Error(
			`Variável de ambiente ausente ou inválida: ${name} (mínimo ${minLength} caracteres). ` +
				`Defina-a no ambiente (Dokploy) ou no arquivo .env (copie de .env.example).`,
		);
	}
	return value;
}

loadDotEnv();

/** Configuração validada do servidor. Falha rápido no boot se estiver incompleta. */
export const env = {
	/** URL de conexão PostgreSQL. */
	DATABASE_URL: required("DATABASE_URL"),
	/** Segredo de assinatura JWT — use 32+ caracteres em produção. */
	JWT_SECRET: required("JWT_SECRET", 16),
	/** Porta HTTP do backend. */
	PORT: Number(process.env.PORT ?? 3000),
	/** Host de escuta (0.0.0.0 dentro de container). */
	HOST: process.env.HOST ?? "0.0.0.0",
	/** development | production | test */
	NODE_ENV: process.env.NODE_ENV ?? "development",
	/** Origens permitidas no CORS (separadas por vírgula). */
	CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
	/** true = confia em x-forwarded-for/x-real-ip (somente atrás de proxy confiável). */
	TRUST_PROXY: process.env.TRUST_PROXY === "true",
	ADMIN_EMAIL: process.env.ADMIN_EMAIL,
	ADMIN_NAME: process.env.ADMIN_NAME,
};

export type Env = typeof env;
