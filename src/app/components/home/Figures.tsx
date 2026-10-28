// Results stated on the resume (resources/consts.ts); nothing here is rounded up or added
const rows = [
	{ value: '70%', text: 'less time spent on supply-chain reporting with the agentic platform at Twisted X.' },
	{ value: '15%', text: 'better order fulfillment from the same platform.' },
	{ value: '11–21%', text: 'forecast error across SKUs with a fine-tuned TimesFM model, down from 24–31% with rolling 12-month averages.' },
	{ value: '40%', text: 'lower retrieval latency for the MCP tool-calling agents over NetSuite.' },
	{ value: '500 GB', text: 'of data a day through the Spark and Kafka pipelines I built at HCL Technologies.' },
];

// Forecast error (WAPE) ranges on one 0–35% axis: the baseline in grey, the change in the accent
const AXIS_MAX = 35;
const ranges = [
	{ name: 'Rolling 12-month average', from: 24, to: 31, emphasis: false },
	{ name: 'Fine-tuned TimesFM', from: 11, to: 21, emphasis: true },
];
const ticks = [0, 10, 20, 30];
const pct = (v: number) => `${(v / AXIS_MAX) * 100}%`;

export function Figures() {
	return (
		<section className="figures" data-chapter="base" aria-labelledby="figures-title">
			<div className="figures__list">
				<h2 id="figures-title" className="section-title" data-reveal>What changed</h2>
				<dl className="figures__rows">
					{rows.map((row, i) => (
						<div key={row.value} className="figure-row" data-reveal style={{ '--i': i } as React.CSSProperties}>
							<dt className="figure-row__value">{row.value}</dt>
							<dd className="figure-row__text">{row.text}</dd>
						</div>
					))}
				</dl>
			</div>

			<figure className="forecast" data-reveal style={{ '--i': 2 } as React.CSSProperties}>
				<figcaption className="forecast__title">Forecast error across SKUs, as WAPE. Lower is better.</figcaption>
				<div className="forecast__plot" role="img" aria-label="Forecast error fell from 24 to 31 percent with rolling 12-month averages to 11 to 21 percent with fine-tuned TimesFM.">
					{ranges.map((r) => (
						<div key={r.name} className={`forecast__row${r.emphasis ? ' is-emphasis' : ''}`}>
							<span className="forecast__name">{r.name}</span>
							<span className="forecast__track">
								<span
									className="forecast__range"
									style={{ left: pct(r.from), width: pct(r.to - r.from) }}
									tabIndex={0}
									data-tip={`${r.name}: ${r.from}–${r.to}%`}
								/>
								<span className="forecast__value" style={{ left: `calc(${pct(r.to)} + 8px)` }}>
									{r.from}–{r.to}%
								</span>
							</span>
						</div>
					))}
					<div className="forecast__axis" aria-hidden="true">
						{ticks.map((t) => (
							<span key={t} style={{ left: pct(t) }}>{t}%</span>
						))}
					</div>
				</div>
				<table className="ds-visually-hidden">
					<caption>Forecast error (WAPE) across SKUs</caption>
					<thead>
						<tr><th scope="col">Method</th><th scope="col">Low</th><th scope="col">High</th></tr>
					</thead>
					<tbody>
						{ranges.map((r) => (
							<tr key={r.name}><th scope="row">{r.name}</th><td>{r.from}%</td><td>{r.to}%</td></tr>
						))}
					</tbody>
				</table>
			</figure>
		</section>
	);
}
