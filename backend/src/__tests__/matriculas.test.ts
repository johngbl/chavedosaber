import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { clearRateLimitStore } from "../middleware/rateLimit";
import { mockSelectList } from "./dbMocks";
import { generateValidToken } from "./helpers";

// Configuração do ambiente
process.env.JWT_SECRET = "test-secret-key-for-testing";
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";

// Mock do drizzle-orm e do schema registrados no setup.ts (preload global).

// Helpers para criar db mockado
function createMockDb() {
	return {
		select: mock(() => ({
			from: mock((..._args: unknown[]) => ({
				where: mock((..._args: unknown[]) => ({
					limit: mock((..._args: unknown[]) => Promise.resolve([])),
				})),
			})),
		})),
		insert: mock(() => ({
			values: mock((..._args: unknown[]) => ({
				returning: mock((..._args: unknown[]) => Promise.resolve([])),
			})),
		})),
		update: mock(() => ({
			set: mock((..._args: unknown[]) => ({
				where: mock((..._args: unknown[]) => ({
					returning: mock((..._args: unknown[]) => Promise.resolve([])),
				})),
			})),
		})),
	};
}

let mockDb = createMockDb();

mock.module("../db/connection", () => ({
	get db() {
		return mockDb;
	},
}));

/** Simula o consumo atômico do link (update com returning). */
function mockClaimLink(claimed: unknown) {
	mockDb.update.mockReturnValue({
		set: mock(() => ({
			where: mock(() => ({
				returning: mock(() => Promise.resolve(claimed ? [claimed] : [])),
			})),
		})),
	} as any);
}

// CPF válido (dígitos verificadores corretos) — usado nos fixtures
const VALID_CPF = "529.982.247-25";
// Token de link temporário (32+ caracteres)
const VALID_TOKEN = "test-link-token-aaaaaaaaaaaaaaaaaaaaaaaa";

const validMatriculaData = {
	token: VALID_TOKEN,
	serie: "1º Ano",
	turno: "Matutino",
	nomeAluno: "João Silva",
	dataNascimento: "2015-05-10",
	sexo: "M",
	corRaca: "Parda",
	naturalidade: "Salvador",
	sus: "12345678901234",
	cpfAluno: VALID_CPF,
	nomePai: "José Silva",
	nomeMae: "Maria Silva",
	endereco: "Rua A, 123",
	telefones: "(71) 99999-9999",
	emailContato: "maria@email.com",
	zonaResidencia: "Urbana",
	utilizaTransporteEscolar: false,
	possuiProblemaSaude: false,
	fazUsoMedicacao: false,
	possuiRelatorioMedico: false,
	apresentaAlergia: false,
	possuiDeficienciaOuTgd: false,
	defCegueira: false,
	defBaixaVisao: false,
	defSurdez: false,
	defAutismoInfantil: false,
	defSindromeAsperger: false,
	defAltasHabilidadesSuperdotacao: false,
	defSurdocegueira: false,
	defFisica: false,
	defSindromeRett: false,
	defTranstornoDesintegrativo: false,
	defAuditivaInfancia: false,
	defIntelectual: false,
	defMultipla: false,
	recebeBolsaFamilia: false,
	autorizoUsoImagem: true,
	nomeResponsavel: "Maria Silva",
	rgResponsavel: "1234567",
	cpfResponsavel: VALID_CPF,
};

const minimalData = {
	token: VALID_TOKEN,
	serie: "1º Ano",
	turno: "Matutino",
	nomeAluno: "João Silva",
	dataNascimento: "2015-05-10",
	sexo: "M",
	corRaca: "Parda",
	naturalidade: "Salvador",
	nomeMae: "Maria Silva",
	endereco: "Rua A, 123",
	telefones: "(71) 99999-9999",
	zonaResidencia: "Urbana",
	nomeResponsavel: "Maria Silva",
	rgResponsavel: "1234567",
	cpfResponsavel: VALID_CPF,
};

describe("Matrícula Routes", () => {
	beforeEach(() => {
		clearRateLimitStore();
		mockDb = createMockDb();
		mock.module("../db/connection", () => ({
			get db() {
				return mockDb;
			},
		}));
	});

	describe("POST /api/matriculas", () => {
		it("should create a new matrícula with a valid link", async () => {
			const createdMatricula = {
				id: 1,
				...validMatriculaData,
				status: "pendente",
			};

			mockClaimLink({ id: 1, token: VALID_TOKEN });
			mockDb.insert.mockReturnValue({
				values: mock(() => ({
					returning: mock(() => Promise.resolve([createdMatricula])),
				})),
			} as any);

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(validMatriculaData),
				}),
			);

			expect(response.status).toBe(201);
			const body = await response.json();
			expect(body.id).toBe(1);
			expect(body.status).toBe("pendente");
		});

		it("should reject when the link token is missing (422)", async () => {
			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...validMatriculaData,
						token: undefined,
					}),
				}),
			);

			expect(response.status).toBe(422);
		});

		it("should reject when the link is already used or expired (410)", async () => {
			// update retorna [] → link não pode ser consumido
			mockClaimLink(null);

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(validMatriculaData),
				}),
			);

			expect(response.status).toBe(410);
			const body = await response.json();
			expect(body.error).toContain("Link");
		});

		it("should validate required fields (422)", async () => {
			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ serie: "" }),
				}),
			);

			expect(response.status).toBe(422);
		});

		it("should reject invalid CPF checksum (400)", async () => {
			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...minimalData,
						cpfResponsavel: "123.456.789-01", // dígitos verificadores incorretos
					}),
				}),
			);

			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body.error).toContain("cpfResponsavel");
		});

		it("should reject future birth date (400)", async () => {
			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...minimalData,
						dataNascimento: "2099-01-01", // futura
					}),
				}),
			);

			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body.error).toContain("dataNascimento");
		});

		it("should reject impossible date that would crash PostgreSQL (400)", async () => {
			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...minimalData,
						dataNascimento: "2023-02-30", // 30 de fevereiro não existe
					}),
				}),
			);

			expect(response.status).toBe(400);
		});

		it("should reject invalid NIS format (422)", async () => {
			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...minimalData,
						recebeBolsaFamilia: true,
						numeroNis: "12345", // precisa de 11 dígitos
					}),
				}),
			);

			// O schema já valida o formato (11 dígitos) → 422 antes da semântica.
			expect(response.status).toBe(422);
		});

		it("should reject invalid contact email (422)", async () => {
			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...minimalData,
						emailContato: "não-é-um-email",
					}),
				}),
			);

			expect(response.status).toBe(422);
		});

		it("should accept optional fields as undefined", async () => {
			const createdMatricula = {
				id: 1,
				...minimalData,
				status: "pendente",
			};

			mockClaimLink({ id: 1, token: VALID_TOKEN });
			mockDb.insert.mockReturnValue({
				values: mock(() => ({
					returning: mock(() => Promise.resolve([createdMatricula])),
				})),
			} as any);

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(minimalData),
				}),
			);

			expect(response.status).toBe(201);
		});
	});

	describe("Links temporários de matrícula", () => {
		const futureLink = {
			id: 1,
			token: VALID_TOKEN,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			usedAt: null,
		};

		describe("POST /api/matriculas/links (gerar)", () => {
			it("should return 401 without authentication", async () => {
				const { matriculaRoutes } = await import("../routes/matriculas");
				const app = new Elysia().use(matriculaRoutes);

				const response = await app.handle(
					new Request("http://localhost/api/matriculas/links", {
						method: "POST",
					}),
				);

				expect(response.status).toBe(401);
			});

			it("should generate a link with 30 days expiry when authenticated", async () => {
				const jwtToken = await generateValidToken();
				mockDb.insert.mockReturnValue({
					values: mock(() => ({})),
				} as any);

				const { matriculaRoutes } = await import("../routes/matriculas");
				const app = new Elysia().use(matriculaRoutes);

				const response = await app.handle(
					new Request("http://localhost/api/matriculas/links", {
						method: "POST",
						headers: { Authorization: `Bearer ${jwtToken}` },
					}),
				);

				expect(response.status).toBe(201);
				const body = (await response.json()) as {
					token: string;
					expiresAt: string;
					link: string;
				};
				expect(body.token.length).toBeGreaterThanOrEqual(32);
				expect(body.link).toBe(`/matricula/${body.token}`);
				const expires = new Date(body.expiresAt).getTime();
				const delta = expires - Date.now();
				expect(delta).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
				expect(delta).toBeLessThanOrEqual(30 * 24 * 60 * 60 * 1000);
			});
		});

		describe("GET /api/matriculas/links (listar)", () => {
			it("should return 401 without authentication", async () => {
				const { matriculaRoutes } = await import("../routes/matriculas");
				const app = new Elysia().use(matriculaRoutes);

				const response = await app.handle(
					new Request("http://localhost/api/matriculas/links"),
				);

				expect(response.status).toBe(401);
			});

			it("should list recent links when authenticated", async () => {
				const jwtToken = await generateValidToken();
				mockDb.select.mockReturnValue({
					from: mock(() => ({
						orderBy: mock(() => ({
							limit: mock(() => Promise.resolve([futureLink])),
						})),
					})),
				} as any);

				const { matriculaRoutes } = await import("../routes/matriculas");
				const app = new Elysia().use(matriculaRoutes);

				const response = await app.handle(
					new Request("http://localhost/api/matriculas/links", {
						headers: { Authorization: `Bearer ${jwtToken}` },
					}),
				);

				expect(response.status).toBe(200);
				const body = (await response.json()) as unknown[];
				expect(body).toHaveLength(1);
			});
		});

		describe("GET /api/matriculas/links/:token (validar, público)", () => {
			it("should accept a valid unused link", async () => {
				mockDb.select.mockReturnValue({
					from: mock(() => ({
						where: mock(() => ({
							limit: mock(() => Promise.resolve([futureLink])),
						})),
					})),
				} as any);

				const { matriculaRoutes } = await import("../routes/matriculas");
				const app = new Elysia().use(matriculaRoutes);

				const response = await app.handle(
					new Request(`http://localhost/api/matriculas/links/${VALID_TOKEN}`),
				);

				expect(response.status).toBe(200);
				const body = (await response.json()) as { valid: boolean };
				expect(body.valid).toBe(true);
			});

			it("should reject an expired link (410)", async () => {
				const expired = {
					...futureLink,
					expiresAt: new Date(Date.now() - 1000),
				};
				mockDb.select.mockReturnValue({
					from: mock(() => ({
						where: mock(() => ({
							limit: mock(() => Promise.resolve([expired])),
						})),
					})),
				} as any);

				const { matriculaRoutes } = await import("../routes/matriculas");
				const app = new Elysia().use(matriculaRoutes);

				const response = await app.handle(
					new Request(`http://localhost/api/matriculas/links/${VALID_TOKEN}`),
				);

				expect(response.status).toBe(410);
			});

			it("should reject an already-used link (410)", async () => {
				const used = { ...futureLink, usedAt: new Date() };
				mockDb.select.mockReturnValue({
					from: mock(() => ({
						where: mock(() => ({
							limit: mock(() => Promise.resolve([used])),
						})),
					})),
				} as any);

				const { matriculaRoutes } = await import("../routes/matriculas");
				const app = new Elysia().use(matriculaRoutes);

				const response = await app.handle(
					new Request(`http://localhost/api/matriculas/links/${VALID_TOKEN}`),
				);

				expect(response.status).toBe(410);
			});

			it("should reject an unknown token (410)", async () => {
				// select padrão resolve [] → link não encontrado
				const { matriculaRoutes } = await import("../routes/matriculas");
				const app = new Elysia().use(matriculaRoutes);

				const response = await app.handle(
					new Request(
						"http://localhost/api/matriculas/links/token-inexistente-1234567890",
					),
				);

				expect(response.status).toBe(410);
			});
		});
	});

	describe("GET /api/matriculas", () => {
		it("should return 401 without authentication", async () => {
			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas"),
			);

			expect(response.status).toBe(401);
		});

		it("should list all matrículas with valid token", async () => {
			const token = await generateValidToken();
			const mockMatriculas = [
				{ id: 1, ...validMatriculaData, status: "pendente" },
				{ id: 2, ...validMatriculaData, status: "aprovada" },
			];

			mockSelectList(mockDb.select, mockMatriculas);

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.data).toHaveLength(2);
			expect(body.total).toBe(2);
			expect(body.page).toBe(1);
			expect(body.limit).toBe(10);
			expect(body.totalPages).toBe(1);
		});

		it("should filter matrículas by status", async () => {
			const token = await generateValidToken();
			const mockMatriculas = [
				{ id: 1, ...validMatriculaData, status: "pendente" },
			];

			mockSelectList(mockDb.select, mockMatriculas);

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas?status=pendente", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.data).toHaveLength(1);
			expect(body.data[0].status).toBe("pendente");
			expect(body.total).toBe(1);
		});

		it("should reject invalid status filter (422)", async () => {
			const token = await generateValidToken();

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas?status=inexistente", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			);

			expect(response.status).toBe(422);
		});

		it("should paginate matrículas (SQL-level limit/offset)", async () => {
			const token = await generateValidToken();
			const mockMatriculas = Array.from({ length: 15 }, (_, i) => ({
				id: i + 1,
				...validMatriculaData,
				status: "pendente",
				createdAt: new Date(2026, 0, i + 1).toISOString(),
			}));

			// Simula o que o SQL retornaria: página 2 de 15 itens com limit 5
			mockSelectList(mockDb.select, mockMatriculas.slice(5, 10), 15);

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas?page=2&limit=5", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.data).toHaveLength(5);
			expect(body.total).toBe(15);
			expect(body.page).toBe(2);
			expect(body.limit).toBe(5);
			expect(body.totalPages).toBe(3);
		});
	});

	describe("GET /api/matriculas/:id", () => {
		it("should return 401 without authentication", async () => {
			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas/1"),
			);

			expect(response.status).toBe(401);
		});

		it("should return matrícula details with valid token", async () => {
			const token = await generateValidToken();
			const mockMatricula = {
				id: 1,
				...validMatriculaData,
				status: "pendente",
			};

			mockDb.select.mockReturnValue({
				from: mock(() => ({
					where: mock(() => ({
						limit: mock(() => Promise.resolve([mockMatricula])),
					})),
				})),
			} as any);

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas/1", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.id).toBe(1);
			expect(body.nomeAluno).toBe("João Silva");
		});

		it("should return 404 when matrícula not found", async () => {
			const token = await generateValidToken();

			mockDb.select.mockReturnValue({
				from: mock(() => ({
					where: mock(() => ({
						limit: mock(() => Promise.resolve([])),
					})),
				})),
			} as any);

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas/999", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			);

			expect(response.status).toBe(404);
			const body = await response.json();
			expect(body.error).toBe("Matrícula não encontrada");
		});
	});

	describe("PATCH /api/matriculas/:id/status", () => {
		it("should return 401 without authentication", async () => {
			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas/1/status", {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ status: "aprovada" }),
				}),
			);

			expect(response.status).toBe(401);
		});

		it("should update matrícula status with valid token", async () => {
			const token = await generateValidToken();
			const existingMatricula = {
				id: 1,
				...validMatriculaData,
				status: "pendente",
			};
			const updatedMatricula = { ...existingMatricula, status: "aprovada" };

			mockDb.select.mockReturnValue({
				from: mock(() => ({
					where: mock(() => ({
						limit: mock(() => Promise.resolve([existingMatricula])),
					})),
				})),
			} as any);

			mockDb.update.mockReturnValue({
				set: mock(() => ({
					where: mock(() => ({
						returning: mock(() => Promise.resolve([updatedMatricula])),
					})),
				})),
			} as any);

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas/1/status", {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ status: "aprovada" }),
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.status).toBe("aprovada");
		});

		it("should validate status values", async () => {
			const token = await generateValidToken();

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas/1/status", {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ status: "invalid" }),
				}),
			);

			expect(response.status).toBe(422);
		});

		it("should return 404 when matrícula not found", async () => {
			const token = await generateValidToken();

			mockDb.select.mockReturnValue({
				from: mock(() => ({
					where: mock(() => ({
						limit: mock(() => Promise.resolve([])),
					})),
				})),
			} as any);

			const { matriculaRoutes } = await import("../routes/matriculas");
			const app = new Elysia().use(matriculaRoutes);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas/999/status", {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ status: "aprovada" }),
				}),
			);

			expect(response.status).toBe(404);
			const body = await response.json();
			expect(body.error).toBe("Matrícula não encontrada");
		});
	});
});
