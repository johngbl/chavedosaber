// IMPORTANTE: define env ANTES de qualquer import de rotas/plugins
// (preload roda este arquivo; beforeAll chega tarde demais)
process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";
process.env.JWT_SECRET = "test-secret-key-for-testing";
process.env.ADMIN_EMAIL ??= "admin@test.com";
process.env.ADMIN_PASSWORD ??= "test123";
process.env.ADMIN_NAME ??= "Test Admin";
// Rate limit: testes enviam x-forwarded-for explicitamente para simular proxy.
process.env.TRUST_PROXY = "true";
process.env.NODE_ENV = "test";

// Mock global do drizzle-orm (registrado ANTES de qualquer arquivo de teste,
// evita o erro "Export named 'desc' not found" quando arquivos registram
// factories diferentes para o mesmo módulo).
import { mock } from "bun:test";

mock.module("drizzle-orm", () => ({
	eq: mock((..._args: unknown[]) => "eq-result"),
	count: mock(() => "count()"),
	desc: mock(() => "desc-result"),
	and: mock((..._args: unknown[]) => "and-result"),
	gt: mock(() => "gt-result"),
	isNull: mock(() => "isNull-result"),
}));

// Mock global do schema (first-wins): registrado ANTES de qualquer arquivo de
// teste para que todas as rotas vejam a mesma versão completa.
mock.module("../db/schema", () => ({
	users: {
		id: "id",
		nome: "nome",
		email: "email",
		senha: "senha",
		createdAt: "created_at",
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
		telefone2: "telefone2",
		telefone3: "telefone3",
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
	matriculaLinks: {
		id: "id",
		token: "token",
		expiresAt: "expires_at",
		usedAt: "used_at",
		createdAt: "created_at",
	},
}));
