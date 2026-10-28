'use client'
import { Flex } from "@/once-ui/components"
import { SiteNav } from "./components/SiteNav"
import { CommandPalette } from "./components/CommandPalette"
import Footer from "./components/footer"
import { Instrument_Sans, Bricolage_Grotesque, Source_Code_Pro } from "next/font/google";
import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";
import "./design-system.css";
import classNames from 'classnames';
import { useCallback, useEffect, useState } from "react";
import AIChatbot from "./components/AIChatbot";
import { Analytics } from '@vercel/analytics/react';

// Once UI reads --font-primary for body text and --font-secondary for headings
const primary = Instrument_Sans({
	variable: '--font-primary',
	subsets: ['latin'],
	display: 'swap'
});

const secondary = Bricolage_Grotesque({
	variable: '--font-secondary',
	subsets: ['latin'],
	display: 'swap'
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
				secondary.variable,
				code.variable,
				'root')}
			justifyContent="center"
			// The inline script below may set data-theme before hydration
			suppressHydrationWarning>
			<body className="ds-body" style={{ display: 'flex', flexDirection: 'column' }}>
				{/* Apply the saved theme before first paint so light-mode visitors don't see a dark flash */}
				<script
					dangerouslySetInnerHTML={{
						__html: "try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}",
					}}
				/>
				<a href="#main-content" className="ds-skip-link">Skip to content</a>
				<SiteNav theme={theme} onThemeSwitch={onThemeSwitch} onOpenPalette={() => setPaletteOpen(true)} />
				<div id="main-content" className="ds-main" tabIndex={-1}>
					{children}
				</div>
				<Footer />
				<CommandPalette open={paletteOpen} onClose={closePalette} theme={theme} onThemeSwitch={onThemeSwitch} />
				<AIChatbot theme={theme} />
				<Analytics />
			</body>
		</Flex>
	)
}
