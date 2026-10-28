'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { skillsData } from '../../resources/consts';
import { showSystemRoute } from './systemEvents';

type Use = {
	at: string;
	what: string;
	result?: string;
	/** The live diagram question that shows this use, where one exists */
	route?: { graph: string; id: string };
};

type Tool = { name: string; uses: Use[] };

/*
 * Every tool listed here is tied to where it was used, taken from the resume and the projects in
 * resources/consts.ts. Tools with no specific use on the resume stay on the full skills page.
 */
const groups: { title: string; tools: Tool[] }[] = [
	{
		title: 'Agents and LLM systems',
		tools: [
			{
				name: 'LangChain and LangGraph',
				uses: [{ at: 'Twisted X', what: 'The agentic supply-chain assistant: multi-step planning, tool calling and retrieval over NetSuite ERP, supplier APIs and logistics data.', result: '70% less reporting time, 15% better fulfillment', route: { graph: 'twisted-x', id: 'stock' } }],
			},
			{
				name: 'RAG',
				uses: [
					{ at: 'Twisted X', what: 'Retrieval over ERP, supplier and logistics data for the supply-chain assistant.', route: { graph: 'twisted-x', id: 'stock' } },
					{ at: 'JPMorgan Chase', what: 'LLM prototypes with retrieval-augmented generation and prompt engineering.', result: '15% more relevant answers than the baseline', route: { graph: 'jpmorgan', id: 'rag' } },
				],
			},
			{
				name: 'MCP tool calling',
				uses: [{ at: 'Twisted X', what: 'Agents built in Celigo AI Studio that reach NetSuite business logic through RESTlet flows, with guardrails, evaluations, rollback and audit logging.', result: '40% lower retrieval latency' }],
			},
			{
				name: 'Claude API',
				uses: [{ at: 'Twisted X', what: 'Reads retailer listings for the web monitoring agent and pulls out each style and its price.', route: { graph: 'twisted-x', id: 'pricing' } }],
			},
			{
				name: 'OpenAI and Gemini APIs',
				uses: [
					{ at: 'Side project', what: 'AI Mock Interview Platform: Gemini writes role-specific questions and feedback.' },
					{ at: 'Side project', what: 'AI Image Generation Platform: images made with OpenAI’s DALL·E API.' },
				],
			},
			{
				name: 'Eval harnesses',
				uses: [
					{ at: 'Twisted X', what: 'Every change to prompts, tools or models is tested before it ships.', route: { graph: 'twisted-x', id: 'stock' } },
					{ at: 'JPMorgan Chase', what: 'Standard evaluation scripts and experiment tracking for the research team.', result: 'New experiments set up 30% faster', route: { graph: 'jpmorgan', id: 'setup' } },
				],
			},
		],
	},
	{
		title: 'Machine learning',
		tools: [
			{
				name: 'PyTorch and scikit-learn',
				uses: [
					{ at: 'JPMorgan Chase', what: 'Machine-learning pipelines on large financial datasets.', result: '12% better than the baseline on target tasks', route: { graph: 'jpmorgan', id: 'model' } },
					{ at: 'Side project', what: 'Diffusion Model Face Generator: a UNet2D trained from scratch on MetFaces.' },
				],
			},
			{
				name: 'TimesFM',
				uses: [{ at: 'Twisted X', what: 'Demand forecasting with a fine-tuned TimesFM model, replacing rolling 12-month averages.', result: 'Forecast error down from 24–31% to 11–21%' }],
			},
			{
				name: 'marqo-fashionSigLIP',
				uses: [{ at: 'Twisted X', what: 'Turns product images and attributes into vectors for the product comparison API.', route: { graph: 'twisted-x', id: 'lookalike' } }],
			},
			{
				name: 'pandas',
				uses: [{ at: 'JPMorgan Chase', what: 'Cleaning and shaping large financial datasets for experiments.', result: '35% faster data prep', route: { graph: 'jpmorgan', id: 'model' } }],
			},
		],
	},
	{
		title: 'Backend and data',
		tools: [
			{
				name: 'Java and Spring Boot',
				uses: [{ at: 'HCL Technologies', what: 'Microservices on Agile teams, with tuned SQL and Elasticsearch.', result: '300ms faster APIs, $12,000 a year saved', route: { graph: 'hcl', id: 'latency' } }],
			},
			{
				name: 'Node.js and TypeScript',
				uses: [{ at: 'Colombo AI', what: 'The personalized feed pipeline, its ranking engine and REST APIs.', result: '30% more engagement', route: { graph: 'colombo-ai', id: 'next' } }],
			},
			{
				name: 'Python',
				uses: [
					{ at: 'Twisted X', what: 'ETL pipelines into Snowflake for supplier, trading partner and sales data.' },
					{ at: 'UT Arlington', what: 'Data processing pipelines and REST APIs for research lab projects.' },
				],
			},
			{
				name: 'Kafka and Spark',
				uses: [{ at: 'HCL Technologies', what: 'Streaming and batch ETL pipelines, stored in HDFS.', result: '500 GB a day, 30% lower job latency', route: { graph: 'hcl', id: 'pipeline' } }],
			},
			{
				name: 'Snowflake and dbt',
				uses: [{ at: 'Twisted X', what: 'Standardized partner data and partner-specific dbt marts for reporting.' }],
			},
			{
				name: 'PostgreSQL',
				uses: [
					{ at: 'Colombo AI', what: 'Feed and messaging data, with targeted indexes and rewritten queries.', result: '40% faster API responses', route: { graph: 'colombo-ai', id: 'learn' } },
					{ at: 'HCL Technologies', what: 'Refactored PostgreSQL and MongoDB schemas.', result: 'Reports in 2.9s instead of 4.5s' },
				],
			},
			{
				name: 'DuckDB',
				uses: [{ at: 'Twisted X', what: 'Holds our styles and competitor styles side by side for the comparison API.', route: { graph: 'twisted-x', id: 'lookalike' } }],
			},
		],
	},
	{
		title: 'Frontend',
		tools: [
			{
				name: 'React and Next.js',
				uses: [
					{ at: 'Colombo AI', what: 'The feed and the creator posting experience, including Magic Pen.', result: '20% more posts created', route: { graph: 'colombo-ai', id: 'create' } },
					{ at: 'This site', what: 'Built in Next.js, including the live diagrams above.' },
				],
			},
			{
				name: 'Redux and Webpack',
				uses: [{ at: 'HCL Technologies', what: 'More than 15 responsive React components with TypeScript and Redux, and Webpack code-splitting.', result: 'Page load from 3s to 1.8s' }],
			},
			{
				name: 'Playwright',
				uses: [{ at: 'Twisted X', what: 'The web monitoring agent opens retailer sites and finds our listings.', route: { graph: 'twisted-x', id: 'pricing' } }],
			},
		],
	},
	{
		title: 'Cloud and delivery',
		tools: [
			{
				name: 'AWS',
				uses: [
					{ at: 'Twisted X', what: 'Platform services deployed on AWS with zero-downtime releases.' },
					{ at: 'HCL Technologies', what: 'PDF and email workflows moved to Lambda, API Gateway and CloudWatch.', result: '320 fewer EC2 hours a year', route: { graph: 'hcl', id: 'lambda' } },
				],
			},
			{
				name: 'Docker',
				uses: [
					{ at: 'Twisted X', what: 'Containerized builds in the CI/CD pipelines.' },
					{ at: 'HCL Technologies', what: 'Containerized deployments across three environments.' },
				],
			},
			{
				name: 'GitHub Actions',
				uses: [{ at: 'Twisted X', what: 'Build, test and deploy pipelines for the platform services.', result: 'Setup time from hours to minutes' }],
			},
			{
				name: 'Jenkins',
				uses: [{ at: 'HCL Technologies', what: 'CI/CD pipelines written in Groovy.', result: '10 hours of manual deployment saved each week' }],
			},
			{
				name: 'Prometheus and Grafana',
				uses: [{ at: 'JPMorgan Chase', what: 'Monitoring for services hardened with circuit breakers, rate limiting and OAuth2.' }],
			},
		],
	},
];

const allTools = groups.flatMap((g) => g.tools);
const placesOf = (tool: Tool) => Array.from(new Set(tool.uses.map((u) => u.at)));

function Detail({ tool }: { tool: Tool }) {
	const places = placesOf(tool);
	return (
		<div className="stack__detail-inner" key={tool.name}>
			<p className="stack__detail-name">{tool.name}</p>
			<p className="stack__detail-where">Used at {places.join(' and ')}</p>
			<ul className="stack__uses" role="list">
				{tool.uses.map((use, i) => (
					<li key={i} className="stack__use" style={{ '--i': i } as React.CSSProperties}>
						<span className="stack__use-at">{use.at}</span>
						<span className="stack__use-what">{use.what}</span>
						{use.result && <span className="stack__use-result">{use.result}</span>}
						{use.route && (
							<button type="button" className="stack__use-go" onClick={() => showSystemRoute(use.route!.graph, use.route!.id)}>
								See it in the live diagram
								<ArrowDown aria-hidden="true" />
							</button>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}

/** Pick a tool and see where it was used, with the result and a way into the live diagram */
export function Stack() {
	const [selected, setSelected] = useState(allTools[0].name);
	// On a fine pointer, hovering previews a tool; leaving the list returns to the picked one
	const [preview, setPreview] = useState<string | null>(null);
	const shown = allTools.find((t) => t.name === (preview ?? selected)) ?? allTools[0];

	return (
		<section className="stack" data-chapter="hot" aria-labelledby="stack-title">
			<div className="stack__side">
				<h2 id="stack-title" className="stack__title">What I use</h2>
				<p className="stack__lede">Pick a tool to see where I used it and what it changed.</p>
				<div id="stack-detail" className="stack__detail stack__detail--side" aria-live="polite">
					<Detail tool={shown} />
				</div>
			</div>

			<div className="stack__blocks" onMouseLeave={() => setPreview(null)}>
				{groups.map((group) => (
					<div key={group.title} className="stack__block" data-reveal>
						<h3 className="stack__name">{group.title}</h3>
						<ul className="stack__items" role="list">
							{group.tools.map((tool) => {
								const active = tool.name === selected;
								return (
									<li key={tool.name}>
										<button
											type="button"
											className="stack__tool"
											aria-pressed={active}
											aria-controls="stack-detail"
											onClick={() => {
												setSelected(tool.name);
												setPreview(null);
											}}
											onMouseEnter={() => {
												if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) setPreview(tool.name);
											}}
										>
											{tool.name}
											<span className="stack__tool-count" aria-hidden="true">{placesOf(tool).length}</span>
										</button>
										{/* On a phone the detail opens right under the tool that was picked */}
										{active && (
											<div className="stack__detail stack__detail--inline">
												<Detail tool={tool} />
											</div>
										)}
									</li>
								);
							})}
						</ul>
					</div>
				))}
				<p className="stack__more" data-reveal>
					<Link href="/skills" className="ds-link">All {skillsData.length} skills, with years of use</Link>
				</p>
			</div>
		</section>
	);
}
