'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { primaryNav, isActivePath } from "../resources/navigation";
import "./site-nav.css";

interface SiteNavProps {
	theme: "light" | "dark";
	onThemeSwitch: () => void;
	onOpenPalette: () => void;
}

export function SiteNav({ theme, onThemeSwitch, onOpenPalette }: SiteNavProps) {
	const pathname = usePathname() ?? "/";
	const [mobileOpen, setMobileOpen] = useState(false);
	const [chapter, setChapter] = useState<string>("base");
	const [isMac, setIsMac] = useState(true);

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

	// Close the mobile menu on navigation
	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

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
			</div>
		</header>
	);
}
