

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.Dl7G50JL.js","_app/immutable/chunks/B99_TmvJ.js","_app/immutable/chunks/xihTtKlq.js"];
export const stylesheets = ["_app/immutable/assets/0.liF58aTM.css"];
export const fonts = [];
