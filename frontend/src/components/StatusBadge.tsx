interface StatusBadgeProps {
	status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
	const styles: Record<string, string> = {
		pendente: "bg-yellow-100 text-yellow-800",
		aprovada: "bg-green-100 text-green-800",
		rejeitada: "bg-red-100 text-red-800",
	};

	const labels: Record<string, string> = {
		pendente: "Pendente",
		aprovada: "Aprovada",
		rejeitada: "Rejeitada",
	};

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}
		>
			{labels[status] || status}
		</span>
	);
}
