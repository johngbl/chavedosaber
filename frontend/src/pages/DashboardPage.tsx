import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import type { Matricula, MatriculaListResponse } from "../types/matricula";

type StatusFilter = "todos" | "pendente" | "aprovada" | "rejeitada";

const PAGE_SIZE = 10;

export function DashboardPage() {
	const { logout, nome } = useAuth();
	const navigate = useNavigate();
	const [matriculas, setMatriculas] = useState<Matricula[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<StatusFilter>("todos");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [error, setError] = useState("");

	const loadMatriculas = useCallback(async () => {
		try {
			setLoading(true);
			setError("");
			const params = new URLSearchParams({
				page: String(page),
				limit: String(PAGE_SIZE),
			});
			if (filter !== "todos") {
				params.set("status", filter);
			}
			const result = await apiFetch<MatriculaListResponse>(
				`/matriculas?${params.toString()}`,
			);
			setMatriculas(result.data);
			setTotal(result.total);
			setTotalPages(result.totalPages);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao carregar");
			setMatriculas([]);
			setTotal(0);
			setTotalPages(1);
		} finally {
			setLoading(false);
		}
	}, [filter, page]);

	useEffect(() => {
		loadMatriculas();
	}, [loadMatriculas]);

	function handleFilterChange(next: StatusFilter) {
		setFilter(next);
		setPage(1);
	}

	function handleLogout() {
		logout();
		navigate("/login");
	}

	const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
	const to = Math.min(page * PAGE_SIZE, total);

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<img src="/logo.png" alt="Escola Chave do Saber" className="h-8" />
						<h1 className="text-lg font-semibold text-gray-800">
							Painel de Pré-Matrículas
						</h1>
					</div>
					<div className="flex items-center gap-4">
						<span className="text-sm text-gray-500">Olá, {nome}</span>
						<button
							type="button"
							onClick={handleLogout}
							className="text-sm text-red-600 hover:underline"
						>
							Sair
						</button>
					</div>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-6">
				<div className="flex items-center gap-2 mb-4 flex-wrap">
					{(
						["todos", "pendente", "aprovada", "rejeitada"] as StatusFilter[]
					).map((s) => (
						<button
							type="button"
							key={s}
							onClick={() => handleFilterChange(s)}
							className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
								filter === s
									? "bg-brand-green text-white"
									: "bg-white text-gray-600 border hover:bg-gray-50"
							}`}
						>
							{s === "todos" ? "Todas" : s.charAt(0).toUpperCase() + s.slice(1)}
						</button>
					))}
				</div>

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{error}
					</div>
				)}

				{loading ? (
					<div className="text-center py-12 text-gray-400">Carregando...</div>
				) : matriculas.length === 0 ? (
					<div className="text-center py-12 text-gray-400">
						Nenhuma pré-matrícula encontrada.
					</div>
				) : (
					<>
						<div className="bg-white rounded-xl shadow overflow-hidden">
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="bg-gray-50 border-b">
										<tr>
											<th className="text-left px-4 py-3 font-medium text-gray-600">
												#
											</th>
											<th className="text-left px-4 py-3 font-medium text-gray-600">
												Aluno
											</th>
											<th className="text-left px-4 py-3 font-medium text-gray-600">
												Série
											</th>
											<th className="text-left px-4 py-3 font-medium text-gray-600">
												Data
											</th>
											<th className="text-left px-4 py-3 font-medium text-gray-600">
												Status
											</th>
											<th className="text-left px-4 py-3 font-medium text-gray-600">
												Ações
											</th>
										</tr>
									</thead>
									<tbody className="divide-y">
										{matriculas.map((m) => (
											<tr key={m.id} className="hover:bg-gray-50">
												<td className="px-4 py-3 text-gray-500">{m.id}</td>
												<td className="px-4 py-3 font-medium text-gray-800">
													{m.nomeAluno}
												</td>
												<td className="px-4 py-3 text-gray-600">{m.serie}</td>
												<td className="px-4 py-3 text-gray-500">
													{new Date(m.createdAt).toLocaleDateString("pt-BR")}
												</td>
												<td className="px-4 py-3">
													<StatusBadge status={m.status} />
												</td>
												<td className="px-4 py-3">
													<Link
														to={`/admin/${m.id}`}
														className="text-brand-green hover:underline font-medium"
													>
														Ver detalhes
													</Link>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						<nav
							className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3"
							aria-label="Paginação"
						>
							<p className="text-sm text-gray-500">
								Mostrando {from}–{to} de {total}
							</p>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page <= 1 || loading}
									className="px-3 py-1.5 text-sm rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
								>
									Anterior
								</button>
								<span className="text-sm text-gray-600 px-2">
									Página {page} de {totalPages}
								</span>
								<button
									type="button"
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page >= totalPages || loading}
									className="px-3 py-1.5 text-sm rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
								>
									Próxima
								</button>
							</div>
						</nav>
					</>
				)}
			</main>
		</div>
	);
}
