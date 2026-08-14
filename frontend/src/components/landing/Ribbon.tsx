import { SCHOOL } from "../../content/school";
import { IconSparkle } from "./icons";

const ITEMS = [
	SCHOOL.slogan,
	"Educação Infantil",
	"Ensino Fundamental",
	"Educação Especial",
	"Salas climatizadas",
	"Biblioteca própria",
	"Milagres – BA",
];

function RibbonRow({ hidden = false }: { hidden?: boolean }) {
	return (
		<div aria-hidden={hidden} className="flex w-max items-center">
			{ITEMS.map((item) => (
				<span
					key={item}
					className="mx-6 flex items-center gap-6 font-display text-sm font-bold uppercase tracking-[0.22em] text-white"
				>
					<IconSparkle className="size-3.5 text-brand-yellow" />
					{item}
				</span>
			))}
		</div>
	);
}

export function Ribbon() {
	return (
		<div className="relative z-10 -mx-2 -my-6 -rotate-1 overflow-hidden bg-brand-red py-4 shadow-xl shadow-brand-red/25">
			<div className="flex w-max animate-marquee">
				<RibbonRow />
				<RibbonRow hidden />
			</div>
		</div>
	);
}
