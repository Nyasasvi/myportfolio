'use client'

import Link from "next/link";
import { useEffect, useRef } from "react";
import { footerButtonLinks } from "../resources/consts";
import { contactLinks, primaryNav, toolsNav } from "../resources/navigation";
import "./footer.css";

// Sets the visible [data-fit] lines to one size, the largest at which every line still runs
// within the margins (a single line runs exactly margin to margin)
function useFitLines(ref: React.RefObject<HTMLElement>) {
    useEffect(() => {
        const root = ref.current;
        if (!root) return;
        const fit = () => {
            const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-fit]")).filter((line) => line.offsetParent);
            const target = root.clientWidth;
            if (!lines.length || target <= 0) return;
            const sizes = lines.map((line) => {
                line.style.fontSize = "100px";
                const natural = line.scrollWidth;
                return natural > 0 ? (100 * target) / natural : 100;
            });
            const size = Math.min(...sizes);
            lines.forEach((line) => (line.style.fontSize = `${size}px`));
        };
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(root);
        document.fonts?.ready.then(fit).catch(() => {});
        return () => ro.disconnect();
    }, [ref]);
}

export default function Footer() {
    const markRef = useRef<HTMLDivElement>(null);
    useFitLines(markRef);

    return (
        <footer className="site-footer" data-hide-fab>
            <div className="site-footer__cols">
                <div className="site-footer__col">
                    <p className="site-footer__head">Pages</p>
                    <ul role="list">
                        {primaryNav.map((item) => (
                            <li key={item.href}><Link href={item.href} className="site-footer__link">{item.label}</Link></li>
                        ))}
                    </ul>
                </div>
                <div className="site-footer__col">
                    <p className="site-footer__head">Tools</p>
                    <ul role="list">
                        {toolsNav.map((item) => (
                            <li key={item.href}><Link href={item.href} className="site-footer__link">{item.label}</Link></li>
                        ))}
                    </ul>
                </div>
                <div className="site-footer__col">
                    <p className="site-footer__head">Elsewhere</p>
                    <ul role="list">
                        {footerButtonLinks.map((link) => {
                            const external = link.href.startsWith("http");
                            return (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="site-footer__link"
                                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    >
                                        {link.label === "Linkedin" ? "LinkedIn" : link.label === "Github" ? "GitHub" : link.label === "Mail" ? "Email" : link.label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="site-footer__col">
                    <p className="site-footer__head">Dallas, Texas</p>
                    <ul role="list">
                        <li><a href={`mailto:${contactLinks.email}`} className="site-footer__link">{contactLinks.email}</a></li>
                        <li><a href={contactLinks.resume} target="_blank" rel="noopener noreferrer" className="site-footer__link">Resume, PDF</a></li>
                    </ul>
                </div>
            </div>

            <div className="site-footer__mark" ref={markRef} aria-hidden="true">
                <span className="site-footer__line site-footer__line--one" data-fit>Yasasvi Nellore</span>
                <span className="site-footer__line site-footer__line--two" data-fit>Yasasvi</span>
                <span className="site-footer__line site-footer__line--two" data-fit>Nellore</span>
            </div>

            <p className="site-footer__legal">© {new Date().getFullYear()} Yasasvi Nellore. Built in Dallas, Texas.</p>
        </footer>
    )
}
