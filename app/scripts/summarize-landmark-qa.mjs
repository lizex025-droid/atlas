import { readFile,writeFile } from 'node:fs/promises';
const bytes=await readFile('test-results/landmarks-acceptance.log');
const text=bytes.toString(bytes[0]===255&&bytes[1]===254?'utf16le':'utf8').replace(/^\uFEFF/,'');
const start=text.search(/\{\s*"config"\s*:/);if(start<0)throw new Error('No complete Playwright report');
const report=JSON.parse(text.slice(start));
const summary={run:'20-workflow combined acceptance before final opacity/binding hardening',stats:report.stats,errors:report.errors,reportSource:'test-results/landmarks-acceptance.log'};
await writeFile('test-results/landmarks-acceptance-summary.json',JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
