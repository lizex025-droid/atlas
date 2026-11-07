import coverage from './content/book-coverage.json';

export function BookCoverage(){
 return <details className="book-audit">
  <summary>Rohen textbook integration</summary>
  <p>Each row has its own denominator. Concept, content and model totals describe the pages reviewed so far.</p>
  <div className="coverage-table-wrap"><table>
   <thead><tr><th>Measure</th><th>Progress</th><th>Scope</th></tr></thead>
   <tbody>{coverage.metrics.map(metric=><tr key={metric.label}>
    <th scope="row">{metric.label}</th>
    <td>{metric.done} / {metric.total}</td><td>{metric.scope}</td>
   </tr>)}</tbody>
  </table></div>
  <div className="coverage-table-wrap"><table>
   <thead><tr><th>Chapter</th><th>Anatomy pages visually audited</th></tr></thead>
   <tbody>{coverage.chapters.map(chapter=><tr key={chapter.chapter}>
    <th scope="row">{chapter.chapter}</th><td>{chapter.visuallyReviewed} / {chapter.anatomyPages}</td>
   </tr>)}</tbody>
  </table></div>
 </details>;
}
