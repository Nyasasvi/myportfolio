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
];

// Interactive tools, grouped under one menu
export const toolsNav: NavItem[] = [
    { label: "AI Newsletter", href: "/newsletter", description: "Weekly AI news, curated", keywords: ["news", "subscribe"] },
    { label: "Job Match", href: "/job-match", description: "Compare a job description to my experience", keywords: ["fit", "role", "recruiter"] },
    { label: "Skill Assessment", href: "/skill-assessment", description: "Quiz yourself on core topics", keywords: ["quiz", "test"] },
    { label: "AR Experience", href: "/ar-experience", description: "View my work in augmented reality", keywords: ["3d", "augmented"] },
    { label: "Analytics", href: "/analytics", description: "Site traffic and engagement", keywords: ["stats", "metrics"] },
];

export const contactLinks = {
    email: "yasasvi.nellore@gmail.com",
    github: "https://github.com/Nyasasvi/",
    linkedin: "https://www.linkedin.com/in/yasasvi-nellore/",
    resume: "/assets/resume.pdf",
};

export const isActivePath = (pathname: string, href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
