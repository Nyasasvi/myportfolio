# Yasasvi Nellore — portfolio

The personal site of Yasasvi Nellore, a software engineer in Dallas who builds AI agents and the
full-stack software around them. It is built with Next.js 14 and leans on live, interactive pieces
instead of static lists: system diagrams you can route light through, a career timeline you can
scrub, and an About page whose background changes with each employer.

## What's on the site

### Home (`/`)

- **Hero** — the name set large over a WebGL field of light trails that follow the systems below.
- **Live system diagrams** — one per company (Twisted X, JPMorgan Chase, Colombo AI, HCL). Pick a
  question and the light re-routes through the system that answers it, with the steps beside it.
- **What changed** — the headline results, counted up as they scroll in. A chart beside them redraws
  for whichever result is pointed at or tapped; the HCL figure fills live through the Dallas day.
- **Projects** — an index in large type with a pinned preview, category filters and a live check
  that marks deployed demos that are online right now.
- **From banking to boots** — the career as a timeline drawn to scale. Drag the playhead, press
  play, or tap a role; the current role grows to today's date.
- **What I use** — pick a tool to see where it was used and what it changed, with a link into the
  matching diagram.
- **About** — the bio at the length the reader has time for (5 seconds, 30 seconds, 2 minutes).
- **Get in touch** — contact channels and a live clock for Dallas.

### About (`/about`)

Five chapters, newest first. Scrolling into each one hands the background to an animated scene from
that employer's world, drawn in original shapes (no logos):

| Chapter | Background | Interaction |
| --- | --- | --- |
| Twisted X | Boot prints and shipments along a supply route | The walker follows the pointer |
| JPMorgan Chase | A live candlestick tape | Point at a candle to light it |
| Colombo AI | Likes and comments rising like a feed | Click, tap or "Send a like" |
| UT Arlington | A neural network firing | Move near a neuron to fire it |
| HCL Technologies | Data packets through a processing column | The nearest lane speeds up |

A sticky chapter bar shows reading progress and has a **Pause background** control.

### Other pages

- **Projects** (`/projects`), **Skills** (`/skills`) and **Contact** (`/contact`).
- **AR Experience** (`/ar-experience`) — a 3D scene with an animated drawing of Yasasvi standing on a
  lit platform and ten cards about the work orbiting around (drag to spin, tap to bring one
  forward), plus a small bug-catching game and a QR code to open it on a phone.
- Site-wide: light and dark themes, a <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>K</kbd> command palette,
  and an "Ask about me" chatbot.

## Tech stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** plain CSS with design tokens (`src/app/design-system.css`), on top of the Once UI
  base styles; one variable typeface, Epilogue
- **Graphics:** WebGL for the homepage light field, Canvas 2D for the About scenes, Three.js and
  React Three Fiber for the AR page
- **Motion:** CSS transitions and Framer Motion
- **Other:** lucide-react icons, nodemailer for the contact form, Vercel Analytics

## Getting started

Requires Node.js 18.17 or later.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

For a production build:

```bash
npm run build
npm start
```

The site builds and runs without any environment variables; the contact form and the chatbot's AI
answers need the settings below.

## Environment variables

Create `.env.local` in the project root:

```env
# Contact form: messages are sent through Gmail
SMTP_USER=your.address@gmail.com
SMTP_PASS=your_gmail_app_password

# Chatbot: without it, the chatbot answers from built-in replies
OPENAI_API_KEY=your_openai_api_key
```

| Variable | Used by | Notes |
| --- | --- | --- |
| `SMTP_USER` | Contact form | The Gmail address that sends the message |
| `SMTP_PASS` | Contact form | A Gmail [app password](https://myaccount.google.com/apppasswords) (needs 2-Step Verification) |
| `OPENAI_API_KEY` | Chatbot | Optional; uses `gpt-4o-mini` |

## Editing the content

Most text and numbers come from data files, so the pages stay in step with each other:

| What | Where |
| --- | --- |
| Experience, research, projects, skills, short bio | `src/app/resources/consts.ts` |
| Project write-ups and cover images | `src/app/resources/showcase.ts` |
| Company diagrams (sources, systems, questions, steps) | `src/app/components/signal/graph.ts` |
| Homepage results and their charts | `src/app/components/home/Figures.tsx` |
| About chapters, figures and scenes | `src/app/about/page.tsx`, `src/app/about/scenes.ts` |
| AR scene cards and their text | `src/app/components/ARScene.tsx` |
| The animated character in the AR scene | `src/app/components/ar/avatar.ts` |
| Navigation and contact links | `src/app/resources/navigation.ts` |
| Resume PDF | `public/assets/resume.pdf` |
| Photos (resized WebP) | `public/images/color/` |

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Homepage, composed from components/home
│   ├── about/                # About page, its scenes and background stage
│   ├── projects/  skills/  contact/  ar-experience/
│   ├── api/
│   │   ├── chatbot/          # Chatbot answers
│   │   ├── contact/          # Contact form email
│   │   └── check-env/        # Reports which settings are present
│   ├── components/
│   │   ├── home/             # Homepage sections
│   │   ├── signal/           # WebGL light field and the company graphs
│   │   └── ...               # Navigation, footer, command palette, chatbot, AR scene
│   ├── resources/            # Content data
│   ├── design-system.css     # Tokens and shared styles
│   └── homepage.css
└── once-ui/                  # Base UI styles and tokens
public/                       # Resume, photos, project images
```

## Accessibility and performance

- Everything that moves on its own respects `prefers-reduced-motion`, and the About backgrounds
  have a pause control.
- Animations run only while on screen and in a visible tab; the WebGL field steps down its quality
  on slow devices.
- Interactive pieces work from the keyboard, charts have text descriptions, and content is
  server-rendered so it reads without JavaScript.

## Deployment

The site is set up for Vercel (it uses Vercel Analytics): import the repository in Vercel and add the
environment variables above in the project settings. Any host that runs Next.js 14 works too.

## License

© Yasasvi Nellore. All rights reserved.
