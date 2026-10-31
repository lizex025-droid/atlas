# AnatomyAtlas dark workspace design system

## Surface landmark study

The two additional AnatomyLearning screenshots (143414 and 143424) were opened visually. They informed the large isolated bone, centered floating Bony Markings heading, small category-colored circles and restrained detail controls. All icons, controls and point data are original or independently licensed; no reference image, watermark, texture or locking overlay is distributed.

Study mode collapses the persistent left panel and uses a compact right floating panel. Marker colors are defined once in landmarkCategories: soft white/cream for surfaces/body, warm yellow/orange for projections and muted brown for depressions/attachments. Points have thin outlines, hover labels, a turquoise selected state and visible keyboard focus. The normal workspace remains available. Rendering uses the existing reduced-resolution licensed geometry/materials; high-resolution textured reference fidelity is not claimed.

## v0.4 information-panel refinement

All six additional images in `C:\Users\User\Pictures\ANATOMY` were opened visually: Description 074015, Parts 074408, Surfaces 074426, Landmarks 074441, Cross-Sections 074502 and model categories 074530. They informed the information hierarchy; no reference artwork or protected text is shipped.

The stable narrow panel now has an English/Latin pronunciation row, disclosed IPA source/status, horizontally scrolling category tabs with Previous/More controls, and a separately scrolling long-form content area. Tab or identity changes reset content scroll. Features have original line glyphs and an explicit unavailable-segmentation notice instead of fabricated thumbnails. Sources, missing fields and review notes remain readable within the panel. Added tokens/styles are in `app/src/knowledge.css`; desktop QA uses 1680×900.

References: all seven supplied screenshots were opened visually. The proposed references folder was absent; source images were inspected at their exact Pictures/Screenshots paths. Screenshots are design references, not distributed assets. Original icons use Lucide; no proprietary branding, icons, thumbnails or prose are copied.

Tokens in app/src/styles.css: viewport #10141B, panel #11151C, header #242025, secondary surface #191E26, text #F3F5F7, muted #A0A7B1, border #303641, selection #74DC92, accent #45D6CD. One-pixel separators, minimal corner rounding, restrained state color and no decorative gradients or dashboard cards. System Segoe UI/Arial fallbacks render offline; no remote fonts are required.

Desktop geometry: 34px brand bar, 54px hierarchy bar, 284px persistent information panel, 80px right tool rail, 88px system strip and 24px status line. At 1850px+ the panel/rail grow to 292/88px. The viewport fills the remaining rectangle and does not resize when tool drawers open. The panel can collapse without remounting the scene. Under 760px information is an overlay and the systems strip scrolls horizontally.

Type: 25–27px structure heading; 12–13px anatomical prose; 10px section headings; 8–10px action/status labels. Names wrap, hierarchy names scroll horizontally, tabs use native horizontal scrolling, and content owns its vertical scroll. The Larger information text setting increases facts to 14px.

Focus uses a turquoise 2px outline. Hover changes surface/text subtly. Active tabs and systems have a narrow accent indicator. Missing content uses a plain unavailable state with no fabricated description or thumbnail. Green geometry identifies selection; visibility/transparency remain separate states. Reduced-motion preferences suppress camera interpolation and CSS transitions.

## Atlas entrance and collection

All twelve ANARUNY screenshots were opened visually. The entrance follows their broad 2:1:1 composition: large exploration tile, tall practice tile and two stacked study tiles. A 74px left rail, 64px header, #1B2328 surface, fine separators and translucent captions continue into centred system sections. Icons and wording are original; lock overlays and proprietary images are absent.

At 1680x900 collection cards are 270px square, centred in rows of up to four. Smaller screens use two columns and a vertically scrolling entrance. The 32 preview images are original renders of licensed local meshes, with canonical members/hashes/rights in public/previews/manifest.json. These anatomy-entry cards are separate from the restrained card-free workspace; source-surface fidelity remains limited.
