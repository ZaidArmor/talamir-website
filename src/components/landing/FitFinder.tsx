'use client';

import { useEffect, useRef, useState } from 'react';
import type { EcosystemEntity, LandingCopy } from '@/content/landing';
import type { Locale } from '@/content/types';
import { anchorFor } from './anchors';
import { useSelection } from './SelectionContext';
import { StatusBadge } from './StatusBadge';

/**
 * The four-question fit finder.
 *
 * Scoring is intentionally simple and intentionally *stated*: each of the first
 * three answers votes for the entity at the same index, the opening answer
 * counts double because it is the one describing who the visitor actually is,
 * and the final question only ever pushes toward the operating brand. That is
 * the whole model. It is guidance, and the disclaimer under the box says so.
 *
 * The result is announced through a live region and focus moves to it, so a
 * screen-reader user is not left on a button that has just been replaced.
 */
const RESULT_ORDER = ['vexora-erp', 'vexora-finance', 'sultan', 'car-care'];

export function FitFinder({
  locale,
  copy,
  entities,
}: {
  locale: Locale;
  copy: LandingCopy;
  entities: EcosystemEntity[];
}) {
  const { select } = useSelection();
  const [answers, setAnswers] = useState<number[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const step = answers.length;
  const finished = step >= copy.fit.questions.length;

  const score = () => {
    const totals: Record<string, number> = Object.fromEntries(RESULT_ORDER.map((id) => [id, 0]));
    answers.slice(0, 3).forEach((answer, index) => {
      const id = RESULT_ORDER[answer];
      if (id) totals[id] += index === 0 ? 2 : 1;
    });
    // "I need the service now" is decisive: it is the one answer that describes
    // a need no platform under development can meet.
    if (answers[3] === 3) totals['car-care'] += 2;

    return RESULT_ORDER.reduce(
      (best, id) => (totals[id] > totals[best] ? id : best),
      RESULT_ORDER[0],
    );
  };

  const winner = finished ? score() : null;
  const entity = winner ? entities.find((candidate) => candidate.id === winner) : undefined;

  useEffect(() => {
    if (!winner) return;
    select(winner);
    resultRef.current?.focus();
  }, [winner, select]);

  if (!finished || !entity || !winner) {
    const question = copy.fit.questions[step];
    return (
      <div className="lp-fit">
        <p className="lp-fit-steps lp-ltr">
          <span className="sr-only">{copy.fit.progressLabel} </span>
          {step + 1} / {copy.fit.questions.length}
        </p>
        <p className="lp-fit-q">{question.question}</p>
        <div className="lp-fit-opts">
          {question.options.map((option, index) => (
            <button
              key={option}
              type="button"
              className="lp-fit-opt"
              onClick={() => setAnswers((previous) => [...previous, index])}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const result = copy.fit.results[winner];

  return (
    <div className="lp-fit">
      <div className="lp-fit-result" ref={resultRef} tabIndex={-1} role="status" aria-live="polite">
        <span className="lp-endorse">{entity.endorsement[locale]}</span>
        <div className="lp-p-name lp-ltr">
          {entity.nameAr === entity.nameEn ? entity.nameEn : `${entity.nameEn} · ${entity.nameAr}`}
        </div>
        <StatusBadge entity={entity} locale={locale} />

        <h3>{copy.fit.whyTitle}</h3>
        <p>{result?.why}</p>

        <h3>{copy.fit.benefitsTitle}</h3>
        <ul>{result?.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>

        <h3>{copy.fit.statusTitle}</h3>
        <p>{entity.statusLabel[locale]}</p>

        <div>
          <a href={`#${anchorFor(entity.id)}`} className="lp-btn lp-btn-primary">
            {entity.cta[locale]}
          </a>
        </div>
        <button type="button" className="lp-fit-restart" onClick={() => setAnswers([])}>
          {copy.fit.restart}
        </button>
      </div>
    </div>
  );
}
