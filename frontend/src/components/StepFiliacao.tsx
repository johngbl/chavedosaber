import type { MatriculaFormData } from "../types/matricula";
import { maskPhone } from "../utils/masks";

interface StepProps {
	data: MatriculaFormData;
	onChange: <K extends keyof MatriculaFormData>(
		field: K,
		value: MatriculaFormData[K],
	) => void;
	errors: Partial<Record<keyof MatriculaFormData, string>>;
}

export function StepFiliacao({ data, onChange, errors }: StepProps) {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">
				Filiação, Endereço e Contatos
			</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="sm:col-span-2">
					<label
						htmlFor="nomeMae"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Nome da Mãe *
					</label>
					<input
						id="nomeMae"
						type="text"
						value={data.nomeMae}
						onChange={(e) => onChange("nomeMae", e.target.value)}
						className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
							errors.nomeMae ? "border-red-400" : "border-gray-300"
						}`}
						placeholder="Nome completo da mãe"
					/>
					{errors.nomeMae && (
						<p className="text-red-500 text-xs mt-1">{errors.nomeMae}</p>
					)}
				</div>

				<div className="sm:col-span-2">
					<label
						htmlFor="nomePai"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Nome do Pai
					</label>
					<input
						id="nomePai"
						type="text"
						value={data.nomePai}
						onChange={(e) => onChange("nomePai", e.target.value)}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
						placeholder="Opcional"
					/>
				</div>

				<div className="sm:col-span-2">
					<label
						htmlFor="endereco"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Endereço Completo *
					</label>
					<input
						id="endereco"
						type="text"
						value={data.endereco}
						onChange={(e) => onChange("endereco", e.target.value)}
						className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
							errors.endereco ? "border-red-400" : "border-gray-300"
						}`}
						placeholder="Rua, número, bairro, complemento"
					/>
					{errors.endereco && (
						<p className="text-red-500 text-xs mt-1">{errors.endereco}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="telefones"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Telefones para Contato *
					</label>
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<span className="text-xs text-gray-500 w-16">Telefone 1:</span>
							<input
								id="telefones"
								type="text"
								value={data.telefones}
								onChange={(e) =>
									onChange("telefones", maskPhone(e.target.value))
								}
								className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none ${
									errors.telefones ? "border-red-400" : "border-gray-300"
								}`}
								placeholder="(00) 00000-0000"
								maxLength={15}
							/>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xs text-gray-500 w-16">Telefone 2:</span>
							<input
								id="telefone2"
								type="text"
								value={data.telefone2}
								onChange={(e) =>
									onChange("telefone2", maskPhone(e.target.value))
								}
								className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
								placeholder="(00) 00000-0000 (opcional)"
								maxLength={15}
							/>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xs text-gray-500 w-16">Telefone 3:</span>
							<input
								id="telefone3"
								type="text"
								value={data.telefone3}
								onChange={(e) =>
									onChange("telefone3", maskPhone(e.target.value))
								}
								className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
								placeholder="(00) 00000-0000 (opcional)"
								maxLength={15}
							/>
						</div>
					</div>
					{errors.telefones && (
						<p className="text-red-500 text-xs mt-1">{errors.telefones}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="emailContato"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						E-mail para Contato
					</label>
					<input
						id="emailContato"
						type="email"
						value={data.emailContato}
						onChange={(e) => onChange("emailContato", e.target.value)}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
						placeholder="Opcional"
					/>
				</div>

				<div>
					<span className="block text-sm font-medium text-gray-700 mb-1">
						Zona de Residência *
					</span>
					<div className="flex gap-4 mt-2">
						{["Urbana", "Rural"].map((z) => (
							<label key={z} className="flex items-center gap-2 text-sm">
								<input
									type="radio"
									name="zona"
									value={z}
									checked={data.zonaResidencia === z}
									onChange={(e) => onChange("zonaResidencia", e.target.value)}
									className="accent-brand-green"
								/>
								{z}
							</label>
						))}
					</div>
					{errors.zonaResidencia && (
						<p className="text-red-500 text-xs mt-1">{errors.zonaResidencia}</p>
					)}
				</div>

				<div className="flex items-center gap-2 mt-4">
					<input
						type="checkbox"
						id="transporte"
						checked={data.utilizaTransporteEscolar}
						onChange={(e) =>
							onChange("utilizaTransporteEscolar", e.target.checked)
						}
						className="w-4 h-4 accent-brand-green rounded"
					/>
					<label htmlFor="transporte" className="text-sm text-gray-700">
						Utiliza transporte escolar
					</label>
				</div>
			</div>
		</div>
	);
}
