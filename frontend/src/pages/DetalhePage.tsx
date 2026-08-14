import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import { PrintTermo } from "../components/PrintTermo";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import type { Matricula } from "../types/matricula";

function getDeficiencias(m: Matricula): [string, boolean][] {
	return [
		["Cegueira", m.defCegueira],
		["Baixa Visão", m.defBaixaVisao],
		["Surdez", m.defSurdez],
		["Autismo Infantil", m.defAutismoInfantil],
		["Síndrome de Asperger", m.defSindromeAsperger],
		["Altas Habilidades", m.defAltasHabilidadesSuperdotacao],
		["Surdocegueira", m.defSurdocegueira],
		["Deficiência Física", m.defFisica],
		["Síndrome de Rett", m.defSindromeRett],
		["Transtorno Desintegrativo", m.defTranstornoDesintegrativo],
		["Def. Auditiva (infância)", m.defAuditivaInfancia],
		["Def. Intelectual", m.defIntelectual],
		["Def. Múltipla", m.defMultipla],
	];
}

export function DetalhePage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { logout, nome } = useAuth();
	const [matricula, setMatricula] = useState<Matricula | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [updating, setUpdating] = useState(false);
	const [showPrint, setShowPrint] = useState(false);

	const loadMatricula = useCallback(async () => {
		if (!id) return;
		try {
			setLoading(true);
			const data = await apiFetch<Matricula>(`/matriculas/${id}`);
			setMatricula(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao carregar");
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		loadMatricula();
	}, [loadMatricula]);

	async function updateStatus(newStatus: "aprovada" | "rejeitada") {
		if (!id) return;
		setUpdating(true);
		try {
			await apiFetch(`/matriculas/${id}/status`, {
				method: "PATCH",
				body: JSON.stringify({ status: newStatus }),
			});
			await loadMatricula();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao atualizar");
		} finally {
			setUpdating(false);
		}
	}

	function handlePrint() {
		setShowPrint(true);
		setTimeout(() => {
			window.print();
			setShowPrint(false);
		}, 100);
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<p className="text-gray-400">Carregando...</p>
			</div>
		);
	}

	if (error || !matricula) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<div className="text-center">
					<p className="text-red-600 mb-4">
						{error || "Matrícula não encontrada"}
					</p>
					<Link
						to="/admin"
						className="text-brand-green hover:underline text-sm"
					>
						Voltar ao painel
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b print:hidden">
				<div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Link
							to="/admin"
							className="text-sm text-brand-green hover:underline"
						>
							← Painel
						</Link>
						<h1 className="text-lg font-semibold text-gray-800">
							Pré-Matrícula #{matricula.id}
						</h1>
						<StatusBadge status={matricula.status} />
					</div>
					<div className="flex items-center gap-3">
						<span className="text-sm text-gray-500">{nome}</span>
						<button
							type="button"
							onClick={() => {
								logout();
								navigate("/login");
							}}
							className="text-sm text-red-600 hover:underline"
						>
							Sair
						</button>
					</div>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 py-6 print:hidden">
				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{error}
					</div>
				)}

				<div className="flex gap-2 mb-6 flex-wrap">
					{matricula.status === "pendente" && (
						<>
							<button
								type="button"
								onClick={() => updateStatus("aprovada")}
								disabled={updating}
								className="px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-lg hover:bg-brand-green-dark disabled:opacity-60"
							>
								{updating ? "Atualizando..." : "Aprovar"}
							</button>
							<button
								type="button"
								onClick={() => updateStatus("rejeitada")}
								disabled={updating}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60"
							>
								{updating ? "Atualizando..." : "Rejeitar"}
							</button>
						</>
					)}
					<button
						type="button"
						onClick={handlePrint}
						className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800"
					>
						Gerar Termo de Assinatura
					</button>
				</div>

				<div className="space-y-6">
					<Card title="Dados do Aluno">
						<Field label="Nome" value={matricula.nomeAluno} />
						<Field label="Série" value={matricula.serie} />
						<Field label="Turno" value={matricula.turno} />
						<Field
							label="Data de Nascimento"
							value={new Date(matricula.dataNascimento).toLocaleDateString(
								"pt-BR",
							)}
						/>
						<Field
							label="Sexo"
							value={matricula.sexo === "M" ? "Masculino" : "Feminino"}
						/>
						<Field label="Cor/Raça" value={matricula.corRaca} />
						<Field label="Naturalidade" value={matricula.naturalidade} />
						{matricula.sus && <Field label="SUS" value={matricula.sus} />}
						{matricula.cpfAluno && (
							<Field label="CPF" value={matricula.cpfAluno} />
						)}
					</Card>

					<Card title="Filiação e Contacto">
						<Field label="Nome da Mãe" value={matricula.nomeMae} />
						{matricula.nomePai && (
							<Field label="Nome do Pai" value={matricula.nomePai} />
						)}
						<Field label="Endereço" value={matricula.endereco} />
						<Field label="Telefone 1" value={matricula.telefones} />
						{matricula.telefone2 && (
							<Field label="Telefone 2" value={matricula.telefone2} />
						)}
						{matricula.telefone3 && (
							<Field label="Telefone 3" value={matricula.telefone3} />
						)}
						{matricula.emailContato && (
							<Field label="E-mail" value={matricula.emailContato} />
						)}
						<Field label="Zona" value={matricula.zonaResidencia} />
						<Field
							label="Transporte Escolar"
							value={matricula.utilizaTransporteEscolar ? "Sim" : "Não"}
						/>
					</Card>

					<Card title="Informações Médicas">
						<Field
							label="Problema de Saúde"
							value={matricula.possuiProblemaSaude ? "Sim" : "Não"}
						/>
						{matricula.possuiProblemaSaude && (
							<Field label="Qual" value={matricula.qualProblemaSaude || "—"} />
						)}
						<Field
							label="Uso de Medicação"
							value={matricula.fazUsoMedicacao ? "Sim" : "Não"}
						/>
						<Field
							label="Relatório Médico"
							value={matricula.possuiRelatorioMedico ? "Sim" : "Não"}
						/>
						<Field
							label="Alergia"
							value={matricula.apresentaAlergia ? "Sim" : "Não"}
						/>
						{matricula.apresentaAlergia && (
							<Field
								label="Qual Alergia"
								value={matricula.qualAlergia || "—"}
							/>
						)}
					</Card>

					{matricula.possuiDeficienciaOuTgd && (
						<Card title="Deficiências / TGD">
							{getDeficiencias(matricula)
								.filter(([, v]) => v)
								.map(([label]) => (
									<Field key={label} label={label} value="Sim" />
								))}
						</Card>
					)}

					<Card title="Responsável Legal e Autorizações">
						<Field label="Nome" value={matricula.nomeResponsavel} />
						<Field label="RG" value={matricula.rgResponsavel} />
						<Field label="CPF" value={matricula.cpfResponsavel} />
						<Field
							label="Bolsa Família"
							value={matricula.recebeBolsaFamilia ? "Sim" : "Não"}
						/>
						{matricula.recebeBolsaFamilia && matricula.numeroNis && (
							<Field label="NIS" value={matricula.numeroNis} />
						)}
						<Field
							label="Autorizo Uso de Imagem"
							value={matricula.autorizoUsoImagem ? "Sim" : "Não"}
						/>
					</Card>

					<Card title="Registo">
						<Field
							label="Data de Submissão"
							value={new Date(matricula.createdAt).toLocaleString("pt-BR")}
						/>
						{matricula.updatedAt && (
							<Field
								label="Última Atualização"
								value={new Date(matricula.updatedAt).toLocaleString("pt-BR")}
							/>
						)}
					</Card>
				</div>
			</main>

			{showPrint && matricula && (
				<div className="print-area">
					<PrintTermo matricula={matricula} />
				</div>
			)}
		</div>
	);
}

function Card({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-white rounded-xl shadow p-5">
			<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
				{title}
			</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
				{children}
			</div>
		</div>
	);
}

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div className="py-1">
			<span className="text-xs text-gray-400">{label}</span>
			<p className="text-sm text-gray-800">{value}</p>
		</div>
	);
}
