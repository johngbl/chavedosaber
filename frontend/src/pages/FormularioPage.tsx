import { useState } from "react";
import { apiFetch } from "../api/client";
import { StepDadosAluno } from "../components/StepDadosAluno";
import { StepFiliacao } from "../components/StepFiliacao";
import { Stepper } from "../components/Stepper";
import { StepResponsavel } from "../components/StepResponsavel";
import { StepSaude } from "../components/StepSaude";
import type { MatriculaFormData } from "../types/matricula";
import { emptyFormData } from "../types/matricula";
import {
	isValidCpf,
	isValidDate,
	isValidEmail,
	isValidNis,
	stripDigits,
} from "../utils/validations";

type StepErrors = Partial<Record<keyof MatriculaFormData, string>>;

const STEP_VALIDATORS: ((data: MatriculaFormData) => StepErrors)[] = [
	(data) => {
		const e: StepErrors = {};
		if (!data.serie) e.serie = "Obrigatório";
		if (!data.turno) e.turno = "Obrigatório";
		if (!data.nomeAluno.trim()) e.nomeAluno = "Obrigatório";
		if (!data.dataNascimento) e.dataNascimento = "Obrigatório";
		else if (!isValidDate(data.dataNascimento))
			e.dataNascimento = "Data inválida ou futura";
		if (!data.sexo) e.sexo = "Obrigatório";
		if (!data.corRaca) e.corRaca = "Obrigatório";
		if (!data.naturalidade.trim()) e.naturalidade = "Obrigatório";
		if (data.cpfAluno && !isValidCpf(data.cpfAluno))
			e.cpfAluno = "CPF inválido (verifique os dígitos)";
		return e;
	},
	(data) => {
		const e: StepErrors = {};
		if (!data.nomeMae.trim()) e.nomeMae = "Obrigatório";
		if (!data.endereco.trim()) e.endereco = "Obrigatório";
		if (!data.telefones.trim()) e.telefones = "Obrigatório";
		if (!data.zonaResidencia) e.zonaResidencia = "Obrigatório";
		if (data.emailContato && !isValidEmail(data.emailContato))
			e.emailContato = "E-mail inválido";
		return e;
	},
	() => ({}),
	(data) => {
		const e: StepErrors = {};
		if (!data.nomeResponsavel.trim()) e.nomeResponsavel = "Obrigatório";
		if (!data.rgResponsavel.trim()) e.rgResponsavel = "Obrigatório";
		else if (stripDigits(data.rgResponsavel).length < 4)
			e.rgResponsavel = "Informe ao menos 4 dígitos";
		if (!data.cpfResponsavel.trim()) e.cpfResponsavel = "Obrigatório";
		else if (!isValidCpf(data.cpfResponsavel))
			e.cpfResponsavel = "CPF inválido (verifique os dígitos)";
		if (
			data.recebeBolsaFamilia &&
			data.numeroNis &&
			!isValidNis(data.numeroNis)
		)
			e.numeroNis = "NIS deve ter 11 dígitos";
		if (!data.consentimento)
			e.consentimento =
				"Você deve declarar que leu e concorda com os termos para continuar";
		return e;
	},
];

export function FormularioPage() {
	const [step, setStep] = useState(0);
	const [data, setData] = useState<MatriculaFormData>(emptyFormData);
	const [errors, setErrors] = useState<StepErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);
	const [submitError, setSubmitError] = useState("");

	function handleChange<K extends keyof MatriculaFormData>(
		field: K,
		value: MatriculaFormData[K],
	) {
		setData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => {
			const next = { ...prev };
			delete next[field];
			return next;
		});
	}

	function validate(): boolean {
		const stepErrors = STEP_VALIDATORS[step](data);
		setErrors(stepErrors);
		return Object.keys(stepErrors).length === 0;
	}

	function next() {
		if (!validate()) return;
		setStep((s) => Math.min(s + 1, 3));
	}

	function prev() {
		setStep((s) => Math.max(s - 1, 0));
	}

	// Helper para limpar dados opcionais vazios antes de enviar
	function cleanFormData(formData: MatriculaFormData): Record<string, unknown> {
		const cleaned: Record<string, unknown> = {};
		// Campos que são apenas de UI e não devem ser enviados ao backend
		const uiOnlyFields = new Set(["consentimento"]);
		for (const [key, value] of Object.entries(formData)) {
			if (uiOnlyFields.has(key)) continue;
			if (value === "") continue; // Não inclui campos opcionais vazios
			cleaned[key] = value;
		}
		return cleaned;
	}

	async function submit() {
		if (!validate()) return;
		setSubmitting(true);
		setSubmitError("");
		try {
			await apiFetch("/matriculas", {
				method: "POST",
				body: JSON.stringify(cleanFormData(data)),
			});
			setSuccess(true);
		} catch (err) {
			setSubmitError(
				err instanceof Error ? err.message : "Erro ao enviar formulário",
			);
		} finally {
			setSubmitting(false);
		}
	}

	if (success) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
					<div className="w-16 h-16 bg-brand-green-light rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							role="img"
							aria-label="Sucesso"
							className="w-8 h-8 text-brand-green"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-gray-800 mb-2">
						Pré-Matrícula Enviada!
					</h2>
					<p className="text-gray-600 text-sm">
						A sua pré-matrícula foi registada com sucesso. A secretaria da
						escola irá analisar os dados e retornará o contacto em breve.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4">
			<div className="max-w-2xl mx-auto">
				<div className="text-center mb-6">
					<img
						src="/logo.png"
						alt="Escola Chave do Saber"
						className="h-16 mx-auto mb-3"
					/>
					<h1 className="text-2xl font-bold text-brand-green-dark">
						Pré-Matrícula Digital
					</h1>
					<p className="text-sm text-gray-500 mt-1">
						Preencha os dados abaixo para iniciar a pré-matrícula
					</p>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-6">
					<Stepper currentStep={step} />

					{step === 0 && (
						<StepDadosAluno
							data={data}
							onChange={handleChange}
							errors={errors}
						/>
					)}
					{step === 1 && (
						<StepFiliacao data={data} onChange={handleChange} errors={errors} />
					)}
					{step === 2 && (
						<StepSaude data={data} onChange={handleChange} errors={errors} />
					)}
					{step === 3 && (
						<StepResponsavel
							data={data}
							onChange={handleChange}
							errors={errors}
						/>
					)}

					{submitError && (
						<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
							{submitError}
						</div>
					)}

					<div className="flex justify-between mt-8 pt-4 border-t">
						<button
							type="button"
							onClick={prev}
							disabled={step === 0}
							className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							Anterior
						</button>

						{step < 3 ? (
							<button
								type="button"
								onClick={next}
								className="px-6 py-2 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-brand-orange-dark transition-colors"
							>
								Próximo
							</button>
						) : (
							<button
								type="button"
								onClick={submit}
								disabled={submitting}
								className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
							>
								{submitting ? "Enviando..." : "Enviar Pré-Matrícula"}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
