import { test, expect } from '@playwright/test';

test('touch-sized body-browser presets switch existing licensed anatomical layers and remain undoable', async ({page}) => {
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(() => localStorage.setItem('anatomy-atlas.display.v1', JSON.stringify({reducedMotion:true,quality:'low'})));
 await page.goto('/#workspace');
 const modes = page.getByRole('group',{name:'Anatomy view presets'});
 await expect(modes.getByRole('button',{name:'Show Skeleton'})).toHaveAttribute('aria-pressed','true');
 await modes.getByRole('button',{name:'Show Nerves'}).click();
 await expect(modes.getByRole('button',{name:'Show Nerves'})).toHaveAttribute('aria-pressed','true');
 await expect(modes.getByRole('button',{name:'Show Skeleton'})).toHaveAttribute('aria-pressed','false');
 await page.getByRole('button',{name:'Undo',exact:true}).click();
 await expect(modes.getByRole('button',{name:'Show Skeleton'})).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
