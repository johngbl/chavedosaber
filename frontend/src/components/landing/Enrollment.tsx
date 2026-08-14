import { SCHOOL } from "../../content/school";
import { IconKey, IconWhatsapp } from "./icons";
import { Reveal, SectionTitle } from "./ui";

const STEPS = [
	{
		title: "Chame no WhatsApp",
		desc: "Fale com a secretaria e confirme os dados da criança.",
		tone: "bg-brand-green shadow-brand-green/30",
	},
	{
		title: "Receba seu link pessoal",
		desc: "A secretaria gera um link único e seguro de matrícula para a sua família.",
		tone: "bg-brand-orange shadow-brand-orange/30",
	},
	{
		title: "Preencha a ficha online",
		desc: "Em poucos minutos, do celular ou do computador. Sem fila, sem papel.",
		tone: "bg-brand-blue shadow-brand-blue/30",
	},
];

export function Enrollment() {
	return (
		<section id="matriculas" className="scroll-mt-24 py-24 md:py-28">
			<div className="mx-auto grid max-w-6xl items-center gap-16 px-4 lg:grid-cols-[0.9fr_1.1fr]">
				<div>
					<SectionTitle
						eyebrow="Matrículas abertas"
						title="Sua vaga em três passos simples"
						sub="Para proteger os dados das famílias e evitar spam, a ficha de matrícula online é aberta apenas por link pessoal emitido pela secretaria."
					/>
					<Reveal delay={0.15}>
						<a
							href={SCHOOL.whatsappUrl}
							target="_blank"
							rel="noreferrer"
							className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-brand-green px-7 py-4 font-bold text-white shadow-xl shadow-brand-green/30 transition-all hover:-translate-y-1"
						>
							<IconWhatsapp className="size-5" />
							Começar pelo WhatsApp
						</a>
						<p className="mt-5 flex items-center gap-2 text-sm font-semibold text-ink/50">
							<IconKey className="size-4 text-brand-yellow" />
							O link é só seu e vale por 30 dias.
						</p>
					</Reveal>
				</div>

				<div className="relative">
					<div
						aria-hidden="true"
						className="absolute bottom-10 left-7 top-10 border-l-2 border-dashed border-ink/10"
					/>
					<div className="space-y-6">
						{STEPS.map((step, index) => (
							<Reveal key={step.title} delay={0.12 * index}>
								<div className="flex items-start gap-5 rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
									<span
										className={`relative z-10 flex size-14 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-bold text-white shadow-lg ${step.tone}`}
									>
										{index + 1}
									</span>
									<div>
										<h3 className="font-display text-xl font-bold text-ink">{step.title}</h3>
										<p className="mt-1 leading-relaxed text-ink/65">{step.desc}</p>
									</div>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
