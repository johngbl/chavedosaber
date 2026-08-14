import { randomBytes } from "node:crypto";
import { and, count, desc, eq, gt, isNull } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../db/connection";
import { matriculaLinks, matriculas } from "../db/schema";
import { authBeforeHandle } from "../middleware/auth";
import {
	isValidCpf,
	isValidDate,
	isValidNis,
	stripDigits,
} from "../utils/validations";

const STATUS_VALUES = t.Union([
	t.Literal("pendente"),
	t.Literal("aprovada"),
	t.Literal("rejeitada"),
]);

const cpfPattern = "^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}$";

/** Validade dos links temporários de matrícula: 30 dias. */
const LINK_EXPIRES_IN_MS = 30 * 24 * 60 * 60 * 1000;

const matriculaBodySchema = t.Object({
	token: t.String({
		minLength: 32,
		error: "Token de matrícula ausente ou inválido",
	}),
	serie: t.String({ minLength: 1 }),
	turno: t.String({ minLength: 1 }),
	nomeAluno: t.String({ minLength: 1 }),
	dataNascimento: t.String({
		minLength: 1,
		pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
		error: "Data deve estar no formato YYYY-MM-DD",
	}),
	sexo: t.Union([t.Literal("M"), t.Literal("F")]),
	corRaca: t.Union([
		t.Literal("Branca"),
		t.Literal("Preta"),
		t.Literal("Parda"),
		t.Literal("Amarela"),
		t.Literal("Indígena"),
		t.Literal("Não declarada"),
	]),
	naturalidade: t.String({ minLength: 1 }),
	sus: t.Optional(t.String()),
	cpfAluno: t.Optional(
		t.Union([
			t.Literal(""),
			t.String({
				pattern: cpfPattern,
				error: "CPF deve estar no formato 000.000.000-00",
			}),
		]),
	),
	nomePai: t.Optional(t.String()),
	nomeMae: t.String({ minLength: 1 }),
	endereco: t.String({ minLength: 1 }),
	telefones: t.String({ minLength: 1 }),
	telefone2: t.Optional(t.String()),
	telefone3: t.Optional(t.String()),
	emailContato: t.Optional(
		t.Union([
			t.Literal(""),
			t.String({
				format: "email",
				error: "E-mail de contato inválido",
			}),
		]),
	),
	zonaResidencia: t.Union([t.Literal("Urbana"), t.Literal("Rural")]),
	utilizaTransporteEscolar: t.Optional(t.Boolean()),
	possuiProblemaSaude: t.Optional(t.Boolean()),
	qualProblemaSaude: t.Optional(t.String()),
	fazUsoMedicacao: t.Optional(t.Boolean()),
	possuiRelatorioMedico: t.Optional(t.Boolean()),
	apresentaAlergia: t.Optional(t.Boolean()),
	qualAlergia: t.Optional(t.String()),
	possuiDeficienciaOuTgd: t.Optional(t.Boolean()),
	defCegueira: t.Optional(t.Boolean()),
	defBaixaVisao: t.Optional(t.Boolean()),
	defSurdez: t.Optional(t.Boolean()),
	defAutismoInfantil: t.Optional(t.Boolean()),
	defSindromeAsperger: t.Optional(t.Boolean()),
	defAltasHabilidadesSuperdotacao: t.Optional(t.Boolean()),
	defSurdocegueira: t.Optional(t.Boolean()),
	defFisica: t.Optional(t.Boolean()),
	defSindromeRett: t.Optional(t.Boolean()),
	defTranstornoDesintegrativo: t.Optional(t.Boolean()),
	defAuditivaInfancia: t.Optional(t.Boolean()),
	defIntelectual: t.Optional(t.Boolean()),
	defMultipla: t.Optional(t.Boolean()),
	recebeBolsaFamilia: t.Optional(t.Boolean()),
	numeroNis: t.Optional(
		t.Union([
			t.Literal(""),
			t.String({
				pattern: "^[0-9]{11}$",
				error: "NIS deve conter 11 dígitos",
			}),
		]),
	),
	autorizoUsoImagem: t.Optional(t.Boolean()),
	nomeResponsavel: t.String({ minLength: 1 }),
	rgResponsavel: t.String({ minLength: 1 }),
	cpfResponsavel: t.String({
		minLength: 1,
		pattern: cpfPattern,
		error: "CPF deve estar no formato 000.000.000-00",
	}),
});

/** Validações semânticas (após o schema) que evitam 500 do PostgreSQL. */
function semanticValidationErrors(body: Record<string, unknown>): string[] {
	const errors: string[] = [];

	if (!isValidDate(String(body.dataNascimento ?? ""))) {
		errors.push("dataNascimento: data inválida ou futura");
	}

	const cpfAluno = body.cpfAluno as string | undefined;
	if (cpfAluno && !isValidCpf(cpfAluno)) {
		errors.push("cpfAluno: CPF inválido");
	}

	const cpfResponsavel = String(body.cpfResponsavel ?? "");
	if (!isValidCpf(cpfResponsavel)) {
		errors.push("cpfResponsavel: CPF inválido");
	}

	const numeroNis = body.numeroNis as string | undefined;
	if (numeroNis && !isValidNis(numeroNis)) {
		errors.push("numeroNis: NIS inválido");
	}

	const rgResponsavel = String(body.rgResponsavel ?? "");
	if (stripDigits(rgResponsavel).length < 4) {
		errors.push("rgResponsavel: informe ao menos 4 dígitos do RG");
	}

	return errors;
}

function sanitizeMatriculaBody(body: Record<string, unknown>) {
	// O token de acesso não pertence à tabela de matrículas.
	const cleaned = { ...body };
	delete cleaned.token;
	const optionalStringKeys = [
		"sus",
		"cpfAluno",
		"nomePai",
		"telefone2",
		"telefone3",
		"emailContato",
		"qualProblemaSaude",
		"qualAlergia",
		"numeroNis",
	] as const;

	for (const key of optionalStringKeys) {
		if (cleaned[key] === "") {
			cleaned[key] = null;
		}
	}
	return cleaned;
}

export const matriculaRoutes = new Elysia({ prefix: "/api/matriculas" })
	// Público: enviar pré-matrícula com um link temporário válido.
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const now = new Date();
				// Consumo atômico do link: só 1 matrícula consegue "usar" o token
				// (uma única linha é atualizada por token, mesmo em concorrência).
				const [claimed] = await db
					.update(matriculaLinks)
					.set({ usedAt: now })
					.where(
						and(
							eq(matriculaLinks.token, String(body.token ?? "")),
							isNull(matriculaLinks.usedAt),
							gt(matriculaLinks.expiresAt, now),
						),
					)
					.returning();

				if (!claimed) {
					set.status = 410;
					return { error: "Link inválido, expirado ou já utilizado" };
				}

				const values = sanitizeMatriculaBody(body as Record<string, unknown>);
				const [result] = await db
					.insert(matriculas)
					.values(values as typeof body)
					.returning();
				set.status = 201;
				return result;
			} catch (err) {
				console.error("Erro ao salvar pré-matrícula:", err);
				set.status = 500;
				return {
					error: "Erro interno ao salvar a pré-matrícula. Tente novamente.",
				};
			}
		},
		{
			body: matriculaBodySchema,
			beforeHandle: ({
				body,
				set,
			}: {
				body: Record<string, unknown>;
				set: { status?: number | string };
			}) => {
				const errors = semanticValidationErrors(body);
				if (errors.length > 0) {
					set.status = 400;
					return { error: errors.join("; ") };
				}
			},
		},
	)
	// Público: validar o link ao abrir o formulário (não o consome).
	.get(
		"/links/:token",
		async ({ params, set }) => {
			const [link] = await db
				.select()
				.from(matriculaLinks)
				.where(eq(matriculaLinks.token, params.token))
				.limit(1);
			if (!link) {
				set.status = 410;
				return { error: "Link inválido" };
			}
			if (link.usedAt) {
				set.status = 410;
				return { error: "Link já utilizado" };
			}
			if (link.expiresAt.getTime() < Date.now()) {
				set.status = 410;
				return { error: "Link expirado" };
			}
			return { valid: true, expiresAt: link.expiresAt };
		},
		{
			params: t.Object({ token: t.String() }),
		},
	)
	// Privado
	.guard({ beforeHandle: authBeforeHandle }, (app) =>
		app
			// Gerar link temporário de matrícula (uso único, 30 dias).
			.post("/links", async ({ set }) => {
				const token = randomBytes(24).toString("base64url");
				const expiresAt = new Date(Date.now() + LINK_EXPIRES_IN_MS);
				await db.insert(matriculaLinks).values({ token, expiresAt });
				set.status = 201;
				return { token, expiresAt, link: `/matricula/${token}` };
			})
			// Listar links recentes (status: ativo/usado/expirado).
			.get("/links", async () => {
				const data = await db
					.select()
					.from(matriculaLinks)
					.orderBy(desc(matriculaLinks.createdAt))
					.limit(20);
				return data;
			})
			.get(
				"/",
				async ({ query }) => {
					const page = Math.max(1, Number(query.page) || 1);
					const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
					const offset = (page - 1) * limit;

					// Filtro e paginação no SQL — evita carregar a tabela inteira.
					const whereClause = query.status
						? eq(matriculas.status, query.status)
						: undefined;

					const [data, totalRows] = await Promise.all([
						db
							.select()
							.from(matriculas)
							.where(whereClause)
							.orderBy(desc(matriculas.createdAt))
							.limit(limit)
							.offset(offset),
						db.select({ count: count() }).from(matriculas).where(whereClause),
					]);

					const total = Number(totalRows[0]?.count ?? 0);
					const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

					return { data, total, page, limit, totalPages };
				},
				{
					query: t.Object({
						status: t.Optional(
							t.Union([
								t.Literal("pendente"),
								t.Literal("aprovada"),
								t.Literal("rejeitada"),
							]),
						),
						page: t.Optional(t.String()),
						limit: t.Optional(t.String()),
					}),
				},
			)
			.get(
				"/:id",
				async ({ params, set }) => {
					const id = Number(params.id);
					if (!Number.isFinite(id)) {
						set.status = 400;
						return { error: "ID inválido" };
					}
					const [result] = await db
						.select()
						.from(matriculas)
						.where(eq(matriculas.id, id))
						.limit(1);
					if (!result) {
						set.status = 404;
						return { error: "Matrícula não encontrada" };
					}
					return result;
				},
				{
					params: t.Object({ id: t.String() }),
				},
			)
			.patch(
				"/:id/status",
				async ({ params, body, set }) => {
					const id = Number(params.id);
					if (!Number.isFinite(id)) {
						set.status = 400;
						return { error: "ID inválido" };
					}
					const [existing] = await db
						.select()
						.from(matriculas)
						.where(eq(matriculas.id, id))
						.limit(1);
					if (!existing) {
						set.status = 404;
						return { error: "Matrícula não encontrada" };
					}
					const [updated] = await db
						.update(matriculas)
						.set({ status: body.status, updatedAt: new Date() })
						.where(eq(matriculas.id, id))
						.returning();
					return updated;
				},
				{
					params: t.Object({ id: t.String() }),
					body: t.Object({ status: STATUS_VALUES }),
				},
			),
	);
