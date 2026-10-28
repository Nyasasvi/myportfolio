/*
 * The systems behind the homepage field: data sources feeding the three AI systems built at
 * Twisted X Global Brands (see resources/consts.ts, experience[0]). The renderer draws particles
 * along these edges; the diagram labels and the route steps read the same data, so the picture
 * and the words can't drift apart.
 */

export type Point = { x: number; y: number };

export const SOURCES = [
	{ id: 'erp', label: 'NetSuite ERP' },
	{ id: 'suppliers', label: 'Supplier APIs' },
	{ id: 'logistics', label: 'Logistics data' },
	{ id: 'retail', label: 'Retailer websites' },
	{ id: 'catalog', label: 'Our catalog' },
	{ id: 'competitor', label: 'Competitor styles' },
] as const;

export const HUBS = [
	{ id: 'planner', label: 'Supply-chain assistant', detail: 'LangChain, LangGraph, RAG' },
	{ id: 'monitor', label: 'Web monitoring agent', detail: 'Playwright, Claude API' },
	{ id: 'matcher', label: 'Product comparison API', detail: 'marqo-fashionSigLIP, DuckDB' },
] as const;

export const OUTPUTS = [
	'Styles likely to run short',
	'Listings that break pricing rules',
	'Closest styles in our catalog',
] as const;

/*
 * [from, hub]; each hub continues to the output with the same index. `from` is a source index, or
 * fromHub(h) when one system feeds another: the monitoring agent matches listings by calling the
 * product comparison API rather than reading the catalog itself.
 */
export const fromHub = (hub: number) => -1 - hub;
export const isHubEdge = (from: number) => from < 0;
export const hubOfEdgeStart = (from: number) => -1 - from;

export const EDGES: ReadonlyArray<readonly [number, number]> = [
	[0, 0],
	[1, 0],
	[2, 0],
	[3, 1],
	[fromHub(2), 1],
	[5, 2],
	[4, 2],
];

export type RouteStep = { verb: string; text: string };

export type Route = {
	id: string;
	question: string;
	hub: number;
	steps: RouteStep[];
};

// Each question runs through one of the three systems. Steps describe the route in plain words;
// they are a simplified sketch, not production code.
export const ROUTES: Route[] = [
	{
		id: 'stock',
		question: 'Which styles will run short before the next shipment lands?',
		hub: 0,
		steps: [
			{ verb: 'Plan.', text: 'LangGraph breaks the question into steps: stock on hand, open supplier orders, inbound shipments.' },
			{ verb: 'Call tools.', text: 'The agent queries NetSuite ERP, supplier APIs and logistics data, retrieving context with RAG.' },
			{ verb: 'Check.', text: 'An eval harness tests every change to prompts, tools or models before it ships.' },
			{ verb: 'Answer.', text: 'Planners get the styles at risk, and the dates that put them there.' },
		],
	},
	{
		id: 'pricing',
		question: 'Is any retailer listing our styles below the agreed price?',
		hub: 1,
		steps: [
			{ verb: 'Browse.', text: 'A Playwright agent opens retailer sites and finds our product listings.' },
			{ verb: 'Read.', text: 'The Claude API reads each listing and pulls out the style and its price.' },
			{ verb: 'Match.', text: 'Each listing goes to our product comparison API, which returns the matching style; checks cut false positives.' },
			{ verb: 'Answer.', text: 'Only the listings that break pricing rules reach a person.' },
		],
	},
	{
		id: 'lookalike',
		question: 'Do we already sell a style like this competitor’s?',
		hub: 2,
		steps: [
			{ verb: 'Embed.', text: 'marqo-fashionSigLIP turns product images and attributes into vectors.' },
			{ verb: 'Store.', text: 'DuckDB holds our styles and competitor styles side by side.' },
			{ verb: 'Compare.', text: 'Nearest neighbours by image and attribute find the closest matches.' },
			{ verb: 'Serve.', text: 'It runs as an API, so other systems, like the web monitoring agent, call it to match products.' },
			{ verb: 'Answer.', text: 'Duplicates show up early, and so do gaps in the catalog.' },
		],
	},
];

export type Edge = readonly [number, number];

/*
 * One company's systems for the homepage diagrams. Every graph has six sources and three systems,
 * so they all share the DIAGRAM layouts below; the renderer supports up to eight edges.
 */
export type SystemGraph = {
	id: string;
	company: string;
	title: string;
	intro: string;
	sources: ReadonlyArray<{ id: string; label: string }>;
	hubs: ReadonlyArray<{ id: string; label: string; detail: string }>;
	outputs: ReadonlyArray<string>;
	edges: ReadonlyArray<Edge>;
	routes: Route[];
};

export const TWISTED_X: SystemGraph = {
	id: 'twisted-x',
	company: 'Twisted X Global Brands',
	title: 'Agents I built at Twisted X',
	intro:
		'Twisted X Global Brands is a footwear company in Texas. Since December 2024 I’ve built the AI systems its planners and merchandisers use, on top of ERP, supplier and logistics data. Pick a question to see the route it takes.',
	sources: SOURCES,
	hubs: HUBS,
	outputs: OUTPUTS,
	edges: EDGES,
	routes: ROUTES,
};

// From resources/consts.ts, experience[1]
export const JPMORGAN: SystemGraph = {
	id: 'jpmorgan',
	company: 'JPMorgan Chase',
	title: 'AI research at JPMorgan',
	intro:
		'From July to December 2024 I was a Senior Associate in AI Research, prototyping and evaluating new approaches with data scientists across Markets and Asset & Wealth Management. Pick a question to see how each experiment ran.',
	sources: [
		{ id: 'docs', label: 'Internal documents' },
		{ id: 'prompts', label: 'Prompt variants' },
		{ id: 'tests', label: 'Internal test sets' },
		{ id: 'financial', label: 'Financial datasets' },
		{ id: 'baselines', label: 'Baseline models' },
		{ id: 'runs', label: 'Experiment runs' },
	],
	hubs: [
		{ id: 'rag', label: 'LLM prototypes', detail: 'RAG, prompt engineering' },
		{ id: 'ml', label: 'ML pipelines', detail: 'PyTorch, scikit-learn, pandas' },
		{ id: 'eval', label: 'Evaluation toolkit', detail: 'Python, experiment tracking' },
	],
	outputs: ['15% more relevant answers', '12% better than baseline', 'Experiments set up 30% faster'],
	edges: [
		[0, 0],
		[1, 0],
		[2, 0],
		[3, 1],
		[4, 1],
		[2, 2],
		[5, 2],
	],
	routes: [
		{
			id: 'rag',
			question: 'Can an LLM answer research questions better than the baseline?',
			hub: 0,
			steps: [
				{ verb: 'Retrieve.', text: 'Retrieval-augmented generation pulls the passages most relevant to the question.' },
				{ verb: 'Prompt.', text: 'Prompt engineering shapes how the model uses what was retrieved.' },
				{ verb: 'Score.', text: 'Answers are measured against internal test sets, not judged by eye.' },
				{ verb: 'Result.', text: 'Responses were 15% more relevant than the baseline.' },
			],
		},
		{
			id: 'model',
			question: 'Does a new model beat the baseline on this task?',
			hub: 1,
			steps: [
				{ verb: 'Frame.', text: 'Start from the problem and a hypothesis worth testing.' },
				{ verb: 'Prepare.', text: 'pandas pipelines clean large financial datasets, cutting data prep time by 35%.' },
				{ verb: 'Train.', text: 'PyTorch and scikit-learn models are run as reproducible experiments.' },
				{ verb: 'Result.', text: 'Models improved on the baseline by 12% on target tasks.' },
			],
		},
		{
			id: 'setup',
			question: 'How quickly can the team start a new experiment?',
			hub: 2,
			steps: [
				{ verb: 'Reuse.', text: 'Shared Python utilities replace one-off setup scripts.' },
				{ verb: 'Track.', text: 'Every run is logged the same way, so results line up.' },
				{ verb: 'Evaluate.', text: 'Standard evaluation scripts score each run against the same test sets.' },
				{ verb: 'Result.', text: 'New experiments were set up 30% faster.' },
			],
		},
	],
};

// From resources/consts.ts, experience[2]
export const COLOMBO_AI: SystemGraph = {
	id: 'colombo-ai',
	company: 'Colombo AI',
	title: 'The feed at Colombo AI',
	intro:
		'Colombo AI is a social platform. From December 2023 to May 2024 I built its personalized feed, the recommendation pipeline behind it, and tools that help creators post. Pick a question to follow it through the system.',
	sources: [
		{ id: 'follows', label: 'Follows' },
		{ id: 'interests', label: 'Interests' },
		{ id: 'posts', label: 'New posts' },
		{ id: 'reactions', label: 'Likes & comments' },
		{ id: 'viewing', label: 'Viewing behavior' },
		{ id: 'media', label: 'Images, video & text' },
	],
	hubs: [
		{ id: 'ranking', label: 'Feed ranking engine', detail: 'Node.js, TypeScript, REST' },
		{ id: 'recs', label: 'Recommendations', detail: 'Node.js, PostgreSQL' },
		{ id: 'magic-pen', label: 'Magic Pen', detail: 'React, multi-modal tools' },
	],
	outputs: ['30% more engagement', 'A feed that adapts as you use it', '20% more posts created'],
	edges: [
		[0, 0],
		[1, 0],
		[2, 0],
		[3, 1],
		[4, 1],
		[5, 2],
	],
	routes: [
		{
			id: 'next',
			question: 'What should this person see next in their feed?',
			hub: 0,
			steps: [
				{ verb: 'Gather.', text: 'Collect candidates from the people they follow, their interests and new posts.' },
				{ verb: 'Score.', text: 'Rank by affinity, engagement and recency, with time decay so old posts fade.' },
				{ verb: 'Shape.', text: 'Remove duplicates, keep creators varied, and page with cursors for infinite scroll.' },
				{ verb: 'Result.', text: 'Engagement rose by 30%.' },
			],
		},
		{
			id: 'learn',
			question: 'How does a single like change the feed?',
			hub: 1,
			steps: [
				{ verb: 'Capture.', text: 'Likes, comments and viewing are recorded in PostgreSQL.' },
				{ verb: 'Weigh.', text: 'Each interaction updates weighted affinity scores between a person and a creator.' },
				{ verb: 'Re-rank.', text: 'The feed re-orders using engagement, recency and time-decay signals.' },
				{ verb: 'Result.', text: 'The feed adapts as people use it, served by queries that indexing made 40% faster.' },
			],
		},
		{
			id: 'create',
			question: 'How do creators make posts faster?',
			hub: 2,
			steps: [
				{ verb: 'Open.', text: 'Creators start a post from the composer.' },
				{ verb: 'Make.', text: 'Magic Pen helps with images, video and text in one place.' },
				{ verb: 'Publish.', text: 'New posts flow straight into the feed ranking engine.' },
				{ verb: 'Result.', text: 'Content creation rose by 20%.' },
			],
		},
	],
};

// From resources/consts.ts, experience[3]
export const HCL: SystemGraph = {
	id: 'hcl',
	company: 'HCL Technologies',
	title: 'Systems I built at HCL',
	intro:
		'From May 2021 to July 2022 I was a software developer at HCL Technologies in Hyderabad, working on Agile teams across data pipelines, Java microservices and AWS. Pick a question to see what changed.',
	sources: [
		{ id: 'events', label: 'Event streams' },
		{ id: 'batch', label: 'Batch data' },
		{ id: 'sql', label: 'SQL databases' },
		{ id: 'requests', label: 'API requests' },
		{ id: 'pdf', label: 'PDF jobs' },
		{ id: 'email', label: 'Email jobs' },
	],
	hubs: [
		{ id: 'etl', label: 'Streaming ETL', detail: 'Spark, Kafka, HDFS' },
		{ id: 'services', label: 'Microservices', detail: 'Spring Boot, Elasticsearch' },
		{ id: 'serverless', label: 'Serverless workflows', detail: 'AWS Lambda, API Gateway' },
	],
	outputs: ['500 GB a day, 30% lower latency', '300ms faster APIs', '320 fewer EC2 hours a year'],
	edges: [
		[0, 0],
		[1, 0],
		[2, 1],
		[3, 1],
		[4, 2],
		[5, 2],
	],
	routes: [
		{
			id: 'pipeline',
			question: 'How does 500 GB a day reach downstream services?',
			hub: 0,
			steps: [
				{ verb: 'Ingest.', text: 'Kafka streams events in alongside batch data.' },
				{ verb: 'Process.', text: 'Spark jobs transform both, in batch and streaming.' },
				{ verb: 'Store.', text: 'Results land in HDFS for the services that need them.' },
				{ verb: 'Result.', text: 'Job latency dropped by 30%, and data reached downstream services sooner.' },
			],
		},
		{
			id: 'latency',
			question: 'What made the APIs 300ms faster?',
			hub: 1,
			steps: [
				{ verb: 'Tune.', text: 'The slowest SQL queries were found and rewritten.' },
				{ verb: 'Index.', text: 'Elasticsearch took search load off the database.' },
				{ verb: 'Serve.', text: 'Spring Boot microservices answer requests from the faster path.' },
				{ verb: 'Result.', text: 'API latency fell by 300ms, saving $12,000 a year in cloud costs.' },
			],
		},
		{
			id: 'lambda',
			question: 'Where did the PDF and email work go?',
			hub: 2,
			steps: [
				{ verb: 'Move.', text: 'High-volume PDF and email jobs moved off always-on EC2 to AWS Lambda.' },
				{ verb: 'Expose.', text: 'API Gateway triggers each job on demand.' },
				{ verb: 'Watch.', text: 'CloudWatch tracks every run and its latency.' },
				{ verb: 'Result.', text: '320 fewer EC2 hours a year, with p95 latency under 800ms.' },
			],
		},
	],
};

export const COMPANY_GRAPHS: SystemGraph[] = [TWISTED_X, JPMORGAN, COLOMBO_AI, HCL];

/*
 * Layouts in normalised view coordinates (0..1, origin top-left). `axis` is the direction the
 * flow travels, which sets the bezier tangents: 'x' for left-to-right, 'y' for bottom-to-top.
 */
export type Layout = {
	axis: 'x' | 'y';
	sources: Point[];
	hubs: Point[];
	outputs: Point[];
	// Lateral spread of a bundle (fraction of the view's short side) at source, hub and output
	spread: [number, number, number];
};

// The readable diagram beside the route steps
export const DIAGRAM: Layout = {
	axis: 'x',
	sources: [0.12, 0.26, 0.4, 0.56, 0.72, 0.88].map((y) => ({ x: 0.03, y })),
	hubs: [
		{ x: 0.52, y: 0.27 },
		{ x: 0.52, y: 0.6 },
		{ x: 0.52, y: 0.84 },
	],
	outputs: [
		{ x: 0.97, y: 0.27 },
		{ x: 0.97, y: 0.6 },
		{ x: 0.97, y: 0.84 },
	],
	spread: [0.012, 0.004, 0.01],
};

// The same diagram on a phone: systems move right so their labels clear the source labels
export const DIAGRAM_NARROW: Layout = {
	...DIAGRAM,
	sources: [0.1, 0.25, 0.4, 0.56, 0.72, 0.88].map((y) => ({ x: 0.04, y })),
	hubs: [
		{ x: 0.62, y: 0.27 },
		{ x: 0.62, y: 0.6 },
		{ x: 0.62, y: 0.84 },
	],
	outputs: [
		{ x: 0.96, y: 0.27 },
		{ x: 0.96, y: 0.6 },
		{ x: 0.96, y: 0.84 },
	],
};

// The hero on a wide screen: light rises from behind the name and converges at upper right,
// leaving the top-left calm for the sentence
export const HERO_WIDE: Layout = {
	axis: 'x',
	sources: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((y) => ({ x: -0.06, y })),
	hubs: [
		{ x: 0.6, y: 0.3 },
		{ x: 0.7, y: 0.45 },
		{ x: 0.62, y: 0.6 },
	],
	outputs: [
		{ x: 1.06, y: 0.16 },
		{ x: 1.06, y: 0.4 },
		{ x: 1.06, y: 0.64 },
	],
	spread: [0.06, 0.012, 0.07],
};

// The hero on a tall screen: light rises from the bottom edge through the name
export const HERO_TALL: Layout = {
	axis: 'y',
	sources: [0.08, 0.24, 0.4, 0.56, 0.72, 0.9].map((x) => ({ x, y: 1.06 })),
	hubs: [
		{ x: 0.5, y: 0.46 },
		{ x: 0.74, y: 0.52 },
		{ x: 0.62, y: 0.6 },
	],
	outputs: [
		{ x: 0.42, y: -0.06 },
		{ x: 0.72, y: -0.06 },
		{ x: 0.98, y: -0.06 },
	],
	spread: [0.08, 0.018, 0.1],
};
