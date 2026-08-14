import { Link } from "react-router-dom";
import { SCHOOL } from "../../content/school";
import { IconFacebook, IconInstagram, IconKey, IconMail, IconMapPin, IconPhone } from "./icons";

export function Footer() {
	return (
		<footer id="contato" className="relative scroll-mt-24 overflow-hidden bg-brand-blue-dark pb-8 pt-16 text-white">
			<IconKey
				className="pointer-events-none absolute -right-16 -top-10 size-72 rotate-12 text-white/5"
		/>
			<div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-[1.2fr_1fr_1fr]">
				<div>
					<div className="inline-flex rounded-2xl bg-white p-2.5 shadow-lg">
						<img src="/logo.png" alt="Logotipo da Escola Chave do Saber" className="h-14 w-auto" />
					</div>
					<p className="mt-4 font-display text-xl font-bold">{SCHOOL.name}</p>
					<p className="mt-1 text-sm font-semibold text-white/60">{SCHOOL.slogan}</p>
					<div className="mt-5 flex gap-2">
						<a
							href={SCHOOL.instagramUrl}
							target="_blank"
							rel="noreferrer"
							aria-label="Instagram da escola"
							className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/25"
						>
							<IconInstagram className="size-4" />
						</a>
						<a
							href={SCHOOL.facebookUrl}
							target="_blank"
							rel="noreferrer"
							aria-label="Facebook da escola"
							className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/25"
						>
							<IconFacebook className="size-4" />
						</a>
					</div>
				</div>

				<div>
					<h3 className="font-display text-lg font-bold text-brand-yellow">Contato</h3>
					<ul className="mt-5 space-y-4 text-sm leading-relaxed text-white/75">
						<li className="flex items-start gap-3">
							<IconMapPin className="mt-0.5 size-4 shrink-0 text-brand-yellow" />
							<span>
								{SCHOOL.address}
								<br />
								{SCHOOL.cityLine}
							</span>
						</li>
						<li>
							<a
								href={SCHOOL.whatsappUrl}
								target="_blank"
								rel="noreferrer"
								className="flex items-center gap-3 transition-colors hover:text-white"
							>
								<IconPhone className="size-4 shrink-0 text-brand-yellow" />
								{SCHOOL.phoneDisplay}
							</a>
						</li>
						<li>
							<a
								href={`mailto:${SCHOOL.email}`}
								className="flex items-center gap-3 break-all transition-colors hover:text-white"
							>
								<IconMail className="size-4 shrink-0 text-brand-yellow" />
								{SCHOOL.email}
							</a>
						</li>
					</ul>
				</div>

				<div>
					<h3 className="font-display text-lg font-bold text-brand-yellow">Informações</h3>
					<ul className="mt-5 space-y-2.5 text-sm text-white/75">
						<li>Código INEP {SCHOOL.inep}</li>
						<li>Escola da rede privada</li>
						<li>Acessibilidade completa</li>
						<li>Matrícula por link pessoal da secretaria</li>
					</ul>
					<Link
						to="/login"
						className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-white/50 hover:text-white"
					>
						Acesso da secretaria
					</Link>
				</div>
			</div>

			<div className="mx-auto mt-14 flex max-w-6xl flex-col gap-2 border-t border-white/10 px-4 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
				<p>© 2026 {SCHOOL.name} — Milagres/BA</p>
				<p>{SCHOOL.slogan}</p>
			</div>
		</footer>
	);
}
