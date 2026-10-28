'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Moon, Search, Sun, X } from "lucide-react";
import { primaryNav, toolsNav, isActivePath } from "../resources/navigation";
import "./site-nav.css";

interface SiteNavProps {
	theme: "light" | "dark";
	onThemeSwitch: () => void;
	onOpenPalette: () => void;
}

export function SiteNav({ theme, onThemeSwitch, onOpenPalette }: SiteNavProps) {
	const pathname = usePathname() ?? "/";
	const [toolsOpen, setToolsOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [chapter, setChapter] = useState<string>("base");
	const [isMac, setIsMac] = useState(true);
	const toolsRef = useRef<HTMLLIElement>(null);
	const toolsActive = toolsNav.some((item) => isActivePath(pathname, item.href));

	useEffect(() => {
		setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
	}, []);

	// The bar takes the ground of the chapter beneath it (transparent over the hero, stone over
	// the paper chapter, coral over the stack), so it never reads as a floating panel
	useEffect(() => {
		const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
		if (!chapters.length) {
			setChapter("base");
			return;
		}
		let io: IntersectionObserver | null = null;
		const observe = () => {
			io?.disconnect();
			const line = 32;
			io = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) setChapter((entry.target as HTMLElement).dataset.chapter ?? "base");
					}
				},
				{ rootMargin: `-${line}px 0px -${Math.max(0, window.innerHeight - line - 1)}px 0px` },
			);
			chapters.forEach((el) => io!.observe(el));
		};
		observe();
		window.addEventListener("resize", observe);
		return () => {
			io?.disconnect();
			window.removeEventListener("resize", observe);
		};
	}, [pathname]);

	// Close menus on navigation
	useEffect(() => {
		setToolsOpen(false);
		setMobileOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!toolsOpen) return;
		const onPointer = (e: PointerEvent) => {
			if (!toolsRef.current?.contains(e.target as Node)) setToolsOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setToolsOpen(false);
		};
		document.addEventListener("pointerdown", onPointer);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("pointerdown", onPointer);
			document.removeEventListener("keydown", onKey);
		};
	}, [toolsOpen]);

	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : "";
		if (!mobileOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setMobileOpen(false);
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [mobileOpen]);

	const ThemeIcon = theme === "dark" ? Sun : Moon;

	return (
		<header className="site-nav-wrap" data-chapter={chapter}>
			<nav className="site-nav" aria-label="Main">
				<Link href="/" className="site-nav__brand" aria-label="Yasasvi Nellore, home">
					Yasasvi Nellore
				</Link>

				<ul className="site-nav__links" role="list" data-signal-mask>
					{primaryNav.filter((item) => item.href !== "/").map((item) => {
						const active = isActivePath(pathname, item.href);
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`site-nav__link${active ? " is-active" : ""}`}
									aria-current={active ? "page" : undefined}
								>
									{item.label}
								</Link>
							</li>
						);
					})}
					<li className="site-nav__tools" ref={toolsRef}>
						<button
							type="button"
							className={`site-nav__link${toolsActive ? " is-active" : ""}`}
							aria-expanded={toolsOpen}
							aria-controls="tools-menu"
							onClick={() => setToolsOpen((open) => !open)}
						>
							Tools
							<ChevronDown size={14} className="site-nav__chevron" aria-hidden="true" />
						</button>
						<div id="tools-menu" className="site-nav__menu ds-glass" data-open={toolsOpen} hidden={!toolsOpen}>
							{toolsNav.map((item) => {
								const active = isActivePath(pathname, item.href);
								return (
									<Link
										key={item.href}
										href={item.href}
										className={`site-nav__menu-item${active ? " is-active" : ""}`}
										aria-current={active ? "page" : undefined}
									>
										<span className="site-nav__menu-label">{item.label}</span>
										<span className="site-nav__menu-desc">{item.description}</span>
									</Link>
								);
							})}
						</div>
					</li>
				</ul>

				<div className="site-nav__actions">
					<button type="button" className="site-nav__search" onClick={onOpenPalette} aria-label="Search pages and actions">
						<Search size={15} aria-hidden="true" />
						<span className="site-nav__search-label">Search</span>
						<span className="site-nav__search-keys" aria-hidden="true">
							<kbd className="ds-kbd">{isMac ? "⌘" : "Ctrl"}</kbd>
							<kbd className="ds-kbd">K</kbd>
						</span>
					</button>
					<button
						type="button"
						className="ds-icon-btn"
						onClick={onThemeSwitch}
						aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
					>
						<ThemeIcon aria-hidden="true" />
					</button>
					<button
						type="button"
						className="site-nav__menu-toggle"
						aria-expanded={mobileOpen}
						aria-controls="mobile-nav"
						onClick={() => setMobileOpen((open) => !open)}
					>
						{mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
						{mobileOpen ? "Close" : "Menu"}
					</button>
				</div>
			</nav>

			<div className="site-nav__sheet-backdrop" data-open={mobileOpen} onClick={() => setMobileOpen(false)} aria-hidden="true" />
			<div id="mobile-nav" className="site-nav__sheet ds-glass" data-open={mobileOpen} hidden={!mobileOpen}>
				<p className="site-nav__sheet-heading">Pages</p>
				{primaryNav.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={`site-nav__sheet-link${isActivePath(pathname, item.href) ? " is-active" : ""}`}
						aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
					>
						{item.label}
					</Link>
				))}
				<p className="site-nav__sheet-heading">Tools</p>
				{toolsNav.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={`site-nav__sheet-link${isActivePath(pathname, item.href) ? " is-active" : ""}`}
						aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
					>
						{item.label}
					</Link>
				))}
			</div>
		</header>
	);
}
