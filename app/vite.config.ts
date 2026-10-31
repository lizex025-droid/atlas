import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],optimizeDeps:{entries:['index.html']},build:{rollupOptions:{output:{onlyExplicitManualChunks:true,manualChunks(id){
 if(id.endsWith('/catalog.json'))return 'anatomy-catalog';
 if(id.includes('node_modules/three/')||id.includes('node_modules/three-stdlib/')||id.includes('node_modules/@react-three/')||id.includes('node_modules/three-mesh-bvh/'))return 'graphics';
}}}}});
