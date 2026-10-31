import { test,expect } from '@playwright/test';
import type { Page } from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('anatomy-atlas.display.v1',JSON.stringify({reducedMotion:true,quality:'low'})));});
async function ready(page:Page){await expect.poll(()=>page.getByTestId('model-loading').evaluate(el=>Number(el.getAttribute('data-total'))>0&&el.getAttribute('data-total')===el.getAttribute('data-loaded')&&el.getAttribute('data-total')===el.getAttribute('data-expected')),{timeout:60000}).toBe(true);}
async function search(page:Page,query:string,name:string){await page.getByRole('button',{name:'Search',exact:true}).click();await page.getByRole('textbox',{name:'Search anatomy'}).fill(query);await page.locator('.search-result').filter({hasText:name}).first().click();await page.getByRole('button',{name:'Close Search'}).click();}
test('study flow: real selection, isolate, opacity, notes and saved scene restoration',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#workspace');await ready(page);
 const box=await page.locator('canvas').boundingBox();await page.locator('canvas').click({position:{x:box!.width/2,y:box!.height*.13}});await expect(page.locator('.structure-identity h1')).not.toHaveText('Explore thehuman body.');
 await search(page,'FMA24474','Right femur');await expect(page.locator('.structure-identity h1')).toHaveText('Right femur');
 await page.getByRole('button',{name:'Isolate',exact:true}).click();await expect(page.getByText(/^1 \/ \d+ visible$/)).toBeVisible();
 await page.getByRole('button',{name:'Tools',exact:true}).click();await page.getByRole('slider',{name:'Structure opacity'}).fill('0.5');
 await page.getByRole('textbox',{name:'Annotation text'}).fill('My anatomical study note');await page.getByRole('button',{name:'Add annotation'}).click();await expect(page.locator('.note')).toContainText('My anatomical study note');
 await page.getByRole('button',{name:'Focus selection',exact:true}).last().click();await page.getByRole('button',{name:'Save Scene',exact:true}).click();
 await page.getByRole('textbox',{name:'Scene name'}).fill('Femur study');await page.getByRole('button',{name:'Save current scene'}).click();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('anatomy-atlas.scenes.v2')!)[0]);expect(stored.selected).toBe('FMA24474');expect(stored.opacity.FMA24474).toBe(.5);expect(stored.annotations[0].text).toBe('My anatomical study note');expect(stored.camera.target[1]).toBeLessThan(0);
 await page.getByRole('button',{name:'Reset workspace',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Library',exact:true}).click();await page.locator('.saved-scene').getByRole('button',{name:/^Femur study/}).click();
 await expect(page.locator('.structure-identity h1')).toHaveText('Right femur');await page.getByRole('button',{name:'Tools',exact:true}).click();await expect(page.locator('.note')).toContainText('My anatomical study note');await expect(page.getByRole('slider',{name:'Structure opacity'})).toHaveValue('0.5');await ready(page);
 await page.screenshot({path:'test-results/dark-saved-scene.png',fullPage:true});expect(errors).toEqual([]);
});
test('small screen, no-results and corrupt storage recovery',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/#workspace');await page.evaluate(()=>localStorage.setItem('anatomy-atlas.scenes.v2','bad json'));await page.reload();
 await page.getByRole('button',{name:'Search',exact:true}).click();await page.getByRole('textbox',{name:'Search anatomy'}).fill('nonexistent');await expect(page.getByText(/No structures found/)).toBeVisible();
 await page.getByRole('textbox',{name:'Search anatomy'}).fill('T11');await expect(page.locator('.search-result').filter({hasText:'Eleventh thoracic vertebra'})).toBeVisible();await page.getByRole('button',{name:'Close Search'}).click();
 await page.getByRole('button',{name:'Collapse information panel'}).click();await ready(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/dark-mobile.png',fullPage:true});
});
test('skeletal and muscular layers load progressively; failed chunks can retry',async({page})=>{
 const requests:string[]=[];let fail=true;page.on('request',r=>{if(r.url().endsWith('.glb'))requests.push(r.url());});
 await page.route('**/models/bodyparts3d/*.glb',route=>fail&&route.request().url().includes('skeletal-head-neck-0')?route.fulfill({status:503,body:'Temporary failure'}):route.continue());
 await page.goto('/#workspace');await expect(page.getByRole('alert')).toContainText('Model loading failed',{timeout:60000});fail=false;await page.getByRole('button',{name:'Retry models'}).click();await ready(page);expect(requests.every(u=>u.includes('/skeletal-'))).toBe(true);
 const count=requests.length;await page.getByRole('button',{name:'Layer Muscular',exact:true}).click();await ready(page);expect(requests.slice(count).some(u=>u.includes('/muscular-'))).toBe(true);await expect(page.getByRole('button',{name:'Layer Muscular',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.screenshot({path:'test-results/dark-muscular.png',fullPage:true});await page.getByRole('button',{name:'Layer Skeletal',exact:true}).click();await ready(page);await expect(page.getByRole('button',{name:'Layer Skeletal',exact:true})).toHaveAttribute('aria-pressed','false');
});
test('T11 selection, context tabs, source facts and group breadcrumbs stay coordinated',async({page})=>{
 await page.setViewportSize({width:1680,height:900});await page.goto('/#workspace');await ready(page);await page.screenshot({path:'test-results/qa-initial.png',fullPage:true});
 await search(page,'T11','Eleventh thoracic vertebra');await expect(page.locator('.structure-identity h1')).toHaveText('Eleventh thoracic vertebra');await expect(page.getByText('Vertebra thoracica XI',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Isolate',exact:true}).click();await page.getByRole('button',{name:'Focus selection',exact:true}).first().click();await ready(page);
 await expect.poll(()=>page.locator('.model-label').evaluate(el=>el.getBoundingClientRect().width)).toBeLessThan(220);await page.screenshot({path:'test-results/qa-t11-description.png',fullPage:true});
 await page.getByRole('tab',{name:'Parts',exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('Vertebral body');await page.screenshot({path:'test-results/qa-t11-parts.png',fullPage:true});
 await page.getByRole('tab',{name:'Landmarks',exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('Pedicles');await page.screenshot({path:'test-results/qa-t11-landmarks.png',fullPage:true});
 await page.getByRole('tab',{name:'Surfaces',exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('Costal facets');
 await page.getByRole('navigation',{name:'Anatomical hierarchy'}).getByRole('button',{name:'Thoracic vertebrae',exact:true}).click();await expect(page.locator('.structure-identity h1')).toHaveText('Thoracic vertebrae');await expect(page.getByText(/mapped structures/)).toBeVisible();
});
test('palmar aponeurosis selection replaces T11 facts; missing medical data stays explicit',async({page})=>{
 await page.setViewportSize({width:1680,height:900});await page.goto('/#workspace');await search(page,'T11','Eleventh thoracic vertebra');await page.getByRole('tab',{name:'Landmarks',exact:true}).click();
 await search(page,'aponeurosis palmaris','Palmar aponeurosis');await expect(page.locator('.structure-identity h1')).toContainText('Palmar aponeurosis');await expect(page.getByRole('tab',{name:'Description',exact:true})).toHaveAttribute('aria-selected','true');await expect(page.getByRole('tabpanel')).not.toContainText('Pedicles');await expect(page.getByRole('tabpanel')).toContainText('palmaris longus');
 await page.getByRole('button',{name:'Isolate',exact:true}).click();await page.getByRole('button',{name:'Focus selection',exact:true}).first().click();await ready(page);await expect(page.getByRole('alert')).toHaveCount(0);await page.getByRole('tab',{name:'Relations',exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('antebrachial');await page.screenshot({path:'test-results/qa-palmar-relations.png',fullPage:true});
 await page.getByRole('tab',{name:'Clinical',exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('Dupuytren');
 await search(page,'FMA24474','Right femur');await expect(page.getByRole('tabpanel')).toContainText('No verified anatomical description');await expect(page.locator('.structure-identity')).toContainText('Latin terminology not yet verified');
});
test('search, visibility actions, undo, settings and drawer layout work',async({page})=>{
 await page.setViewportSize({width:1680,height:900});await page.goto('/#workspace');await ready(page);await page.getByRole('button',{name:'Search',exact:true}).click();await page.getByRole('textbox',{name:'Search anatomy'}).fill('vertebra');await expect(page.locator('.result-caption')).toContainText('matching entries');await page.screenshot({path:'test-results/qa-search.png',fullPage:true});
 await page.getByRole('textbox',{name:'Search anatomy'}).fill('T11');await page.locator('.search-result').filter({hasText:'Eleventh thoracic vertebra'}).first().click();await page.getByRole('button',{name:'Close Search'}).click();
 await page.getByRole('button',{name:'Fade others',exact:true}).click();await page.getByRole('button',{name:'Hide',exact:true}).click();await expect(page.locator('.structure-identity h1')).toContainText('Explore');await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.locator('.structure-identity h1')).toHaveText('Eleventh thoracic vertebra');
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('checkbox',{name:'Higher contrast'}).check();await expect(page.locator('.anatomy-workspace')).toHaveAttribute('data-contrast','true');await page.getByRole('button',{name:'Close Settings'}).click();
 const viewport=await page.locator('.anatomy-viewport').boundingBox();await page.getByRole('button',{name:'Library',exact:true}).click();expect(await page.locator('.anatomy-viewport').boundingBox()).toEqual(viewport);
});

test('orbit, zoom and pan alter the camera saved by the real viewport',async({page})=>{
 await page.goto('/#workspace');await ready(page);
 async function capture(name:string){await page.getByRole('button',{name:'Save Scene',exact:true}).click();await page.getByRole('textbox',{name:'Scene name'}).fill(name);await page.getByRole('button',{name:'Save current scene'}).click();const camera=await page.evaluate(()=>JSON.parse(localStorage.getItem('anatomy-atlas.scenes.v2')!).at(-1).camera);await page.getByRole('button',{name:'Close Library'}).click();return camera;}
 const first=await capture('Initial camera');const b=(await page.locator('canvas').boundingBox())!;const x=b.x+b.width*.45,y=b.y+b.height*.5;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+100,y+40,{steps:12});await page.mouse.up();const orbit=await capture('Orbit camera');expect(orbit.position).not.toEqual(first.position);
 await page.mouse.move(x,y);await page.mouse.wheel(0,-260);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const zoom=await capture('Zoom camera');const distance=(c:{position:number[];target:number[]})=>Math.hypot(...c.position.map((n,i)=>n-c.target[i]));expect(distance(zoom)).toBeLessThan(distance(orbit));
 await page.mouse.move(x,y);await page.mouse.down({button:'right'});await page.mouse.move(x+80,y,{steps:10});await page.mouse.up({button:'right'});const pan=await capture('Pan camera');expect(pan.target).not.toEqual(zoom.target);
});
