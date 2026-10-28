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
	{ id: 'matcher', label: 'Product comparison', detail: 'marqo-fashionSigLIP, DuckDB' },
] as const;

export const OUTPUTS = [
	'Styles likely to run short',
	'Listings that break pricing rules',
	'Closest styles in our catalog',
] as const;

// [source index, hub index]; each hub continues to the output with the same index
export const EDGES: ReadonlyArray<readonly [number, number]> = [
	[0, 0],
	[1, 0],
	[2, 0],
	[3, 1],
	[4, 1],
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
			{ verb: 'Match.', text: 'Listings are matched to our catalog, with checks that cut false positives.' },
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
			{ verb: 'Answer.', text: 'Duplicates show up early, and so do gaps in the catalog.' },
		],
	},
];

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
