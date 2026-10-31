# Interactive bone-landmark verification — 2026-10-31

## Delivered and inspected

The feature runs inside the existing AnatomyAtlas app. Both new reference images (143414 and 143424) were visually opened. Eight original orthogonal/oblique T7 views were reviewed, including annotated versions, against the actual licensed mesh. No reference-site geometry, marker data, textures or text was copied.

T7 FMA9968 has six gross surface anchors: anterior body, superior/inferior bony endplates, spinous tip and bilateral transverse-process ends. They are representative surface points on anatomical regions, not segmented region masks or attachment footprints. Twenty-three other T7 identities are explicitly unmapped or non-surface. The full 206-reference inventory is present; 199 reference bones have installed source mappings and one has reviewed anchor positions. Independent anatomical approval remains pending.

## Executed checks and run boundaries

- **51/51 unit checks** passed across six files on the final code. Tests include all previous suites plus actual indexed-triangle membership, barycentric contact, exact source SHA-256, sidedness, local/world transforms with nonuniform scale, invalid bindings, honest 206 coverage, optional v2 scene metadata and preservation of bone opacity in every study context.
- **20/20 browser workflows** passed in one combined run, with no skipped, unexpected or flaky cases. Duration: 268.156 seconds. Evidence: `app/test-results-landmarks-acceptance/.last-run.json` and [summary](app/test-results/landmarks-acceptance-summary.json). This run preceded the final opacity/binding hardening.
- **6/6 targeted landmark browser workflows** passed after that final hardening (1.3 minutes), including a new rendered-image comparison for selected-bone opacity. The other cases cover real marker clicks, tooltip/selection/focus, hide/show, category filtering, unverified spaces, 206 coverage, actual raycast bone entry, orbit/occlusion, saved transformed scenes, mobile panel collapse, section clipping and mismatched-model rejection/retry. Evidence: `app/test-results-landmarks-final/.last-run.json`. This is not a claim of a separate 21-case combined run.
- **Production build** passed on final code: 2,175 modules; app module 422.84 KB (67.20 KB gzip), deferred Viewer 7.65 KB (3.61 gzip), graphics 941.71 KB (254.89 gzip), catalogue 977.84 KB (113.10 gzip), CSS 36.99 KB (8.53 gzip). Existing large-chunk advisories remain. No physical-GPU throughput guarantee is claimed.
- **Landmark audit** passed with zero errors. It binds the six points to the actual model digest and rendered triangles; outputs are in `app/public/landmarks/coverage.json`, LANDMARK_COVERAGE_REPORT.md and LANDMARK_PROGRESS.json.
- **Final compiled-app traversal** passed at 12:58:54 UTC: workspace → T7 → real licensed GLB → six surface markers → body selection → superior endplate → portrait whole-bone/collapsed controls. Zero page errors and zero failed HTTP responses. [Machine result](app/test-results/landmarks-production-verification.json). Reduced motion/software rendering were used for deterministic QA; physical-GPU frame rate and smooth-transition timing were not benchmarked.

The earlier interrupted browser round had screenshot/loading timeouts; both local servers were subsequently found stopped. They were restarted before the successful combined acceptance run. Those interrupted results are not reported as passes. The first orbit test also incorrectly searched only accessible visible controls after a marker became occluded; checking its actual hidden/projected state corrected that test without disabling occlusion.

## Visual evidence

- [T7 overview](app/test-results/landmarks-t7-overview.png)
- [Selected surface point](app/test-results/landmarks-t7-selected.png)
- [Posterior view](app/test-results/landmarks-t7-posterior.png) and [orbit](app/test-results/landmarks-t7-orbit.png)
- [Unmapped/non-surface detail](app/test-results/landmarks-t7-unmapped.png)
- [Restored transform](app/test-results/landmarks-restored-transform.png) and [opacity](app/test-results/landmarks-opacity.png)
- [Compiled app](app/test-results/landmarks-production.png) and [superior endplate](app/test-results/landmarks-production-superior.png)
- [Portrait](app/test-results/landmarks-production-mobile.png) and [collapsed portrait controls](app/test-results/landmarks-production-mobile-compact.png)

Visual review increased bone study framing, separated the floating heading from anatomy, added portrait projection fitting and collapsible details, and made hidden information controls inert. Marker colors/outlines, selected state and labels remain legible against the dark workspace. Available geometry is visibly polygon-reduced; reference-level textures/fine anatomical surface fidelity are not delivered.

## Remaining acceptance limits

No complete 206-bone mapping, independent medical validation, fine facet/notch segmentation, real cartilage layers or attachment footprints are claimed. Gross-feature review against this mesh does not prove clinical/anatomical accuracy across variations. Continue through the persistent manifest and mapping workflow before marking any additional point reviewed.
