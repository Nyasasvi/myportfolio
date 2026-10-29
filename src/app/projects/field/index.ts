import { ChapterField } from '@/app/components/field/ChapterField';
import { ImageGenScene } from './scenes/imagegen';
import { InterviewScene } from './scenes/interview';
import { ChessScene } from './scenes/chess';
import { DiffusionScene } from './scenes/diffusion';
import { ResumeScene } from './scenes/resume';
import { ClassroomScene } from './scenes/classroom';
import { ShopScene } from './scenes/shop';
import { DietScene } from './scenes/diet';

/** The projects page's field: one scene per project, keyed by the project's slug in data-scene */
export const createField = (canvas: HTMLCanvasElement, sections: HTMLElement[], onReady: () => void) =>
	new ChapterField(canvas, sections, {
		head: '.project-chapter__body',
		onReady,
		scenes: {
			'image-generation': () => new ImageGenScene(),
			'mock-interview': () => new InterviewScene(),
			'chess-bellator': () => new ChessScene(),
			'diffusion-faces': () => new DiffusionScene(),
			'resume-editor': () => new ResumeScene(),
			'canvas-lms': () => new ClassroomScene(),
			shopping: () => new ShopScene(),
			'diet-agent': () => new DietScene(),
		},
	});
