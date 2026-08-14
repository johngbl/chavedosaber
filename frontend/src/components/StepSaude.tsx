import type { MatriculaFormData } from "../types/matricula";

interface StepProps {
	data: MatriculaFormData;
	onChange: <K extends keyof MatriculaFormData>(
		field: K,
		value: MatriculaFormData[K],
	) => void;
	errors: Partial<Record<keyof MatriculaFormData, string>>;
}

const DEFICIENCIAS: { key: keyof MatriculaFormData; label: string }[] = [
	{ key: "defCegueira", label: "Cegueira" },
	{ key: "defBaixaVisao", label: "Baixa Visão" },
	{ key: "defSurdez", label: "Surdez" },
	{ key: "defAutismoInfantil", label: "Autismo Infantil" },
	{ key: "defSindromeAsperger", label: "Síndrome de Asperger" },
	{
		key: "defAltasHabilidadesSuperdotacao",
		label: "Altas Habilidades / Superdotação",
	},
	{ key: "defSurdocegueira", label: "Surdocegueira" },
	{ key: "defFisica", label: "Deficiência Física" },
	{ key: "defSindromeRett", label: "Síndrome de Rett" },
	{
		key: "defTranstornoDesintegrativo",
		label: "Transtorno Desintegrativo da Infância",
	},
	{
		key: "defAuditivaInfancia",
		label: "Deficiência Auditiva (adquirida na infância)",
	},
	{ key: "defIntelectual", label: "Deficiência Intelectual" },
	{ key: "defMultipla", label: "Deficiência Múltipla" },
];

export function StepSaude({ data, onChange }: StepProps) {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">
				Informações de Saúde e Deficiências
			</h2>

			<div className="space-y-4">
				<div className="bg-gray-50 rounded-lg p-4 space-y-3">
					<h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
						Saúde
					</h3>

					<div className="space-y-2">
						<div className="flex items-center gap-3">
							<span className="text-sm text-gray-700 w-48">
								Possui problema de saúde?
							</span>
							{["Sim", "Não"].map((v) => (
								<label key={v} className="flex items-center gap-1 text-sm">
									<input
										type="radio"
										name="problemaSaude"
										checked={
											data.possuiProblemaSaude ? v === "Sim" : v === "Não"
										}
										onChange={() =>
											onChange("possuiProblemaSaude", v === "Sim")
										}
										className="accent-brand-green"
									/>
									{v}
								</label>
							))}
						</div>
						{data.possuiProblemaSaude && (
							<input
								type="text"
								value={data.qualProblemaSaude}
								onChange={(e) => onChange("qualProblemaSaude", e.target.value)}
								className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
								placeholder="Descreva o problema de saúde"
							/>
						)}
					</div>

					<div className="flex items-center gap-3">
						<span className="text-sm text-gray-700 w-48">
							Faz uso de medicação?
						</span>
						{["Sim", "Não"].map((v) => (
							<label key={v} className="flex items-center gap-1 text-sm">
								<input
									type="radio"
									name="medicacao"
									checked={data.fazUsoMedicacao ? v === "Sim" : v === "Não"}
									onChange={() => onChange("fazUsoMedicacao", v === "Sim")}
									className="accent-brand-green"
								/>
								{v}
							</label>
						))}
					</div>

					<div className="flex items-center gap-3">
						<span className="text-sm text-gray-700 w-48">
							Possui relatório médico?
						</span>
						{["Sim", "Não"].map((v) => (
							<label key={v} className="flex items-center gap-1 text-sm">
								<input
									type="radio"
									name="relatorioMedico"
									checked={
										data.possuiRelatorioMedico ? v === "Sim" : v === "Não"
									}
									onChange={() =>
										onChange("possuiRelatorioMedico", v === "Sim")
									}
									className="accent-brand-green"
								/>
								{v}
							</label>
						))}
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-3">
							<span className="text-sm text-gray-700 w-48">
								Apresenta alergia?
							</span>
							{["Sim", "Não"].map((v) => (
								<label key={v} className="flex items-center gap-1 text-sm">
									<input
										type="radio"
										name="alergia"
										checked={data.apresentaAlergia ? v === "Sim" : v === "Não"}
										onChange={() => onChange("apresentaAlergia", v === "Sim")}
										className="accent-brand-green"
									/>
									{v}
								</label>
							))}
						</div>
						{data.apresentaAlergia && (
							<input
								type="text"
								value={data.qualAlergia}
								onChange={(e) => onChange("qualAlergia", e.target.value)}
								className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
								placeholder="Descreva a alergia"
							/>
						)}
					</div>
				</div>

				<div className="bg-gray-50 rounded-lg p-4 space-y-3">
					<div className="flex items-center gap-3">
						<span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
							Deficiências / TGD / Altas Habilidades
						</span>
						{["Sim", "Não"].map((v) => (
							<label key={v} className="flex items-center gap-1 text-sm">
								<input
									type="radio"
									name="deficienciaTgd"
									checked={
										data.possuiDeficienciaOuTgd ? v === "Sim" : v === "Não"
									}
									onChange={() =>
										onChange("possuiDeficienciaOuTgd", v === "Sim")
									}
									className="accent-brand-green"
								/>
								{v}
							</label>
						))}
					</div>

					{data.possuiDeficienciaOuTgd && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
							{DEFICIENCIAS.map(({ key, label }) => (
								<label key={key} className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={data[key] as boolean}
										onChange={(e) =>
											onChange(
												key,
												e.target.checked as MatriculaFormData[typeof key],
											)
										}
										className="w-4 h-4 accent-brand-green rounded"
									/>
									{label}
								</label>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
