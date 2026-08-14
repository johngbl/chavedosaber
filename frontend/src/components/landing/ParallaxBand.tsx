import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SCHOOL } from "../../content/school";

export function ParallaxBand() {
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
	const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

	return (
		<section ref={ref} className="relative flex h-[26rem] items-center justify-center overflow-hidden md:h-[30rem]">
			<motion.img
				src="/images/escola-wide.webp"
				alt=""
				aria-hidden="true"
				style={{ y }}
				className="absolute left-0 top-[-15%] h-[130%] w-full object-cover"
			/>
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-gradient-to-r from-brand-blue-dark/85 via-brand-blue/75 to-brand-blue-dark/85"
			/>
			<div className="relative px-4 text-center">
				<p className="font-display text-xs font-bold uppercase tracking-[0.35em] text-brand-yellow md:text-sm">
					{SCHOOL.slogan}
				</p>
				<h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-bold text-white md:text-5xl">
					Uma escola da comunidade, feita com carinho para cada criança.
				</h2>
			</div>
		</section>
	);
}
