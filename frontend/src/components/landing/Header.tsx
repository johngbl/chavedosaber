import { useEffect, useState } from "react";
import { SCHOOL } from "../../content/school";
import { scrollToId } from "../../lib/smoothScroll";
import { IconFacebook, IconInstagram, IconWhatsapp } from "./icons";

const NAV = [
	{ label: "A escola", target: "#escola" },
	{ label: "Níveis de ensino", target: "#niveis" },
	{ label: "Estrutura", target: "#estrutura" },
	{ label: "Matrículas", target: "#matriculas" },
	{ label: "Contato", target: "#contato" },
];

export function Header() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
				scrolled ? "bg-paper/90 shadow-lg shadow-ink/5 backdrop-blur-md" : "bg-transparent"
			}`}
		>
			<div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
				<button
					type="button"
					onClick={() => scrollToId("#topo")}
					className="flex items-center gap-3"
					aria-label="Voltar ao topo"
				>
					<img src="/logo.png" alt="Logotipo da Escola Chave do Saber" className="h-12 w-auto" />
					<span className="hidden text-left sm:block">
						<span className="block font-display text-lg font-bold leading-tight text-brand-blue">
							{SCHOOL.name}
						</span>
						<span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-brand-red">
							{SCHOOL.slogan}
						</span>
					</span>
				</button>

				<nav className="hidden items-center gap-6 lg:flex">
					{NAV.map((item) => (
						<button
							key={item.target}
							type="button"
							onClick={() => scrollToId(item.target)}
							className="text-sm font-bold text-ink/60 transition-colors hover:text-brand-blue"
						>
							{item.label}
						</button>
					))}
				</nav>

				<div className="flex items-center gap-1.5">
					<a
						href={SCHOOL.instagramUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="Instagram da escola"
						className="hidden size-9 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-brand-blue-light hover:text-brand-blue sm:flex"
					>
						<IconInstagram className="size-4" />
					</a>
					<a
						href={SCHOOL.facebookUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="Facebook da escola"
						className="hidden size-9 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-brand-blue-light hover:text-brand-blue sm:flex"
					>
						<IconFacebook className="size-4" />
					</a>
					<a
						href={SCHOOL.whatsappUrl}
						target="_blank"
						rel="noreferrer"
						className="ml-1 hidden items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-green/25 transition-transform hover:-translate-y-0.5 md:flex"
					>
						<IconWhatsapp className="size-4" />
						WhatsApp
					</a>
				</div>
			</div>
		</header>
	);
}
