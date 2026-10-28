import { projects } from "./consts";

// What makes each project technically interesting, in one or two sentences. Written only from
// the project descriptions in consts.ts; keep them in step when a description changes.
const notes: Record<string, { slug: string; why: string }> = {
    "AI Image Generation Platform": {
        slug: "image-generation",
        why: "Prompts go to OpenAI’s DALL·E API, finished images are stored and served through Cloudinary, and search runs across everything generated so far.",
    },
    "AI Mock Interview Platform": {
        slug: "mock-interview",
        why: "Voice interviews run on Google Gemini through the VAPI SDK, shaped to the role, with feedback written to Cloud Firestore after every session.",
    },
    "Chess Bellator": {
        slug: "chess-bellator",
        why: "A chess engine that picks moves with Monte Carlo Tree Search: it plays out games from each candidate move and spends its time on the branches that keep winning.",
    },
    "Diffusion Model Face Generator": {
        slug: "diffusion-faces",
        why: "A UNet2D diffusion model trained from scratch on the MetFaces dataset with Hugging Face Diffusers, learning to turn noise into painted portraits.",
    },
    "AI Resume Editor": {
        slug: "resume-editor",
        why: "Reads a job description, rewrites the summary, skills and experience of a resume to match it for applicant tracking systems, and exports a PDF.",
    },
    "Canvas LMS Clone": {
        slug: "canvas-lms",
        why: "A learning management system modelled on Canvas: courses, assignments, grading and discussion boards, with real-time notifications over WebSockets.",
    },
    "E-Commerce Shopping Platform": {
        slug: "shopping",
        why: "Catalog, cart, Stripe payments, reviews, a seller dashboard and order tracking, with a responsive layout built for phones.",
    },
    "Diet AI Agent": {
        slug: "diet-agent",
        why: "Logs meals, analyses nutrition and recommends what to eat next, on a Node.js and Express API backed by PostgreSQL and OpenAI.",
    },
};

export type ShowcaseProject = (typeof projects)[number] & {
    slug: string;
    why: string;
    image: { small: string; large: string };
    repo?: string;
};

// Resized colour derivatives live in /public/images/color (WebP, same crops as the old mono set)
export const showcase: ShowcaseProject[] = projects.map((project) => {
    const note = notes[project.name] ?? { slug: "", why: project.description };
    return {
        ...project,
        ...note,
        image: note.slug
            ? { small: `/images/color/${note.slug}-480.webp`, large: `/images/color/${note.slug}-960.webp` }
            : { small: project.imageUrl, large: project.imageUrl },
        repo: project.githubLink?.includes("github.com") ? project.githubLink : undefined,
    };
});
