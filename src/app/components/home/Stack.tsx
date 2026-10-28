import Link from 'next/link';
import { skillsData } from '../../resources/consts';

// Grouped by the work they do, drawn from the resume and the skills list; no levels or percentages
const groups = [
	{
		title: 'Agents and LLM systems',
		items: ['LangChain and LangGraph', 'RAG over vector databases', 'MCP tool calling', 'OpenAI, Gemini and Claude APIs', 'Eval harnesses and guardrails'],
	},
	{
		title: 'Machine learning',
		items: ['PyTorch and scikit-learn', 'TensorFlow', 'Hugging Face Transformers and Diffusers', 'TimesFM forecasting', 'marqo-fashionSigLIP embeddings'],
	},
	{
		title: 'Backend and data',
		items: ['Java and Spring Boot', 'Python and FastAPI', 'Node.js and Express', 'Kafka and Spark', 'Snowflake, dbt, PostgreSQL, DuckDB'],
	},
	{
		title: 'Frontend',
		items: ['React and Next.js', 'TypeScript', 'Redux and React Query', 'Tailwind CSS', 'Playwright for testing and agents'],
	},
	{
		title: 'Cloud and delivery',
		items: ['AWS', 'Docker and Kubernetes', 'Terraform', 'GitHub Actions and Jenkins', 'Prometheus and Grafana'],
	},
];

export function Stack() {
	return (
		<section className="stack" data-chapter="hot" aria-labelledby="stack-title">
			<h2 id="stack-title" className="stack__title">What I use</h2>
			<div className="stack__blocks">
				{groups.map((group) => (
					<div key={group.title} className="stack__block" data-reveal>
						<h3 className="stack__name">{group.title}</h3>
						<ul className="stack__items" role="list">
							{group.items.map((item) => <li key={item}>{item}</li>)}
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
