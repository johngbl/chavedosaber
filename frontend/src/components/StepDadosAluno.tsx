import type { MatriculaFormData } from "../types/matricula";
import { maskCpf, maskSus } from "../utils/masks";

interface StepProps {
	data: MatriculaFormData;
	onChange: <K extends keyof MatriculaFormData>(
		field: K,
		value: MatriculaFormData[K],
	) => void;
	errors: Partial<Record<keyof MatriculaFormData, string>>;
}

const SERIES = [
	"1º Ano - Ensino Fundamental",
	"2º Ano - Ensino Fundamental",
	"3º Ano - Ensino Fundamental",
	"4º Ano - Ensino Fundamental",
	"5º Ano - Ensino Fundamental",
];

const TURNOS = ["Matutino", "Vespertino"];

const CORES_RACA = [
	"Branca",
	"Preta",
	"Parda",
	"Amarela",
	"Indígena",
	"Não declarada",
];

export function StepDadosAluno({ data, onChange, errors }: StepProps) {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">
				Dados Básicos do Aluno
			</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="serie"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Série * <span className="text-xs text-gray-400">(Ano escolar)</span>
					</label>
					<select
						id="serie"
						value={data.serie}
						onChange={(e) => onChange("serie", e.target.value)}
						className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
							errors.serie ? "border-red-400" : "border-gray-300"
						}`}
					>
						<option value="">Selecione...</option>
						{SERIES.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
					{errors.serie && (
						<p className="text-red-500 text-xs mt-1">{errors.serie}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="turno"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Turno *
					</label>
					<select
						id="turno"
						value={data.turno}
						onChange={(e) => onChange("turno", e.target.value)}
						className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
							errors.turno ? "border-red-400" : "border-gray-300"
						}`}
					>
						<option value="">Selecione...</option>
						{TURNOS.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
					{errors.turno && (
						<p className="text-red-500 text-xs mt-1">{errors.turno}</p>
					)}
				</div>

				<div className="sm:col-span-2">
					<label
						htmlFor="nomeAluno"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Nome Completo do Aluno *
					</label>
					<input
						id="nomeAluno"
						type="text"
						value={data.nomeAluno}
						onChange={(e) => onChange("nomeAluno", e.target.value)}
						className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
							errors.nomeAluno ? "border-red-400" : "border-gray-300"
						}`}
						placeholder="Nome completo"
					/>
					{errors.nomeAluno && (
						<p className="text-red-500 text-xs mt-1">{errors.nomeAluno}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="dataNascimento"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Data de Nascimento *
					</label>
					<input
						id="dataNascimento"
						type="date"
						value={data.dataNascimento}
						onChange={(e) => onChange("dataNascimento", e.target.value)}
						className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
							errors.dataNascimento ? "border-red-400" : "border-gray-300"
						}`}
					/>
					{errors.dataNascimento && (
						<p className="text-red-500 text-xs mt-1">{errors.dataNascimento}</p>
					)}
				</div>

				<div>
					<span className="block text-sm font-medium text-gray-700 mb-1">
						Sexo *
					</span>
					<div className="flex gap-4 mt-2">
						{["M", "F"].map((s) => (
							<label key={s} className="flex items-center gap-2 text-sm">
								<input
									type="radio"
									name="sexo"
									value={s}
									checked={data.sexo === s}
									onChange={(e) => onChange("sexo", e.target.value)}
									className="accent-brand-green"
								/>
								{s === "M" ? "Masculino" : "Feminino"}
							</label>
						))}
					</div>
					{errors.sexo && (
						<p className="text-red-500 text-xs mt-1">{errors.sexo}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="corRaca"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Cor/Raça *
					</label>
					<select
						id="corRaca"
						value={data.corRaca}
						onChange={(e) => onChange("corRaca", e.target.value)}
						className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
							errors.corRaca ? "border-red-400" : "border-gray-300"
						}`}
					>
						<option value="">Selecione...</option>
						{CORES_RACA.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
					{errors.corRaca && (
						<p className="text-red-500 text-xs mt-1">{errors.corRaca}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="naturalidade"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Naturalidade *
					</label>
					<input
						id="naturalidade"
						type="text"
						value={data.naturalidade}
						onChange={(e) => onChange("naturalidade", e.target.value)}
						className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
							errors.naturalidade ? "border-red-400" : "border-gray-300"
						}`}
						placeholder="Cidade / UF"
					/>
					{errors.naturalidade && (
						<p className="text-red-500 text-xs mt-1">{errors.naturalidade}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="sus"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Nº do Cartão SUS
					</label>
					<input
						id="sus"
						type="text"
						value={data.sus}
						onChange={(e) => onChange("sus", maskSus(e.target.value))}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
						placeholder="Opcional"
						maxLength={15}
					/>
				</div>

				<div>
					<label
						htmlFor="cpfAluno"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						CPF do Aluno
					</label>
					<input
						id="cpfAluno"
						type="text"
						value={data.cpfAluno}
						onChange={(e) => onChange("cpfAluno", maskCpf(e.target.value))}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
						placeholder="000.000.000-00"
						maxLength={14}
					/>
				</div>
			</div>
		</div>
	);
}
