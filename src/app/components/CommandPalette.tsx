'use client'

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Copy, CornerDownLeft, FileText, Github, Linkedin, Mail, Moon, Search, Sun } from "lucide-react";
import { primaryNav, toolsNav, contactLinks } from "../resources/navigation";
import "./command-palette.css";

type Command = {
	id: string;
	label: string;
	hint: string;
	group: "Pages" | "Tools" | "Actions";
	keywords: string;
	icon?: React.ReactNode;
	run: () => void;
};

interface CommandPaletteProps {
	open: boolean;
	onClose: () => void;
	theme: "light" | "dark";
	onThemeSwitch: () => void;
}

export function CommandPalette({ open, onClose, theme, onThemeSwitch }: CommandPaletteProps) {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const [toast, setToast] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const returnFocusRef = useRef<HTMLElement | null>(null);

	const commands = useMemo<Command[]>(() => {
		const go = (href: string) => () => {
			router.push(href);
			onClose();
		};
		const external = (href: string) => () => {
			window.open(href, "_blank", "noopener,noreferrer");
			onClose();
		};
		return [
			...primaryNav.map((item) => ({
				id: item.href,
				label: item.label,
				hint: item.description,
				group: "Pages" as const,
				keywords: [item.label, item.description, ...(item.keywords ?? [])].join(" ").toLowerCase(),
				run: go(item.href),
			})),
			...toolsNav.map((item) => ({
				id: item.href,
				label: item.label,
				hint: item.description,
				group: "Tools" as const,
				keywords: [item.label, item.description, ...(item.keywords ?? [])].join(" ").toLowerCase(),
				run: go(item.href),
			})),
			{
				id: "resume",
				label: "Open resume",
				hint: "PDF, opens in a new tab",
				group: "Actions",
				keywords: "resume cv pdf download",
				icon: <FileText aria-hidden="true" />,
				run: external(contactLinks.resume),
			},
			{
				id: "copy-email",
				label: "Copy email address",
				hint: contactLinks.email,
				group: "Actions",
				keywords: "copy email mail contact",
				icon: <Copy aria-hidden="true" />,
				run: () => {
					navigator.clipboard?.writeText(contactLinks.email).then(
						() => setToast("Email address copied"),
						() => setToast("Couldn't copy. The address is " + contactLinks.email),
					);
				},
			},
			{
				id: "email",
				label: "Write an email",
				hint: "Opens your mail app",
				group: "Actions",
				keywords: "email mail contact hire",
				icon: <Mail aria-hidden="true" />,
				run: () => {
					window.location.href = `mailto:${contactLinks.email}`;
					onClose();
				},
			},
			{
				id: "github",
				label: "GitHub",
				hint: "github.com/Nyasasvi",
				group: "Actions",
				keywords: "github code repositories",
				icon: <Github aria-hidden="true" />,
				run: external(contactLinks.github),
			},
			{
				id: "linkedin",
				label: "LinkedIn",
				hint: "linkedin.com/in/yasasvi-nellore",
				group: "Actions",
				keywords: "linkedin profile connect",
				icon: <Linkedin aria-hidden="true" />,
				run: external(contactLinks.linkedin),
			},
			{
				id: "theme",
				label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
				hint: "Appearance",
				group: "Actions",
				keywords: "theme dark light mode appearance",
				icon: theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />,
				run: () => {
					onThemeSwitch();
					onClose();
				},
			},
		];
	}, [router, onClose, onThemeSwitch, theme]);

	const results = useMemo(() => {
		const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
		if (!terms.length) return commands;
		return commands.filter((cmd) => terms.every((term) => cmd.keywords.includes(term)));
	}, [commands, query]);

	useEffect(() => {
		if (open) {
			returnFocusRef.current = document.activeElement as HTMLElement;
			setQuery("");
			setActiveIndex(0);
			setToast(null);
			requestAnimationFrame(() => inputRef.current?.focus());
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
			returnFocusRef.current?.focus?.();
		}
	}, [open]);

	useEffect(() => setActiveIndex(0), [query]);

	useEffect(() => {
		listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
	}, [activeIndex]);

	if (!open) return null;

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			results[activeIndex]?.run();
		} else if (e.key === "Escape") {
			e.preventDefault();
			onClose();
		} else if (e.key === "Tab") {
			// The input is the only focusable element; keep focus inside the dialog
			e.preventDefault();
		}
	};

	const groups = (["Pages", "Tools", "Actions"] as const)
		.map((group) => ({ group, items: results.filter((r) => r.group === group) }))
		.filter((g) => g.items.length);

	return (
		<div className="cmdk-root" onKeyDown={onKeyDown}>
			<div className="cmdk-backdrop" onClick={onClose} aria-hidden="true" />
			<div className="cmdk ds-glass" role="dialog" aria-modal="true" aria-label="Search pages and actions">
				<div className="cmdk__input-row">
					<Search size={18} aria-hidden="true" />
					<input
						ref={inputRef}
						className="cmdk__input"
						placeholder="Search pages and actions"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						role="combobox"
						aria-expanded="true"
						aria-controls="cmdk-list"
						aria-activedescendant={results[activeIndex] ? `cmdk-${results[activeIndex].id}` : undefined}
						aria-autocomplete="list"
						autoComplete="off"
						spellCheck={false}
					/>
					<kbd className="ds-kbd">Esc</kbd>
				</div>

				<ul ref={listRef} id="cmdk-list" className="cmdk__list" role="listbox" aria-label="Results">
					{groups.map(({ group, items }) => (
						<li key={group} role="presentation">
							<p className="cmdk__group" aria-hidden="true">{group}</p>
							<ul role="group" aria-label={group} className="cmdk__group-list">
								{items.map((cmd) => {
									const index = results.indexOf(cmd);
									const selected = index === activeIndex;
									return (
										<li
											key={cmd.id}
											id={`cmdk-${cmd.id}`}
											role="option"
											aria-selected={selected}
											data-index={index}
											className="cmdk__item"
											onMouseMove={() => setActiveIndex(index)}
											onClick={() => cmd.run()}
										>
											<span className="cmdk__icon">{cmd.icon ?? <ArrowUpRight aria-hidden="true" />}</span>
											<span className="cmdk__label">{cmd.label}</span>
											<span className="cmdk__hint">{cmd.hint}</span>
											{selected && <CornerDownLeft className="cmdk__enter" aria-hidden="true" />}
										</li>
									);
								})}
							</ul>
						</li>
					))}
				</ul>

				{!results.length && (
					<div className="cmdk__empty">
						<p>No pages or actions match “{query}”.</p>
						<p className="ds-meta">Try “projects”, “resume” or “email”.</p>
					</div>
				)}

				<div className="cmdk__footer" aria-live="polite">
					{toast ? (
						<span className="cmdk__toast">{toast}</span>
					) : (
						<span className="ds-meta">
							<kbd className="ds-kbd">↑</kbd> <kbd className="ds-kbd">↓</kbd> to move, <kbd className="ds-kbd">↵</kbd> to open
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
