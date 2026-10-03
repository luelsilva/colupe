//#region .svelte-kit/adapter-bun/manifest.js
const manifest = (() => {
	function __memo(fn) {
		let value;
		return () => value ??= value = fn();
	}
	return {
		appDir: "_app",
		appPath: "_app",
		assets: /* @__PURE__ */ new Set([
			"favicon.svg",
			"icon.png",
			"logo.png"
		]),
		mimeTypes: {
			".svg": "image/svg+xml",
			".png": "image/png"
		},
		_: {
			client: {
				start: "_app/immutable/entry/start.CAV7PWDC.js",
				app: "_app/immutable/entry/app.WPnfalhb.js",
				imports: [
					"_app/immutable/entry/start.CAV7PWDC.js",
					"_app/immutable/chunks/CNIWIAac.js",
					"_app/immutable/chunks/CkUIrX4F.js",
					"_app/immutable/entry/app.WPnfalhb.js",
					"_app/immutable/chunks/CkUIrX4F.js",
					"_app/immutable/chunks/xihTtKlq.js"
				],
				stylesheets: [],
				fonts: [],
				uses_env_dynamic_public: false
			},
			nodes: [
				__memo(() => import("./chunks/0-5dVUUov4.js")),
				__memo(() => import("./chunks/1-u0UsQCIc.js")),
				__memo(() => import("./chunks/2-CiOLHHvM.js")),
				__memo(() => import("./chunks/3-DQATfAvx.js")),
				__memo(() => import("./chunks/4-BoCC2CMm.js"))
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