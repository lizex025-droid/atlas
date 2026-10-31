import { byId } from './anatomy';
export const bodySystems=['Skeletal','Connective Tissue','Muscular','Arterial','Venous','Lymphatic','Nervous','Respiratory','Digestive','Endocrine','Urogenital','Integumentary'] as const;
export type BodySystem=typeof bodySystems[number];
export function systemFor(id:string):BodySystem|null {
 if(id==='TA2:2549')return 'Connective Tissue';
 const s=byId.get(id);if(!s)return null;const name=s.name.toLowerCase();
 if(/cartilage|disk|ligament|fascia|retinaculum|tendon|iliotibial/.test(name))return 'Connective Tissue';
 if(/skin|hair/.test(name))return 'Integumentary';
 if(/thyroid|adrenal|pituitary|thymus/.test(name)&&s.system!=='Muscular'&&s.system!=='Cardiovascular')return 'Endocrine';
 if(/lymph/.test(name))return 'Lymphatic';
 if(s.system==='Cardiovascular'){if(/vein|venous|vena|coronary sinus/.test(name))return 'Venous';if(/artery|arterial|aorta|pulmonary trunk/.test(name))return 'Arterial';return null;}
 if(s.system==='Urinary'||s.system==='Reproductive'||/prostate|testis|urethra/.test(name))return 'Urogenital';
 return bodySystems.includes(s.system as BodySystem)?s.system as BodySystem:null;
}
