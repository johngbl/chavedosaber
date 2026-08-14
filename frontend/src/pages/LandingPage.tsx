import { Link } from "react-router-dom";

/**
 * Página inicial (landing page).
 * Placeholder: a página institucional final será construída aqui.
 */
export function LandingPage() {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
				<img
					src="/logo.png"
					alt="Escola Chave do Saber"
					className="h-16 mx-auto mb-4"
				/>
				<h1 className="text-2xl font-bold text-brand-green-dark mb-2">
					Escola Chave do Saber
				</h1>
				<p className="text-gray-600 text-sm mb-6">
					Pré-matrículas digitais para o ano letivo.
				</p>

				<div className="bg-brand-green-light border border-brand-green/30 rounded-lg p-4 mb-6">
					<p className="text-xs text-brand-green-dark leading-relaxed">
						As pré-matrículas são realizadas por{" "}
						<strong>link de convite</strong> enviado pela secretaria da escola.
						Se você recebeu um link, clique nele para preencher a ficha.
					</p>
				</div>

				<Link
					to="/login"
					className="inline-block px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-lg hover:bg-brand-green-dark transition-colors"
				>
					Acesso da Secretaria
				</Link>
			</div>
		</div>
	);
}
