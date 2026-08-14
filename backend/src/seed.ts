import "./env";
import { eq } from "drizzle-orm";
import { db } from "./db/connection";
import { users } from "./db/schema";
import { env } from "./env";

const ADMIN_EMAIL = env.ADMIN_EMAIL || "admin@escolachave.com";
const ADMIN_NAME = env.ADMIN_NAME || "Administrador";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const FORCE = process.argv.includes("--force");

const WEAK_PASSWORDS = new Set([
	"admin123",
	"password",
	"12345678",
	"123456789",
	"senha123",
	"qwerty123",
	"admin",
	"123456",
]);

function assertStrongPassword(password: string): void {
	if (password.length < 12) {
		throw new Error(
			"ADMIN_PASSWORD deve ter pelo menos 12 caracteres. Defina-a em .env ou no ambiente.",
		);
	}
	if (WEAK_PASSWORDS.has(password.toLowerCase())) {
		throw new Error("ADMIN_PASSWORD é muito fraca. Escolha uma senha forte.");
	}
}

async function seed() {
	if (!ADMIN_PASSWORD) {
		// No boot automático (Dockerfile) a variável pode não existir ainda;
		// pular é seguro — o seed manual continua exigindo a senha.
		if (process.argv.includes("--auto")) {
			console.warn("ADMIN_PASSWORD não definida; pulando criação do admin.");
			process.exit(0);
		}
		throw new Error(
			"ADMIN_PASSWORD não definida. Defina-a em .env ou no ambiente antes de rodar o seed.",
		);
	}
	assertStrongPassword(ADMIN_PASSWORD);

	const hashedPassword = await Bun.password.hash(ADMIN_PASSWORD);

	const [existing] = await db
		.select()
		.from(users)
		.where(eq(users.email, ADMIN_EMAIL))
		.limit(1);

	if (existing) {
		if (FORCE) {
			await db
				.update(users)
				.set({ senha: hashedPassword })
				.where(eq(users.email, ADMIN_EMAIL));
			console.log(`Senha do administrador atualizada: ${ADMIN_EMAIL}`);
		} else {
			console.log(`Admin já existe: ${ADMIN_EMAIL}`);
		}
		process.exit(0);
	}

	await db.insert(users).values({
		nome: ADMIN_NAME,
		email: ADMIN_EMAIL,
		senha: hashedPassword,
	});

	console.log(`Administrador criado: ${ADMIN_EMAIL}`);
	process.exit(0);
}

seed().catch((err: unknown) => {
	const message = err instanceof Error ? err.message : String(err);
	console.error(`Seed falhou: ${message}`);
	process.exit(1);
});
