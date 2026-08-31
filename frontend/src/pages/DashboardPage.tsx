import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import type {
	Matricula,
	MatriculaLink,
	MatriculaLinkResponse,
	MatriculaListResponse,
} from "../types/matricula";

type StatusFilter = "todos" | "pendente" | "aprovada" | "rejeitada";

const PAGE_SIZE = 10;

function formatDate(iso: string | null | undefined): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("pt-BR");
}

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

	// Links temporários de matrícula
	const [links, setLinks] = useState<MatriculaLink[]>([]);
	const [linksLoading, setLinksLoading] = useState(true);
	const [newLink, setNewLink] = useState<MatriculaLinkResponse | null>(null);
	const [linkError, setLinkError] = useState("");
	const [generating, setGenerating] = useState(false);
	const [copied, setCopied] = useState(false);

	const loadLinks = useCallback(async () => {
		try {
			setLinksLoading(true);
			const data = await apiFetch<MatriculaLink[]>("/matriculas/links");
			setLinks(data);
		} catch {
			setLinks([]);
		} finally {
			setLinksLoading(false);
		}
	}, []);

	async function generateLink() {
		setGenerating(true);
		setLinkError("");
		setCopied(false);
		try {
			const data = await apiFetch<MatriculaLinkResponse>("/matriculas/links", {
				method: "POST",
			});
			setNewLink(data);
			await loadLinks();
		} catch (err) {
			setLinkError(err instanceof Error ? err.message : "Erro ao gerar link");
		} finally {
			setGenerating(false);
		}
	}

	async function copyLink(link: string) {
		try {
			await navigator.clipboard.writeText(`${window.location.origin}${link}`);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setLinkError("Não foi possível copiar o link.");
		}
	}

	async function handleDeleteLink(id: number) {
		if (!window.confirm("Deseja realmente excluir este link de matrícula?")) {
			return;
		}
		try {
			setLinkError("");
			await apiFetch(`/matriculas/links/${id}`, { method: "DELETE" });
			setLinks((prev) => prev.filter((l) => l.id !== id));
			if (newLink && links.find((l) => l.id === id)?.token === newLink.token) {
				setNewLink(null);
			}
		} catch (err) {
			setLinkError(
				err instanceof Error ? err.message : "Erro ao excluir link",
			);
		}
	}

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

	useEffect(() => {
		loadLinks();
	}, [loadLinks]);

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
				{/* Links temporários de matrícula */}
				<section className="bg-white rounded-xl shadow p-5 mb-6">
					<div className="flex items-center justify-between flex-wrap gap-3 mb-4">
						<div>
							<h2 className="text-base font-semibold text-gray-800">
								Links de Matrícula
							</h2>
							<p className="text-xs text-gray-500 mt-0.5">
								Envie o link para a família realizar a pré-matrícula online.
							</p>
						</div>
						<button
							type="button"
							onClick={generateLink}
							disabled={generating}
							className="px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-lg hover:bg-brand-green-dark disabled:opacity-60 transition-colors"
						>
							{generating ? "Gerando..." : "+ Gerar link de matrícula"}
						</button>
					</div>

					{linkError && (
						<div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
							{linkError}
						</div>
					)}

					{newLink && (
						<div className="mb-4 p-3 bg-brand-green-light border border-brand-green/30 rounded-lg">
							<p className="text-xs text-brand-green-dark mb-1 font-medium">
								Link gerado (válido até {formatDate(newLink.expiresAt)}):
							</p>
							<div className="flex items-center gap-2 flex-wrap">
								<code className="text-xs bg-white rounded border px-2 py-1 text-gray-700 break-all flex-1 min-w-0">
									{window.location.origin}
									{newLink.link}
								</code>
								<button
									type="button"
									onClick={() => copyLink(newLink.link)}
									className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
								>
									{copied ? "Copiado!" : "Copiar"}
								</button>
							</div>
						</div>
					)}

					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b">
								<tr>
									<th className="text-left px-3 py-2 font-medium text-gray-600">
										Criado
									</th>
									<th className="text-left px-3 py-2 font-medium text-gray-600">
										Expira
									</th>
									<th className="text-left px-3 py-2 font-medium text-gray-600">
										Status
									</th>
									<th className="text-left px-3 py-2 font-medium text-gray-600">
										Ações
									</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{linksLoading ? (
									<tr>
										<td colSpan={4} className="px-3 py-3 text-gray-400">
											Carregando...
										</td>
									</tr>
								) : links.length === 0 ? (
									<tr>
										<td colSpan={4} className="px-3 py-3 text-gray-400">
											Nenhum link gerado até o momento.
										</td>
									</tr>
								) : (
									links.map((link) => {
										const expired =
											!link.usedAt &&
											new Date(link.expiresAt).getTime() < Date.now();
										const status = link.usedAt
											? "Utilizado"
											: expired
												? "Expirado"
												: "Ativo";
										return (
											<tr key={link.id}>
												<td className="px-3 py-2 text-gray-600">
													{formatDate(link.createdAt)}
												</td>
												<td className="px-3 py-2 text-gray-600">
													{formatDate(link.expiresAt)}
												</td>
												<td className="px-3 py-2">
													<span
														className={`text-xs font-medium px-2 py-0.5 rounded-full ${
															status === "Ativo"
																? "bg-brand-green-light text-brand-green-dark"
																: status === "Utilizado"
																	? "bg-gray-100 text-gray-600"
																	: "bg-red-50 text-red-600"
														}`}
													>
														{status}
													</span>
												</td>
												<td className="px-3 py-2">
													<div className="flex items-center gap-3">
														<button
															type="button"
															onClick={() => copyLink(`/matricula/${link.token}`)}
															className="text-xs text-brand-green hover:underline font-medium"
														>
															Copiar link
														</button>
														<button
															type="button"
															onClick={() => handleDeleteLink(link.id)}
															className="text-xs text-red-500 hover:text-red-700 hover:underline"
														>
															Excluir
														</button>
													</div>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</section>

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
