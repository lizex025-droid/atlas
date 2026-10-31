import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe,expect,it } from 'vitest';
import { atlasCards,atlasSections } from './atlasCatalog';
import { anatomy,byId } from './anatomy';
import { groups,knownId,systemFor } from './registry';
import { quizQuestions } from './IdentificationQuiz';
import { decodeScenes } from './scene';
import { workspaceInitial,frame } from './workspace';
describe('atlas entry catalogue and practice data',()=>{
 it('covers every installed surface exactly once, including unclassified entries',()=>{const ids=atlasCards.flatMap(c=>c.members);expect(ids.length).toBe(anatomy.length);expect(new Set(ids).size).toBe(anatomy.length);expect(atlasSections).toHaveLength(13);});
 it('registers persistent region groups with real canonical mesh IDs',()=>{for(const c of atlasCards){expect(knownId(c.id)).toBe(true);expect(groups.get(c.id)?.members).toEqual(c.members);expect(c.members.every(id=>byId.has(id))).toBe(true);expect(frame(c.members,workspaceInitial().camera).position.every(Number.isFinite)).toBe(true);}});
 it('retains new group views through the existing saved-scene validator',()=>{const c=atlasCards[0];const state={...workspaceInitial(),id:'atlas-view',date:'2026-10-31',name:'Atlas region',groupId:c.id,selectedIds:c.members};expect(decodeScenes(JSON.stringify([state]))).toHaveLength(1);});
 it('does not misclassify named thyroid muscles or arteries as endocrine glands',()=>{expect(systemFor('FMA46614')).toBe('Muscular');expect(systemFor('FMA10680')).toBe('Arterial');});
 it('binds every generated preview to its licensed mesh IDs and verifies image hashes',()=>{const manifest=JSON.parse(readFileSync(new URL('../public/previews/manifest.json',import.meta.url),'utf8'));for(const card of atlasCards){const image=manifest.previews.find((p:{id:string})=>p.id===card.id);expect(image.members).toEqual(card.members);const bytes=readFileSync(new URL('../public'+card.preview,import.meta.url));expect(createHash('sha256').update(bytes).digest('hex')).toBe(image.sha256);}});
 it('uses actual source names as quiz answers with four distinct choices',()=>{for(const q of quizQuestions){expect(byId.has(q.id)).toBe(true);expect(q.options).toContain(byId.get(q.id)!.name);expect(new Set(q.options).size).toBe(4);}});
});
