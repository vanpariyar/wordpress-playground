import { PHPResponse as C, LatestSupportedPHPVersion as R, loadPHPRuntime as L, FSHelpers as w, __private__dont__use as g } from "@php-wasm/universal";
import * as d from "comlink";
import { PhpWasmError as h, Semaphore as O, joinPaths as T } from "@php-wasm/util";
import { responseTo as S } from "@php-wasm/web-service-worker";
import { logger as m } from "@php-wasm/logger";
import { journalFSEvents as z } from "@php-wasm/fs-journal";
function N(r, t = void 0) {
  W();
  const e = r instanceof Worker ? r : d.windowEndpoint(r, t), a = d.wrap(e), n = y(a);
  return new Proxy(n, {
    get: (i, s) => s === "isConnected" ? async () => {
      for (; ; )
        try {
          await D(a.isConnected(), 200);
          break;
        } catch {
        }
    } : a[s]
  });
}
async function D(r, t) {
  return new Promise((e, a) => {
    setTimeout(a, t), r.then(e);
  });
}
function G(r, t) {
  W();
  const e = Promise.resolve();
  let a, n;
  const i = new Promise((o, u) => {
    a = o, n = u;
  }), s = y(r), c = new Proxy(s, {
    get: (o, u) => u === "isConnected" ? () => e : u === "isReady" ? () => i : u in o ? o[u] : t == null ? void 0 : t[u]
  });
  return d.expose(
    c,
    typeof window < "u" ? d.windowEndpoint(self.parent) : void 0
  ), [a, n, c];
}
let P = !1;
function W() {
  if (P)
    return;
  P = !0, d.transferHandlers.set("EVENT", {
    canHandle: (e) => e instanceof CustomEvent,
    serialize: (e) => [
      {
        detail: e.detail
      },
      []
    ],
    deserialize: (e) => e
  }), d.transferHandlers.set("FUNCTION", {
    canHandle: (e) => typeof e == "function",
    serialize(e) {
      const { port1: a, port2: n } = new MessageChannel();
      return d.expose(e, a), [n, [n]];
    },
    deserialize(e) {
      return e.start(), d.wrap(e);
    }
  }), d.transferHandlers.set("PHPResponse", {
    canHandle: (e) => typeof e == "object" && e !== null && "headers" in e && "bytes" in e && "errors" in e && "exitCode" in e && "httpStatusCode" in e,
    serialize(e) {
      return [e.toRawData(), []];
    },
    deserialize(e) {
      return C.fromRawData(e);
    }
  });
  const r = d.transferHandlers.get("throw"), t = r == null ? void 0 : r.serialize;
  r.serialize = ({ value: e }) => {
    const a = t({ value: e });
    return e.response && (a[0].value.response = e.response), e.source && (a[0].value.source = e.source), a;
  };
}
function y(r) {
  return new Proxy(r, {
    get(t, e) {
      switch (typeof t[e]) {
        case "function":
          return (...a) => t[e](...a);
        case "object":
          return t[e] === null ? t[e] : y(t[e]);
        case "undefined":
        case "number":
        case "string":
          return t[e];
        default:
          return d.proxy(t[e]);
      }
    }
  });
}
async function M(r = R, t = "light") {
  if (t === "kitchen-sink")
    switch (r) {
      case "8.3":
        return await import("./kitchen-sink/php_8_3.js");
      case "8.2":
        return await import("./kitchen-sink/php_8_2.js");
      case "8.1":
        return await import("./kitchen-sink/php_8_1.js");
      case "8.0":
        return await import("./kitchen-sink/php_8_0.js");
      case "7.4":
        return await import("./kitchen-sink/php_7_4.js");
      case "7.3":
        return await import("./kitchen-sink/php_7_3.js");
      case "7.2":
        return await import("./kitchen-sink/php_7_2.js");
      case "7.1":
        return await import("./kitchen-sink/php_7_1.js");
      case "7.0":
        return await import("./kitchen-sink/php_7_0.js");
    }
  else
    switch (r) {
      case "8.3":
        return await import("./light/php_8_3.js");
      case "8.2":
        return await import("./light/php_8_2.js");
      case "8.1":
        return await import("./light/php_8_1.js");
      case "8.0":
        return await import("./light/php_8_0.js");
      case "7.4":
        return await import("./light/php_7_4.js");
      case "7.3":
        return await import("./light/php_7_3.js");
      case "7.2":
        return await import("./light/php_7_2.js");
      case "7.1":
        return await import("./light/php_7_1.js");
      case "7.0":
        return await import("./light/php_7_0.js");
    }
  throw new Error(`Unsupported PHP version ${r}`);
}
const A = () => ({
  websocket: {
    decorator: (r) => class extends r {
      constructor() {
        try {
          super();
        } catch {
        }
      }
      send() {
        return null;
      }
    }
  }
});
async function Q(r, t = {}) {
  var n;
  const e = t.loadAllExtensions ? "kitchen-sink" : "light", a = await M(r, e);
  return (n = t.onPhpLoaderModuleLoaded) == null || n.call(t, a), await L(a, {
    ...t.emscriptenOptions || {},
    ...A()
  });
}
let b;
const I = new Promise((r) => {
  b = r;
});
function X(r) {
  if (!r)
    throw new h("PHP API client must be a valid client object.");
  b(r);
}
async function Y(r, t) {
  const e = navigator.serviceWorker;
  if (!e)
    throw window.isSecureContext ? new h(
      "Service workers are not supported in your browser."
    ) : new h(
      "WordPress Playground uses service workers and may only work on HTTPS and http://localhost/ sites, but the current site is neither."
    );
  const a = await e.register(t, {
    type: "module",
    // Always bypass HTTP cache when fetching the new Service Worker script:
    updateViaCache: "none"
  });
  try {
    await a.update();
  } catch (n) {
    m.error("Failed to update service worker.", n);
  }
  navigator.serviceWorker.addEventListener(
    "message",
    async function(i) {
      if (r && i.data.scope !== r)
        return;
      const s = await I, c = i.data.args || [], o = i.data.method, u = await s[o](...c);
      i.source.postMessage(S(i.data.requestId, u));
    }
  ), e.startMessages();
}
function Z(r, t) {
  window.addEventListener("message", (e) => {
    e.source === r.contentWindow && (t && e.origin !== t || typeof e.data != "object" || e.data.type !== "relay" || window.parent.postMessage(e.data, "*"));
  }), window.addEventListener("message", (e) => {
    var a;
    e.source === window.parent && (typeof e.data != "object" || e.data.type !== "relay" || (a = r == null ? void 0 : r.contentWindow) == null || a.postMessage(e.data));
  });
}
async function ee(r) {
  const t = new Worker(r, { type: "module" });
  return new Promise((e, a) => {
    t.onerror = (i) => {
      const s = new Error(
        `WebWorker failed to load at ${r}. ${i.message ? `Original error: ${i.message}` : ""}`
      );
      s.filename = i.filename, a(s);
    };
    function n(i) {
      i.data === "worker-script-started" && (e(t), t.removeEventListener("message", n));
    }
    t.addEventListener("message", n);
  });
}
function te(r, t = { initialSync: {} }) {
  return t = {
    ...t,
    initialSync: {
      ...t.initialSync,
      direction: t.initialSync.direction ?? "opfs-to-memfs"
    }
  }, async function(e, a, n) {
    return t.initialSync.direction === "opfs-to-memfs" ? (w.fileExists(a, n) && w.rmdir(a, n), w.mkdir(a, n), await _(a, r, n)) : await v(
      a,
      r,
      n,
      t.initialSync.onProgress
    ), q(e, r, n);
  };
}
async function _(r, t, e) {
  w.mkdir(r, e);
  const a = new O({
    concurrency: 40
  }), n = [], i = [
    [t, e]
  ];
  for (; i.length > 0; ) {
    const [s, c] = i.pop();
    for await (const o of s.values()) {
      const u = a.run(async () => {
        const l = T(
          c,
          o.name
        );
        if (o.kind === "directory") {
          try {
            r.mkdir(l);
          } catch (f) {
            if ((f == null ? void 0 : f.errno) !== 20)
              throw m.error(f), f;
          }
          i.push([o, l]);
        } else if (o.kind === "file") {
          const f = await o.getFile(), p = new Uint8Array(await f.arrayBuffer());
          r.createDataFile(
            c,
            o.name,
            p,
            !0,
            !0,
            !0
          );
        }
        n.splice(n.indexOf(u), 1);
      });
      n.push(u);
    }
    for (; i.length === 0 && n.length > 0; )
      await Promise.any(n);
  }
}
async function v(r, t, e, a) {
  r.mkdirTree(e);
  const n = [];
  async function i(o, u) {
    await Promise.all(
      r.readdir(o).filter(
        (l) => l !== "." && l !== ".."
      ).map(async (l) => {
        const f = T(o, l);
        if (!$(r, f)) {
          n.push([u, f, l]);
          return;
        }
        const p = await u.getDirectoryHandle(l, {
          create: !0
        });
        return await i(f, p);
      })
    );
  }
  await i(e, t);
  let s = 0;
  const c = n.map(
    ([o, u, l]) => x(o, l, r, u).then(() => {
      a == null || a({ files: ++s, total: n.length });
    })
  );
  await Promise.all(c);
}
function $(r, t) {
  return r.isDir(r.lookupPath(t, { follow: !0 }).node.mode);
}
async function x(r, t, e, a) {
  let n;
  try {
    n = e.readFile(a, {
      encoding: "binary"
    });
  } catch {
    return;
  }
  const i = await r.getFileHandle(t, { create: !0 }), s = i.createWritable !== void 0 ? (
    // Google Chrome, Firefox, probably more browsers
    await i.createWritable()
  ) : (
    // Safari
    await i.createSyncAccessHandle()
  );
  try {
    await s.truncate(0), await s.write(n);
  } finally {
    await s.close();
  }
}
function q(r, t, e) {
  const a = [], n = z(r, e, (c) => {
    a.push(c);
  }), i = new J(r, t, e);
  async function s() {
    const c = await r.semaphore.acquire();
    try {
      for (; a.length; )
        await i.processEntry(a.shift());
    } finally {
      c();
    }
  }
  return r.addEventListener("request.end", s), function() {
    n(), r.removeEventListener("request.end", s);
  };
}
class J {
  constructor(t, e, a) {
    this.php = t, this.opfs = e, this.memfsRoot = k(a);
  }
  toOpfsPath(t) {
    return k(t.substring(this.memfsRoot.length));
  }
  async processEntry(t) {
    if (!t.path.startsWith(this.memfsRoot) || t.path === this.memfsRoot)
      return;
    const e = this.toOpfsPath(t.path), a = await H(this.opfs, e), n = E(e);
    if (n)
      try {
        if (t.operation === "DELETE")
          try {
            await a.removeEntry(n, {
              recursive: !0
            });
          } catch {
          }
        else if (t.operation === "CREATE")
          t.nodeType === "directory" ? await a.getDirectoryHandle(n, {
            create: !0
          }) : await a.getFileHandle(n, {
            create: !0
          });
        else if (t.operation === "WRITE")
          await x(
            a,
            n,
            this.php[g].FS,
            t.path
          );
        else if (t.operation === "RENAME" && t.toPath.startsWith(this.memfsRoot)) {
          const i = this.toOpfsPath(t.toPath), s = await H(
            this.opfs,
            i
          ), c = E(i);
          if (t.nodeType === "directory") {
            const o = await s.getDirectoryHandle(
              n,
              {
                create: !0
              }
            );
            await v(
              this.php[g].FS,
              o,
              t.toPath
            ), await a.removeEntry(n, {
              recursive: !0
            });
          } else
            (await a.getFileHandle(n)).move(s, c);
        }
      } catch (i) {
        throw m.log({ entry: t, name: n }), m.error(i), i;
      }
  }
}
function k(r) {
  return r.replace(/\/$/, "").replace(/\/\/+/g, "/");
}
function E(r) {
  return r.substring(r.lastIndexOf("/") + 1);
}
async function H(r, t) {
  const e = t.replace(/^\/+|\/+$/g, "").replace(/\/+/, "/");
  if (!e)
    return r;
  const a = e.split("/");
  let n = r;
  for (let i = 0; i < a.length - 1; i++) {
    const s = a[i];
    n = await n.getDirectoryHandle(s, { create: !0 });
  }
  return n;
}
export {
  N as consumeAPI,
  te as createDirectoryHandleMountHandler,
  G as exposeAPI,
  M as getPHPLoaderModule,
  Q as loadWebRuntime,
  Y as registerServiceWorker,
  X as setPhpInstanceUsedByServiceWorker,
  Z as setupPostMessageRelay,
  ee as spawnPHPWorkerThread
};
