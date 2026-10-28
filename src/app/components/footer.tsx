'use client'

import { Github, Instagram, Linkedin, Mail, type LucideIcon } from "lucide-react";
import { footerButtonLinks } from "../resources/consts";
import "./footer.css";

const icons: Record<string, LucideIcon> = {
    github: Github,
    linkedin: Linkedin,
    mail: Mail,
    instagram: Instagram,
};

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <p className="site-footer__copy">© {new Date().getFullYear()} Yasasvi Nellore. Built in Dallas, TX.</p>
                <ul className="site-footer__links" role="list">
                    {footerButtonLinks.map((link) => {
                        const Icon = icons[link.icon];
                        const external = link.href.startsWith("http");
                        return (
                            <li key={link.label}>
                                <a
                                    href={link.href}
                                    className="ds-icon-btn"
                                    aria-label={link.label}
                                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                >
                                    {Icon ? <Icon aria-hidden /> : link.label}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </footer>
    )
}
