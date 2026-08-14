import Lenis from "lenis";

let lenis: Lenis | null = null;

export function initLenis() {
	if (lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		return;
	}
	lenis = new Lenis({ duration: 1.1, smoothWheel: true });
	const raf = (time: number) => {
		lenis?.raf(time);
		requestAnimationFrame(raf);
	};
	requestAnimationFrame(raf);
}

export function destroyLenis() {
	lenis?.destroy();
	lenis = null;
}

export function scrollToId(selector: string) {
	const target = document.querySelector(selector);
	if (!target) return;
	if (lenis) {
		lenis.scrollTo(target as HTMLElement, { offset: -88 });
	} else {
		target.scrollIntoView({ behavior: "smooth" });
	}
}
