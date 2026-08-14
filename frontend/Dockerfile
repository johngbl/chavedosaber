# ---------- Build do SPA ----------
FROM oven/bun:1.3-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ---------- Servir com nginx ----------
FROM nginx:1.27-alpine

# Hostname do backend para o proxy /api.
# Docker Compose: "backend". Dokploy (Dockerfile standalone): informe o nome
# interno do app backend na rede do Dokploy via variável BACKEND_HOST.
ENV BACKEND_HOST=backend

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/default.conf.template

# Padrão da casa: tudo internamente na porta 3000 (consistente com os demais apps).
EXPOSE 3000

# Renderiza o template substituindo SOMENTE ${BACKEND_HOST} (protege variáveis
# de runtime do nginx como $host, $remote_addr) e inicia o nginx.
CMD ["sh", "-c", "envsubst '${BACKEND_HOST}' < /etc/nginx/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
