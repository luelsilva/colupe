import { $ as render, A as get_render_context, B as internal_set, C as experimental_async_required, Ct as is_valid_array_len, D as getContext, Dt as valid_array_indices, E as getAllContexts, Et as uneval, F as hydrating, G as move_effect, H as is_passive_event, I as hydration_failed, J as noop$1, K as mutable_source, L as hydration_mismatch, M as hydratable_serialization_failed, N as hydrate_next, O as get_first_child, P as hydrate_node, Q as queue_micro_task, R as increment, St as is_valid_array_index, T as get, Tt as stringify_string, U as lifecycle_function_unavailable, V as invoke_error_boundary, W as mark_as_component, X as pop$1, Y as pause_effect, Z as push$1, _ as defer_effect, _t as MAX_ARRAY_INDEX, a as LEGACY_PROPS, at as set_active_effect, b as destroy_effect, bt as is_buffer, c as array_from, ct as set_hydrate_node, d as clear_text_content, dt as source, et as render_effect, f as component_context, ft as ssr_context, g as current_batch, gt as DevalueError, h as create_text, ht as untrack, i as HYDRATION_ERROR, it as setContext, j as hasContext, k as get_next_sibling, l as block, lt as set_hydrating, m as createContext, mt as svelte_boundary_reset_onerror, n as EFFECT_PRESERVED, nt as safe_not_equal, o as active_effect, ot as set_active_reaction, p as component_root, pt as svelte_boundary_reset_noop, q as next, r as EFFECT_TRANSPARENT, rt as set, s as active_reaction, st as set_component_context, t as Batch, tt as run$1, u as branch, ut as skip_nodes, v as define_property, vt as enumerable_symbols, w as flushSync, wt as stringify_key, x as effect_tracking, xt as is_plain_object, y as derived, yt as get_type, z as init_operations } from "./server-Nzd3og9_.js";
//#region .svelte-kit/adapter-bun/chunks/internal2.js
var base = "";
var assets = base;
var app_dir = "_app";
var initial = {
	base,
	assets
};
initial.base;
/**
* @param {{ base: string, assets: string }} paths
*/
function override(paths) {
	base = paths.base;
	assets = paths.assets;
}
function reset() {
	base = initial.base;
	assets = initial.assets;
}
//#endregion
//#region .svelte-kit/adapter-bun/chunks/internal.js
var __defProp = Object.defineProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
/**
* `$env/dynamic/public`
* @type {Record<string, string>}
*/
var public_env = {};
/** @type {(environment: Record<string, string>) => void} */
function set_private_env(environment) {}
/** @type {(environment: Record<string, string>) => void} */
function set_public_env(environment) {
	public_env = environment;
}
var read_implementation = null;
function set_read_implementation(fn) {
	read_implementation = fn;
}
function set_manifest(_) {}
/**
* Used on elements, as a map of event type -> event handler,
* and on events themselves to track which element handled an event
*/
var event_symbol = Symbol("events");
/** @type {Set<string>} */
var all_registered_events = /* @__PURE__ */ new Set();
/** @type {Set<(events: Array<string>) => void>} */
var root_event_handles = /* @__PURE__ */ new Set();
var last_propagated_event = null;
var last_propagated_event_clear_scheduled = false;
/**
* @this {EventTarget}
* @param {Event} event
* @returns {void}
*/
function handle_event_propagation(event) {
	var handler_element = this;
	var owner_document = handler_element.ownerDocument;
	var event_name = event.type;
	var path = event.composedPath?.() || [];
	var current_target = path[0] || event.target;
	last_propagated_event = event;
	if (!last_propagated_event_clear_scheduled) {
		last_propagated_event_clear_scheduled = true;
		setTimeout(() => {
			last_propagated_event_clear_scheduled = false;
			last_propagated_event = null;
		});
	}
	var path_idx = 0;
	var handled_at = last_propagated_event === event && event[event_symbol];
	if (handled_at) {
		var at_idx = path.indexOf(handled_at);
		if (at_idx !== -1 && (handler_element === document || handler_element === window)) {
			event[event_symbol] = handler_element;
			return;
		}
		var handler_idx = path.indexOf(handler_element);
		if (handler_idx === -1) return;
		if (at_idx <= handler_idx) path_idx = at_idx;
	}
	current_target = path[path_idx] || event.target;
	if (current_target === handler_element) return;
	define_property(event, "currentTarget", {
		configurable: true,
		get() {
			return current_target || owner_document;
		}
	});
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		/**
		* @type {unknown}
		*/
		var throw_error;
		/**
		* @type {unknown[]}
		*/
		var other_errors = [];
		while (current_target !== null) {
			if (current_target === handler_element) break;
			try {
				var delegated = current_target[event_symbol]?.[event_name];
				if (delegated != null && (!current_target.disabled || event.target === current_target)) delegated.call(current_target, event);
			} catch (error) {
				if (throw_error) other_errors.push(error);
				else throw_error = error;
			}
			if (event.cancelBubble) break;
			path_idx++;
			current_target = path_idx < path.length ? path[path_idx] : null;
		}
		if (throw_error) {
			for (let error of other_errors) queueMicrotask(() => {
				throw error;
			});
			throw throw_error;
		}
	} finally {
		event[event_symbol] = handler_element;
		delete event.currentTarget;
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
globalThis?.window?.trustedTypes;
/**
* @param {TemplateNode} start
* @param {TemplateNode | null} end
*/
function assign_nodes(start, end) {
	var effect = active_effect;
	if (effect.nodes === null) effect.nodes = {
		start,
		end,
		a: null,
		t: null
	};
}
/**
* Returns a `subscribe` function that integrates external event-based systems with Svelte's reactivity.
* It's particularly useful for integrating with web APIs like `MediaQuery`, `IntersectionObserver`, or `WebSocket`.
*
* If `subscribe` is called inside an effect (including indirectly, for example inside a getter),
* the `start` callback will be called with an `update` function. Whenever `update` is called, the effect re-runs.
*
* If `start` returns a cleanup function, it will be called when the effect is destroyed.
*
* If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
* are active, and the returned teardown function will only be called when all effects are destroyed.
*
* It's best understood with an example. Here's an implementation of [`MediaQuery`](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery):
*
* ```js
* import { createSubscriber } from 'svelte/reactivity';
* import { on } from 'svelte/events';
*
* export class MediaQuery {
* 	#query;
* 	#subscribe;
*
* 	constructor(query) {
* 		this.#query = window.matchMedia(`(${query})`);
*
* 		this.#subscribe = createSubscriber((update) => {
* 			// when the `change` event occurs, re-run any effects that read `this.current`
* 			const off = on(this.#query, 'change', update);
*
* 			// stop listening when all the effects are destroyed
* 			return () => off();
* 		});
* 	}
*
* 	get current() {
* 		// This makes the getter reactive, if read in an effect
* 		this.#subscribe();
*
* 		// Return the current state of the query, whether or not we're in an effect
* 		return this.#query.matches;
* 	}
* }
* ```
* @param {(update: () => void) => (() => void) | void} start
* @since 5.7.0
*/
function createSubscriber(start) {
	let subscribers = 0;
	let version = source(0);
	/** @type {(() => void) | void} */
	let stop;
	return () => {
		if (effect_tracking()) {
			get(version);
			render_effect(() => {
				if (subscribers === 0) stop = untrack(() => start(() => increment(version)));
				subscribers += 1;
				return () => {
					queue_micro_task(() => {
						subscribers -= 1;
						if (subscribers === 0) {
							stop?.();
							stop = void 0;
							increment(version);
						}
					});
				};
			});
		}
	};
}
/** @import { Effect, Source, TemplateNode, } from '#client' */
/**
* @typedef {{
* 	 onerror?: ((error: unknown, reset: () => void) => void) | null;
*   failed?: ((anchor: Node, error: () => unknown, reset: () => () => void) => void) | null;
*   pending?: ((anchor: Node) => void) | null;
* }} BoundaryProps
*/
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
/**
* @param {TemplateNode} node
* @param {BoundaryProps} props
* @param {((anchor: Node) => void)} children
* @param {((error: unknown) => unknown) | undefined} [transform_error]
* @returns {void}
*/
function boundary(node, props, children, transform_error) {
	new Boundary(node, props, children, transform_error);
}
var Boundary = class {
	/** @type {Boundary | null} */
	parent;
	is_pending = false;
	/**
	* API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
	* Inherited from parent boundary, or defaults to identity.
	* @type {(error: unknown) => unknown}
	*/
	transform_error;
	/** @type {TemplateNode} */
	#anchor;
	/** @type {TemplateNode | null} */
	#hydrate_open = hydrating ? hydrate_node : null;
	/** @type {BoundaryProps} */
	#props;
	/** @type {((anchor: Node) => void)} */
	#children;
	/** @type {Effect} */
	#effect;
	/** @type {Effect | null} */
	#main_effect = null;
	/** @type {Effect | null} */
	#pending_effect = null;
	/** @type {Effect | null} */
	#failed_effect = null;
	/** @type {DocumentFragment | null} */
	#offscreen_fragment = null;
	#local_pending_count = 0;
	#pending_count = 0;
	#pending_count_update_queued = false;
	/** @type {Set<Effect>} */
	#dirty_effects = /* @__PURE__ */ new Set();
	/** @type {Set<Effect>} */
	#maybe_dirty_effects = /* @__PURE__ */ new Set();
	/**
	* A source containing the number of pending async deriveds/expressions.
	* Only created if `$effect.pending()` is used inside the boundary,
	* otherwise updating the source results in needless `Batch.ensure()`
	* calls followed by no-op flushes
	* @type {Source<number> | null}
	*/
	#effect_pending = null;
	#effect_pending_subscriber = createSubscriber(() => {
		this.#effect_pending = source(this.#local_pending_count);
		return () => {
			this.#effect_pending = null;
		};
	});
	/**
	* @param {TemplateNode} node
	* @param {BoundaryProps} props
	* @param {((anchor: Node) => void)} children
	* @param {((error: unknown) => unknown) | undefined} [transform_error]
	*/
	constructor(node, props, children, transform_error) {
		this.#anchor = node;
		this.#props = props;
		this.#children = (anchor) => {
			var effect = active_effect;
			effect.b = this;
			effect.f |= 128;
			children(anchor);
		};
		this.parent = active_effect.b;
		this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);
		this.#effect = block(() => {
			if (hydrating) {
				const comment = this.#hydrate_open;
				hydrate_next();
				const server_rendered_pending = comment.data === "[!";
				if (comment.data.startsWith("[?")) {
					const serialized_error = JSON.parse(comment.data.slice(2));
					this.#hydrate_failed_content(serialized_error);
				} else if (server_rendered_pending) this.#hydrate_pending_content();
				else this.#hydrate_resolved_content();
			} else this.#render();
		}, flags);
		if (hydrating) this.#anchor = hydrate_node;
	}
	#hydrate_resolved_content() {
		try {
			this.#main_effect = branch(() => this.#children(this.#anchor));
		} catch (error) {
			this.error(error);
		}
	}
	/**
	* @param {unknown} error The deserialized error from the server's hydration comment
	*/
	#hydrate_failed_content(error) {
		const failed = this.#props.failed;
		const { reset, invoke_onerror } = this.#create_reset(error);
		queue_micro_task(invoke_onerror);
		if (!failed) return;
		this.#failed_effect = branch(() => {
			failed(this.#anchor, () => error, () => reset);
		});
	}
	/**
	* Creates the `reset` function for a failed boundary, along with a function
	* that invokes `onerror` with it (if provided)
	* @param {unknown} error
	* @returns {{ reset: () => void, invoke_onerror: () => void }}
	*/
	#create_reset(error) {
		var did_reset = false;
		var calling_on_error = false;
		const reset = () => {
			if (did_reset) {
				svelte_boundary_reset_noop();
				return;
			}
			did_reset = true;
			if (calling_on_error) svelte_boundary_reset_onerror();
			if (this.#failed_effect !== null) pause_effect(this.#failed_effect, () => {
				this.#failed_effect = null;
			});
			this.#run(() => {
				this.#render();
			});
		};
		const invoke_onerror = () => {
			try {
				calling_on_error = true;
				this.#props.onerror?.(error, reset);
				calling_on_error = false;
			} catch (err) {
				invoke_error_boundary(err, this.#effect && this.#effect.parent);
			}
		};
		return {
			reset,
			invoke_onerror
		};
	}
	#hydrate_pending_content() {
		const pending = this.#props.pending;
		if (!pending) return;
		this.is_pending = true;
		this.#pending_effect = branch(() => pending(this.#anchor));
		queue_micro_task(() => {
			var fragment = this.#offscreen_fragment = document.createDocumentFragment();
			var anchor = create_text();
			var handled = false;
			fragment.append(anchor);
			this.#main_effect = this.#run(() => {
				try {
					return branch(() => this.#children(anchor));
				} catch (error) {
					try {
						this.error(error);
						handled = true;
					} catch (error) {
						invoke_error_boundary(error, this.#effect.parent);
					}
					return null;
				}
			});
			if (this.#main_effect === null) {
				this.#offscreen_fragment = null;
				if (handled) this.#resolve(current_batch);
				return;
			}
			if (this.#pending_count === 0) {
				this.#anchor.before(fragment);
				this.#offscreen_fragment = null;
				pause_effect(this.#pending_effect, () => {
					this.#pending_effect = null;
				});
				this.#resolve(current_batch);
			}
		});
	}
	#render() {
		try {
			this.is_pending = this.has_pending_snippet();
			this.#pending_count = 0;
			this.#local_pending_count = 0;
			this.#main_effect = branch(() => {
				this.#children(this.#anchor);
			});
			if (this.#pending_count > 0) {
				var fragment = this.#offscreen_fragment = document.createDocumentFragment();
				move_effect(this.#main_effect, fragment);
				const pending = this.#props.pending;
				this.#pending_effect = branch(() => pending(this.#anchor));
			} else this.#resolve(current_batch);
		} catch (error) {
			this.error(error);
		}
	}
	/**
	* @param {Batch} batch
	*/
	#resolve(batch) {
		this.is_pending = false;
		batch.transfer_effects(this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Defer an effect inside a pending boundary until the boundary resolves
	* @param {Effect} effect
	*/
	defer_effect(effect) {
		defer_effect(effect, this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Returns `false` if the effect exists inside a boundary whose pending snippet is shown
	* @returns {boolean}
	*/
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#props.pending;
	}
	/**
	* @template T
	* @param {() => T} fn
	*/
	#run(fn) {
		var previous_effect = active_effect;
		var previous_reaction = active_reaction;
		var previous_ctx = component_context;
		set_active_effect(this.#effect);
		set_active_reaction(this.#effect);
		set_component_context(this.#effect.ctx);
		try {
			Batch.ensure();
			return fn();
		} finally {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_ctx);
		}
	}
	/**
	* Updates the pending count associated with the currently visible pending snippet,
	* if any, such that we can replace the snippet with content once work is done
	* @param {1 | -1} d
	* @param {Batch} batch
	*/
	#update_pending_count(d, batch) {
		if (!this.has_pending_snippet()) {
			if (this.parent) this.parent.#update_pending_count(d, batch);
			return;
		}
		this.#pending_count += d;
		if (this.#pending_count === 0) {
			this.#resolve(batch);
			if (this.#pending_effect) pause_effect(this.#pending_effect, () => {
				this.#pending_effect = null;
			});
			if (this.#offscreen_fragment) {
				this.#anchor.before(this.#offscreen_fragment);
				this.#offscreen_fragment = null;
			}
		}
	}
	/**
	* Update the source that powers `$effect.pending()` inside this boundary,
	* and controls when the current `pending` snippet (if any) is removed.
	* Do not call from inside the class
	* @param {1 | -1} d
	* @param {Batch} batch
	*/
	update_pending_count(d, batch) {
		this.#update_pending_count(d, batch);
		this.#local_pending_count += d;
		if (!this.#effect_pending || this.#pending_count_update_queued) return;
		this.#pending_count_update_queued = true;
		queue_micro_task(() => {
			this.#pending_count_update_queued = false;
			if (this.#effect_pending) internal_set(this.#effect_pending, this.#local_pending_count);
		});
	}
	get_effect_pending() {
		this.#effect_pending_subscriber();
		return get(this.#effect_pending);
	}
	/** @param {unknown} error */
	error(error) {
		if (!this.#props.onerror && !this.#props.failed) throw error;
		if (current_batch?.is_fork) {
			if (this.#main_effect) current_batch.skip_effect(this.#main_effect);
			if (this.#pending_effect) current_batch.skip_effect(this.#pending_effect);
			if (this.#failed_effect) current_batch.skip_effect(this.#failed_effect);
			current_batch.oncommit(() => {
				this.#handle_error(error);
			});
		} else this.#handle_error(error);
	}
	/**
	* @param {unknown} error
	*/
	#handle_error(error) {
		if (this.#main_effect) {
			destroy_effect(this.#main_effect);
			this.#main_effect = null;
		}
		if (this.#pending_effect) {
			destroy_effect(this.#pending_effect);
			this.#pending_effect = null;
		}
		if (this.#failed_effect) {
			destroy_effect(this.#failed_effect);
			this.#failed_effect = null;
		}
		if (hydrating) {
			set_hydrate_node(this.#hydrate_open);
			next();
			set_hydrate_node(skip_nodes());
		}
		let failed = this.#props.failed;
		/** @param {unknown} transformed_error */
		const handle_error_result = (transformed_error) => {
			const { reset, invoke_onerror } = this.#create_reset(transformed_error);
			invoke_onerror();
			if (failed) this.#failed_effect = this.#run(() => {
				try {
					return branch(() => {
						var effect = active_effect;
						effect.b = this;
						effect.f |= 128;
						failed(this.#anchor, () => transformed_error, () => reset);
					});
				} catch (error) {
					invoke_error_boundary(error, this.#effect.parent);
					return null;
				}
			});
		};
		queue_micro_task(() => {
			/** @type {unknown} */
			var result;
			try {
				result = this.transform_error(error);
			} catch (e) {
				invoke_error_boundary(e, this.#effect && this.#effect.parent);
				return;
			}
			if (result !== null && typeof result === "object" && typeof result.then === "function")
 /** @type {any} */ result.then(
				handle_error_result,
				/** @param {unknown} e */
				(e) => invoke_error_boundary(e, this.#effect && this.#effect.parent)
			);
			else handle_error_result(result);
		});
	}
};
/**
* Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component.
* Transitions will play during the initial render unless the `intro` option is set to `false`.
*
* @template {Record<string, any>} Props
* @template {Record<string, any>} Exports
* @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} component
* @param {MountOptions<Props>} options
* @returns {Exports}
*/
function mount$1(component, options) {
	return _mount(component, options);
}
/**
* Hydrates a component on the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component
*
* @template {Record<string, any>} Props
* @template {Record<string, any>} Exports
* @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} component
* @param {{} extends Props ? {
* 		target: Document | Element | ShadowRoot;
* 		props?: Props;
* 		events?: Record<string, (e: any) => any>;
*  	context?: Map<any, any>;
* 		intro?: boolean;
* 		recover?: boolean;
*		transformError?: (error: unknown) => unknown;
* 	} : {
* 		target: Document | Element | ShadowRoot;
* 		props: Props;
* 		events?: Record<string, (e: any) => any>;
*  	context?: Map<any, any>;
* 		intro?: boolean;
* 		recover?: boolean;
*		transformError?: (error: unknown) => unknown;
* 	}} options
* @returns {Exports}
*/
function hydrate$1(component, options) {
	init_operations();
	options.intro = options.intro ?? false;
	const target = options.target;
	const was_hydrating = hydrating;
	const previous_hydrate_node = hydrate_node;
	try {
		var anchor = /* @__PURE__ */ get_first_child(target);
		while (anchor && (anchor.nodeType !== 8 || anchor.data !== "[")) anchor = /* @__PURE__ */ get_next_sibling(anchor);
		if (!anchor) throw HYDRATION_ERROR;
		set_hydrating(true);
		set_hydrate_node(anchor);
		const instance = _mount(component, {
			...options,
			anchor
		});
		set_hydrating(false);
		return instance;
	} catch (error) {
		if (error instanceof Error && error.message.split("\n").some((line) => line.startsWith("https://svelte.dev/e/"))) throw error;
		if (error !== HYDRATION_ERROR) console.warn("Failed to hydrate: ", error);
		if (options.recover === false) hydration_failed();
		init_operations();
		clear_text_content(target);
		set_hydrating(false);
		return mount$1(component, options);
	} finally {
		set_hydrating(was_hydrating);
		set_hydrate_node(previous_hydrate_node);
	}
}
/** @type {Map<EventTarget, Map<string, number>>} */
var listeners = /* @__PURE__ */ new Map();
/**
* @template {Record<string, any>} Exports
* @param {ComponentType<SvelteComponent<any>> | Component<any>} Component
* @param {MountOptions} options
* @returns {Exports}
*/
function _mount(Component, { target, anchor, props = {}, events, context, intro = true, transformError }) {
	init_operations();
	/** @type {Exports} */
	var component = void 0;
	var unmount = component_root(() => {
		var anchor_node = anchor ?? target.appendChild(create_text());
		boundary(anchor_node, { pending: () => {} }, (anchor_node) => {
			push$1({});
			var ctx = component_context;
			if (context) ctx.c = context;
			if (events)
 /** @type {any} */ props.$$events = events;
			if (hydrating) assign_nodes(anchor_node, null);
			component = Component(anchor_node, props) || mark_as_component();
			if (hydrating) {
				/** @type {Effect & { nodes: EffectNodes }} */ active_effect.nodes.end = hydrate_node;
				if (hydrate_node === null || hydrate_node.nodeType !== 8 || hydrate_node.data !== "]") {
					hydration_mismatch();
					throw HYDRATION_ERROR;
				}
			}
			pop$1();
		}, transformError);
		/** @type {Set<string>} */
		var registered_events = /* @__PURE__ */ new Set();
		/** @param {Array<string>} events */
		var event_handle = (events) => {
			for (var i = 0; i < events.length; i++) {
				var event_name = events[i];
				if (registered_events.has(event_name)) continue;
				registered_events.add(event_name);
				var passive = is_passive_event(event_name);
				for (const node of [target, document]) {
					var counts = listeners.get(node);
					if (counts === void 0) {
						counts = /* @__PURE__ */ new Map();
						listeners.set(node, counts);
					}
					var count = counts.get(event_name);
					if (count === void 0) {
						node.addEventListener(event_name, handle_event_propagation, { passive });
						counts.set(event_name, 1);
					} else counts.set(event_name, count + 1);
				}
			}
		};
		event_handle(array_from(all_registered_events));
		root_event_handles.add(event_handle);
		return () => {
			for (var event_name of registered_events) for (const node of [target, document]) {
				var counts = listeners.get(node);
				var count = counts.get(event_name);
				if (--count == 0) {
					node.removeEventListener(event_name, handle_event_propagation);
					counts.delete(event_name);
					if (counts.size === 0) listeners.delete(node);
				} else counts.set(event_name, count);
			}
			root_event_handles.delete(event_handle);
			if (anchor_node !== anchor) anchor_node.parentNode?.removeChild(anchor_node);
		};
	});
	mounted_components.set(component, unmount);
	return component;
}
/**
* References of the components that were mounted or hydrated.
* Uses a `WeakMap` to avoid memory leaks.
*/
var mounted_components = /* @__PURE__ */ new WeakMap();
/**
* Unmounts a component that was previously mounted using `mount` or `hydrate`.
*
* Since 5.13.0, if `options.outro` is `true`, [transitions](https://svelte.dev/docs/svelte/transition) will play before the component is removed from the DOM.
*
* Returns a `Promise` that resolves after transitions have completed if `options.outro` is true, or immediately otherwise (prior to 5.13.0, returns `void`).
*
* ```js
* import { mount, unmount } from 'svelte';
* import App from './App.svelte';
*
* const app = mount(App, { target: document.body });
*
* // later...
* unmount(app, { outro: true });
* ```
* @param {Record<string, any>} component
* @param {{ outro?: boolean }} [options]
* @returns {Promise<void>}
*/
function unmount$1(component, options) {
	const fn = mounted_components.get(component);
	if (fn) {
		mounted_components.delete(component);
		return fn(options);
	}
	return Promise.resolve();
}
/** @import { ComponentConstructorOptions, ComponentType, SvelteComponent, Component } from 'svelte' */
/**
* Takes the component function and returns a Svelte 4 compatible component constructor.
*
* @deprecated Use this only as a temporary solution to migrate your imperative component code to Svelte 5.
*
* @template {Record<string, any>} Props
* @template {Record<string, any>} Exports
* @template {Record<string, any>} Events
* @template {Record<string, any>} Slots
*
* @param {SvelteComponent<Props, Events, Slots> | Component<Props>} component
* @returns {ComponentType<SvelteComponent<Props, Events, Slots> & Exports>}
*/
function asClassComponent$1(component) {
	return class extends Svelte4Component {
		/** @param {any} options */
		constructor(options) {
			super({
				component,
				...options
			});
		}
	};
}
/**
* Support using the component as both a class and function during the transition period
* @typedef  {{new (o: ComponentConstructorOptions): SvelteComponent;(...args: Parameters<Component<Record<string, any>>>): ReturnType<Component<Record<string, any>, Record<string, any>>>;}} LegacyComponentType
*/
var Svelte4Component = class {
	/** @type {any} */
	#events;
	/** @type {Record<string, any>} */
	#instance;
	/**
	* @param {ComponentConstructorOptions & {
	*  component: any;
	* }} options
	*/
	constructor(options) {
		var sources = /* @__PURE__ */ new Map();
		/**
		* @param {string | symbol} key
		* @param {unknown} value
		*/
		var add_source = (key, value) => {
			var s = /* @__PURE__ */ mutable_source(value, false, false);
			sources.set(key, s);
			return s;
		};
		const props = new Proxy({
			...options.props || {},
			$$events: {}
		}, {
			get(target, prop) {
				return get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
			},
			has(target, prop) {
				if (prop === LEGACY_PROPS) return true;
				get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
				return Reflect.has(target, prop);
			},
			set(target, prop, value) {
				set(sources.get(prop) ?? add_source(prop, value), value);
				return Reflect.set(target, prop, value);
			}
		});
		this.#instance = (options.hydrate ? hydrate$1 : mount$1)(options.component, {
			target: options.target,
			anchor: options.anchor,
			props,
			context: options.context,
			intro: options.intro ?? false,
			recover: options.recover,
			transformError: options.transformError
		});
		if (!options?.props?.$$host || options.sync === false) flushSync();
		this.#events = props.$$events;
		for (const key of Object.keys(this.#instance)) {
			if (key === "$set" || key === "$destroy" || key === "$on") continue;
			define_property(this, key, {
				get() {
					return this.#instance[key];
				},
				/** @param {any} value */
				set(value) {
					this.#instance[key] = value;
				},
				enumerable: true
			});
		}
		this.#instance.$set = (next) => {
			Object.assign(props, next);
		};
		this.#instance.$destroy = () => {
			unmount$1(this.#instance);
		};
	}
	/** @param {Record<string, any>} props */
	$set(props) {
		this.#instance.$set(props);
	}
	/**
	* @param {string} event
	* @param {(...args: any[]) => any} callback
	* @returns {any}
	*/
	$on(event, callback) {
		this.#events[event] = this.#events[event] || [];
		/** @param {any[]} args */
		const cb = (...args) => callback.call(this, ...args);
		this.#events[event].push(cb);
		return () => {
			this.#events[event] = this.#events[event].filter(
				/** @param {any} fn */
				(fn) => fn !== cb
			);
		};
	}
	$destroy() {
		this.#instance.$destroy();
	}
};
/** @import { SvelteComponent } from '../index.js' */
/** @import { Csp } from '../server/public.js' */
/** @typedef {{ head: string, html: string, css: { code: string, map: null }; hashes?: { script: `sha256-${string}`[] } }} LegacyRenderResult */
/**
* Takes a Svelte 5 component and returns a Svelte 4 compatible component constructor.
*
* @deprecated Use this only as a temporary solution to migrate your imperative component code to Svelte 5.
*
* @template {Record<string, any>} Props
* @template {Record<string, any>} Exports
* @template {Record<string, any>} Events
* @template {Record<string, any>} Slots
*
* @param {SvelteComponent<Props, Events, Slots>} component
* @returns {typeof SvelteComponent<Props, Events, Slots> & Exports}
*/
function asClassComponent(component) {
	const component_constructor = asClassComponent$1(component);
	/** @type {(props?: {}, opts?: { $$slots?: {}; context?: Map<any, any>; csp?: Csp; transformError?: (error: unknown) => unknown }) => LegacyRenderResult & PromiseLike<LegacyRenderResult> } */
	const _render = (props, { context, csp, transformError } = {}) => {
		const result = render(component, {
			props,
			context,
			csp,
			transformError
		});
		const munged = Object.defineProperties({}, {
			css: { value: {
				code: "",
				map: null
			} },
			head: { get: () => result.head },
			html: { get: () => result.body },
			then: { 
			/**
			* this is not type-safe, but honestly it's the best I can do right now, and it's a straightforward function.
			*
			* @template TResult1
			* @template [TResult2=never]
			* @param { (value: LegacyRenderResult) => TResult1 } onfulfilled
			* @param { (reason: unknown) => TResult2 } onrejected
			*/
value: (onfulfilled, onrejected) => {
				{
					const user_result = onfulfilled({
						css: munged.css,
						head: munged.head,
						html: munged.html
					});
					return Promise.resolve(user_result);
				}
			} }
		});
		return munged;
	};
	component_constructor.render = _render;
	return component_constructor;
}
function getAbortSignal() {
	let context = ssr_context;
	while (context !== null) {
		if (context.r !== null) return context.r.global.get_abort_signal();
		context = context.p;
	}
	return new AbortController().signal;
}
/** @import { HydratableLookupEntry } from '#server' */
/**
* @template T
* @param {string} key
* @param {() => T} fn
* @returns {T}
*/
function hydratable(key, fn) {
	experimental_async_required("hydratable");
	const { hydratable } = get_render_context();
	let entry = hydratable.lookup.get(key);
	if (entry !== void 0) return entry.value;
	const value = fn();
	entry = encode(key, value, hydratable.unresolved_promises);
	hydratable.lookup.set(key, entry);
	return value;
}
/**
* @param {string} key
* @param {any} value
* @param {Map<Promise<any>, string>} [unresolved]
*/
function encode(key, value, unresolved) {
	/** @type {HydratableLookupEntry} */
	const entry = {
		value,
		serialized: ""
	};
	let uid = 1;
	entry.serialized = uneval(entry.value, (value, uneval) => {
		if (is_promise(value)) {
			const placeholder = `"${uid++}"`;
			const p = value.then((v) => {
				entry.serialized = entry.serialized.replace(placeholder, () => `r(${uneval(v)})`);
			}).catch((devalue_error) => hydratable_serialization_failed(key, serialization_stack(entry.stack, devalue_error?.stack)));
			unresolved?.set(p, key);
			p.catch(() => {}).finally(() => unresolved?.delete(p));
			(entry.promises ??= []).push(p);
			return placeholder;
		}
	});
	return entry;
}
/**
* @param {any} value
* @returns {value is Promise<any>}
*/
function is_promise(value) {
	return Object.prototype.toString.call(value) === "[object Promise]";
}
/**
* @param {string | undefined} root_stack
* @param {string | undefined} uneval_stack
*/
function serialization_stack(root_stack, uneval_stack) {
	let out = "";
	if (root_stack) out += root_stack + "\n";
	if (uneval_stack) out += "Caused by:\n" + uneval_stack + "\n";
	return out || "<missing stack trace>";
}
/** @import { Snippet } from 'svelte' */
/** @import { Renderer } from '../renderer' */
/** @import { Getters } from '#shared' */
/**
* Create a snippet programmatically
* @template {unknown[]} Params
* @param {(...params: Getters<Params>) => {
*   render: () => string
*   setup?: (element: Element) => void | (() => void)
* }} fn
* @returns {Snippet<Params>}
*/
function createRawSnippet(fn) {
	return (renderer, ...args) => {
		var getters = args.map((value) => () => value);
		renderer.push(fn(...getters).render().trim());
	};
}
/** @import { SSRContext } from '#server' */
/** @import { Renderer } from './internal/server/renderer.js' */
var index_server_exports = /* @__PURE__ */ __exportAll({
	afterUpdate: () => noop$1,
	beforeUpdate: () => noop$1,
	createContext: () => createContext,
	createEventDispatcher: () => createEventDispatcher,
	createRawSnippet: () => createRawSnippet,
	flushSync: () => noop$1,
	fork: () => fork,
	getAbortSignal: () => getAbortSignal,
	getAllContexts: () => getAllContexts,
	getContext: () => getContext,
	hasContext: () => hasContext,
	hydratable: () => hydratable,
	hydrate: () => hydrate,
	mount: () => mount,
	onDestroy: () => onDestroy,
	onMount: () => noop$1,
	setContext: () => setContext,
	settled: () => settled,
	tick: () => tick,
	unmount: () => unmount,
	untrack: () => run$1
});
/** @param {() => void} fn */
function onDestroy(fn) {
	/** @type {Renderer} */ ssr_context.r.on_destroy(fn);
}
function createEventDispatcher() {
	return noop$1;
}
function mount() {
	lifecycle_function_unavailable("mount");
}
function hydrate() {
	lifecycle_function_unavailable("hydrate");
}
function unmount() {
	lifecycle_function_unavailable("unmount");
}
function fork() {
	lifecycle_function_unavailable("fork");
}
async function tick() {}
async function settled() {}
function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { stores, page, constructors, components = [], form, data_0 = null, data_1 = null } = $$props;
		setContext("__svelte__", stores);
		stores.page.set(page);
		const Pyramid_1 = derived(() => constructors[1]);
		if (constructors[1]) {
			$$renderer.push("<!--[0-->");
			const Pyramid_0 = constructors[0];
			if (Pyramid_0) {
				$$renderer.push("<!--[-->");
				Pyramid_0($$renderer, {
					data: data_0,
					form,
					params: page.params,
					children: ($$renderer) => {
						if (Pyramid_1()) {
							$$renderer.push("<!--[-->");
							Pyramid_1()($$renderer, {
								data: data_1,
								form,
								params: page.params
							});
							$$renderer.push("<!--]-->");
						} else {
							$$renderer.push("<!--[!-->");
							$$renderer.push("<!--]-->");
						}
					},
					$$slots: { default: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
		} else {
			$$renderer.push("<!--[-1-->");
			const Pyramid_0 = constructors[0];
			if (Pyramid_0) {
				$$renderer.push("<!--[-->");
				Pyramid_0($$renderer, {
					data: data_0,
					form,
					params: page.params
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
		}
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
var root_default = asClassComponent(Root);
var error_template_default = ({ status, message }) => "<!doctype html>\n<html lang=\"en\">\n	<head>\n		<meta charset=\"utf-8\" />\n		<title>" + message + "</title>\n\n		<style>\n			body {\n				--bg: white;\n				--fg: #222;\n				--divider: #ccc;\n				background: var(--bg);\n				color: var(--fg);\n				font-family:\n					system-ui,\n					-apple-system,\n					BlinkMacSystemFont,\n					'Segoe UI',\n					Roboto,\n					Oxygen,\n					Ubuntu,\n					Cantarell,\n					'Open Sans',\n					'Helvetica Neue',\n					sans-serif;\n				display: flex;\n				align-items: center;\n				justify-content: center;\n				height: 100vh;\n				margin: 0;\n			}\n\n			.error {\n				display: flex;\n				align-items: center;\n				max-width: 32rem;\n				margin: 0 1rem;\n			}\n\n			.status {\n				font-weight: 200;\n				font-size: 3rem;\n				line-height: 1;\n				position: relative;\n				top: -0.05rem;\n			}\n\n			.message {\n				border-left: 1px solid var(--divider);\n				padding: 0 0 0 1rem;\n				margin: 0 0 0 1rem;\n				min-height: 2.5rem;\n				display: flex;\n				align-items: center;\n			}\n\n			.message h1 {\n				font-weight: 400;\n				font-size: 1em;\n				margin: 0;\n			}\n\n			@media (prefers-color-scheme: dark) {\n				body {\n					--bg: #222;\n					--fg: #ddd;\n					--divider: #666;\n				}\n			}\n		</style>\n	</head>\n	<body>\n		<div class=\"error\">\n			<span class=\"status\">" + status + "</span>\n			<div class=\"message\">\n				<h1>" + message + "</h1>\n			</div>\n		</div>\n	</body>\n</html>\n";
var options = {
	app_template_contains_nonce: false,
	async: false,
	csp: {
		"mode": "auto",
		"directives": {
			"upgrade-insecure-requests": false,
			"block-all-mixed-content": false
		},
		"reportOnly": {
			"upgrade-insecure-requests": false,
			"block-all-mixed-content": false
		}
	},
	csrf_check_origin: true,
	csrf_trusted_origins: [],
	embedded: false,
	env_public_prefix: "PUBLIC_",
	env_private_prefix: "",
	hash_routing: false,
	hooks: null,
	preload_strategy: "modulepreload",
	root: root_default,
	service_worker: false,
	service_worker_options: void 0,
	server_error_boundaries: false,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!doctype html>\n<html lang=\"pt-BR\" data-theme=\"light\">\n	<head>\n		<meta charset=\"utf-8\" />\n		<link rel=\"icon\" href=\"/favicon.svg\" />\n		<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n		<title>Colupe - Conectando Clientes e Profissionais</title>\n		" + head + "\n	</head>\n	<body class=\"min-h-screen bg-base-100 text-base-content antialiased\">\n		<div style=\"display: contents\">" + body + "</div>\n	</body>\n</html>\n",
		error: error_template_default
	},
	version_hash: "b7wc3h"
};
async function get_hooks() {
	let handle;
	let handleFetch;
	let handleError;
	let handleValidationError;
	let init;
	let reroute;
	let transport;
	return {
		handle,
		handleFetch,
		handleError,
		handleValidationError,
		init,
		reroute,
		transport
	};
}
//#endregion
//#region ../../node_modules/.bun/@sveltejs+kit@2.70.3+05f94278923e5a42/node_modules/@sveltejs/kit/src/exports/internal/index.js
/** @import { StandardSchemaV1 } from '@standard-schema/spec' */
var HttpError = class {
	/**
	* @param {number} status
	* @param {{message: string} extends App.Error ? (App.Error | string | undefined) : App.Error} body
	*/
	constructor(status, body) {
		this.status = status;
		if (typeof body === "string") this.body = { message: body };
		else if (body) this.body = body;
		else this.body = { message: `Error: ${status}` };
	}
	toString() {
		return JSON.stringify(this.body);
	}
};
var Redirect = class {
	/**
	* @param {300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308} status
	* @param {string} location
	*/
	constructor(status, location) {
		try {
			new Headers({ location });
		} catch {
			throw new Error(`Invalid redirect location ${JSON.stringify(location)}: this string contains characters that cannot be used in HTTP headers`);
		}
		this.status = status;
		this.location = location;
	}
};
/**
* An error that was thrown from within the SvelteKit runtime that is not fatal and doesn't result in a 500, such as a 404.
* `SvelteKitError` goes through `handleError`.
* @extends Error
*/
var SvelteKitError = class extends Error {
	/**
	* @param {number} status
	* @param {string} text
	* @param {string} message
	*/
	constructor(status, text, message) {
		super(message);
		this.status = status;
		this.text = text;
	}
};
/**
* @template [T=undefined]
*/
var ActionFailure = class {
	/**
	* @param {number} status
	* @param {T} data
	*/
	constructor(status, data) {
		this.status = status;
		this.data = data;
	}
};
//#endregion
//#region .svelte-kit/adapter-bun/chunks/shared.js
function noop() {}
/**
* @template T
* @param {() => T} fn
*/
function once(fn) {
	let done = false;
	/** @type T */
	let result;
	return () => {
		if (done) return result;
		done = true;
		return result = fn();
	};
}
/**	@type {(array_buffer: ArrayBuffer) => string} */
function encode_native(array_buffer) {
	return new Uint8Array(array_buffer).toBase64();
}
/**	@type {(base64: string) => ArrayBuffer} */
function decode_native(base64) {
	return Uint8Array.fromBase64(base64).buffer;
}
/** @type {(array_buffer: ArrayBuffer) => string} */
function encode_buffer(array_buffer) {
	return Buffer.from(array_buffer).toString("base64");
}
/**	@type {(base64: string) => ArrayBuffer} */
function decode_buffer(base64) {
	return Uint8Array.from(Buffer.from(base64, "base64")).buffer;
}
/** @type {(array_buffer: ArrayBuffer) => string} */
function encode_legacy(array_buffer) {
	const array = new Uint8Array(array_buffer);
	let binary = "";
	const chunk_size = 32768;
	for (let i = 0; i < array.length; i += chunk_size) {
		const chunk = array.subarray(i, i + chunk_size);
		binary += String.fromCharCode.apply(null, chunk);
	}
	return btoa(binary);
}
/**	@type {(base64: string) => ArrayBuffer} */
function decode_legacy(base64) {
	const binary_string = atob(base64);
	const len = binary_string.length;
	const array = new Uint8Array(len);
	for (let i = 0; i < len; i++) array[i] = binary_string.charCodeAt(i);
	return array.buffer;
}
var native = typeof Uint8Array.fromBase64 === "function";
var buffer = typeof process === "object" && process.versions?.node !== void 0;
var encode64 = native ? encode_native : buffer ? encode_buffer : encode_legacy;
var decode64 = native ? decode_native : buffer ? decode_buffer : decode_legacy;
/**
* Merges caller-provided operation overrides over the defaults. Iterating the
* default keys (rather than the override's own keys) means nullish members
* fall back to the default, and inherited members — e.g. from a class
* instance — are picked up.
*
* @template {Record<string, any>} T
* @param {T} defaults
* @param {Partial<T> | undefined} overrides
* @returns {T}
*/
function merge_operations(defaults, overrides) {
	if (!overrides) return defaults;
	const merged = {};
	for (const key of Object.keys(defaults)) merged[key] = overrides[key] ?? defaults[key];
	return merged;
}
/** @type {{ kind: 'not-plain' }} */
var NOT_PLAIN = /* @__PURE__ */ Object.freeze({ kind: "not-plain" });
/** @type {{ kind: 'symbol-keys' }} */
var SYMBOL_KEYS = /* @__PURE__ */ Object.freeze({ kind: "symbol-keys" });
var default_stringify_operations = /* @__PURE__ */ Object.freeze({
	identify: (value) => value,
	typeOf: (value) => value === null ? "null" : typeof value,
	toPrimitive: (value) => value,
	tagOf: (value) => get_type(value),
	isThenable: (value) => typeof value.then === "function",
	toPromise: (thenable) => Promise.resolve(thenable),
	unbox: (boxed) => boxed.valueOf(),
	toISOString: (date) => isNaN(date.getDate()) ? "" : date.toISOString(),
	toStringValue: (value) => value.toString(),
	regExpInfo: (regexp) => ({
		source: regexp.source,
		flags: regexp.flags
	}),
	valuesOf: (set) => set,
	entriesOf: (map) => map,
	viewInfo: (view) => {
		if (is_buffer(view)) view = new Uint8Array(view);
		return {
			buffer: view.buffer,
			byteOffset: view.byteOffset,
			byteLength: view.byteLength,
			length: view.length,
			bufferByteLength: view.buffer.byteLength
		};
	},
	toArrayBuffer: (buffer) => buffer,
	lengthOf: (array) => array.length,
	hasOwn: (value, key) => Object.hasOwn(value, key),
	indicesOf: (array) => valid_array_indices(array),
	shapeOf: (value) => {
		if (!is_plain_object(value)) return NOT_PLAIN;
		if (enumerable_symbols(value).length > 0) return SYMBOL_KEYS;
		return {
			kind: Object.getPrototypeOf(value) === null ? "null-proto" : "plain",
			keys: Object.keys(value)
		};
	},
	get: (value, key) => value[key]
});
var array_buffer_byte_length = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
var shared_array_buffer_byte_length = typeof SharedArrayBuffer === "undefined" ? void 0 : Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength").get;
var default_parse_operations = /* @__PURE__ */ Object.freeze({
	fromPrimitive: (primitive) => primitive,
	fromISOString: (iso) => new Date(iso),
	fromStringValue: (tag, text) => {
		if (tag === "URL") return new URL(text);
		if (tag === "URLSearchParams") return new URLSearchParams(text);
		return Temporal[tag.slice(9)].from(text);
	},
	fromArrayBuffer: (buffer) => buffer,
	fromRegExpInfo: (source, flags) => new RegExp(source, flags),
	fromViewInfo: (tag, buffer, byteOffset, length) => {
		try {
			array_buffer_byte_length.call(buffer);
		} catch (error) {
			if (!shared_array_buffer_byte_length) throw error;
			shared_array_buffer_byte_length.call(buffer);
		}
		const Constructor = globalThis[tag];
		return byteOffset !== void 0 ? new Constructor(buffer, byteOffset, length) : new Constructor(buffer);
	},
	box: (value) => Object(value),
	createArray: (length) => new Array(length),
	createSparseArray: (length) => {
		/** @type {any[]} */
		const array = [];
		array[MAX_ARRAY_INDEX] = void 0;
		delete array[MAX_ARRAY_INDEX];
		array.length = length;
		return array;
	},
	createObject: () => ({}),
	createNullPrototypeObject: () => Object.create(null),
	createSet: () => /* @__PURE__ */ new Set(),
	createMap: () => /* @__PURE__ */ new Map(),
	set: (target, key, value) => {
		target[key] = value;
	},
	addValue: (set, value) => {
		set.add(value);
	},
	addEntry: (map, key, value) => {
		map.set(key, value);
	}
});
/**
* Revive a value serialized with `devalue.stringify`
* @param {string} serialized
* @param {Record<string, (value: any) => any>} [revivers]
* @param {import('./types.js').ParseOptions} [options]
*/
function parse(serialized, revivers, options) {
	return unflatten(JSON.parse(serialized), revivers, options);
}
/**
* Revive a value flattened with `devalue.stringify`
* @param {number | any[]} parsed
* @param {Record<string, (value: any) => any>} [revivers]
* @param {import('./types.js').ParseOptions} [options]
*/
function unflatten(parsed, revivers, options) {
	/** @type {import('./types.js').ParseOperations} */
	const ops = merge_operations(default_parse_operations, options?.operations);
	if (typeof parsed === "number") return hydrate(parsed, true);
	if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid input");
	const values = parsed;
	const hydrated = Array(values.length);
	/**
	* A set of values currently being hydrated with custom revivers,
	* used to detect invalid cyclical dependencies
	* @type {Set<number> | null}
	*/
	let hydrating = null;
	/**
	* @param {number} index
	* @returns {any}
	*/
	function hydrate(index, standalone = false) {
		if (index === -1) return ops.fromPrimitive(void 0);
		if (index === -3) return ops.fromPrimitive(NaN);
		if (index === -4) return ops.fromPrimitive(Infinity);
		if (index === -5) return ops.fromPrimitive(-Infinity);
		if (index === -6) return ops.fromPrimitive(-0);
		if (standalone || typeof index !== "number") throw new Error(`Invalid input`);
		if (index in hydrated) return hydrated[index];
		if (index >= values.length) throw new Error(`Invalid input`);
		const value = values[index];
		if (!value || typeof value !== "object") hydrated[index] = ops.fromPrimitive(value);
		else if (Array.isArray(value)) {
			if (typeof value[0] === "string") {
				const type = value[0];
				const reviver = revivers && Object.hasOwn(revivers, type) ? revivers[type] : void 0;
				if (reviver) {
					let i = value[1];
					if (typeof i !== "number") i = values.push(value[1]) - 1;
					if (Object.hasOwn(hydrated, i)) return hydrated[index] = reviver(hydrated[i]);
					hydrating ??= /* @__PURE__ */ new Set();
					if (hydrating.has(i)) throw new Error("Invalid circular reference");
					hydrating.add(i);
					hydrated[index] = reviver(hydrate(i));
					hydrating.delete(i);
					return hydrated[index];
				}
				switch (type) {
					case "Date":
						hydrated[index] = ops.fromISOString(value[1]);
						break;
					case "Set":
						const set = ops.createSet();
						hydrated[index] = set;
						for (let i = 1; i < value.length; i += 1) ops.addValue(set, hydrate(value[i]));
						break;
					case "Map":
						const map = ops.createMap();
						hydrated[index] = map;
						for (let i = 1; i < value.length; i += 2) ops.addEntry(map, hydrate(value[i]), hydrate(value[i + 1]));
						break;
					case "RegExp":
						hydrated[index] = ops.fromRegExpInfo(value[1], value[2]);
						break;
					case "Object": {
						const wrapped_index = value[1];
						if (typeof values[wrapped_index] === "object" && values[wrapped_index][0] !== "BigInt") throw new Error("Invalid input");
						hydrated[index] = ops.box(hydrate(wrapped_index));
						break;
					}
					case "BigInt":
						hydrated[index] = ops.fromPrimitive(BigInt(value[1]));
						break;
					case "null":
						const obj = ops.createNullPrototypeObject();
						hydrated[index] = obj;
						for (let i = 1; i < value.length; i += 2) {
							const key = value[i];
							if (typeof key !== "string") throw new Error("Cannot parse an object with a non-string key");
							if (key === "__proto__") throw new Error("Cannot parse an object with a `__proto__` property");
							ops.set(obj, key, hydrate(value[i + 1]));
						}
						break;
					case "Int8Array":
					case "Uint8Array":
					case "Uint8ClampedArray":
					case "Int16Array":
					case "Uint16Array":
					case "Float16Array":
					case "Int32Array":
					case "Uint32Array":
					case "Float32Array":
					case "Float64Array":
					case "BigInt64Array":
					case "BigUint64Array":
					case "DataView": {
						if (values[value[1]][0] !== "ArrayBuffer") throw new Error("Invalid data");
						const buffer = hydrate(value[1]);
						hydrated[index] = ops.fromViewInfo(type, buffer, value[2], value[3]);
						break;
					}
					case "ArrayBuffer": {
						const base64 = value[1];
						if (typeof base64 !== "string") throw new Error("Invalid ArrayBuffer encoding");
						hydrated[index] = ops.fromArrayBuffer(decode64(base64));
						break;
					}
					case "URL":
					case "URLSearchParams":
					case "Temporal.Duration":
					case "Temporal.Instant":
					case "Temporal.PlainDate":
					case "Temporal.PlainTime":
					case "Temporal.PlainDateTime":
					case "Temporal.PlainMonthDay":
					case "Temporal.PlainYearMonth":
					case "Temporal.ZonedDateTime":
						hydrated[index] = ops.fromStringValue(type, value[1]);
						break;
					default: throw new Error(`Unknown type ${type}`);
				}
			} else if (value[0] === -7) {
				const len = value[1];
				if (!is_valid_array_len(len)) throw new Error("Invalid input");
				const array = ops.createSparseArray(len);
				hydrated[index] = array;
				for (let i = 2; i < value.length; i += 2) {
					const idx = value[i];
					if (!is_valid_array_index(idx) || idx >= len) throw new Error("Invalid input");
					ops.set(array, idx, hydrate(value[i + 1]));
				}
			} else {
				const array = ops.createArray(value.length);
				hydrated[index] = array;
				for (let i = 0; i < value.length; i += 1) {
					const n = value[i];
					if (n === -2) continue;
					ops.set(array, i, hydrate(n));
				}
			}
		} else {
			const object = ops.createObject();
			hydrated[index] = object;
			for (const key of Object.keys(value)) {
				if (key === "__proto__") throw new Error("Cannot parse an object with a `__proto__` property");
				ops.set(object, key, hydrate(value[key]));
			}
		}
		return hydrated[index];
	}
	return hydrate(0);
}
/**
* Turn a value into a JSON string that can be parsed with `devalue.parse`
* @param {any} value
* @param {Record<string, (value: any) => any>} [reducers]
* @param {import('./types.js').StringifyOptions} [options]
*/
function stringify$1(value, reducers, options) {
	const stringified = run(false, value, reducers, options);
	return typeof stringified === "string" ? stringified : `[${stringified.join(",")}]`;
}
/**
* @param {boolean} async
* @param {any} value
* @param {Record<string, (value: any) => any>} [reducers]
* @param {import('./types.js').StringifyOptions} [options]
*/
function run(async, value, reducers, options) {
	const ops = merge_operations(default_stringify_operations, options?.operations);
	/** @type {any[]} */
	const stringified = [];
	/** @type {Map<any, number>} */
	const indexes = /* @__PURE__ */ new Map();
	/** @type {Array<{ key: string, fn: (value: any) => any }>} */
	const custom = [];
	if (reducers) for (const key of Object.getOwnPropertyNames(reducers)) custom.push({
		key,
		fn: reducers[key]
	});
	/** @type {string[]} */
	const keys = [];
	let p = 0;
	/**
	* @param {any} thing
	* @param {number} [index]
	*/
	function flatten(thing, index) {
		const type = ops.typeOf(thing);
		if (type === "undefined") return -1;
		/** @type {number | undefined} */
		let number;
		if (type === "number") {
			number = ops.toPrimitive(thing);
			if (Number.isNaN(number)) return -3;
			if (number === Infinity) return -4;
			if (number === -Infinity) return -5;
			if (number === 0 && 1 / number < 0) return -6;
		}
		const id = ops.identify(thing);
		if (indexes.has(id)) return indexes.get(id);
		index ??= p++;
		indexes.set(id, index);
		for (const { key, fn } of custom) {
			const value = fn(thing);
			if (value) {
				stringified[index] = `["${key}",${flatten(value)}]`;
				return index;
			}
		}
		if (type === "function") throw new DevalueError(`Cannot stringify a function`, keys, thing, value);
		else if (type === "symbol") throw new DevalueError(`Cannot stringify a Symbol primitive`, keys, thing, value);
		/** @type {string | Promise<any>} */
		let str = "";
		if (type !== "object") str = stringify_primitive(type === "number" ? number : ops.toPrimitive(thing));
		else if (ops.isThenable(thing)) {
			if (!async) throw new DevalueError(`Cannot stringify a Promise or thenable — use stringifyAsync instead`, keys, thing, value);
			str = ops.toPromise(thing).then((value) => {
				const i = flatten(value, index);
				if (i < 0) stringified[index] = i;
			});
			str.catch(() => {});
		} else {
			const tag = ops.tagOf(thing);
			switch (tag) {
				case "Number":
				case "String":
				case "Boolean":
				case "BigInt":
					str = `["Object",${flatten(ops.unbox(thing))}]`;
					break;
				case "Date":
					str = `["Date","${ops.toISOString(thing)}"]`;
					break;
				case "URL":
					str = `["URL",${stringify_string(ops.toStringValue(thing))}]`;
					break;
				case "URLSearchParams":
					str = `["URLSearchParams",${stringify_string(ops.toStringValue(thing))}]`;
					break;
				case "RegExp":
					const { source, flags } = ops.regExpInfo(thing);
					str = flags ? `["RegExp",${stringify_string(source)},"${flags}"]` : `["RegExp",${stringify_string(source)}]`;
					break;
				case "Array": {
					let mostly_dense = false;
					const length = ops.lengthOf(thing);
					str = "[";
					for (let i = 0; i < length; i += 1) {
						if (i > 0) str += ",";
						if (ops.hasOwn(thing, i)) {
							keys.push(`[${i}]`);
							str += flatten(ops.get(thing, i));
							keys.pop();
						} else if (mostly_dense) str += -2;
						else {
							const populated_keys = ops.indicesOf(thing);
							const population = populated_keys.length;
							const d = String(length).length;
							if ((length - population) * 3 > 4 + d + population * (d + 1)) {
								str = "[-7," + length;
								for (let j = 0; j < populated_keys.length; j++) {
									const key = populated_keys[j];
									keys.push(`[${key}]`);
									str += "," + key + "," + flatten(ops.get(thing, key));
									keys.pop();
								}
								break;
							} else {
								mostly_dense = true;
								str += -2;
							}
						}
					}
					str += "]";
					break;
				}
				case "Set":
					str = "[\"Set\"";
					for (const value of ops.valuesOf(thing)) str += `,${flatten(value)}`;
					str += "]";
					break;
				case "Map":
					str = "[\"Map\"";
					for (const [key, value] of ops.entriesOf(thing)) {
						const key_type = ops.typeOf(key);
						const key_is_primitive = key_type !== "object" && key_type !== "function" && key_type !== "symbol";
						keys.push(`.get(${key_is_primitive ? stringify_primitive(ops.toPrimitive(key)) : "..."})`);
						str += `,${flatten(key)},${flatten(value)}`;
						keys.pop();
					}
					str += "]";
					break;
				case "Int8Array":
				case "Uint8Array":
				case "Uint8ClampedArray":
				case "Int16Array":
				case "Uint16Array":
				case "Float16Array":
				case "Int32Array":
				case "Uint32Array":
				case "Float32Array":
				case "Float64Array":
				case "BigInt64Array":
				case "BigUint64Array": {
					const info = ops.viewInfo(thing);
					str = "[\"" + tag + "\"," + flatten(info.buffer);
					if (info.byteLength !== info.bufferByteLength) str += `,${info.byteOffset},${info.length}`;
					str += "]";
					break;
				}
				case "DataView": {
					const info = ops.viewInfo(thing);
					str = "[\"" + tag + "\"," + flatten(info.buffer);
					if (info.byteLength !== info.bufferByteLength) str += `,${info.byteOffset},${info.byteLength}`;
					str += "]";
					break;
				}
				case "ArrayBuffer":
					str = `["ArrayBuffer","${encode64(ops.toArrayBuffer(thing))}"]`;
					break;
				case "Temporal.Duration":
				case "Temporal.Instant":
				case "Temporal.PlainDate":
				case "Temporal.PlainTime":
				case "Temporal.PlainDateTime":
				case "Temporal.PlainMonthDay":
				case "Temporal.PlainYearMonth":
				case "Temporal.ZonedDateTime":
					str = `["${tag}",${stringify_string(ops.toStringValue(thing))}]`;
					break;
				default: {
					const shape = ops.shapeOf(thing);
					if (shape.kind === "not-plain") throw new DevalueError(`Cannot stringify arbitrary non-POJOs`, keys, thing, value);
					if (shape.kind === "symbol-keys") throw new DevalueError(`Cannot stringify POJOs with symbolic keys`, keys, thing, value);
					if (shape.kind === "null-proto") {
						str = "[\"null\"";
						for (const key of shape.keys) {
							if (key === "__proto__") throw new DevalueError(`Cannot stringify objects with __proto__ keys`, keys, thing, value);
							keys.push(stringify_key(key));
							str += `,${stringify_string(key)},${flatten(ops.get(thing, key))}`;
							keys.pop();
						}
						str += "]";
					} else {
						str = "{";
						let started = false;
						for (const key of shape.keys) {
							if (key === "__proto__") throw new DevalueError(`Cannot stringify objects with __proto__ keys`, keys, thing, value);
							if (started) str += ",";
							started = true;
							keys.push(stringify_key(key));
							str += `${stringify_string(key)}:${flatten(ops.get(thing, key))}`;
							keys.pop();
						}
						str += "}";
					}
				}
			}
		}
		stringified[index] = str;
		return index;
	}
	const index = flatten(value);
	if (index < 0) return `${index}`;
	return stringified;
}
/**
* @param {any} thing
* @returns {string}
*/
function stringify_primitive(thing) {
	const type = typeof thing;
	if (type === "string") return stringify_string(thing);
	if (thing === void 0) return (-1).toString();
	if (thing === 0 && 1 / thing < 0) return (-6).toString();
	if (type === "bigint") return `["BigInt","${thing}"]`;
	return String(thing);
}
var text_encoder = new TextEncoder();
/**
* Like node's path.relative, but without using node
* @param {string} from
* @param {string} to
*/
function get_relative_path(from, to) {
	const from_parts = from.split(/[/\\]/);
	const to_parts = to.split(/[/\\]/);
	from_parts.pop();
	while (from_parts[0] === to_parts[0]) {
		from_parts.shift();
		to_parts.shift();
	}
	let i = from_parts.length;
	while (i--) from_parts[i] = "..";
	return from_parts.concat(to_parts).join("/");
}
/**
* @param {Uint8Array} bytes
* @returns {string}
*/
function base64_encode(bytes) {
	if (globalThis.Buffer) return globalThis.Buffer.from(bytes).toString("base64");
	let binary = "";
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
}
/**
* @param {string} encoded
* @returns {Uint8Array}
*/
function base64_decode(encoded) {
	if (globalThis.Buffer) {
		const buffer = globalThis.Buffer.from(encoded, "base64");
		return new Uint8Array(buffer);
	}
	const binary = atob(encoded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}
/**
* @param {unknown} err
* @return {Error}
*/
function coalesce_to_error(err) {
	return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
/**
* This is an identity function that exists to make TypeScript less
* paranoid about people throwing things that aren't errors, which
* frankly is not something we should care about
* @param {unknown} error
*/
function normalize_error(error) {
	return error;
}
/**
* @param {unknown} error
*/
function get_status(error) {
	return error instanceof HttpError || error instanceof SvelteKitError ? error.status : 500;
}
/**
* @param {unknown} error
*/
function get_message(error) {
	return error instanceof SvelteKitError ? error.text : "Internal Error";
}
var INVALIDATED_PARAM = "x-sveltekit-invalidated";
var TRAILING_SLASH_PARAM = "x-sveltekit-trailing-slash";
/**
* Try to `devalue.stringify` the data object using the provided transport encoders.
* @param {any} data
* @param {Transport} transport
*/
function stringify(data, transport) {
	return stringify$1(data, Object.fromEntries(Object.entries(transport).map(([k, v]) => [k, v.encode])));
}
var remote_object = "__skrao";
var remote_map = "__skram";
var remote_set = "__skras";
var remote_file = "__skraf";
Symbol(remote_object);
/** @param {Transport} transport */
function create_remote_arg_revivers(transport) {
	const remote_fns_revivers = {
		/** @type {(value: unknown) => unknown} */
		[remote_object]: (value) => value,
		/** @type {(value: unknown) => Map<unknown, unknown>} */
		[remote_map]: (value) => {
			if (!Array.isArray(value)) throw new Error("Invalid data for Map reviver");
			const map = /* @__PURE__ */ new Map();
			for (const item of value) {
				if (!Array.isArray(item) || item.length !== 2 || typeof item[0] !== "string" || typeof item[1] !== "string") throw new Error("Invalid data for Map reviver");
				const [key, val] = item;
				map.set(parse$1(key), parse$1(val));
			}
			return map;
		},
		/** @type {(value: unknown) => Set<unknown>} */
		[remote_set]: (value) => {
			if (!Array.isArray(value)) throw new Error("Invalid data for Set reviver");
			const set = /* @__PURE__ */ new Set();
			for (const item of value) {
				if (typeof item !== "string") throw new Error("Invalid data for Set reviver");
				set.add(parse$1(item));
			}
			return set;
		},
		/** @type {(value: any) => File} */
		[remote_file]: (value) => {
			if (!value || typeof value !== "object" || typeof value.name !== "string" || typeof value.type !== "string" || typeof value.size !== "number" || typeof value.lastModified !== "number" || !(value.data instanceof ArrayBuffer)) throw new Error("Invalid data for File reviver");
			const { data, name, ...meta } = value;
			return new File([data], name, meta);
		}
	};
	const all_revivers = {
		...Object.fromEntries(Object.entries(transport).map(([k, v]) => [k, v.decode])),
		...remote_fns_revivers
	};
	/** @type {(data: string) => unknown} */
	const parse$1 = (data) => parse(data, all_revivers);
	return all_revivers;
}
/**
* Parses the argument (if any) for a remote function
* @param {string} string
* @param {Transport} transport
*/
function parse_remote_arg(string, transport) {
	if (!string) return void 0;
	return parse(new TextDecoder().decode(base64_decode(string.replaceAll("-", "+").replaceAll("_", "/"))), create_remote_arg_revivers(transport));
}
/**
* @param {string} id
* @param {string} payload
*/
function create_remote_key(id, payload) {
	return id + "/" + payload;
}
/**
* @param {string} key
* @returns {{ id: string; payload: string }}
*/
function split_remote_key(key) {
	const i = key.lastIndexOf("/");
	if (i === -1) throw new Error(`Invalid remote key: ${key}`);
	return {
		id: key.slice(0, i),
		payload: key.slice(i + 1)
	};
}
//#endregion
//#region ../../node_modules/.bun/@sveltejs+kit@2.70.3+05f94278923e5a42/node_modules/@sveltejs/kit/src/runtime/server/constants.js
const IN_WEBCONTAINER = !!globalThis.process?.versions?.webcontainer;
/** @type {AsyncLocalStorage<RequestStore | null> | null} */
let als;
import("node:async_hooks").then((hooks) => als = new hooks.AsyncLocalStorage()).catch(() => {});
/**
* @template T
* @param {RequestStore | null} store
* @param {() => T} fn
*/
function with_request_store(store, fn) {
	try {
		return als ? als.run(store, fn) : fn();
	} finally {
		if (!IN_WEBCONTAINER);
	}
}
//#endregion
//#region ../../node_modules/.bun/@sveltejs+kit@2.70.3+05f94278923e5a42/node_modules/@sveltejs/kit/src/exports/internal/server.js
/**
* @template {{ tracing: { enabled: boolean, root: import('@opentelemetry/api').Span, current: import('@opentelemetry/api').Span } }} T
* @param {T} event_like
* @param {import('@opentelemetry/api').Span} current
* @returns {T}
*/
function merge_tracing(event_like, current) {
	return {
		...event_like,
		tracing: {
			...event_like.tracing,
			current
		}
	};
}
//#endregion
//#region .svelte-kit/adapter-bun/chunks/exports.js
var internal = new URL("sveltekit-internal://");
/**
* @param {string} base
* @param {string} path
*/
function resolve(base, path) {
	if (path[0] === "/" && path[1] === "/") return path;
	let url = new URL(base, internal);
	url = new URL(path, url);
	return url.protocol === internal.protocol ? url.pathname + url.search + url.hash : url.href;
}
/**
* @param {string} path
* @param {import('types').TrailingSlash} trailing_slash
*/
function normalize_path(path, trailing_slash) {
	if (path === "/" || trailing_slash === "ignore") return path;
	if (trailing_slash === "never") return path.endsWith("/") ? path.slice(0, -1) : path;
	else if (trailing_slash === "always" && !path.endsWith("/")) return path + "/";
	return path;
}
/**
* Decode pathname excluding %25 to prevent further double decoding of params
* @param {string} pathname
*/
function decode_pathname(pathname) {
	return pathname.split("%25").map(decodeURI).join("%25");
}
/** @param {Record<string, string>} params */
function decode_params(params) {
	for (const key in params) params[key] = decodeURIComponent(params[key]);
	return params;
}
/**
* @param {URL} url
* @param {() => void} callback
* @param {(search_param: string) => void} search_params_callback
* @param {boolean} [allow_hash]
*/
function make_trackable(url, callback, search_params_callback, allow_hash = false) {
	const tracked = new URL(url);
	Object.defineProperty(tracked, "searchParams", {
		value: new Proxy(tracked.searchParams, { get(obj, key) {
			if (key === "get" || key === "getAll" || key === "has") return (param, ...rest) => {
				search_params_callback(param);
				return obj[key](param, ...rest);
			};
			callback();
			const value = Reflect.get(obj, key);
			return typeof value === "function" ? value.bind(obj) : value;
		} }),
		enumerable: true,
		configurable: true
	});
	/**
	* URL properties that could change during the lifetime of the page,
	* which excludes things like `origin`
	* @type {(keyof URL)[]}
	*/
	const tracked_url_properties = [
		"href",
		"pathname",
		"search",
		"toString",
		"toJSON"
	];
	if (allow_hash) tracked_url_properties.push("hash");
	for (const property of tracked_url_properties) Object.defineProperty(tracked, property, {
		get() {
			callback();
			return url[property];
		},
		enumerable: true,
		configurable: true
	});
	tracked[Symbol.for("nodejs.util.inspect.custom")] = (_depth, opts, inspect) => {
		return inspect(url, opts);
	};
	tracked.searchParams[Symbol.for("nodejs.util.inspect.custom")] = (_depth, opts, inspect) => {
		return inspect(url.searchParams, opts);
	};
	if (!allow_hash) disable_hash(tracked);
	return tracked;
}
/**
* Disallow access to `url.hash` on the server and in `load`
* @param {URL} url
*/
function disable_hash(url) {
	allow_nodejs_console_log(url);
	Object.defineProperty(url, "hash", { get() {
		throw new Error("Cannot access event.url.hash. Consider using `page.url.hash` inside a component instead");
	} });
}
/**
* Disallow access to `url.search` and `url.searchParams` during prerendering
* @param {URL} url
*/
function disable_search(url) {
	allow_nodejs_console_log(url);
	for (const property of ["search", "searchParams"]) Object.defineProperty(url, property, { get() {
		throw new Error(`Cannot access url.${property} on a page with prerendering enabled`);
	} });
}
/**
* Allow URL to be console logged, bypassing disabled properties.
* @param {URL} url
*/
function allow_nodejs_console_log(url) {
	url[Symbol.for("nodejs.util.inspect.custom")] = (_depth, opts, inspect) => {
		return inspect(new URL(url), opts);
	};
}
/** @import { Readable, StartStopNotifier, Subscriber, Unsubscriber, Updater, Writable } from '../public.js' */
/** @import { Stores, StoresValues, SubscribeInvalidateTuple } from '../private.js' */
/**
* @type {Array<SubscribeInvalidateTuple<any> | any>}
*/
var subscriber_queue = [];
/**
* Creates a `Readable` store that allows reading by subscription.
*
* @template T
* @param {T} [value] initial value
* @param {StartStopNotifier<T>} [start]
* @returns {Readable<T>}
*/
function readable(value, start) {
	return { subscribe: writable(value, start).subscribe };
}
/**
* Create a `Writable` store that allows both updating and reading by subscription.
*
* @template T
* @param {T} [value] initial value
* @param {StartStopNotifier<T>} [start]
* @returns {Writable<T>}
*/
function writable(value, start = noop$1) {
	/** @type {Unsubscriber | null} */
	let stop = null;
	/** @type {Set<SubscribeInvalidateTuple<T>>} */
	const subscribers = /* @__PURE__ */ new Set();
	/**
	* @param {T} new_value
	* @returns {void}
	*/
	function set(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) {
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) subscriber_queue[i][0](subscriber_queue[i + 1]);
					subscriber_queue.length = 0;
				}
			}
		}
	}
	/**
	* @param {Updater<T>} fn
	* @returns {void}
	*/
	function update(fn) {
		set(fn(value));
	}
	/**
	* @param {Subscriber<T>} run
	* @param {() => void} [invalidate]
	* @returns {Unsubscriber}
	*/
	function subscribe(run, invalidate = noop$1) {
		/** @type {SubscribeInvalidateTuple<T>} */
		const subscriber = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) stop = start(set, update) || noop$1;
		run(value);
		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0 && stop) {
				stop();
				stop = null;
			}
		};
	}
	return {
		set,
		update,
		subscribe
	};
}
/**
* Hash using djb2
* @param {import('types').StrictBody[]} values
*/
function hash(...values) {
	let hash = 5381;
	for (const value of values) if (typeof value === "string") {
		let i = value.length;
		while (i) hash = hash * 33 ^ value.charCodeAt(--i);
	} else if (ArrayBuffer.isView(value)) {
		const buffer = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
		let i = buffer.length;
		while (i) hash = hash * 33 ^ buffer[--i];
	} else throw new TypeError("value must be a string or TypedArray");
	return (hash >>> 0).toString(36);
}
/**
* @param {RegExpMatchArray} match
* @param {import('types').RouteParam[]} params
* @param {Record<string, import('@sveltejs/kit').ParamMatcher>} matchers
*/
function exec(match, params, matchers) {
	/** @type {Record<string, string>} */
	const result = {};
	const values = match.slice(1);
	const values_needing_match = values.filter((value) => value !== void 0);
	let buffered = 0;
	for (let i = 0; i < params.length; i += 1) {
		const param = params[i];
		let value = values[i - buffered];
		if (param.chained && param.rest && buffered) {
			value = values.slice(i - buffered, i + 1).filter((s) => s).join("/");
			buffered = 0;
		}
		if (value === void 0) {
			if (param.rest) value = "";
			else continue;
		}
		if (!param.matcher || matchers[param.matcher](value)) {
			result[param.name] = value;
			const next_param = params[i + 1];
			const next_value = values[i + 1];
			if (next_param && !next_param.rest && next_param.optional && next_value && param.chained) buffered = 0;
			if (!next_param && !next_value && Object.keys(result).length === values_needing_match.length) buffered = 0;
			continue;
		}
		if (param.optional && param.chained) {
			buffered++;
			continue;
		}
		return;
	}
	if (buffered) return;
	return result;
}
/**
* Find the first route that matches the given path
* @template {{pattern: RegExp, params: import('types').RouteParam[]}} Route
* @param {string} path - The decoded pathname to match
* @param {Route[]} routes
* @param {Record<string, import('@sveltejs/kit').ParamMatcher>} matchers
* @returns {{ route: Route, params: Record<string, string> } | null}
*/
function find_route(path, routes, matchers) {
	for (const route of routes) {
		const match = route.pattern.exec(path);
		if (!match) continue;
		const matched = exec(match, route.params, matchers);
		if (matched) return {
			route,
			params: decode_params(matched)
		};
	}
	return null;
}
/**
* @param {Set<string>} expected
*/
function validator(expected) {
	/**
	* @param {any} module
	* @param {string} [file]
	*/
	function validate(module, file) {
		if (!module) return;
		for (const key in module) {
			if (key[0] === "_" || expected.has(key)) continue;
			const values = [...expected.values()];
			const hint = hint_for_supported_files(key, file?.slice(file.lastIndexOf("."))) ?? `valid exports are ${values.join(", ")}, or anything with a '_' prefix`;
			throw new Error(`Invalid export '${key}'${file ? ` in ${file}` : ""} (${hint})`);
		}
	}
	return validate;
}
/**
* @param {string} key
* @param {string} ext
* @returns {string | void}
*/
function hint_for_supported_files(key, ext = ".js") {
	const supported_files = [];
	if (valid_layout_exports.has(key)) supported_files.push(`+layout${ext}`);
	if (valid_page_exports.has(key)) supported_files.push(`+page${ext}`);
	if (valid_layout_server_exports.has(key)) supported_files.push(`+layout.server${ext}`);
	if (valid_page_server_exports.has(key)) supported_files.push(`+page.server${ext}`);
	if (valid_server_exports.has(key)) supported_files.push(`+server${ext}`);
	if (supported_files.length > 0) return `'${key}' is a valid export in ${supported_files.slice(0, -1).join(", ")}${supported_files.length > 1 ? " or " : ""}${supported_files.at(-1)}`;
}
var valid_layout_exports = /* @__PURE__ */ new Set([
	"load",
	"prerender",
	"csr",
	"ssr",
	"trailingSlash",
	"config"
]);
var valid_page_exports = /* @__PURE__ */ new Set([...valid_layout_exports, "entries"]);
var valid_layout_server_exports = /* @__PURE__ */ new Set([...valid_layout_exports]);
var valid_page_server_exports = /* @__PURE__ */ new Set([
	...valid_layout_server_exports,
	"actions",
	"entries"
]);
var valid_server_exports = /* @__PURE__ */ new Set([
	"GET",
	"POST",
	"PATCH",
	"PUT",
	"DELETE",
	"OPTIONS",
	"HEAD",
	"fallback",
	"prerender",
	"trailingSlash",
	"config",
	"entries"
]);
var validate_layout_exports = validator(valid_layout_exports);
var validate_page_exports = validator(valid_page_exports);
var validate_layout_server_exports = validator(valid_layout_server_exports);
var validate_page_server_exports = validator(valid_page_server_exports);
//#endregion
export { stringify as A, options as B, get_status as C, parse as D, once as E, Redirect as F, set_public_env as G, read_implementation as H, SvelteKitError as I, assets as J, set_read_implementation as K, __commonJSMin as L, text_encoder as M, ActionFailure as N, parse_remote_arg as O, HttpError as P, get_hooks as R, get_relative_path as S, normalize_error as T, set_manifest as U, public_env as V, set_private_env as W, override as X, base as Y, reset as Z, TRAILING_SLASH_PARAM as _, make_trackable as a, create_remote_key as b, resolve as c, validate_page_exports as d, validate_page_server_exports as f, INVALIDATED_PARAM as g, with_request_store as h, hash as i, stringify$1 as j, split_remote_key as k, validate_layout_exports as l, merge_tracing as m, disable_search as n, normalize_path as o, writable as p, app_dir as q, find_route as r, readable as s, decode_pathname as t, validate_layout_server_exports as u, base64_encode as v, noop as w, get_message as x, coalesce_to_error as y, index_server_exports as z };

//# sourceMappingURL=exports-DfxTtTC9.js.map