'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
	const toggleRef = useRef<HTMLButtonElement>(null);
	const sheetRef = useRef<HTMLDivElement>(null);

	const closeMenu = useCallback((returnFocus: boolean) => {
		setMobileOpen(false);
		if (returnFocus) requestAnimationFrame(() => toggleRef.current?.focus());
	}, []);

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

	// While the menu is open: the page underneath doesn't scroll, focus moves to the first page link
	// and Tab cycles between the toggle and the links; Escape closes and hands focus back to the toggle.
	// Widening past the phone layout closes it, so the page is never left locked.
	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : "";
		if (!mobileOpen) return;
		const sheet = sheetRef.current;
		sheet?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				closeMenu(true);
				return;
			}
			if (e.key !== "Tab" || !sheet) return;
			const stops = [toggleRef.current, ...Array.from(sheet.querySelectorAll<HTMLElement>("a[href]"))].filter(Boolean) as HTMLElement[];
			const at = stops.indexOf(document.activeElement as HTMLElement);
			const next = at === -1 ? 0 : e.shiftKey ? (at - 1 + stops.length) % stops.length : (at + 1) % stops.length;
			e.preventDefault();
			stops[next].focus();
		};
		const wide = window.matchMedia("(min-width: 861px)");
		const onWide = () => wide.matches && closeMenu(false);
		document.addEventListener("keydown", onKey);
		wide.addEventListener("change", onWide);
		return () => {
			document.removeEventListener("keydown", onKey);
			wide.removeEventListener("change", onWide);
		};
	}, [mobileOpen, closeMenu]);

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
						ref={toggleRef}
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

			<div className="site-nav__sheet-backdrop" data-open={mobileOpen} onClick={() => closeMenu(true)} aria-hidden="true" />
			<div id="mobile-nav" ref={sheetRef} className="site-nav__sheet ds-glass" data-open={mobileOpen} hidden={!mobileOpen}>
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
