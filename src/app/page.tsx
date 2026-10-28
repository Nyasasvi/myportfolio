import { Hero } from './components/home/Hero';
import { Systems } from './components/home/Systems';
import { Figures } from './components/home/Figures';
import { Work } from './components/home/Work';
import { Career } from './components/home/Career';
import { Stack } from './components/home/Stack';
import { AboutBlock } from './components/home/AboutBlock';
import { Reach } from './components/home/Reach';
import { COMPANY_GRAPHS } from './components/signal/graph';
import './homepage.css';

export default function Home() {
	return (
		<main className="home">
			<Hero />
			{/* One live diagram per company, newest first, alternating sides */}
			{COMPANY_GRAPHS.map((graph, i) => (
				<Systems key={graph.id} graph={graph} flip={i % 2 === 1} />
			))}
			<Figures />
			<Work />
			<Career />
			<Stack />
			<AboutBlock />
			<Reach />
		</main>
	);
}
