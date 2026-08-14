import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { clearRateLimitStore } from "../middleware/rateLimit";
import { mockSelectList } from "./dbMocks";
import { generateValidToken } from "./helpers";

// Configuração do ambiente
process.env.JWT_SECRET = "test-secret-key-for-testing";
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";

// Mock do drizzle-orm registrado no setup.ts (preload global).

// Mock do schema
mock.module("../db/schema", () => ({
	users: {
		id: "id",
		nome: "nome",
		email: "email",
		senha: "senha",
	},
	matriculas: {
		id: "id",
		status: "status",
		serie: "serie",
		turno: "turno",
		nomeAluno: "nome_aluno",
		dataNascimento: "data_nascimento",
		sexo: "sexo",
		corRaca: "cor_raca",
		naturalidade: "naturalidade",
		sus: "sus",
		cpfAluno: "cpf_aluno",
		nomePai: "nome_pai",
		nomeMae: "nome_mae",
		endereco: "endereco",
		telefones: "telefones",
		emailContato: "email_contato",
		zonaResidencia: "zona_residencia",
		utilizaTransporteEscolar: "utiliza_transporte_escolar",
		possuiProblemaSaude: "possui_problema_saude",
		qualProblemaSaude: "qual_problema_saude",
		fazUsoMedicacao: "faz_uso_medicacao",
		possuiRelatorioMedico: "possui_relatorio_medico",
		apresentaAlergia: "apresenta_alergia",
		qualAlergia: "qual_alergia",
		possuiDeficienciaOuTgd: "possui_deficiencia_ou_tgd",
		defCegueira: "def_cegueira",
		defBaixaVisao: "def_baixa_visao",
		defSurdez: "def_surdez",
		defAutismoInfantil: "def_autismo_infantil",
		defSindromeAsperger: "def_sindrome_asperger",
		defAltasHabilidadesSuperdotacao: "def_altas_habilidades_superdotacao",
		defSurdocegueira: "def_surdocegueira",
		defFisica: "def_fisica",
		defSindromeRett: "def_sindrome_rett",
		defTranstornoDesintegrativo: "def_transtorno_desintegrativo",
		defAuditivaInfancia: "def_auditiva_infancia",
		defIntelectual: "def_intelectual",
		defMultipla: "def_multipla",
		recebeBolsaFamilia: "recebe_bolsa_familia",
		numeroNis: "numero_nis",
		autorizoUsoImagem: "autorizo_uso_imagem",
		nomeResponsavel: "nome_responsavel",
		rgResponsavel: "rg_responsavel",
		cpfResponsavel: "cpf_responsavel",
		createdAt: "created_at",
		updatedAt: "updated_at",
	},
}));

// Mock do banco de dados
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

// Cria a app completa para testes E2E
async function createTestApp() {
	const { authRoutes } = await import("../routes/auth");
	const { matriculaRoutes } = await import("../routes/matriculas");
	const { rateLimit } = await import("../middleware/rateLimit");

	return new Elysia()
		.use(rateLimit({ windowMs: 60_000, max: 100 }))
		.use(authRoutes)
		.use(matriculaRoutes)
		.get("/", () => ({ status: "ok", message: "Escola Chave API" }));
}

describe("E2E Tests", () => {
	let app: any;

	beforeEach(async () => {
		clearRateLimitStore();
		mockDb = createMockDb();
		mock.module("../db/connection", () => ({
			get db() {
				return mockDb;
			},
		}));
		app = await createTestApp();
	});

	describe("Health Check", () => {
		it("should return API status", async () => {
			const response = await app.handle(new Request("http://localhost/"));

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.status).toBe("ok");
			expect(body.message).toBe("Escola Chave API");
		});
	});

	describe("Authentication Flow", () => {
		it("should reject login with invalid credentials", async () => {
			mockDb.select.mockReturnValue({
				from: mock(() => ({
					where: mock(() => ({
						limit: mock(() => Promise.resolve([])),
					})),
				})),
			} as any);

			const response = await app.handle(
				new Request("http://localhost/api/auth/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: "invalid@test.com",
						senha: "wrongpassword",
					}),
				}),
			);

			expect(response.status).toBe(401);
			const body = await response.json();
			expect(body.error).toBe("Credenciais inválidas");
		});

		it("should accept login with valid credentials and set cookie", async () => {
			const hashedPassword = await Bun.password.hash("admin123");

			mockDb.select.mockReturnValue({
				from: mock(() => ({
					where: mock(() => ({
						limit: mock(() =>
							Promise.resolve([
								{
									id: 1,
									nome: "Administrador",
									email: "admin@escolachave.com",
									senha: hashedPassword,
								},
							]),
						),
					})),
				})),
			} as any);

			const response = await app.handle(
				new Request("http://localhost/api/auth/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: "admin@escolachave.com",
						senha: "admin123",
					}),
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.nome).toBe("Administrador");
			const setCookie = response.headers.get("set-cookie") ?? "";
			expect(setCookie).toContain("token=");
			expect(setCookie).toContain("HttpOnly");
		});

		it("should rate limit login attempts", async () => {
			// Configura mock para retornar usuário inexistente
			mockDb.select.mockReturnValue({
				from: mock(() => ({
					where: mock(() => ({
						limit: mock(() => Promise.resolve([])),
					})),
				})),
			} as any);

			// max=20 no login — envia 25 sequencialmente para garantir 429
			const responses: Response[] = [];
			for (let i = 0; i < 25; i++) {
				responses.push(
					await app.handle(
						new Request("http://localhost/api/auth/login", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								email: "test@test.com",
								senha: "test123",
							}),
						}),
					),
				);
			}

			const blocked = responses.filter((r) => r.status === 429);
			expect(blocked.length).toBeGreaterThan(0);
		});
	});

	describe("Matrícula Submission", () => {
		it("should create a new matrícula without authentication", async () => {
			const matriculaData = {
				serie: "1º Ano",
				turno: "Matutino",
				nomeAluno: "Teste E2E Silva",
				dataNascimento: "2015-05-10",
				sexo: "M",
				corRaca: "Parda",
				naturalidade: "Salvador",
				nomeMae: "Maria Silva",
				endereco: "Rua Teste, 123",
				telefones: "(71) 99999-9999",
				zonaResidencia: "Urbana",
				nomeResponsavel: "Maria Silva",
				rgResponsavel: "1234567",
				cpfResponsavel: "529.982.247-25",
				autorizoUsoImagem: true,
			};

			const createdMatricula = { id: 1, ...matriculaData, status: "pendente" };

			mockDb.insert.mockReturnValue({
				values: mock(() => ({
					returning: mock(() => Promise.resolve([createdMatricula])),
				})),
			} as any);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(matriculaData),
				}),
			);

			expect(response.status).toBe(201);
			const body = await response.json();
			expect(body.id).toBeDefined();
			expect(body.status).toBe("pendente");
			expect(body.nomeAluno).toBe("Teste E2E Silva");
		});
	});

	describe("Protected Routes", () => {
		it("should reject access without token", async () => {
			const response = await app.handle(
				new Request("http://localhost/api/matriculas"),
			);

			expect(response.status).toBe(401);
		});

		it("should reject access with invalid token", async () => {
			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					headers: { Authorization: "Bearer invalid-token" },
				}),
			);

			expect(response.status).toBe(401);
		});

		it("should allow access with valid token", async () => {
			const token = await generateValidToken();

			const mockMatriculas = [
				{ id: 1, nomeAluno: "João", status: "pendente" },
				{ id: 2, nomeAluno: "Maria", status: "aprovada" },
			];

			mockSelectList(mockDb.select, mockMatriculas);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(Array.isArray(body.data)).toBe(true);
			expect(body.data).toHaveLength(2);
			expect(body.total).toBe(2);
		});

		it("should get matrícula details with valid token", async () => {
			const token = await generateValidToken();

			const mockMatricula = {
				id: 1,
				nomeAluno: "Teste Detalhe E2E",
				status: "pendente",
			};

			mockDb.select.mockReturnValue({
				from: mock(() => ({
					where: mock(() => ({
						limit: mock(() => Promise.resolve([mockMatricula])),
					})),
				})),
			} as any);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas/1", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.id).toBe(1);
			expect(body.nomeAluno).toBe("Teste Detalhe E2E");
		});

		it("should update matrícula status with valid token", async () => {
			const token = await generateValidToken();

			const existingMatricula = { id: 1, status: "pendente" };
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

		it("should filter matrículas by status", async () => {
			const token = await generateValidToken();

			const mockMatriculas = [
				{ id: 1, status: "pendente" },
				{ id: 2, status: "pendente" },
			];

			mockSelectList(mockDb.select, mockMatriculas);

			const response = await app.handle(
				new Request("http://localhost/api/matriculas?status=pendente", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(Array.isArray(body.data)).toBe(true);

			// Todos os itens devem ter status "pendente"
			for (const m of body.data) {
				expect(m.status).toBe("pendente");
			}
			expect(body.total).toBe(2);
		});
	});

	describe("JWT Expiration", () => {
		it("should reject expired token", async () => {
			// Cria um token expirado
			const expiredToken = await generateValidToken({
				userId: 1,
				email: "admin@test.com",
				exp: Math.floor(Date.now() / 1000) - 3600, // Expirado há 1 hora
			});

			const response = await app.handle(
				new Request("http://localhost/api/matriculas", {
					headers: { Authorization: `Bearer ${expiredToken}` },
				}),
			);

			expect(response.status).toBe(401);
			const body = await response.json();
			expect(body.error).toContain("Token");
		});
	});
});
