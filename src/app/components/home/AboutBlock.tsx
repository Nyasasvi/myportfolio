import Link from 'next/link';
import { contactLinks } from '../../resources/navigation';

export function AboutBlock() {
	return (
		<section className="about-home" data-chapter="base" aria-labelledby="about-title">
			<figure className="about-home__band">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src="/images/mono/canyon-1280.webp"
					srcSet="/images/mono/canyon-1280.webp 1280w, /images/mono/canyon-2000.webp 2000w"
					sizes="100vw"
					alt="Yasasvi standing in front of a wide desert canyon"
					width={2000}
					height={857}
					loading="lazy"
					decoding="async"
				/>
			</figure>

			<div className="about-home__grid">
				<div className="about-home__facts" data-reveal>
					<h2 id="about-title" className="section-title">About</h2>
					<figure className="about-home__photo">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/images/mono/mountains-480.webp"
							srcSet="/images/mono/mountains-480.webp 480w, /images/mono/mountains-800.webp 800w"
							sizes="(max-width: 900px) 60vw, 22vw"
							alt="Yasasvi in a winter jacket in front of misty mountains"
							width={800}
							height={1000}
							loading="lazy"
							decoding="async"
						/>
					</figure>
					<ul role="list">
						<li>Based in Dallas, Texas</li>
						<li>Shipping software since 2021</li>
						<li><a href={`mailto:${contactLinks.email}`} className="ds-link">{contactLinks.email}</a></li>
					</ul>
				</div>

				<div className="about-home__bio">
					<p className="about-home__text" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							className="about-home__portrait"
							src="/images/mono/portrait-320.webp"
							srcSet="/images/mono/portrait-320.webp 320w, /images/mono/portrait-640.webp 640w"
							sizes="(max-width: 760px) 120px, 160px"
							alt="Portrait of Yasasvi beside a river"
							width={320}
							height={320}
							loading="lazy"
							decoding="async"
						/>
						<strong>Yasasvi Nellore.</strong> I’m a full-stack and AI engineer with four years of experience building
						distributed web applications and cloud-native microservices in Java, Python and TypeScript, shipped on AWS with
						Docker, Kubernetes and Jenkins.
					</p>
					<p className="about-home__text about-home__text--soft" data-reveal style={{ '--i': 2 } as React.CSSProperties}>
						Today I focus on LLM systems that make software more useful: RAG, MCP, multi-agent orchestration and the
						OpenAI, Gemini and Claude APIs. I hold an M.S. in Computer Science from The University of Texas at Arlington,
						where I also worked as a graduate research assistant.
					</p>
					<p className="about-home__more" data-reveal style={{ '--i': 3 } as React.CSSProperties}>
						<Link href="/about" className="ds-link">Full experience and education</Link>
					</p>
				</div>
			</div>
		</section>
	);
}
