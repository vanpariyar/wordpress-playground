var b = (i, t, e) => {
  if (!t.has(i))
    throw TypeError("Cannot " + e);
};
var n = (i, t, e) => (b(i, t, "read from private field"), e ? e.call(i) : t.get(i)), g = (i, t, e) => {
  if (t.has(i))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(i) : t.set(i, e);
}, _ = (i, t, e, s) => (b(i, t, "write to private field"), s ? s.call(i, e) : t.set(i, e), e);
var L = (i, t, e, s) => ({
  set _(o) {
    _(i, t, o, e);
  },
  get _() {
    return n(i, t, s);
  }
}), v = (i, t, e) => (b(i, t, "access private method"), e);
import "@php-wasm/node-polyfills";
import { logger as T } from "@php-wasm/logger";
const O = 5 * 1024 * 1024;
var h, l, m, I;
class D extends EventTarget {
  constructor() {
    super(...arguments);
    /**
     * Notifies about the download #progress of a file.
     *
     * @param  file   The file name.
     * @param  loaded The number of bytes of that file loaded so far.
     * @param  fileSize  The total number of bytes in the loaded file.
     */
    g(this, m);
    g(this, h, {});
    g(this, l, {});
  }
  expectAssets(e) {
    for (const [s, o] of Object.entries(e)) {
      const r = "http://example.com/", a = new URL(s, r).pathname.split("/").pop();
      a in n(this, h) || (n(this, h)[a] = o), a in n(this, l) || (n(this, l)[a] = 0);
    }
  }
  async monitorFetch(e) {
    const s = await e;
    return R(s, (r) => {
      v(this, m, I).call(this, s.url, r.detail.loaded, r.detail.total);
    });
  }
}
h = new WeakMap(), l = new WeakMap(), m = new WeakSet(), I = function(e, s, o) {
  const r = new URL(e, "http://example.com").pathname.split("/").pop();
  o ? r in n(this, h) || (n(this, h)[r] = o, n(this, l)[r] = s) : o = n(this, h)[r], r in n(this, l) || T.warn(
    `Registered a download #progress of an unregistered file "${r}". This may cause a sudden **decrease** in the #progress percentage as the total number of bytes increases during the download.`
  ), n(this, l)[r] = s, this.dispatchEvent(
    new CustomEvent("progress", {
      detail: {
        loaded: y(n(this, l)),
        total: y(n(this, h))
      }
    })
  );
};
function y(i) {
  return Object.values(i).reduce((t, e) => t + e, 0);
}
function R(i, t) {
  const e = i.headers.get("content-length") || "", s = parseInt(e, 10) || O;
  function o(r, f) {
    t(
      new CustomEvent("progress", {
        detail: {
          loaded: r,
          total: f
        }
      })
    );
  }
  return new Response(
    new ReadableStream({
      async start(r) {
        if (!i.body) {
          r.close();
          return;
        }
        const f = i.body.getReader();
        let a = 0;
        for (; ; )
          try {
            const { done: p, value: E } = await f.read();
            if (E && (a += E.byteLength), p) {
              o(a, a), r.close();
              break;
            } else
              o(a, s), r.enqueue(E);
          } catch (p) {
            T.error({ e: p }), r.error(p);
            break;
          }
      }
    }),
    {
      status: i.status,
      statusText: i.statusText,
      headers: i.headers
    }
  );
}
var d, c, u, w;
class F extends EventTarget {
  constructor() {
    super(...arguments);
    g(this, u);
    g(this, d, void 0);
    g(this, c, void 0);
    _(this, d, {}), _(this, c, 0), this.progress = 0, this.mode = "REAL_TIME", this.caption = "";
  }
  partialObserver(e, s = "") {
    const o = ++L(this, c)._;
    return n(this, d)[o] = 0, (r) => {
      const { loaded: f, total: a } = (r == null ? void 0 : r.detail) || {};
      n(this, d)[o] = f / a * e, v(this, u, w).call(this, this.totalProgress, "REAL_TIME", s);
    };
  }
  slowlyIncrementBy(e) {
    const s = ++L(this, c)._;
    n(this, d)[s] = e, v(this, u, w).call(this, this.totalProgress, "SLOWLY_INCREMENT");
  }
  get totalProgress() {
    return Object.values(n(this, d)).reduce(
      (e, s) => e + s,
      0
    );
  }
}
d = new WeakMap(), c = new WeakMap(), u = new WeakSet(), w = function(e, s, o) {
  this.dispatchEvent(
    new CustomEvent("progress", {
      detail: {
        progress: e,
        mode: s,
        caption: o
      }
    })
  );
};
const P = 1e-5;
class C extends EventTarget {
  constructor({
    weight: t = 1,
    caption: e = "",
    fillTime: s = 4
  } = {}) {
    super(), this._selfWeight = 1, this._selfDone = !1, this._selfProgress = 0, this._selfCaption = "", this._isFilling = !1, this._subTrackers = [], this._weight = t, this._selfCaption = e, this._fillTime = s;
  }
  /**
   * Creates a new sub-tracker with a specific weight.
   *
   * The weight determines what percentage of the overall progress
   * the sub-tracker represents. For example, if the main tracker is
   * monitoring a process that has two stages, and the first stage
   * is expected to take twice as long as the second stage, you could
   * create the first sub-tracker with a weight of 0.67 and the second
   * sub-tracker with a weight of 0.33.
   *
   * The caption is an optional string that describes the current stage
   * of the operation. If provided, it will be used as the progress caption
   * for the sub-tracker. If not provided, the main tracker will look for
   * the next sub-tracker with a non-empty caption and use that as the progress
   * caption instead.
   *
   * Returns the newly-created sub-tracker.
   *
   * @throws {Error} If the weight of the new stage would cause the total weight of all stages to exceed 1.
   *
   * @param weight The weight of the new stage, as a decimal value between 0 and 1.
   * @param caption The caption for the new stage, which will be used as the progress caption for the sub-tracker.
   *
   * @example
   * ```ts
   * const tracker = new ProgressTracker();
   * const subTracker1 = tracker.stage(0.67, 'Slow stage');
   * const subTracker2 = tracker.stage(0.33, 'Fast stage');
   *
   * subTracker2.set(50);
   * subTracker1.set(75);
   * subTracker2.set(100);
   * subTracker1.set(100);
   * ```
   */
  stage(t, e = "") {
    if (t || (t = this._selfWeight), this._selfWeight - t < -P)
      throw new Error(
        `Cannot add a stage with weight ${t} as the total weight of registered stages would exceed 1.`
      );
    this._selfWeight -= t;
    const s = new C({
      caption: e,
      weight: t,
      fillTime: this._fillTime
    });
    return this._subTrackers.push(s), s.addEventListener("progress", () => this.notifyProgress()), s.addEventListener("done", () => {
      this.done && this.notifyDone();
    }), s;
  }
  /**
   * Fills the progress bar slowly over time, simulating progress.
   *
   * The progress bar is filled in a 100 steps, and each step, the progress
   * is increased by 1. If `stopBeforeFinishing` is true, the progress bar
   * will stop filling when it reaches 99% so that you can call `finish()`
   * explicitly.
   *
   * If the progress bar is filling or already filled, this method does nothing.
   *
   * @example
   * ```ts
   * const progress = new ProgressTracker({ caption: 'Processing...' });
   * progress.fillSlowly();
   * ```
   *
   * @param options Optional options.
   */
  fillSlowly({ stopBeforeFinishing: t = !0 } = {}) {
    if (this._isFilling)
      return;
    this._isFilling = !0;
    const e = 100, s = this._fillTime / e;
    this._fillInterval = setInterval(() => {
      this.set(this._selfProgress + 1), t && this._selfProgress >= 99 && clearInterval(this._fillInterval);
    }, s);
  }
  set(t) {
    this._selfProgress = Math.min(t, 100), this.notifyProgress(), this._selfProgress + P >= 100 && this.finish();
  }
  finish() {
    this._fillInterval && clearInterval(this._fillInterval), this._selfDone = !0, this._selfProgress = 100, this._isFilling = !1, this._fillInterval = void 0, this.notifyProgress(), this.notifyDone();
  }
  get caption() {
    for (let t = this._subTrackers.length - 1; t >= 0; t--)
      if (!this._subTrackers[t].done) {
        const e = this._subTrackers[t].caption;
        if (e)
          return e;
      }
    return this._selfCaption;
  }
  setCaption(t) {
    this._selfCaption = t, this.notifyProgress();
  }
  get done() {
    return this.progress + P >= 100;
  }
  get progress() {
    if (this._selfDone)
      return 100;
    const t = this._subTrackers.reduce(
      (e, s) => e + s.progress * s.weight,
      this._selfProgress * this._selfWeight
    );
    return Math.round(t * 1e4) / 1e4;
  }
  get weight() {
    return this._weight;
  }
  get observer() {
    return this._progressObserver || (this._progressObserver = (t) => {
      this.set(t);
    }), this._progressObserver;
  }
  get loadingListener() {
    return this._loadingListener || (this._loadingListener = (t) => {
      this.set(t.detail.loaded / t.detail.total * 100);
    }), this._loadingListener;
  }
  pipe(t) {
    t.setProgress({
      progress: this.progress,
      caption: this.caption
    }), this.addEventListener("progress", (e) => {
      t.setProgress({
        progress: e.detail.progress,
        caption: e.detail.caption
      });
    }), this.addEventListener("done", () => {
      t.setLoaded();
    });
  }
  addEventListener(t, e) {
    super.addEventListener(t, e);
  }
  removeEventListener(t, e) {
    super.removeEventListener(t, e);
  }
  notifyProgress() {
    const t = this;
    this.dispatchEvent(
      new CustomEvent("progress", {
        detail: {
          get progress() {
            return t.progress;
          },
          get caption() {
            return t.caption;
          }
        }
      })
    );
  }
  notifyDone() {
    this.dispatchEvent(new CustomEvent("done"));
  }
}
export {
  D as EmscriptenDownloadMonitor,
  F as ProgressObserver,
  C as ProgressTracker,
  R as cloneResponseMonitorProgress
};
