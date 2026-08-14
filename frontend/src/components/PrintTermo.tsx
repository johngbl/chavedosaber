import { useState } from "react";
import type { Matricula } from "../types/matricula";

interface PrintTermoProps {
	matricula: Matricula;
}

function formatDateExtended(date: Date): string {
	const months = [
		"janeiro",
		"fevereiro",
		"março",
		"abril",
		"maio",
		"junho",
		"julho",
		"agosto",
		"setembro",
		"outubro",
		"novembro",
		"dezembro",
	];
	return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function formatTelefones(
	telefones: string,
	telefone2?: string | null,
	telefone3?: string | null,
): string {
	const tels = [telefones, telefone2, telefone3].filter(
		(t) => t && t.trim() !== "",
	);
	return tels.join(" / ");
}

function PrintHeader({
	logoError,
	onLogoError,
}: {
	logoError: boolean;
	onLogoError: () => void;
}) {
	return (
		<header className="print-header-oficial">
			<div className="print-header-inner">
				{!logoError && (
					<img
						src="/logo.png"
						alt="Escola Chave do Saber"
						className="print-logo"
						onError={onLogoError}
					/>
				)}
				<div className="print-header-texto">
					<p className="print-estado">ESTADO DA BAHIA</p>
					<h1 className="print-escola">ESCOLA CHAVE DO SABER</h1>
					<p className="print-endereco">
						Avenida Manoel Pereira de Andrade, nº 46, Milagres Bahia
					</p>
					<p className="print-cnpj">CNPJ: 24.382.774/0001-92</p>
				</div>
			</div>
			<div className="print-header-line" />
		</header>
	);
}

function PrintFooter() {
	return (
		<footer className="print-footer-oficial">
			E-mail: educacaochavedosaber@hotmail.com
		</footer>
	);
}

export function PrintTermo({ matricula }: PrintTermoProps) {
	const [logoError, setLogoError] = useState(false);

	const dataAtual = formatDateExtended(new Date());
	const telefonesFormatados = formatTelefones(
		matricula.telefones,
		matricula.telefone2 as string | null | undefined,
		matricula.telefone3 as string | null | undefined,
	);

	return (
		<>
			{/* PÁGINA 1: TERMO DE MATRÍCULA */}
			<div className="print-termo">
				<PrintHeader
					logoError={logoError}
					onLogoError={() => setLogoError(true)}
				/>

				<div className="print-content">
					<h2 className="print-titulo-pagina">
						TERMO DE ASSINATURA E RESPONSABILIDADE DE MATRÍCULA - 2026
					</h2>

					<div className="print-body">
						<p>
							Eu, <strong>{matricula.nomeResponsavel}</strong>, portador(a) do
							RG nº <strong>{matricula.rgResponsavel}</strong> e CPF nº{" "}
							<strong>{matricula.cpfResponsavel}</strong>, na qualidade de
							responsável legal, declaro para os devidos fins que o(a) menor{" "}
							<strong>{matricula.nomeAluno}</strong>, nascido(a) em{" "}
							{new Date(matricula.dataNascimento).toLocaleDateString("pt-BR")},
							foi matriculado(a) neste estabelecimento de ensino para frequentar
							a <strong>{matricula.serie}</strong> no turno{" "}
							<strong>{matricula.turno}</strong>, no ano letivo de 2026.
						</p>

						<p>
							Declaro ainda ter ciência das normas internas da escola e
							comprometo-me a fornecer toda a documentação necessária para a
							efetivação da matrícula completa, bem como a zelar pela frequência
							e desempenho escolar do(a) aluno(a).
						</p>
					</div>

					<p className="print-date">Milagres - BA, {dataAtual}</p>

					<div className="print-signatures">
						<div className="print-signature-block">
							<div className="print-line" />
							<p>Assinatura do Responsável Legal</p>
							<p className="print-sub">Nome: {matricula.nomeResponsavel}</p>
						</div>

						<div className="print-signature-block">
							<div className="print-line" />
							<p>Simone Correia Silva</p>
							<p className="print-sub">Dirigente Escolar Chave do Saber</p>
						</div>
					</div>
				</div>

				<PrintFooter />
			</div>

			{/* QUEBRA DE PÁGINA */}
			<div className="page-break" />

			{/* PÁGINA 2: TERMO DE AUTORIZAÇÃO DE IMAGEM E VOZ */}
			<div className="print-termo">
				<PrintHeader
					logoError={logoError}
					onLogoError={() => setLogoError(true)}
				/>

				<div className="print-content">
					<h2 className="print-titulo-pagina">
						TERMO DE AUTORIZAÇÃO PARA USO DE IMAGEM E VOZ
					</h2>
					<p className="print-subtitulo">
						Em conformidade com o Estatuto da Criança e do Adolescente – Lei nº
						8.069/1990 e diretrizes do ECA Digital 2025.
					</p>

					<div className="print-body-autorizacao">
						<div className="print-secao">
							<h3 className="print-secao-titulo">
								1. IDENTIFICAÇÃO DO RESPONSÁVEL LEGAL
							</h3>
							<table className="print-tabela">
								<tbody>
									<tr>
										<td className="print-label">Nome:</td>
										<td className="print-value" colSpan={3}>
											{matricula.nomeResponsavel}
										</td>
									</tr>
									<tr>
										<td className="print-label">Endereço:</td>
										<td className="print-value" colSpan={3}>
											{matricula.endereco}
										</td>
									</tr>
									<tr>
										<td className="print-label">RG:</td>
										<td className="print-value">{matricula.rgResponsavel}</td>
										<td className="print-label">CPF:</td>
										<td className="print-value">{matricula.cpfResponsavel}</td>
									</tr>
									<tr>
										<td className="print-label">Telefone(s):</td>
										<td className="print-value" colSpan={3}>
											{telefonesFormatados}
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<div className="print-secao">
							<h3 className="print-secao-titulo">
								2. IDENTIFICAÇÃO DO(A) ALUNO(A)
							</h3>
							<table className="print-tabela">
								<tbody>
									<tr>
										<td className="print-label">Nome:</td>
										<td className="print-value" colSpan={3}>
											{matricula.nomeAluno}
										</td>
									</tr>
									<tr>
										<td className="print-label">Turma/Ano:</td>
										<td className="print-value">{matricula.serie}</td>
										<td className="print-label">Turno:</td>
										<td className="print-value">{matricula.turno}</td>
									</tr>
								</tbody>
							</table>
						</div>

						<div className="print-secao">
							<h3 className="print-secao-titulo">3. MANIFESTAÇÃO DE VONTADE</h3>
							<p className="print-paragrafo">
								Eu, acima citado(a) na qualidade de responsável legal pelo(a)
								aluno(a) acima identificado(a),{" "}
								<strong>
									{matricula.autorizoUsoImagem ? "AUTORIZO" : "NÃO AUTORIZO"}
								</strong>
								, de forma espontânea, livre, informada, expressa e gratuita, o
								uso de sua imagem e voz pela Escola Chave do Saber nos termos e
								finalidades descritas abaixo.
							</p>
						</div>

						<div className="print-secao">
							<h3 className="print-secao-titulo">4. FINALIDADES DO USO</h3>
							<ul className="print-lista">
								<li>Atividades pedagógicas e projetos escolares;</li>
								<li>Eventos internos e externos da instituição;</li>
								<li>Site oficial e redes sociais da escola;</li>
								<li>Materiais institucionais impressos e digitais;</li>
								<li>Registros pedagógicos e divulgação de ações educativas.</li>
							</ul>
						</div>

						<div className="print-secao">
							<h3 className="print-secao-titulo">
								5. GARANTIAS E COMPROMISSOS
							</h3>
							<ul className="print-lista">
								<li>
									Uso ético e respeitoso, preservando a dignidade do(a)
									aluno(a);
								</li>
								<li>Sem uso para fins comerciais;</li>
								<li>Medidas de segurança no ambiente digital;</li>
								<li>Exposição adequada à idade e condição do(a) estudante;</li>
								<li>
									Pode ser revogada a qualquer momento, por solicitação formal
									por escrito.
								</li>
							</ul>
						</div>

						<div className="print-secao">
							<h3 className="print-secao-titulo">6. VIGÊNCIA</h3>
							<p className="print-paragrafo">
								Validade por prazo indeterminado enquanto houver vínculo com a
								instituição, podendo ser revogada a qualquer tempo por
								solicitação formal por escrito.
							</p>
						</div>
					</div>

					<p className="print-date">Milagres - BA, {dataAtual}</p>

					<div className="print-signatures">
						<div className="print-signature-block">
							<div className="print-line" />
							<p>Assinatura do Responsável Legal</p>
							<p className="print-sub">Nome: {matricula.nomeResponsavel}</p>
						</div>

						<div className="print-signature-block">
							<div className="print-line" />
							<p>Simone Correia Silva</p>
							<p className="print-sub">Dirigente Escolar Chave do Saber</p>
						</div>
					</div>
				</div>

				<PrintFooter />
			</div>
		</>
	);
}
