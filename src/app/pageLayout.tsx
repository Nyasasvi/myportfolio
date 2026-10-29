'use client'
// Straight from its file: the components barrel would also pull in the icon set and react-icons
import { Flex } from "@/once-ui/components/Flex"
import { SiteNav } from "./components/SiteNav"
import { CommandPalette } from "./components/CommandPalette"
import Footer from "./components/footer"
import { Epilogue, Source_Code_Pro } from "next/font/google";
import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";
import "./design-system.css";
import classNames from 'classnames';
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AIChatbot from "./components/AIChatbot";
import { Analytics } from '@vercel/analytics/react';

// One family: Epilogue is variable, so 400 for text and 900 for the monument come from one file.
// Once UI reads --font-primary for body text and --font-secondary for headings; both point here.
const primary = Epilogue({
	variable: '--font-primary',
	subsets: ['latin'],
	display: 'swap',
});

const code = Source_Code_Pro({
	variable: '--font-code',
	subsets: ['latin'],
	display: 'swap',
});

type Theme = 'light' | 'dark';

export default function PageLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [theme, setTheme] = useState<Theme>('dark');
	const [paletteOpen, setPaletteOpen] = useState(false);

	useEffect(() => {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme === 'light' || storedTheme === 'dark') setTheme(storedTheme);
	}, []);

	const onThemeSwitch = useCallback(() => {
		setTheme((current) => {
			const next = current === 'dark' ? 'light' : 'dark';
			localStorage.setItem('theme', next);
			return next;
		});
	}, []);

	const closePalette = useCallback(() => setPaletteOpen(false), []);
	const pathname = usePathname();

	// Reveal each [data-reveal] once as it enters (taste-skill motion.md). Hidden states only exist
	// under html.js and prefers-reduced-motion: no-preference, and a timer shows anything missed.
	useEffect(() => {
		let io: IntersectionObserver | null = null;
		let safety = 0;
		// One frame later, so a page that arrived by client navigation is in the DOM
		const frame = requestAnimationFrame(() => {
			// The first screen (data-reveal="now") animates with the first paint and needs no observer
			const targets = Array.from(document.querySelectorAll<HTMLElement>('#main-content [data-reveal]:not(.is-in):not([data-reveal="now"])'));
			if (!targets.length) return;
			if (!('IntersectionObserver' in window)) {
				targets.forEach((el) => el.classList.add('is-in'));
				return;
			}
			io = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (!entry.isIntersecting) continue;
						entry.target.classList.add('is-in');
						io?.unobserve(entry.target);
					}
				},
				{ rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
			);
			targets.forEach((el) => io!.observe(el));
			safety = window.setTimeout(() => {
				targets.forEach((el) => {
					const r = el.getBoundingClientRect();
					if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
				});
			}, 2500);
		});
		return () => {
			cancelAnimationFrame(frame);
			io?.disconnect();
			window.clearTimeout(safety);
		};
	}, [pathname]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setPaletteOpen((open) => !open);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	return (
		<Flex
			as="html" lang="en"
			fillHeight background="page"
			data-theme={theme}
			data-brand="green"
			data-accent="aqua"
			data-neutral="gray"
			data-border="rounded"
			data-solid="color"
			data-solid-style="flat"
			data-surface="filled"
			data-transition="all"
			className={classNames(
				primary.variable,
				code.variable,
				'root')}
			justifyContent="center"
			// The inline script below may set data-theme before hydration
			suppressHydrationWarning>
			<body className="ds-body" style={{ display: 'flex', flexDirection: 'column' }}>
				{/* Apply the saved theme before first paint so light-mode visitors don't see a dark flash */}
				<script
					dangerouslySetInnerHTML={{
						// The js class gates reveal states, so content stays visible when scripts don't run
						__html: "document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}",
					}}
				/>
				<a href="#main-content" className="ds-skip-link">Skip to content</a>
				<div className="ds-page">
					<SiteNav theme={theme} onThemeSwitch={onThemeSwitch} onOpenPalette={() => setPaletteOpen(true)} />
					<div id="main-content" className="ds-main" tabIndex={-1}>
						{children}
					</div>
				</div>
				<Footer />
				<CommandPalette open={paletteOpen} onClose={closePalette} theme={theme} onThemeSwitch={onThemeSwitch} />
				<AIChatbot theme={theme} />
				<Analytics />
			</body>
		</Flex>
	)
}
