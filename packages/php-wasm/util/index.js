const f = Symbol("SleepFinished");
function a(e) {
  return new Promise((t) => {
    setTimeout(() => t(f), e);
  });
}
class d extends Error {
  constructor() {
    super("Acquiring lock timed out");
  }
}
class _ {
  constructor({ concurrency: t, timeout: s }) {
    this._running = 0, this.concurrency = t, this.timeout = s, this.queue = [];
  }
  get remaining() {
    return this.concurrency - this.running;
  }
  get running() {
    return this._running;
  }
  async acquire() {
    for (; ; )
      if (this._running >= this.concurrency) {
        const t = new Promise((s) => {
          this.queue.push(s);
        });
        this.timeout !== void 0 ? await Promise.race([t, a(this.timeout)]).then(
          (s) => {
            if (s === f)
              throw new d();
          }
        ) : await t;
      } else {
        this._running++;
        let t = !1;
        return () => {
          t || (t = !0, this._running--, this.queue.length > 0 && this.queue.shift()());
        };
      }
  }
  async run(t) {
    const s = await this.acquire();
    try {
      return await t();
    } finally {
      s();
    }
  }
}
class x extends Error {
  constructor(t, s) {
    super(t), this.userFriendlyMessage = s, this.userFriendlyMessage || (this.userFriendlyMessage = t);
  }
}
function T(...e) {
  function t(u) {
    return u.substring(u.length - 1) === "/";
  }
  let s = e.join("/");
  const i = s[0] === "/", n = t(s);
  return s = c(s), !s && !i && (s = "."), s && n && !t(s) && (s += "/"), s;
}
function S(e) {
  if (e === "/")
    return "/";
  e = c(e);
  const t = e.lastIndexOf("/");
  return t === -1 ? "" : t === 0 ? "/" : e.substr(0, t);
}
function b(e) {
  if (e === "/")
    return "/";
  e = c(e);
  const t = e.lastIndexOf("/");
  return t === -1 ? e : e.substr(t + 1);
}
function c(e) {
  const t = e[0] === "/";
  return e = g(
    e.split("/").filter((s) => !!s),
    !t
  ).join("/"), (t ? "/" : "") + e.replace(/\/$/, "");
}
function g(e, t) {
  let s = 0;
  for (let i = e.length - 1; i >= 0; i--) {
    const n = e[i];
    n === "." ? e.splice(i, 1) : n === ".." ? (e.splice(i, 1), s++) : s && (e.splice(i, 1), s--);
  }
  if (t)
    for (; s; s--)
      e.unshift("..");
  return e;
}
function M(e, t) {
  return e === "/" ? !0 : (e = c(e), t = c(t), t.startsWith(e + "/") || t === e);
}
function m(e) {
  let i = 0, n = "";
  const u = [];
  let r = "";
  for (let o = 0; o < e.length; o++) {
    const l = e[o];
    l === "\\" ? ((e[o + 1] === '"' || e[o + 1] === "'") && o++, r += e[o]) : i === 0 ? l === '"' || l === "'" ? (i = 1, n = l) : l.match(/\s/) ? (r.trim().length && u.push(r.trim()), r = l) : u.length && !r ? r = u.pop() + l : r += l : i === 1 && (l === n ? (i = 0, n = "") : r += l);
  }
  return r && u.push(r.trim()), u;
}
function U(e) {
  return function(t, s = [], i = {}) {
    const n = new w(), u = new E(n);
    return setTimeout(async () => {
      let r = [];
      if (s.length)
        r = [t, ...s];
      else if (typeof t == "string")
        r = m(t);
      else if (Array.isArray(t))
        r = t;
      else
        throw new Error("Invalid command ", t);
      try {
        await e(r, u, i);
      } catch (o) {
        n.emit("error", o), typeof o == "object" && o !== null && "message" in o && typeof o.message == "string" && u.stderr(o.message), u.exit(1);
      }
      n.emit("spawn", !0);
    }), n;
  };
}
class h {
  constructor() {
    this.listeners = {};
  }
  emit(t, s) {
    this.listeners[t] && this.listeners[t].forEach(function(i) {
      i(s);
    });
  }
  on(t, s) {
    this.listeners[t] || (this.listeners[t] = []), this.listeners[t].push(s);
  }
}
class E extends h {
  constructor(t) {
    super(), this.childProcess = t, this.exited = !1, this.stdinData = [], t.on("stdin", (s) => {
      this.stdinData ? this.stdinData.push(s.slice()) : this.emit("stdin", s);
    });
  }
  stdout(t) {
    typeof t == "string" && (t = new TextEncoder().encode(t)), this.childProcess.stdout.emit("data", t);
  }
  stdoutEnd() {
    this.childProcess.stdout.emit("end", {});
  }
  stderr(t) {
    typeof t == "string" && (t = new TextEncoder().encode(t)), this.childProcess.stderr.emit("data", t);
  }
  stderrEnd() {
    this.childProcess.stderr.emit("end", {});
  }
  exit(t) {
    this.exited || (this.exited = !0, this.childProcess.emit("exit", t));
  }
  flushStdin() {
    if (this.stdinData)
      for (let t = 0; t < this.stdinData.length; t++)
        this.emit("stdin", this.stdinData[t]);
    this.stdinData = null;
  }
}
let y = 9743;
class w extends h {
  constructor(t = y++) {
    super(), this.pid = t, this.stdout = new h(), this.stderr = new h();
    const s = this;
    this.stdin = {
      write: (i) => {
        s.emit("stdin", i);
      }
    };
  }
}
function P(e = 36, t = "!@#$%^&*()_+=-[]/.,<>?") {
  const s = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" + t;
  let i = "";
  for (let n = e; n > 0; --n)
    i += s[Math.floor(Math.random() * s.length)];
  return i;
}
function q() {
  return P(36, "-_");
}
function p(e) {
  return `json_decode(base64_decode('${D(
    JSON.stringify(e)
  )}'), true)`;
}
function A(e) {
  const t = {};
  for (const s in e)
    t[s] = p(e[s]);
  return t;
}
function D(e) {
  return O(new TextEncoder().encode(e));
}
function O(e) {
  const t = String.fromCodePoint(...e);
  return btoa(t);
}
export {
  d as AcquireTimeoutError,
  x as PhpWasmError,
  _ as Semaphore,
  b as basename,
  U as createSpawnHandler,
  S as dirname,
  M as isParentOf,
  T as joinPaths,
  c as normalizePath,
  p as phpVar,
  A as phpVars,
  q as randomFilename,
  P as randomString
};
