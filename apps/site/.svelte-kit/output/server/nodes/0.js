

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.Bu-3tQ20.js","_app/immutable/chunks/CkUIrX4F.js","_app/immutable/chunks/xihTtKlq.js","_app/immutable/chunks/JzJcEW_V.js"];
export const stylesheets = ["_app/immutable/assets/0.BmKZSaCS.css"];
export const fonts = [];
