# ---------- Build (dependências) ----------
FROM oven/bun:1.3-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---------- Runtime ----------
FROM oven/bun:1.3-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY package.json bunfig.toml drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src ./src

EXPOSE 3000

# Sincroniza o schema (idempotente), garante o admin (seed --auto, idempotente)
# e inicia a API. REQUER: DATABASE_URL e JWT_SECRET no ambiente (Dokploy).
CMD ["sh", "-c", "bunx drizzle-kit push --force && bun run src/seed.ts -- --auto && bun run src/index.ts"]
