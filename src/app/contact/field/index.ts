import { ChapterField } from '@/app/components/field/ChapterField';
import { LetterScene } from './scenes/letter';
import { MailRouteScene } from './scenes/mailroute';
import { ConnectionsScene } from './scenes/connections';
import { TerminalScene } from './scenes/terminal';
import { CalendarScene } from './scenes/calendar';

export type { Draft } from './scenes/letter';
export { LetterScene };

/** The contact page's field: one scene per way of getting in touch, keyed by the chapter's data-scene */
export const createField = (canvas: HTMLCanvasElement, sections: HTMLElement[], onReady: () => void) =>
	new ChapterField(canvas, sections, {
		head: '.contact-chapter__body',
		onReady,
		scenes: {
			message: () => new LetterScene(),
			email: () => new MailRouteScene(),
			linkedin: () => new ConnectionsScene(),
			github: () => new TerminalScene(),
			call: () => new CalendarScene(),
		},
	});
