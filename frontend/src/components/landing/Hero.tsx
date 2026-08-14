import { motion, useScroll, useTransform } from "framer-motion";
import { SCHOOL } from "../../content/school";
import { scrollToId } from "../../lib/smoothScroll";
import { IconArrowDown, IconBook, IconCheck, IconKey, IconSnow, IconUsers, IconWhatsapp } from "./icons";

const TRUST = ["INEP 29469694", "Rede privada", "Acessibilidade completa"];

export function Hero() {
	const { scrollY } = useScroll();
	const y = useTransform(scrollY, [0, 700], [0, 70]);
	const ySlow = useTransform(scrollY, [0, 700], [0, 28]);

	return (
		<section id="topo" className="relative overflow-hidden pb-28 pt-32 md:pt-40">
			<div aria-hidden="true" className="absolute inset-0 -z-10">
				<div className="absolute -right-32 -top-32 size-[28rem] rounded-full bg-brand-orange/10 blur-3xl" />
				<div className="absolute -left-40 top-40 size-[26rem] rounded-full bg-brand-green/10 blur-3xl" />
				<div className="absolute bottom-0 right-1/3 size-72 rounded-full bg-brand-yellow/15 blur-3xl" />
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: "radial-gradient(rgba(62,71,151,0.07) 1px, transparent 1px)",
						backgroundSize: "26px 26px",
					}}
				/>
			</div>

			<div className="mx-auto grid max-w-6xl items-center gap-16 px-4 lg:grid-cols-[1.05fr_0.95fr]">
				<div>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="inline-flex items-center gap-2 rounded-full border border-brand-blue/10 bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-blue shadow-sm"
					>
						<IconKey className="size-4 text-brand-yellow" />
						{SCHOOL.slogan}
					</motion.p>

					<motion.h1
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, delay: 0.1 }}
						className="mt-6 font-display text-5xl font-bold leading-[1.05] text-ink md:text-6xl"
					>
						A{" "}
						<span className="relative inline-block text-brand-blue">
							chave
							<svg
								aria-hidden="true"
								className="absolute -bottom-2 left-0 w-full"
								viewBox="0 0 100 10"
								preserveAspectRatio="none"
							>
								<path
									d="M3 8c30-5 64-5 94-2"
									fill="none"
									stroke="var(--color-brand-yellow)"
									strokeWidth="5"
									strokeLinecap="round"
								/>
							</svg>
						</span>{" "}
						para o futuro do seu filho começa aqui.
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, delay: 0.2 }}
						className="mt-6 max-w-xl text-lg leading-relaxed text-ink/65"
					>
						Escola particular no coração de {SCHOOL.city}, com Educação Infantil, Ensino
						Fundamental e educação especial — em um espaço acolhedor, climatizado e
						acessível para cada criança.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, delay: 0.3 }}
						className="mt-9 flex flex-wrap items-center gap-4"
					>
						<a
							href={SCHOOL.whatsappUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2.5 rounded-full bg-brand-green px-7 py-4 font-bold text-white shadow-xl shadow-brand-green/30 transition-all hover:-translate-y-1"
						>
							<IconWhatsapp className="size-5" />
							Fale com a secretaria
						</a>
						<button
							type="button"
							onClick={() => scrollToId("#matriculas")}
							className="inline-flex items-center gap-2.5 rounded-full border-2 border-brand-blue/15 bg-white px-7 py-4 font-bold text-brand-blue transition-colors hover:border-brand-blue/40"
						>
							Como funciona a matrícula
							<IconArrowDown className="size-4" />
						</button>
					</motion.div>

					<motion.ul
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.45 }}
						className="mt-10 flex flex-wrap gap-x-6 gap-y-2"
					>
						{TRUST.map((item) => (
							<li key={item} className="inline-flex items-center gap-2 text-sm font-bold text-ink/50">
								<IconCheck className="size-4 text-brand-green" />
								{item}
							</li>
						))}
					</motion.ul>
				</div>

				<motion.div
					style={{ y }}
					initial={{ opacity: 0, scale: 0.96 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.9, delay: 0.2 }}
					className="relative"
				>
					<div
						aria-hidden="true"
						className="absolute -inset-5 -rotate-2 rounded-[2.5rem] bg-gradient-to-tr from-brand-orange/25 via-brand-yellow/25 to-brand-green/25"
					/>
					<motion.div
						style={{ y: ySlow }}
						className="relative rotate-1 rounded-[2rem] bg-white p-3 shadow-2xl shadow-brand-blue/15"
					>
						<img
							src="/images/escola-wide.webp"
							alt="Fachada ilustrada da Escola Chave do Saber"
							className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
						/>
					</motion.div>

					<div className="absolute -left-8 top-10 animate-float rounded-2xl bg-white px-4 py-3 shadow-xl shadow-ink/10">
						<p className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
							<span className="flex size-8 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
								<IconUsers className="size-4" />
							</span>
							127 alunos
						</p>
					</div>
					<div className="absolute -right-4 bottom-16 animate-float-slow rounded-2xl bg-white px-4 py-3 shadow-xl shadow-ink/10">
						<p className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
							<span className="flex size-8 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
								<IconSnow className="size-4" />
							</span>
							9 salas climatizadas
						</p>
					</div>
					<div
						className="absolute -bottom-6 left-10 animate-float rounded-2xl bg-white px-4 py-3 shadow-xl shadow-ink/10"
						style={{ animationDelay: "1.2s" }}
					>
						<p className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
							<span className="flex size-8 items-center justify-center rounded-full bg-brand-orange-light text-brand-orange">
								<IconBook className="size-4" />
							</span>
							Biblioteca própria
						</p>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
