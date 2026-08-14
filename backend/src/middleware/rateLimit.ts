import type { Context } from "elysia";
import { Elysia } from "elysia";

interface RateLimitOptions {
	windowMs: number;
	max: number;
	message?: string;
	/** Se definido, só aplica o limite a paths que comecem com este prefixo */
	pathPrefix?: string;
	/**
	 * true = confia em `x-forwarded-for`/`x-real-ip` (usar SOMENTE atrás de
	 * um proxy reverso confiável, ex.: nginx do Dokploy). Por padrão lê
	 * `TRUST_PROXY` do ambiente — sem proxy, o IP real vem do socket.
	 */
	trustProxy?: boolean;
}

interface RequestRecord {
	count: number;
	resetTime: number;
}

/** Intervalo de limpeza de entradas expiradas do store (ms). */
const PRUNE_INTERVAL_MS = 60_000;

const stores = new Map<string, Map<string, RequestRecord>>();
let instanceCounter = 0;

type ServerLike = {
	requestIP: (request: Request) => { address: string } | null;
} | null;

function getClientIp(
	request: Request,
	server: ServerLike,
	trustProxy: boolean,
): string {
	if (trustProxy) {
		// A última entrada é a adicionada pelo proxy confiável (edge).
		const xff = request.headers.get("x-forwarded-for");
		if (xff) {
			const ips = xff
				.split(",")
				.map((part) => part.trim())
				.filter(Boolean);
			if (ips.length > 0) return ips[ips.length - 1];
		}
		return request.headers.get("x-real-ip") ?? "unknown";
	}
	// Sem proxy confiável: usa o IP real da conexão (impossível de forjar).
	return server?.requestIP(request)?.address ?? "unknown";
}

/**
 * Função beforeHandle reutilizável (escopo de rota).
 * Preferível a plugin onRequest, que no Elysia vaza para o app inteiro.
 */
export function createRateLimitGuard(options: RateLimitOptions) {
	const {
		windowMs,
		max,
		message = "Muitas requisições, tente novamente mais tarde",
		pathPrefix,
	} = options;
	const trustProxy = options.trustProxy ?? process.env.TRUST_PROXY === "true";
	const instanceId = `rl_${instanceCounter++}`;
	const store = new Map<string, RequestRecord>();
	stores.set(instanceId, store);
	let lastPrune = 0;

	function pruneExpired(now: number) {
		if (now - lastPrune < PRUNE_INTERVAL_MS) return;
		lastPrune = now;
		for (const [key, record] of store) {
			if (now > record.resetTime) store.delete(key);
		}
	}

	return ({
		request,
		set,
		server,
	}: Pick<Context, "request" | "set" | "server">) => {
		if (pathPrefix) {
			const path = new URL(request.url).pathname;
			if (!path.startsWith(pathPrefix)) {
				return;
			}
		}

		const now = Date.now();
		pruneExpired(now);

		const ip = getClientIp(request, server, trustProxy);
		const record = store.get(ip);

		if (!record || now > record.resetTime) {
			store.set(ip, { count: 1, resetTime: now + windowMs });
			return;
		}

		record.count++;

		if (record.count > max) {
			set.status = 429;
			return new Response(JSON.stringify({ error: message }), {
				status: 429,
				headers: { "Content-Type": "application/json" },
			});
		}
	};
}

/**
 * Plugin de rate limit. Usa onRequest com pathPrefix opcional.
 * Sem pathPrefix, aplica a todas as requisições do app que o montar.
 * Com pathPrefix, só filtra paths correspondentes (não bloqueia outras rotas).
 */
export function rateLimit(options: RateLimitOptions) {
	const guard = createRateLimitGuard(options);

	return new Elysia({ name: `rateLimit_${instanceCounter}` }).onRequest(
		({ request, set, server }) => guard({ request, set, server }),
	);
}

export function clearAllRateLimitStores() {
	for (const store of stores.values()) {
		store.clear();
	}
}

export const clearRateLimitStore = clearAllRateLimitStores;
