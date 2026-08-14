import type { MatriculaFormData } from "../types/matricula";
import { maskCpf, maskNis, maskRg } from "../utils/masks";

interface StepProps {
	data: MatriculaFormData;
	onChange: <K extends keyof MatriculaFormData>(
		field: K,
		value: MatriculaFormData[K],
	) => void;
	errors: Partial<Record<keyof MatriculaFormData, string>>;
}

export function StepResponsavel({ data, onChange, errors }: StepProps) {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">
				Dados do Responsável Legal e Autorizações
			</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="sm:col-span-2">
					<label
						htmlFor="nomeResponsavel"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Nome do Responsável Legal *
					</label>
					<input
						id="nomeResponsavel"
						type="text"
						value={data.nomeResponsavel}
						onChange={(e) => onChange("nomeResponsavel", e.target.value)}
						className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
							errors.nomeResponsavel ? "border-red-400" : "border-gray-300"
						}`}
						placeholder="Nome completo"
					/>
					{errors.nomeResponsavel && (
						<p className="text-red-500 text-xs mt-1">
							{errors.nomeResponsavel}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor="rgResponsavel"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						RG do Responsável *
					</label>
					<input
						id="rgResponsavel"
						type="text"
						value={data.rgResponsavel}
						onChange={(e) => onChange("rgResponsavel", maskRg(e.target.value))}
						className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
							errors.rgResponsavel ? "border-red-400" : "border-gray-300"
						}`}
						placeholder="Nº do RG"
						maxLength={14}
					/>
					{errors.rgResponsavel && (
						<p className="text-red-500 text-xs mt-1">{errors.rgResponsavel}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="cpfResponsavel"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						CPF do Responsável *
					</label>
					<input
						id="cpfResponsavel"
						type="text"
						value={data.cpfResponsavel}
						onChange={(e) =>
							onChange("cpfResponsavel", maskCpf(e.target.value))
						}
						className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
							errors.cpfResponsavel ? "border-red-400" : "border-gray-300"
						}`}
						placeholder="000.000.000-00"
						maxLength={14}
					/>
					{errors.cpfResponsavel && (
						<p className="text-red-500 text-xs mt-1">{errors.cpfResponsavel}</p>
					)}
				</div>

				<div className="sm:col-span-2 border-t pt-4 space-y-3">
					<div className="flex items-start gap-3">
						<input
							type="checkbox"
							id="bolsaFamilia"
							checked={data.recebeBolsaFamilia}
							onChange={(e) => onChange("recebeBolsaFamilia", e.target.checked)}
							className="w-4 h-4 accent-brand-green mt-0.5 rounded"
						/>
						<label htmlFor="bolsaFamilia" className="text-sm text-gray-700">
							Recebe Bolsa Família
						</label>
					</div>
					{data.recebeBolsaFamilia && (
						<div>
							<label
								htmlFor="numeroNis"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Número NIS
							</label>
							<input
								id="numeroNis"
								type="text"
								value={data.numeroNis}
								onChange={(e) => onChange("numeroNis", maskNis(e.target.value))}
								className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
								placeholder="Nº do NIS"
								maxLength={11}
							/>
						</div>
					)}
				</div>

				{/* LGPD Informativo */}
				<div className="sm:col-span-2 border-t pt-4">
					<div className="bg-brand-green-light border border-brand-green/30 rounded-lg p-3">
						<div className="flex items-start gap-2">
							<svg
								role="img"
								aria-label="Informação LGPD"
								className="w-5 h-5 text-brand-green-dark mt-0.5 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Informação sobre proteção de dados</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<p className="text-xs text-brand-green-dark leading-relaxed">
								<strong>Proteção de Dados (LGPD):</strong> A Escola Chave do
								Saber trata os dados pessoais do(a) aluno(a) — inclusive dados
								sensíveis de saúde — com segurança e privacidade, estritamente
								para fins de gestão escolar e atividades pedagógicas, em
								conformidade com a Lei Geral de Proteção de Dados (Lei nº
								13.709/2018).
							</p>
						</div>
					</div>
				</div>

				{/* Autorização de Uso de Imagem */}
				<div className="sm:col-span-2 border-t pt-4 space-y-3">
					<div>
						<span className="block text-sm font-medium text-gray-700 mb-2">
							Você autoriza o uso de imagem e voz do estudante para fins
							pedagógicos e de divulgação? *
						</span>
						<div className="space-y-2">
							<label className="flex items-center gap-2 text-sm cursor-pointer">
								<input
									type="radio"
									name="autorizacaoImagem"
									checked={data.autorizoUsoImagem === true}
									onChange={() => onChange("autorizoUsoImagem", true)}
									className="accent-brand-green"
								/>
								<span>Sim, eu autorizo nos termos descritos.</span>
							</label>
							<label className="flex items-center gap-2 text-sm cursor-pointer">
								<input
									type="radio"
									name="autorizacaoImagem"
									checked={data.autorizoUsoImagem === false}
									onChange={() => onChange("autorizoUsoImagem", false)}
									className="accent-brand-green"
								/>
								<span>Não autorizo.</span>
							</label>
						</div>
					</div>

					{/* Termo Rolável */}
					<div className="border border-gray-200 rounded-lg bg-gray-50 p-3 max-h-40 overflow-y-auto">
						<h4 className="text-xs font-bold text-gray-800 mb-2">
							TERMO DE AUTORIZAÇÃO PARA USO DE IMAGEM E VOZ (ECA / ECA Digital
							2025)
						</h4>
						<p className="text-xs text-gray-700 leading-relaxed">
							A Escola Chave do Saber, inscrita no CNPJ 24.382.774/0001-92,
							solicita autorização para uso de imagem e voz do educando em
							atividades pedagógicas, eventos promovidos, materiais
							institucionais impressos e digitais, e redes sociais oficiais da
							escola. Garantimos que a imagem será utilizada com ética e
							respeito, preservando a dignidade do(a) aluno(a), sem fins
							comerciais, com medidas de segurança digital adequadas à idade.
							Esta autorização tem validade por prazo indeterminado e pode ser
							revogada por escrito a qualquer momento.
						</p>
					</div>
				</div>

				{/* Checkbox de Consentimento Obrigatório */}
				<div className="sm:col-span-2 border-t pt-4">
					<div className="flex items-start gap-3">
						<input
							type="checkbox"
							id="consentimentoTermos"
							checked={data.consentimento}
							onChange={(e) => onChange("consentimento", e.target.checked)}
							className={`w-4 h-4 accent-brand-green mt-0.5 rounded ${
								errors.consentimento ? "ring-2 ring-red-400" : ""
							}`}
						/>
						<label
							htmlFor="consentimentoTermos"
							className="text-sm text-gray-700 leading-relaxed"
						>
							Declaro que li e estou de acordo com os termos de tratamento de
							dados e manifestei minha decisão sobre a autorização de uso de
							imagem acima descrita. *
						</label>
					</div>
					{errors.consentimento && (
						<p className="text-red-500 text-xs ml-7 mt-1">
							{errors.consentimento}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
