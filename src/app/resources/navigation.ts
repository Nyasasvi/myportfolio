export type NavItem = {
    label: string;
    href: string;
    description: string;
    keywords?: string[];
};

// Core pages, shown directly in the top bar
export const primaryNav: NavItem[] = [
    { label: "Home", href: "/", description: "Overview and current work" },
    { label: "About", href: "/about", description: "Experience and background", keywords: ["experience", "work", "resume", "history"] },
    { label: "Projects", href: "/projects", description: "Things I've built", keywords: ["portfolio", "work", "github"] },
    { label: "Skills", href: "/skills", description: "Languages, frameworks and tools", keywords: ["stack", "tech"] },
    { label: "Contact", href: "/contact", description: "Send me a message", keywords: ["email", "hire", "message"] },
    { label: "AR Experience", href: "/ar-experience", description: "View my work in augmented reality", keywords: ["3d", "augmented", "ar", "game"] },
];

export const contactLinks = {
    email: "yasasvi.nellore@gmail.com",
    github: "https://github.com/Nyasasvi/",
    linkedin: "https://www.linkedin.com/in/yasasvi-nellore/",
    resume: "/assets/resume.pdf",
};

export const isActivePath = (pathname: string, href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
