import type { ComponentType } from "react";
import { IconAccess, IconBook, IconSnow, IconUmbrella, IconUsers, IconWifi } from "./icons";
import { Reveal, SectionTitle } from "./ui";

const ITEMS: {
	icon: ComponentType<{ className?: string }>;
	title: string;
	desc: string;
}[] = [
	{
		icon: IconUmbrella,
		title: "Pátio coberto",
		desc: "Recreio e atividades ao ar livre protegidos do sol e da chuva.",
	},
	{
		icon: IconBook,
		title: "Biblioteca",
		desc: "Acervo para criar o hábito da leitura desde os primeiros anos.",
	},
	{
		icon: IconSnow,
		title: "Salas climatizadas",
		desc: "As 9 salas de aula com clima agradável o ano inteiro.",
	},
	{
		icon: IconWifi,
		title: "Internet banda larga",
		desc: "Tecnologia a serviço do aprendizado, conectada ao mundo.",
	},
	{
		icon: IconAccess,
		title: "Acessibilidade completa",
		desc: "Rampas, corrimãos e sinal tátil em toda a escola.",
	},
	{
		icon: IconUsers,
		title: "Equipe dedicada",
		desc: "9 educadores para acompanhar 127 alunos de perto.",
	},
];

export function Structure() {
	return (
		<section id="estrutura" className="scroll-mt-24 bg-white py-24 md:py-28">
			<div className="mx-auto max-w-6xl px-4">
				<SectionTitle
					eyebrow="Estrutura"
					title="Conforto e acessibilidade de verdade"
					sub="Pátio coberto, biblioteca e salas climatizadas: tudo pensado para acolher cada criança com segurança."
				/>
				<div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{ITEMS.map((item, index) => {
						const Icon = item.icon;
						return (
							<Reveal key={item.title} delay={0.08 * index}>
								<div className="flex h-full items-start gap-4 rounded-2xl border border-ink/5 bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-md">
									<span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-green-light text-brand-green">
										<Icon className="size-5" />
									</span>
									<div>
										<h3 className="font-display text-lg font-bold text-ink">{item.title}</h3>
										<p className="mt-1 text-sm leading-relaxed text-ink/60">{item.desc}</p>
									</div>
								</div>
							</Reveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}
