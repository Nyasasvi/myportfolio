import { ChapterField } from '@/app/components/field/ChapterField';
import { NetworkScene } from './scenes/network';
import { CodeScene } from './scenes/code';
import { ServicesScene } from './scenes/services';
import { LayoutScene } from './scenes/layout';
import { ContainersScene } from './scenes/containers';
import { TableScene } from './scenes/table';
import { CommitsScene } from './scenes/commits';

/** The skills page's field: one scene per skill group, keyed by the chapter's data-scene */
export const createField = (canvas: HTMLCanvasElement, sections: HTMLElement[], onReady: () => void) =>
	new ChapterField(canvas, sections, {
		head: '.skills-chapter__head',
		onReady,
		scenes: {
			aiml: () => new NetworkScene(),
			languages: () => new CodeScene(),
			backend: () => new ServicesScene(),
			frontend: () => new LayoutScene(),
			cloud: () => new ContainersScene(),
			database: () => new TableScene(),
			tools: () => new CommitsScene(),
		},
	});
