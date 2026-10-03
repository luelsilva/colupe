//#region .svelte-kit/adapter-bun/manifest.js
const manifest = (() => {
	function __memo(fn) {
		let value;
		return () => value ??= value = fn();
	}
	return {
		appDir: "_app",
		appPath: "_app",
		assets: /* @__PURE__ */ new Set(["favicon.svg"]),
		mimeTypes: { ".svg": "image/svg+xml" },
		_: {
			client: {
				start: "_app/immutable/entry/start.d_9TYJrR.js",
				app: "_app/immutable/entry/app.JeYRUMPJ.js",
				imports: [
					"_app/immutable/entry/start.d_9TYJrR.js",
					"_app/immutable/chunks/C8FBzN2w.js",
					"_app/immutable/chunks/B99_TmvJ.js",
					"_app/immutable/entry/app.JeYRUMPJ.js",
					"_app/immutable/chunks/B99_TmvJ.js",
					"_app/immutable/chunks/xihTtKlq.js"
				],
				stylesheets: [],
				fonts: [],
				uses_env_dynamic_public: false
			},
			nodes: [
				__memo(() => import("./chunks/0-Cyxmo80F.js")),
				__memo(() => import("./chunks/1-tmOhnzgd.js")),
				__memo(() => import("./chunks/2-t0rH3aBN.js")),
				__memo(() => import("./chunks/3-DDgFt3ve.js")),
				__memo(() => import("./chunks/4-DEklXuIN.js"))
			],
			remotes: {},
			routes: [
				{
					id: "/",
					pattern: /^\/$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 2
					},
					endpoint: null
				},
				{
					id: "/precos",
					pattern: /^\/precos\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 3
					},
					endpoint: null
				},
				{
					id: "/sobre",
					pattern: /^\/sobre\/?$/,
					params: [],
					page: {
						layouts: [0],
						errors: [1],
						leaf: 4
					},
					endpoint: null
				}
			],
			prerendered_routes: /* @__PURE__ */ new Set([]),
			matchers: async () => {
				return {};
			},
			server_assets: {}
		}
	};
})();
const prerendered = /* @__PURE__ */ new Set([]);
const base = "";
//#endregion
export { base, manifest, prerendered };

//# sourceMappingURL=manifest.js.map