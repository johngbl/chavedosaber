export interface MatriculaFormData {
	serie: string;
	turno: string;
	nomeAluno: string;
	dataNascimento: string;
	sexo: string;
	corRaca: string;
	naturalidade: string;
	sus: string;
	cpfAluno: string;
	nomePai: string;
	nomeMae: string;
	endereco: string;
	telefones: string;
	telefone2: string;
	telefone3: string;
	emailContato: string;
	zonaResidencia: string;
	utilizaTransporteEscolar: boolean;
	possuiProblemaSaude: boolean;
	qualProblemaSaude: string;
	fazUsoMedicacao: boolean;
	possuiRelatorioMedico: boolean;
	apresentaAlergia: boolean;
	qualAlergia: string;
	possuiDeficienciaOuTgd: boolean;
	defCegueira: boolean;
	defBaixaVisao: boolean;
	defSurdez: boolean;
	defAutismoInfantil: boolean;
	defSindromeAsperger: boolean;
	defAltasHabilidadesSuperdotacao: boolean;
	defSurdocegueira: boolean;
	defFisica: boolean;
	defSindromeRett: boolean;
	defTranstornoDesintegrativo: boolean;
	defAuditivaInfancia: boolean;
	defIntelectual: boolean;
	defMultipla: boolean;
	recebeBolsaFamilia: boolean;
	numeroNis: string;
	autorizoUsoImagem: boolean;
	nomeResponsavel: string;
	rgResponsavel: string;
	cpfResponsavel: string;
	consentimento: boolean;
}

export interface Matricula extends MatriculaFormData {
	id: number;
	status: "pendente" | "aprovada" | "rejeitada";
	createdAt: string;
	updatedAt: string | null;
}

export interface MatriculaListResponse {
	data: Matricula[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export const emptyFormData: MatriculaFormData = {
	serie: "",
	turno: "",
	nomeAluno: "",
	dataNascimento: "",
	sexo: "",
	corRaca: "",
	naturalidade: "",
	sus: "",
	cpfAluno: "",
	nomePai: "",
	nomeMae: "",
	endereco: "",
	telefones: "",
	telefone2: "",
	telefone3: "",
	emailContato: "",
	zonaResidencia: "Urbana",
	utilizaTransporteEscolar: false,
	possuiProblemaSaude: false,
	qualProblemaSaude: "",
	fazUsoMedicacao: false,
	possuiRelatorioMedico: false,
	apresentaAlergia: false,
	qualAlergia: "",
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
	numeroNis: "",
	autorizoUsoImagem: false,
	nomeResponsavel: "",
	rgResponsavel: "",
	cpfResponsavel: "",
	consentimento: false,
};
