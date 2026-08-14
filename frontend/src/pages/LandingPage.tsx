import { MotionConfig } from "framer-motion";
import { useEffect } from "react";
import { About } from "../components/landing/About";
import { Enrollment } from "../components/landing/Enrollment";
import { Footer } from "../components/landing/Footer";
import { Header } from "../components/landing/Header";
import { Hero } from "../components/landing/Hero";
import { Levels } from "../components/landing/Levels";
import { ParallaxBand } from "../components/landing/ParallaxBand";
import { Ribbon } from "../components/landing/Ribbon";
import { Structure } from "../components/landing/Structure";
import { destroyLenis, initLenis } from "../lib/smoothScroll";

export function LandingPage() {
	useEffect(() => {
		initLenis();
		return destroyLenis;
	}, []);

	return (
		<MotionConfig reducedMotion="user">
			<div className="overflow-x-clip bg-paper font-sans text-ink antialiased">
				<Header />
				<main>
					<Hero />
					<Ribbon />
					<About />
					<Levels />
					<Structure />
					<ParallaxBand />
					<Enrollment />
				</main>
				<Footer />
			</div>
		</MotionConfig>
	);
}
