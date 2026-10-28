// Lets other homepage sections open a company's live diagram on a given question without
// sharing React state: the matching Systems section listens, selects the route and scrolls to it.

export const SHOW_ROUTE_EVENT = 'systems:show-route';

export type ShowRouteDetail = { graph: string; route: string };

export function showSystemRoute(graph: string, route: string) {
	window.dispatchEvent(new CustomEvent<ShowRouteDetail>(SHOW_ROUTE_EVENT, { detail: { graph, route } }));
}
