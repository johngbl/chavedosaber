import { SCHOOL } from "../../content/school";
import { CountUp, Reveal, SectionTitle } from "./ui";

export function About() {
	return (
		<section id="escola" className="scroll-mt-24 bg-white py-24 md:py-28">
			<div className="mx-auto grid max-w-6xl items-center gap-16 px-4 lg:grid-cols-2">
				<Reveal className="relative">
					<div aria-hidden="true" className="absolute -left-6 -top-6 size-24 rounded-full bg-brand-yellow/30" />
					<img
						src="/images/escola-closeup.webp"
						alt="Vista da rua em frente à Escola Chave do Saber"
						className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-xl shadow-ink/10"
					/>
					<div className="absolute -bottom-7 left-8 rounded-2xl bg-brand-blue px-6 py-4 shadow-xl shadow-brand-blue/30">
						<p className="font-display text-lg font-bold text-white">Centro de Milagres/BA</p>
						<p className="text-xs font-semibold text-white/70">pertinho da sua família</p>
					</div>
				</Reveal>

				<div>
					<SectionTitle
						eyebrow="A escola"
						title="Um espaço pensado para aprender feliz"
						sub="A Escola Chave do Saber oferece um ambiente preparado para o desenvolvimento integral dos alunos: pátio coberto, biblioteca, salas climatizadas e internet banda larga — tudo no centro de Milagres."
					/>
					<Reveal delay={0.15}>
						<p className="mt-5 leading-relaxed text-ink/65">
							Nossa proposta une acolhimento e infraestrutura moderna para formar cidadãos
							críticos, preparados para os desafios do futuro — do primeiro dia de aula ao
							último ano do Fundamental.
						</p>
					</Reveal>
					<div className="mt-10 grid grid-cols-2 gap-4">
						{SCHOOL.stats.map((stat, index) => (
							<Reveal key={stat.label} delay={0.1 * index}>
								<div className="rounded-2xl border border-ink/5 bg-paper p-5">
									<p className="font-display text-4xl font-bold text-brand-blue">
										<CountUp to={stat.value} />
									</p>
									<p className="mt-1 text-sm font-semibold text-ink/55">{stat.label}</p>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
