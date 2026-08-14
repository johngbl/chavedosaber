import "./env";
import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { env } from "./env";
import { rateLimit } from "./middleware/rateLimit";
import { authRoutes } from "./routes/auth";
import { matriculaRoutes } from "./routes/matriculas";

const corsOrigins = env.CORS_ORIGIN.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

const app = new Elysia()
	// CORS com credenciais e origens explícitas (nunca "*" com cookies).
	.use(cors({ origin: corsOrigins, credentials: true }))
	// Rate limit global: não bloqueia navegação normal; 200 req / 15 min por IP
	.use(
		rateLimit({
			windowMs: 15 * 60 * 1000,
			max: 200,
			pathPrefix: "/api",
		}),
	)
	.use(authRoutes)
	.use(matriculaRoutes)
	.get("/", () => ({ status: "ok", message: "Escola Chave API" }))
	.listen({ port: env.PORT, hostname: env.HOST });

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} (${env.NODE_ENV})`,
);

export { app };
