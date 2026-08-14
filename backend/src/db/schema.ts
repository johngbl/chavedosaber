import {
	boolean,
	date,
	index,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	nome: text("nome").notNull(),
	email: text("email").notNull().unique(),
	senha: text("senha").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matriculas = pgTable(
	"matriculas",
	{
		id: serial("id").primaryKey(),
		status: varchar("status", { length: 20 }).default("pendente").notNull(),

		serie: varchar("serie", { length: 50 }).notNull(),
		turno: varchar("turno", { length: 20 }).notNull(),
		nomeAluno: text("nome_aluno").notNull(),
		dataNascimento: date("data_nascimento").notNull(),
		sexo: varchar("sexo", { length: 1 }).notNull(),
		corRaca: varchar("cor_raca", { length: 30 }).notNull(),
		naturalidade: text("naturalidade").notNull(),
		sus: varchar("sus", { length: 20 }),
		cpfAluno: varchar("cpf_aluno", { length: 14 }),

		nomePai: text("nome_pai"),
		nomeMae: text("nome_mae").notNull(),
		endereco: text("endereco").notNull(),
		telefones: text("telefones").notNull(),
		telefone2: text("telefone2"),
		telefone3: text("telefone3"),
		emailContato: text("email_contato"),
		zonaResidencia: varchar("zona_residencia", { length: 7 }).notNull(),
		utilizaTransporteEscolar: boolean("utiliza_transporte_escolar")
			.default(false)
			.notNull(),

		possuiProblemaSaude: boolean("possui_problema_saude")
			.default(false)
			.notNull(),
		qualProblemaSaude: text("qual_problema_saude"),
		fazUsoMedicacao: boolean("faz_uso_medicacao").default(false).notNull(),
		possuiRelatorioMedico: boolean("possui_relatorio_medico")
			.default(false)
			.notNull(),
		apresentaAlergia: boolean("apresenta_alergia").default(false).notNull(),
		qualAlergia: text("qual_alergia"),

		possuiDeficienciaOuTgd: boolean("possui_deficiencia_ou_tgd")
			.default(false)
			.notNull(),
		defCegueira: boolean("def_cegueira").default(false).notNull(),
		defBaixaVisao: boolean("def_baixa_visao").default(false).notNull(),
		defSurdez: boolean("def_surdez").default(false).notNull(),
		defAutismoInfantil: boolean("def_autismo_infantil")
			.default(false)
			.notNull(),
		defSindromeAsperger: boolean("def_sindrome_asperger")
			.default(false)
			.notNull(),
		defAltasHabilidadesSuperdotacao: boolean(
			"def_altas_habilidades_superdotacao",
		)
			.default(false)
			.notNull(),
		defSurdocegueira: boolean("def_surdocegueira").default(false).notNull(),
		defFisica: boolean("def_fisica").default(false).notNull(),
		defSindromeRett: boolean("def_sindrome_rett").default(false).notNull(),
		defTranstornoDesintegrativo: boolean("def_transtorno_desintegrativo")
			.default(false)
			.notNull(),
		defAuditivaInfancia: boolean("def_auditiva_infancia")
			.default(false)
			.notNull(),
		defIntelectual: boolean("def_intelectual").default(false).notNull(),
		defMultipla: boolean("def_multipla").default(false).notNull(),

		recebeBolsaFamilia: boolean("recebe_bolsa_familia")
			.default(false)
			.notNull(),
		numeroNis: varchar("numero_nis", { length: 15 }),
		autorizoUsoImagem: boolean("autorizo_uso_imagem").default(false).notNull(),

		nomeResponsavel: text("nome_responsavel").notNull(),
		rgResponsavel: varchar("rg_responsavel", { length: 14 }).notNull(),
		cpfResponsavel: varchar("cpf_responsavel", { length: 14 }).notNull(),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [
		// Filtro + ordenação usados na listagem paginada do painel.
		index("matriculas_status_idx").on(table.status),
		index("matriculas_created_at_idx").on(table.createdAt),
	],
);
