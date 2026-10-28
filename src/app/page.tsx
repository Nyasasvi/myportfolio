import { Hero } from './components/home/Hero';
import { Systems } from './components/home/Systems';
import { Figures } from './components/home/Figures';
import { Work } from './components/home/Work';
import { Career } from './components/home/Career';
import { Stack } from './components/home/Stack';
import { AboutBlock } from './components/home/AboutBlock';
import { Reach } from './components/home/Reach';
import './homepage.css';

export default function Home() {
	return (
		<main className="home">
			<Hero />
			<Systems />
			<Figures />
			<Work />
			<Career />
			<Stack />
			<AboutBlock />
			<Reach />
		</main>
	);
}
