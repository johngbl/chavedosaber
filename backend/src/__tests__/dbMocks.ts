import { mock } from "bun:test";

/** Cadeia de query da listagem paginada: select().from().where().orderBy().limit().offset() */
export function listQueryChain<T>(data: T[]) {
	const chain = {
		where: mock(() => chain),
		orderBy: mock(() => chain),
		limit: mock(() => chain),
		offset: mock(() => Promise.resolve(data)),
	};
	return chain;
}

/** Cadeia da query de contagem: select({ count }).from().where() */
export function countQueryChain(total: number) {
	return {
		where: mock(() => Promise.resolve([{ count: total }])),
	};
}

/**
 * Configura o mock de `db.select` para o GET / da listagem paginada:
 * 1ª chamada → dados (orderBy/limit/offset), 2ª chamada → contagem total.
 */
// biome-ignore lint/suspicious/noExplicitAny: mock do bun:test tem assinatura invariante.
export function mockSelectList(select: any, data: unknown[], total?: number) {
	select.mockReturnValueOnce({
		from: mock(() => listQueryChain(data)),
	});
	select.mockReturnValueOnce({
		from: mock(() => countQueryChain(total ?? data.length)),
	});
}
