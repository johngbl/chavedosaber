import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { IconKey } from "./icons";

export function Reveal({
	children,
	delay = 0,
	className,
}: {
	children: ReactNode;
	delay?: number;
	className?: string;
}) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: 28 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-80px" }}
			transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
		>
			{children}
		</motion.div>
	);
}

export function SectionTitle({
	eyebrow,
	title,
	sub,
	center = false,
}: {
	eyebrow: string;
	title: string;
	sub?: string;
	center?: boolean;
}) {
	return (
		<Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
			<p
				className={`inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.24em] text-brand-red ${
					center ? "justify-center" : ""
				}`}
			>
				<IconKey className="size-4 text-brand-yellow" />
				{eyebrow}
			</p>
			<h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">{title}</h2>
			{sub ? <p className="mt-4 text-lg leading-relaxed text-ink/65">{sub}</p> : null}
		</Reveal>
	);
}

export function CountUp({ to }: { to: number }) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: "-40px" });

	useEffect(() => {
		if (!inView) return;
		const controls = animate(0, to, {
			duration: 1.4,
			ease: "easeOut",
			onUpdate: (latest) => {
				if (ref.current) {
					ref.current.textContent = String(Math.round(latest));
				}
			},
		});
		return () => controls.stop();
	}, [inView, to]);

	return <span ref={ref}>0</span>;
}
