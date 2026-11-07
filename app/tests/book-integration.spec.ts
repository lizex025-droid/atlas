import { expect, test } from '@playwright/test';

const humerus='FMA23130';
const greaterTubercle='feature:'+humerus+':greater-tubercle';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('anatomy-atlas.display.v1',JSON.stringify({quality:'low',reducedMotion:true})));
});

test('the right humerus plate is linked to the real bone, a surface point and a semantic-only groove',async({page})=>{
 await page.setViewportSize({width:1680,height:900});
 const errors:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/#workspace');
 await page.getByRole('button',{name:'Search',exact:true}).click();
 await page.getByRole('textbox',{name:'Search anatomy'}).fill(humerus);
 await page.locator('.search-result').filter({hasText:'Right humerus'}).first().click();
 await page.getByRole('button',{name:'Close Search'}).click();
 const title=page.locator('.structure-identity h1');
 const panel=page.getByRole('tabpanel');
 await expect(title).toHaveText('Right humerus');
 await expect(panel.getByRole('heading',{name:'Reading the humerus in three views'})).toBeAttached();
 await page.getByRole('tab',{name:'Parts',exact:true}).click();
 await panel.getByRole('button',{name:'Greater tubercle',exact:true}).click();
 await expect(title).toHaveText('Greater tubercle of right humerus');
 await expect(panel).toContainText('A reviewed representative point is available');
 await page.getByRole('tab',{name:'Sources',exact:true}).click();
 await expect(panel).toContainText('printed p. 373 (PDF p. 387), label 1');
 await panel.getByRole('button',{name:'Locate surface point'}).click();
 const explorer=page.getByRole('region',{name:'Bone landmark explorer'});
 await expect(explorer.getByRole('heading',{name:'Greater tubercle',exact:true})).toBeVisible();
 await expect(page.locator(`[data-landmark="${greaterTubercle}"]`)).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.landmark-marker')).toHaveCount(5);
 await page.screenshot({path:'test-results/book-right-humerus-landmarks.png'});

 await explorer.locator('.unmapped-landmarks summary').click();
 await explorer.getByRole('button',{name:/^Groove for ulnar nerve/}).click();
 await expect(explorer).toContainText('Position unverified');
 await expect(page.locator('.landmark-marker.selected')).toHaveCount(0);
 await explorer.getByRole('button',{name:'Open anatomical record'}).click();
 await expect(title).toHaveText('Groove for ulnar nerve of right humerus');
 await expect(panel.getByRole('button',{name:'Locate surface point'})).toHaveCount(0);
 await expect(panel).toContainText('behind the medial epicondyle');
 await expect(page.getByRole('button',{name:'Isolate',exact:true})).toBeDisabled();
 await page.getByRole('tab',{name:'Sources',exact:true}).click();
 await expect(panel).toContainText('printed p. 373 (PDF p. 387), label 21');
 expect(errors).toEqual([]);
});

test('the book coverage dashboard keeps page and geometry counts distinct on a phone',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 try{
  const page=await context.newPage();
  await page.goto('/#coverage');
  await page.getByText('Rohen textbook integration',{exact:true}).tap();
  const row=(label:string)=>page.getByRole('row').filter({has:page.getByRole('rowheader',{name:label,exact:true})});
  await expect(row('Physical pages inventoried')).toContainText('548 / 548');
  await expect(row('Anatomy pages visually audited')).toContainText('2 / 502');
  await expect(row('Landmarks with reviewed surface points')).toContainText('5 / 30');
  await expect(row('Full geometry validation passes')).toContainText('0 / 1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('.book-audit .coverage-table-wrap').first().evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:'test-results/book-coverage-mobile.png'});
 }finally{await context.close();}
});
