import type { ComponentType } from "react";
import { IconBook, IconHeart, IconShapes } from "./icons";
import { Reveal, SectionTitle } from "./ui";

type Tone = "orange" | "green" | "blue";

const TONES: Record<Tone, { card: string; icon: string }> = {
	orange: { card: "border-brand-orange/20 bg-brand-orange-light", icon: "bg-brand-orange text-white" },
	green: { card: "border-brand-green/20 bg-brand-green-light", icon: "bg-brand-green text-white" },
	blue: { card: "border-brand-blue/20 bg-brand-blue-light", icon: "bg-brand-blue text-white" },
};

const LEVELS: {
	icon: ComponentType<{ className?: string }>;
	title: string;
	desc: string;
	tone: Tone;
	span?: boolean;
}[] = [
	{
		icon: IconShapes,
		title: "Educação Infantil",
		desc: "Os primeiros passos com afeto: linguagem, movimento e descoberta em um ambiente seguro, colorido e estimulante.",
		tone: "orange",
		span: true,
	},
	{
		icon: IconBook,
		title: "Ensino Fundamental",
		desc: "Leitura, raciocínio e autonomia com acompanhamento próximo de cada estudante.",
		tone: "green",
	},
	{
		icon: IconHeart,
		title: "Educação Especial",
		desc: "Suporte dedicado para que cada criança avance no seu ritmo, com dignidade e carinho.",
		tone: "blue",
	},
];

export function Levels() {
	return (
		<section id="niveis" className="relative scroll-mt-24 overflow-hidden py-24 md:py-28">
			<div aria-hidden="true" className="absolute -right-40 top-10 -z-10 size-96 rounded-full bg-brand-blue/5 blur-3xl" />
			<div className="mx-auto max-w-6xl px-4">
				<SectionTitle
					center
					eyebrow="Níveis de ensino"
					title="Do primeiro passo ao futuro"
					sub="Acompanhamos cada criança em todas as fases, com turmas acolhedoras e ensino próximo."
				/>
				<div className="mt-14 grid gap-6 lg:grid-cols-2">
					{LEVELS.map((level, index) => {
						const tone = TONES[level.tone];
						const Icon = level.icon;
						return (
							<Reveal
								key={level.title}
								delay={0.12 * index}
								className={level.span ? "lg:col-span-2" : ""}
							>
								<div
									className={`flex h-full flex-col gap-4 rounded-[1.75rem] border p-8 transition-transform duration-300 hover:-translate-y-1.5 ${tone.card}`}
								>
									<span className={`flex size-12 items-center justify-center rounded-2xl shadow-md ${tone.icon}`}>
										<Icon className="size-6" />
									</span>
									<h3 className="font-display text-2xl font-bold text-ink">{level.title}</h3>
									<p className="leading-relaxed text-ink/65">{level.desc}</p>
								</div>
							</Reveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}
