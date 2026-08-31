import { Link } from "react-router-dom";

export function NotFoundPage() {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="text-center">
				<h1 className="text-4xl font-bold text-gray-300 mb-2">404</h1>
				<p className="text-gray-600 mb-4">
					Não encontramos a página que você procura.
				</p>
				<Link
					to="/"
					className="inline-block px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-lg hover:bg-brand-green-dark transition-colors"
				>
					Voltar ao início
				</Link>
			</div>
		</div>
	);
}
