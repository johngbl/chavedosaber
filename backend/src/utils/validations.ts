/**
 * Utilitários de validação de documentos brasileiros.
 */

export function stripDigits(value: string): string {
	return value.replace(/\D/g, "");
}

export function isValidCpf(cpf: string): boolean {
	if (!cpf) return false;
	const digits = stripDigits(cpf);
	if (digits.length !== 11) return false;
	if (/^(\d)\1+$/.test(digits)) return false;

	let sum = 0;
	for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i);
	let remainder = (sum * 10) % 11;
	if (remainder === 10) remainder = 0;
	if (remainder !== parseInt(digits[9], 10)) return false;

	sum = 0;
	for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i);
	remainder = (sum * 10) % 11;
	if (remainder === 10) remainder = 0;
	return remainder === parseInt(digits[10], 10);
}

export function isValidNis(nis: string): boolean {
	if (!nis) return false;
	const digits = stripDigits(nis);
	return digits.length === 11;
}

/**
 * Valida data no formato YYYY-MM-DD: deve existir no calendário e não ser
 * futura. Usa verificação round-trip em UTC porque `new Date("2023-02-30")`
 * "rola" silenciosamente para 2023-03-01 em vez de retornar Invalid Date.
 */
export function isValidDate(dateStr: string): boolean {
	if (!dateStr) return false;
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
	if (!match) return false;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	if (month < 1 || month > 12 || day < 1 || day > 31) return false;

	const date = new Date(Date.UTC(year, month - 1, day));
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	) {
		return false;
	}

	// Rejeita datas futuras (comparação em UTC com o dia atual).
	const today = new Date();
	const todayUtc = Date.UTC(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);
	return date.getTime() <= todayUtc;
}
