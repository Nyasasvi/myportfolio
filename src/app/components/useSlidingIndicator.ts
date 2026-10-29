'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * Slides a segmented control's highlight from the old choice to the new one. Each active button
 * renders its own `.ds-segmented__indicator`; when the choice changes, the new one starts where the
 * last one was and eases into place (a FLIP with the Web Animations API, no animation library).
 */
export function useSlidingIndicator(group: RefObject<HTMLElement>, active: string) {
	const last = useRef<DOMRect | null>(null);

	useLayoutEffect(() => {
		const bar = group.current?.querySelector<HTMLElement>('.ds-segmented__indicator');
		if (!bar) return;
		const now = bar.getBoundingClientRect();
		const prev = last.current;
		last.current = now;
		if (!prev || !now.width || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const dx = prev.left - now.left;
		const dy = prev.top - now.top;
		const sx = prev.width / now.width;
		if (!dx && !dy && sx === 1) return;
		bar.animate(
			[
				{ transformOrigin: 'left top', transform: `translate(${dx}px, ${dy}px) scaleX(${sx})` },
				{ transformOrigin: 'left top', transform: 'none' },
			],
			{ duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
		);
	}, [group, active]);
}
