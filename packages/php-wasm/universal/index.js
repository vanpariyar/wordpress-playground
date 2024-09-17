var G = (t, e, r) => {
  if (!e.has(t))
    throw TypeError("Cannot " + r);
};
var p = (t, e, r) => (G(t, e, "read from private field"), r ? r.call(t) : e.get(t)), u = (t, e, r) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, r);
}, h = (t, e, r, s) => (G(t, e, "write to private field"), s ? s.call(t, r) : e.set(t, r), r);
var d = (t, e, r) => (G(t, e, "access private method"), r);
import "@php-wasm/node-polyfills";
import { logger } from "@php-wasm/logger";
import { dirname, joinPaths, Semaphore, createSpawnHandler, normalizePath, AcquireTimeoutError } from "@php-wasm/util";
import { parse, stringify } from "ini";
import { StreamedFile } from "@php-wasm/stream-compression";
const FileErrorCodes = {
  0: "No error occurred. System call completed successfully.",
  1: "Argument list too long.",
  2: "Permission denied.",
  3: "Address in use.",
  4: "Address not available.",
  5: "Address family not supported.",
  6: "Resource unavailable, or operation would block.",
  7: "Connection already in progress.",
  8: "Bad file descriptor.",
  9: "Bad message.",
  10: "Device or resource busy.",
  11: "Operation canceled.",
  12: "No child processes.",
  13: "Connection aborted.",
  14: "Connection refused.",
  15: "Connection reset.",
  16: "Resource deadlock would occur.",
  17: "Destination address required.",
  18: "Mathematics argument out of domain of function.",
  19: "Reserved.",
  20: "File exists.",
  21: "Bad address.",
  22: "File too large.",
  23: "Host is unreachable.",
  24: "Identifier removed.",
  25: "Illegal byte sequence.",
  26: "Operation in progress.",
  27: "Interrupted function.",
  28: "Invalid argument.",
  29: "I/O error.",
  30: "Socket is connected.",
  31: "There is a directory under that path.",
  32: "Too many levels of symbolic links.",
  33: "File descriptor value too large.",
  34: "Too many links.",
  35: "Message too large.",
  36: "Reserved.",
  37: "Filename too long.",
  38: "Network is down.",
  39: "Connection aborted by network.",
  40: "Network unreachable.",
  41: "Too many files open in system.",
  42: "No buffer space available.",
  43: "No such device.",
  44: "There is no such file or directory OR the parent directory does not exist.",
  45: "Executable file format error.",
  46: "No locks available.",
  47: "Reserved.",
  48: "Not enough space.",
  49: "No message of the desired type.",
  50: "Protocol not available.",
  51: "No space left on device.",
  52: "Function not supported.",
  53: "The socket is not connected.",
  54: "Not a directory or a symbolic link to a directory.",
  55: "Directory not empty.",
  56: "State not recoverable.",
  57: "Not a socket.",
  58: "Not supported, or operation not supported on socket.",
  59: "Inappropriate I/O control operation.",
  60: "No such device or address.",
  61: "Value too large to be stored in data type.",
  62: "Previous owner died.",
  63: "Operation not permitted.",
  64: "Broken pipe.",
  65: "Protocol error.",
  66: "Protocol not supported.",
  67: "Protocol wrong type for socket.",
  68: "Result too large.",
  69: "Read-only file system.",
  70: "Invalid seek.",
  71: "No such process.",
  72: "Reserved.",
  73: "Connection timed out.",
  74: "Text file busy.",
  75: "Cross-device link.",
  76: "Extension: Capabilities insufficient."
};
function getEmscriptenFsError(t) {
  const e = typeof t == "object" ? t == null ? void 0 : t.errno : null;
  if (e in FileErrorCodes)
    return FileErrorCodes[e];
}
function rethrowFileSystemError(t = "") {
  return function(r, s, i) {
    const n = i.value;
    i.value = function(...o) {
      try {
        return n.apply(this, o);
      } catch (a) {
        const l = typeof a == "object" ? a == null ? void 0 : a.errno : null;
        if (l in FileErrorCodes) {
          const c = FileErrorCodes[l], P = typeof o[1] == "string" ? o[1] : null, pe = P !== null ? t.replaceAll("{path}", P) : t;
          throw new Error(`${pe}: ${c}`, {
            cause: a
          });
        }
        throw a;
      }
    };
  };
}
var __defProp = Object.defineProperty, __getOwnPropDesc = Object.getOwnPropertyDescriptor, __decorateClass = (t, e, r, s) => {
  for (var i = s > 1 ? void 0 : s ? __getOwnPropDesc(e, r) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (i = (s ? o(e, r, i) : o(i)) || i);
  return s && i && __defProp(e, r, i), i;
};
const _FSHelpers = class m {
  static readFileAsText(e, r) {
    return new TextDecoder().decode(m.readFileAsBuffer(e, r));
  }
  static readFileAsBuffer(e, r) {
    return e.readFile(r);
  }
  static writeFile(e, r, s) {
    e.writeFile(r, s);
  }
  static unlink(e, r) {
    e.unlink(r);
  }
  /**
   * Moves a file or directory in the PHP filesystem to a
   * new location.
   *
   * @param FS
   * @param fromPath The path to rename.
   * @param toPath The new path.
   */
  static mv(e, r, s) {
    try {
      const i = e.lookupPath(r).node.mount, n = m.fileExists(e, s) ? e.lookupPath(s).node.mount : e.lookupPath(dirname(s)).node.mount;
      i.mountpoint !== n.mountpoint ? (m.copyRecursive(e, r, s), m.rmdir(e, r, { recursive: !0 })) : e.rename(r, s);
    } catch (i) {
      const n = getEmscriptenFsError(i);
      throw n ? new Error(
        `Could not move ${r} to ${s}: ${n}`,
        {
          cause: i
        }
      ) : i;
    }
  }
  static rmdir(e, r, s = { recursive: !0 }) {
    s != null && s.recursive && m.listFiles(e, r).forEach((i) => {
      const n = `${r}/${i}`;
      m.isDir(e, n) ? m.rmdir(e, n, s) : m.unlink(e, n);
    }), e.rmdir(r);
  }
  static listFiles(e, r, s = { prependPath: !1 }) {
    if (!m.fileExists(e, r))
      return [];
    try {
      const i = e.readdir(r).filter(
        (n) => n !== "." && n !== ".."
      );
      if (s.prependPath) {
        const n = r.replace(/\/$/, "");
        return i.map((o) => `${n}/${o}`);
      }
      return i;
    } catch (i) {
      return logger.error(i, { path: r }), [];
    }
  }
  static isDir(e, r) {
    return m.fileExists(e, r) ? e.isDir(e.lookupPath(r, { follow: !0 }).node.mode) : !1;
  }
  static isFile(e, r) {
    return m.fileExists(e, r) ? e.isFile(e.lookupPath(r, { follow: !0 }).node.mode) : !1;
  }
  /**
   * Creates a symlink in the PHP filesystem.
   *
   * @param FS
   * @param target
   * @param link
   */
  static symlink(e, r, s) {
    return e.symlink(r, s);
  }
  /**
   * Checks if a path is a symlink in the PHP filesystem.
   *
   * @param FS
   * @param path
   * @returns True if the path is a symlink, false otherwise.
   */
  static isSymlink(e, r) {
    return m.fileExists(e, r) ? e.isLink(e.lookupPath(r).node.mode) : !1;
  }
  /**
   * Reads the target of a symlink in the PHP filesystem.
   * @param FS
   * @param path
   * @returns The target of the symlink.
   * @throws {@link @php-wasm/universal:ErrnoError} – If the path is not a symlink.
   */
  static readlink(e, r) {
    return e.readlink(r);
  }
  static realpath(e, r) {
    return e.lookupPath(r, { follow: !0 }).path;
  }
  static fileExists(e, r) {
    try {
      return e.lookupPath(r), !0;
    } catch {
      return !1;
    }
  }
  static mkdir(e, r) {
    e.mkdirTree(r);
  }
  static copyRecursive(e, r, s) {
    const i = e.lookupPath(r).node;
    if (e.isDir(i.mode)) {
      e.mkdirTree(s);
      const n = e.readdir(r).filter(
        (o) => o !== "." && o !== ".."
      );
      for (const o of n)
        m.copyRecursive(
          e,
          joinPaths(r, o),
          joinPaths(s, o)
        );
    } else
      e.writeFile(s, e.readFile(r));
  }
};
__decorateClass([
  rethrowFileSystemError('Could not read "{path}"')
], _FSHelpers, "readFileAsText", 1);
__decorateClass([
  rethrowFileSystemError('Could not read "{path}"')
], _FSHelpers, "readFileAsBuffer", 1);
__decorateClass([
  rethrowFileSystemError('Could not write to "{path}"')
], _FSHelpers, "writeFile", 1);
__decorateClass([
  rethrowFileSystemError('Could not unlink "{path}"')
], _FSHelpers, "unlink", 1);
__decorateClass([
  rethrowFileSystemError('Could not remove directory "{path}"')
], _FSHelpers, "rmdir", 1);
__decorateClass([
  rethrowFileSystemError('Could not list files in "{path}"')
], _FSHelpers, "listFiles", 1);
__decorateClass([
  rethrowFileSystemError('Could not stat "{path}"')
], _FSHelpers, "isDir", 1);
__decorateClass([
  rethrowFileSystemError('Could not stat "{path}"')
], _FSHelpers, "isFile", 1);
__decorateClass([
  rethrowFileSystemError('Could not stat "{path}"')
], _FSHelpers, "realpath", 1);
__decorateClass([
  rethrowFileSystemError('Could not stat "{path}"')
], _FSHelpers, "fileExists", 1);
__decorateClass([
  rethrowFileSystemError('Could not create directory "{path}"')
], _FSHelpers, "mkdir", 1);
__decorateClass([
  rethrowFileSystemError('Could not copy files from "{path}"')
], _FSHelpers, "copyRecursive", 1);
let FSHelpers = _FSHelpers;
const _private = /* @__PURE__ */ new WeakMap();
class PHPWorker {
  /** @inheritDoc */
  constructor(e, r) {
    this.absoluteUrl = "", this.documentRoot = "", _private.set(this, {
      monitor: r
    }), e && this.__internal_setRequestHandler(e);
  }
  __internal_setRequestHandler(e) {
    this.absoluteUrl = e.absoluteUrl, this.documentRoot = e.documentRoot, _private.set(this, {
      ..._private.get(this),
      requestHandler: e
    });
  }
  /**
   * @internal
   * @deprecated
   * Do not use this method directly in the code consuming
   * the web API. It will change or even be removed without
   * a warning.
   */
  __internal_getPHP() {
    return _private.get(this).php;
  }
  async setPrimaryPHP(e) {
    _private.set(this, {
      ..._private.get(this),
      php: e
    });
  }
  /** @inheritDoc @php-wasm/universal!PHPRequestHandler.pathToInternalUrl  */
  pathToInternalUrl(e) {
    return _private.get(this).requestHandler.pathToInternalUrl(e);
  }
  /** @inheritDoc @php-wasm/universal!PHPRequestHandler.internalUrlToPath  */
  internalUrlToPath(e) {
    return _private.get(this).requestHandler.internalUrlToPath(e);
  }
  /**
   * The onDownloadProgress event listener.
   */
  async onDownloadProgress(e) {
    var r;
    return (r = _private.get(this).monitor) == null ? void 0 : r.addEventListener("progress", e);
  }
  /** @inheritDoc @php-wasm/universal!PHP.mv  */
  async mv(e, r) {
    return _private.get(this).php.mv(e, r);
  }
  /** @inheritDoc @php-wasm/universal!PHP.rmdir  */
  async rmdir(e, r) {
    return _private.get(this).php.rmdir(e, r);
  }
  /** @inheritDoc @php-wasm/universal!PHPRequestHandler.request */
  async request(e) {
    return await _private.get(this).requestHandler.request(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.run */
  async run(e) {
    const { php: r, reap: s } = await _private.get(this).requestHandler.processManager.acquirePHPInstance();
    try {
      return await r.run(e);
    } finally {
      s();
    }
  }
  /** @inheritDoc @php-wasm/universal!/PHP.chdir */
  chdir(e) {
    return _private.get(this).php.chdir(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.setSapiName */
  setSapiName(e) {
    _private.get(this).php.setSapiName(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.mkdir */
  mkdir(e) {
    return _private.get(this).php.mkdir(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.mkdirTree */
  mkdirTree(e) {
    return _private.get(this).php.mkdirTree(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.readFileAsText */
  readFileAsText(e) {
    return _private.get(this).php.readFileAsText(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.readFileAsBuffer */
  readFileAsBuffer(e) {
    return _private.get(this).php.readFileAsBuffer(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.writeFile */
  writeFile(e, r) {
    return _private.get(this).php.writeFile(e, r);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.unlink */
  unlink(e) {
    return _private.get(this).php.unlink(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.listFiles */
  listFiles(e, r) {
    return _private.get(this).php.listFiles(e, r);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.isDir */
  isDir(e) {
    return _private.get(this).php.isDir(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.isFile */
  isFile(e) {
    return _private.get(this).php.isFile(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.fileExists */
  fileExists(e) {
    return _private.get(this).php.fileExists(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.onMessage */
  onMessage(e) {
    _private.get(this).php.onMessage(e);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.defineConstant */
  defineConstant(e, r) {
    _private.get(this).php.defineConstant(e, r);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.addEventListener */
  addEventListener(e, r) {
    _private.get(this).php.addEventListener(e, r);
  }
  /** @inheritDoc @php-wasm/universal!/PHP.removeEventListener */
  removeEventListener(e, r) {
    _private.get(this).php.removeEventListener(e, r);
  }
}
const responseTexts = {
  500: "Internal Server Error",
  502: "Bad Gateway",
  404: "Not Found",
  403: "Forbidden",
  401: "Unauthorized",
  400: "Bad Request",
  301: "Moved Permanently",
  302: "Found",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  204: "No Content",
  201: "Created",
  200: "OK"
};
class PHPResponse {
  constructor(e, r, s, i = "", n = 0) {
    this.httpStatusCode = e, this.headers = r, this.bytes = s, this.exitCode = n, this.errors = i;
  }
  static forHttpCode(e, r = "") {
    return new PHPResponse(
      e,
      {},
      new TextEncoder().encode(
        r || responseTexts[e] || ""
      )
    );
  }
  static fromRawData(e) {
    return new PHPResponse(
      e.httpStatusCode,
      e.headers,
      e.bytes,
      e.errors,
      e.exitCode
    );
  }
  toRawData() {
    return {
      headers: this.headers,
      bytes: this.bytes,
      errors: this.errors,
      exitCode: this.exitCode,
      httpStatusCode: this.httpStatusCode
    };
  }
  /**
   * Response body as JSON.
   */
  get json() {
    return JSON.parse(this.text);
  }
  /**
   * Response body as text.
   */
  get text() {
    return new TextDecoder().decode(this.bytes);
  }
}
const RuntimeId = Symbol("RuntimeId"), loadedRuntimes = /* @__PURE__ */ new Map();
let lastRuntimeId = 0;
async function loadPHPRuntime(t, e = {}) {
  const [r, s, i] = makePromise(), n = t.init(currentJsRuntime, {
    onAbort(a) {
      i(a), logger.error(a);
    },
    ENV: {},
    // Emscripten sometimes prepends a '/' to the path, which
    // breaks vite dev mode. An identity `locateFile` function
    // fixes it.
    locateFile: (a) => a,
    ...e,
    noInitialRun: !0,
    onRuntimeInitialized() {
      e.onRuntimeInitialized && e.onRuntimeInitialized(), s();
    }
  });
  await r;
  const o = ++lastRuntimeId;
  return n.id = o, n.originalExit = n._exit, n._exit = function(a) {
    return n.outboundNetworkProxyServer && (n.outboundNetworkProxyServer.close(), n.outboundNetworkProxyServer.closeAllConnections()), loadedRuntimes.delete(o), n.originalExit(a);
  }, n[RuntimeId] = o, loadedRuntimes.set(o, n), o;
}
function getLoadedRuntime(t) {
  return loadedRuntimes.get(t);
}
const currentJsRuntime = function() {
  var t;
  return typeof process < "u" && ((t = process.release) == null ? void 0 : t.name) === "node" ? "NODE" : typeof window < "u" ? "WEB" : typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope ? "WORKER" : "NODE";
}(), makePromise = () => {
  const t = [], e = new Promise((r, s) => {
    t.push(r, s);
  });
  return t.unshift(e), t;
}, kError = Symbol("error"), kMessage = Symbol("message");
class ErrorEvent2 extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param type The name of the event
   * @param options A dictionary object that allows for setting
   *                  attributes via object members of the same name.
   */
  constructor(e, r = {}) {
    super(e), this[kError] = r.error === void 0 ? null : r.error, this[kMessage] = r.message === void 0 ? "" : r.message;
  }
  get error() {
    return this[kError];
  }
  get message() {
    return this[kMessage];
  }
}
Object.defineProperty(ErrorEvent2.prototype, "error", { enumerable: !0 });
Object.defineProperty(ErrorEvent2.prototype, "message", { enumerable: !0 });
const ErrorEvent = typeof globalThis.ErrorEvent == "function" ? globalThis.ErrorEvent : ErrorEvent2;
function isExitCodeZero(t) {
  return t instanceof Error ? "exitCode" in t && (t == null ? void 0 : t.exitCode) === 0 || (t == null ? void 0 : t.name) === "ExitStatus" && "status" in t && t.status === 0 : !1;
}
class UnhandledRejectionsTarget extends EventTarget {
  constructor() {
    super(...arguments), this.listenersCount = 0;
  }
  addEventListener(e, r) {
    ++this.listenersCount, super.addEventListener(e, r);
  }
  removeEventListener(e, r) {
    --this.listenersCount, super.removeEventListener(e, r);
  }
  hasListeners() {
    return this.listenersCount > 0;
  }
}
function improveWASMErrorReporting(t) {
  const e = new UnhandledRejectionsTarget();
  for (const r in t.wasmExports)
    if (typeof t.wasmExports[r] == "function") {
      const s = t.wasmExports[r];
      t.wasmExports[r] = function(...i) {
        var n;
        try {
          return s(...i);
        } catch (o) {
          if (!(o instanceof Error))
            throw o;
          const a = clarifyErrorMessage(
            o,
            (n = t.lastAsyncifyStackSource) == null ? void 0 : n.stack
          );
          if (t.lastAsyncifyStackSource && (o.cause = t.lastAsyncifyStackSource), e.hasListeners()) {
            e.dispatchEvent(
              new ErrorEvent("error", {
                error: o,
                message: a
              })
            );
            return;
          }
          throw isExitCodeZero(o) || showCriticalErrorBox(a), o;
        }
      };
    }
  return e;
}
let functionsMaybeMissingFromAsyncify = [];
function getFunctionsMaybeMissingFromAsyncify() {
  return functionsMaybeMissingFromAsyncify;
}
function clarifyErrorMessage(t, e) {
  if (t.message === "unreachable") {
    let r = UNREACHABLE_ERROR;
    e || (r += `

This stack trace is lacking. For a better one initialize 
the PHP runtime with { debug: true }, e.g. PHPNode.load('8.1', { debug: true }).

`), functionsMaybeMissingFromAsyncify = extractPHPFunctionsFromStack(
      e || t.stack || ""
    );
    for (const s of functionsMaybeMissingFromAsyncify)
      r += `    * ${s}
`;
    return r;
  }
  return t.message;
}
const UNREACHABLE_ERROR = `
"unreachable" WASM instruction executed.

The typical reason is a PHP function missing from the ASYNCIFY_ONLY
list when building PHP.wasm.

You will need to file a new issue in the WordPress Playground repository
and paste this error message there:

https://github.com/WordPress/wordpress-playground/issues/new

If you're a core developer, the typical fix is to:

* Isolate a minimal reproduction of the error
* Add a reproduction of the error to php-asyncify.spec.ts in the WordPress Playground repository
* Run 'npm run fix-asyncify'
* Commit the changes, push to the repo, release updated NPM packages

Below is a list of all the PHP functions found in the stack trace to
help with the minimal reproduction. If they're all already listed in
the Dockerfile, you'll need to trigger this error again with long stack
traces enabled. In node.js, you can do it using the --stack-trace-limit=100
CLI option: 

`, redBg = "\x1B[41m", bold = "\x1B[1m", reset = "\x1B[0m", eol = "\x1B[K";
let logged = !1;
function showCriticalErrorBox(t) {
  if (!logged && (logged = !0, !(t != null && t.trim().startsWith("Program terminated with exit")))) {
    logger.log(`${redBg}
${eol}
${bold}  WASM ERROR${reset}${redBg}`);
    for (const e of t.split(`
`))
      logger.log(`${eol}  ${e} `);
    logger.log(`${reset}`);
  }
}
function extractPHPFunctionsFromStack(t) {
  try {
    const e = t.split(`
`).slice(1).map((r) => {
      const s = r.trim().substring(3).split(" ");
      return {
        fn: s.length >= 2 ? s[0] : "<unknown>",
        isWasm: r.includes("wasm://")
      };
    }).filter(
      ({ fn: r, isWasm: s }) => s && !r.startsWith("dynCall_") && !r.startsWith("invoke_")
    ).map(({ fn: r }) => r);
    return Array.from(new Set(e));
  } catch {
    return [];
  }
}
const STRING = "string", NUMBER = "number", __private__dont__use = Symbol("__private__dont__use");
class PHPExecutionFailureError extends Error {
  constructor(e, r, s) {
    super(e), this.response = r, this.source = s;
  }
}
const PHP_INI_PATH = "/internal/shared/php.ini", AUTO_PREPEND_SCRIPT = "/internal/shared/auto_prepend_file.php";
var x, g, w, _, E, T, J, I, Y, C, Z, A, K, N, X, M, Q, j, ee, U, te, L, re, q, se, b, V, $, ie, B, ne, O, oe;
class PHP {
  /**
   * Initializes a PHP runtime.
   *
   * @internal
   * @param  PHPRuntime - Optional. PHP Runtime ID as initialized by loadPHPRuntime.
   * @param  requestHandlerOptions - Optional. Options for the PHPRequestHandler. If undefined, no request handler will be initialized.
   */
  constructor(t) {
    /**
     * Prepares the $_SERVER entries for the PHP runtime.
     *
     * @param defaults Default entries to include in $_SERVER.
     * @param headers HTTP headers to include in $_SERVER (as HTTP_ prefixed entries).
     * @param port HTTP port, used to determine infer $_SERVER['HTTPS'] value if none
     *             was provided.
     * @returns Computed $_SERVER entries.
     */
    u(this, T);
    u(this, I);
    u(this, C);
    u(this, A);
    u(this, N);
    u(this, M);
    u(this, j);
    u(this, U);
    u(this, L);
    u(this, q);
    u(this, b);
    u(this, $);
    u(this, B);
    u(this, O);
    u(this, x, void 0);
    u(this, g, void 0);
    u(this, w, void 0);
    u(this, _, void 0);
    u(this, E, void 0);
    h(this, g, !1), h(this, w, null), h(this, _, /* @__PURE__ */ new Map()), h(this, E, []), this.semaphore = new Semaphore({ concurrency: 1 }), t !== void 0 && this.initializeRuntime(t);
  }
  /**
   * Adds an event listener for a PHP event.
   * @param eventType - The type of event to listen for.
   * @param listener - The listener function to be called when the event is triggered.
   */
  addEventListener(t, e) {
    p(this, _).has(t) || p(this, _).set(t, /* @__PURE__ */ new Set()), p(this, _).get(t).add(e);
  }
  /**
   * Removes an event listener for a PHP event.
   * @param eventType - The type of event to remove the listener from.
   * @param listener - The listener function to be removed.
   */
  removeEventListener(t, e) {
    var r;
    (r = p(this, _).get(t)) == null || r.delete(e);
  }
  dispatchEvent(t) {
    const e = p(this, _).get(t.type);
    if (e)
      for (const r of e)
        r(t);
  }
  /**
   * Listens to message sent by the PHP code.
   *
   * To dispatch messages, call:
   *
   *     post_message_to_js(string $data)
   *
   *     Arguments:
   *         $data (string) – Data to pass to JavaScript.
   *
   * @example
   *
   * ```ts
   * const php = await PHP.load('8.0');
   *
   * php.onMessage(
   *     // The data is always passed as a string
   *     function (data: string) {
   *         // Let's decode and log the data:
   *         console.log(JSON.parse(data));
   *     }
   * );
   *
   * // Now that we have a listener in place, let's
   * // dispatch a message:
   * await php.run({
   *     code: `<?php
   *         post_message_to_js(
   *             json_encode([
   *                 'post_id' => '15',
   *                 'post_title' => 'This is a blog post!'
   *             ])
   *         ));
   *     `,
   * });
   * ```
   *
   * @param listener Callback function to handle the message.
   */
  onMessage(t) {
    p(this, E).push(t);
  }
  async setSpawnHandler(handler) {
    typeof handler == "string" && (handler = createSpawnHandler(eval(handler))), this[__private__dont__use].spawnProcess = handler;
  }
  /** @deprecated Use PHPRequestHandler instead. */
  get absoluteUrl() {
    return this.requestHandler.absoluteUrl;
  }
  /** @deprecated Use PHPRequestHandler instead. */
  get documentRoot() {
    return this.requestHandler.documentRoot;
  }
  /** @deprecated Use PHPRequestHandler instead. */
  pathToInternalUrl(t) {
    return this.requestHandler.pathToInternalUrl(t);
  }
  /** @deprecated Use PHPRequestHandler instead. */
  internalUrlToPath(t) {
    return this.requestHandler.internalUrlToPath(t);
  }
  initializeRuntime(t) {
    if (this[__private__dont__use])
      throw new Error("PHP runtime already initialized.");
    const e = getLoadedRuntime(t);
    if (!e)
      throw new Error("Invalid PHP runtime id.");
    this[__private__dont__use] = e, this[__private__dont__use].ccall(
      "wasm_set_phpini_path",
      null,
      ["string"],
      [PHP_INI_PATH]
    ), this.fileExists(PHP_INI_PATH) || this.writeFile(
      PHP_INI_PATH,
      [
        "auto_prepend_file=" + AUTO_PREPEND_SCRIPT,
        "memory_limit=256M",
        "ignore_repeated_errors = 1",
        "error_reporting = E_ALL",
        "display_errors = 1",
        "html_errors = 1",
        "display_startup_errors = On",
        "log_errors = 1",
        "always_populate_raw_post_data = -1",
        "upload_max_filesize = 2000M",
        "post_max_size = 2000M",
        "disable_functions = curl_exec,curl_multi_exec",
        "allow_url_fopen = Off",
        "allow_url_include = Off",
        "session.save_path = /home/web_user",
        "implicit_flush = 1",
        "output_buffering = 0",
        "max_execution_time = 0",
        "max_input_time = -1"
      ].join(`
`)
    ), this.fileExists(AUTO_PREPEND_SCRIPT) || this.writeFile(
      AUTO_PREPEND_SCRIPT,
      `<?php
				// Define constants set via defineConstant() calls
				if(file_exists('/internal/shared/consts.json')) {
					$consts = json_decode(file_get_contents('/internal/shared/consts.json'), true);
					foreach ($consts as $const => $value) {
						if (!defined($const) && is_scalar($value)) {
							define($const, $value);
						}
					}
				}
				// Preload all the files from /internal/shared/preload
				foreach (glob('/internal/shared/preload/*.php') as $file) {
					require_once $file;
				}
				`
    ), e.onMessage = async (r) => {
      for (const s of p(this, E)) {
        const i = await s(r);
        if (i)
          return i;
      }
      return "";
    }, h(this, w, improveWASMErrorReporting(e)), this.dispatchEvent({
      type: "runtime.initialized"
    });
  }
  /** @inheritDoc */
  async setSapiName(t) {
    if (this[__private__dont__use].ccall(
      "wasm_set_sapi_name",
      NUMBER,
      [STRING],
      [t]
    ) !== 0)
      throw new Error(
        "Could not set SAPI name. This can only be done before the PHP WASM module is initialized.Did you already dispatch any requests?"
      );
    h(this, x, t);
  }
  /**
   * Changes the current working directory in the PHP filesystem.
   * This is the directory that will be used as the base for relative paths.
   * For example, if the current working directory is `/root/php`, and the
   * path is `data`, the absolute path will be `/root/php/data`.
   *
   * @param  path - The new working directory.
   */
  chdir(t) {
    this[__private__dont__use].FS.chdir(t);
  }
  /**
   * Do not use. Use new PHPRequestHandler() instead.
   * @deprecated
   */
  async request(t) {
    if (logger.warn(
      "PHP.request() is deprecated. Please use new PHPRequestHandler() instead."
    ), !this.requestHandler)
      throw new Error("No request handler available.");
    return this.requestHandler.request(t);
  }
  /**
   * Runs PHP code.
   *
   * This low-level method directly interacts with the WebAssembly
   * PHP interpreter.
   *
   * Every time you call run(), it prepares the PHP
   * environment and:
   *
   * * Resets the internal PHP state
   * * Populates superglobals ($_SERVER, $_GET, etc.)
   * * Handles file uploads
   * * Populates input streams (stdin, argv, etc.)
   * * Sets the current working directory
   *
   * You can use run() in two primary modes:
   *
   * ### Code snippet mode
   *
   * In this mode, you pass a string containing PHP code to run.
   *
   * ```ts
   * const result = await php.run({
   * 	code: `<?php echo "Hello world!";`
   * });
   * // result.text === "Hello world!"
   * ```
   *
   * In this mode, information like __DIR__ or __FILE__ isn't very
   * useful because the code is not associated with any file.
   *
   * Under the hood, the PHP snippet is passed to the `zend_eval_string`
   * C function.
   *
   * ### File mode
   *
   * In the file mode, you pass a scriptPath and PHP executes a file
   * found at a that path:
   *
   * ```ts
   * php.writeFile(
   * 	"/www/index.php",
   * 	`<?php echo "Hello world!";"`
   * );
   * const result = await php.run({
   * 	scriptPath: "/www/index.php"
   * });
   * // result.text === "Hello world!"
   * ```
   *
   * In this mode, you can rely on path-related information like __DIR__
   * or __FILE__.
   *
   * Under the hood, the PHP file is executed with the `php_execute_script`
   * C function.
   *
   * The `run()` method cannot be used in conjunction with `cli()`.
   *
   * @example
   * ```js
   * const result = await php.run(`<?php
   *  $fp = fopen('php://stderr', 'w');
   *  fwrite($fp, "Hello, world!");
   * `);
   * // result.errors === "Hello, world!"
   * ```
   *
   * @param  options - PHP runtime options.
   */
  async run(t) {
    const e = await this.semaphore.acquire();
    let r;
    try {
      if (p(this, g) || (d(this, I, Y).call(this), h(this, g, !0)), t.scriptPath && !this.fileExists(t.scriptPath))
        throw new Error(
          `The script path "${t.scriptPath}" does not exist.`
        );
      d(this, A, K).call(this, t.relativeUri || ""), d(this, U, te).call(this, t.method || "GET");
      const s = normalizeHeaders(t.headers || {}), i = s.host || "example.com:443", n = d(this, j, ee).call(this, i, t.protocol || "http");
      if (d(this, N, X).call(this, i), d(this, M, Q).call(this, n), d(this, L, re).call(this, s), t.body && (r = d(this, q, se).call(this, t.body)), typeof t.code == "string")
        this.writeFile("/internal/eval.php", t.code), d(this, b, V).call(this, "/internal/eval.php");
      else if (typeof t.scriptPath == "string")
        d(this, b, V).call(this, t.scriptPath || "");
      else
        throw new TypeError(
          "The request object must have either a `code` or a `scriptPath` property."
        );
      const o = d(this, T, J).call(this, t.$_SERVER, s, n);
      for (const c in o)
        d(this, $, ie).call(this, c, o[c]);
      const a = t.env || {};
      for (const c in a)
        d(this, B, ne).call(this, c, a[c]);
      const l = await d(this, O, oe).call(this);
      if (l.exitCode !== 0) {
        logger.warn("PHP.run() output was:", l.text);
        const c = new PHPExecutionFailureError(
          `PHP.run() failed with exit code ${l.exitCode} and the following output: ` + l.errors,
          l,
          "request"
        );
        throw logger.error(c), c;
      }
      return l;
    } catch (s) {
      throw this.dispatchEvent({
        type: "request.error",
        error: s,
        // Distinguish between PHP request and PHP-wasm errors
        source: s.source ?? "php-wasm"
      }), s;
    } finally {
      try {
        r && this[__private__dont__use].free(r);
      } finally {
        e(), this.dispatchEvent({
          type: "request.end"
        });
      }
    }
  }
  /**
   * Defines a constant in the PHP runtime.
   * @param key - The name of the constant.
   * @param value - The value of the constant.
   */
  defineConstant(t, e) {
    let r = {};
    try {
      r = JSON.parse(
        this.fileExists("/internal/shared/consts.json") && this.readFileAsText("/internal/shared/consts.json") || "{}"
      );
    } catch {
    }
    this.writeFile(
      "/internal/shared/consts.json",
      JSON.stringify({
        ...r,
        [t]: e
      })
    );
  }
  /**
   * Recursively creates a directory with the given path in the PHP filesystem.
   * For example, if the path is `/root/php/data`, and `/root` already exists,
   * it will create the directories `/root/php` and `/root/php/data`.
   *
   * @param  path - The directory path to create.
   */
  mkdir(t) {
    return FSHelpers.mkdir(this[__private__dont__use].FS, t);
  }
  /**
   * @deprecated Use mkdir instead.
   */
  mkdirTree(t) {
    return FSHelpers.mkdir(this[__private__dont__use].FS, t);
  }
  /**
   * Reads a file from the PHP filesystem and returns it as a string.
   *
   * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
   * @param  path - The file path to read.
   * @returns The file contents.
   */
  readFileAsText(t) {
    return FSHelpers.readFileAsText(this[__private__dont__use].FS, t);
  }
  /**
   * Reads a file from the PHP filesystem and returns it as an array buffer.
   *
   * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
   * @param  path - The file path to read.
   * @returns The file contents.
   */
  readFileAsBuffer(t) {
    return FSHelpers.readFileAsBuffer(this[__private__dont__use].FS, t);
  }
  /**
   * Overwrites data in a file in the PHP filesystem.
   * Creates a new file if one doesn't exist yet.
   *
   * @param  path - The file path to write to.
   * @param  data - The data to write to the file.
   */
  writeFile(t, e) {
    return FSHelpers.writeFile(this[__private__dont__use].FS, t, e);
  }
  /**
   * Removes a file from the PHP filesystem.
   *
   * @throws {@link @php-wasm/universal:ErrnoError} – If the file doesn't exist.
   * @param  path - The file path to remove.
   */
  unlink(t) {
    return FSHelpers.unlink(this[__private__dont__use].FS, t);
  }
  /**
   * Moves a file or directory in the PHP filesystem to a
   * new location.
   *
   * @param oldPath The path to rename.
   * @param newPath The new path.
   */
  mv(t, e) {
    return FSHelpers.mv(this[__private__dont__use].FS, t, e);
  }
  /**
   * Removes a directory from the PHP filesystem.
   *
   * @param path The directory path to remove.
   * @param options Options for the removal.
   */
  rmdir(t, e = { recursive: !0 }) {
    return FSHelpers.rmdir(this[__private__dont__use].FS, t, e);
  }
  /**
   * Lists the files and directories in the given directory.
   *
   * @param  path - The directory path to list.
   * @param  options - Options for the listing.
   * @returns The list of files and directories in the given directory.
   */
  listFiles(t, e = { prependPath: !1 }) {
    return FSHelpers.listFiles(
      this[__private__dont__use].FS,
      t,
      e
    );
  }
  /**
   * Checks if a directory exists in the PHP filesystem.
   *
   * @param  path – The path to check.
   * @returns True if the path is a directory, false otherwise.
   */
  isDir(t) {
    return FSHelpers.isDir(this[__private__dont__use].FS, t);
  }
  /**
   * Checks if a file exists in the PHP filesystem.
   *
   * @param  path – The path to check.
   * @returns True if the path is a file, false otherwise.
   */
  isFile(t) {
    return FSHelpers.isFile(this[__private__dont__use].FS, t);
  }
  /**
   * Creates a symlink in the PHP filesystem.
   * @param target
   * @param path
   */
  symlink(t, e) {
    return FSHelpers.symlink(this[__private__dont__use].FS, t, e);
  }
  /**
   * Checks if a path is a symlink in the PHP filesystem.
   *
   * @param path
   * @returns True if the path is a symlink, false otherwise.
   */
  isSymlink(t) {
    return FSHelpers.isSymlink(this[__private__dont__use].FS, t);
  }
  /**
   * Reads the target of a symlink in the PHP filesystem.
   *
   * @param path
   * @returns The target of the symlink.
   */
  readlink(t) {
    return FSHelpers.readlink(this[__private__dont__use].FS, t);
  }
  /**
   * Resolves the real path of a file in the PHP filesystem.
   * @param path
   * @returns The real path of the file.
   */
  realpath(t) {
    return FSHelpers.realpath(this[__private__dont__use].FS, t);
  }
  /**
   * Checks if a file (or a directory) exists in the PHP filesystem.
   *
   * @param  path - The file path to check.
   * @returns True if the file exists, false otherwise.
   */
  fileExists(t) {
    return FSHelpers.fileExists(this[__private__dont__use].FS, t);
  }
  /**
   * Hot-swaps the PHP runtime for a new one without
   * interrupting the operations of this PHP instance.
   *
   * @param runtime
   * @param cwd. Internal, the VFS path to recreate in the new runtime.
   *             This arg is temporary and will be removed once BasePHP
   *             is fully decoupled from the request handler and
   *             accepts a constructor-level cwd argument.
   */
  hotSwapPHPRuntime(t, e) {
    const r = this[__private__dont__use].FS;
    try {
      this.exit();
    } catch {
    }
    this.initializeRuntime(t), p(this, x) && this.setSapiName(p(this, x)), e && copyFS(r, this[__private__dont__use].FS, e);
  }
  /**
   * Mounts a filesystem to a given path in the PHP filesystem.
   *
   * @param  virtualFSPath - Where to mount it in the PHP virtual filesystem.
   * @param  mountHandler - The mount handler to use.
   * @return Unmount function to unmount the filesystem.
   */
  async mount(t, e) {
    return await e(
      this,
      this[__private__dont__use].FS,
      t
    );
  }
  /**
   * Starts a PHP CLI session with given arguments.
   *
   * This method can only be used when PHP was compiled with the CLI SAPI
   * and it cannot be used in conjunction with `run()`.
   *
   * Once this method finishes running, the PHP instance is no
   * longer usable and should be discarded. This is because PHP
   * internally cleans up all the resources and calls exit().
   *
   * @param  argv - The arguments to pass to the CLI.
   * @returns The exit code of the CLI session.
   */
  async cli(t) {
    for (const e of t)
      this[__private__dont__use].ccall(
        "wasm_add_cli_arg",
        null,
        [STRING],
        [e]
      );
    try {
      return await this[__private__dont__use].ccall(
        "run_cli",
        null,
        [],
        [],
        {
          async: !0
        }
      );
    } catch (e) {
      if (isExitCodeZero(e))
        return 0;
      throw e;
    }
  }
  setSkipShebang(t) {
    this[__private__dont__use].ccall(
      "wasm_set_skip_shebang",
      null,
      [NUMBER],
      [t ? 1 : 0]
    );
  }
  exit(t = 0) {
    this.dispatchEvent({
      type: "runtime.beforedestroy"
    });
    try {
      this[__private__dont__use]._exit(t);
    } catch {
    }
    h(this, g, !1), h(this, w, null), delete this[__private__dont__use].onMessage, delete this[__private__dont__use];
  }
  [Symbol.dispose]() {
    p(this, g) && this.exit(0);
  }
}
x = new WeakMap(), g = new WeakMap(), w = new WeakMap(), _ = new WeakMap(), E = new WeakMap(), T = new WeakSet(), J = function(t, e, r) {
  const s = {
    ...t || {}
  };
  s.HTTPS = s.HTTPS || r === 443 ? "on" : "off";
  for (const i in e) {
    let n = "HTTP_";
    ["content-type", "content-length"].includes(i.toLowerCase()) && (n = ""), s[`${n}${i.toUpperCase().replace(/-/g, "_")}`] = e[i];
  }
  return s;
}, I = new WeakSet(), Y = function() {
  this[__private__dont__use].ccall("php_wasm_init", null, [], []);
}, C = new WeakSet(), Z = function() {
  const t = "/internal/headers.json";
  if (!this.fileExists(t))
    throw new Error(
      "SAPI Error: Could not find response headers file."
    );
  const e = JSON.parse(this.readFileAsText(t)), r = {};
  for (const s of e.headers) {
    if (!s.includes(": "))
      continue;
    const i = s.indexOf(": "), n = s.substring(0, i).toLowerCase(), o = s.substring(i + 2);
    n in r || (r[n] = []), r[n].push(o);
  }
  return {
    headers: r,
    httpStatusCode: e.status
  };
}, A = new WeakSet(), K = function(t) {
  if (this[__private__dont__use].ccall(
    "wasm_set_request_uri",
    null,
    [STRING],
    [t]
  ), t.includes("?")) {
    const e = t.substring(t.indexOf("?") + 1);
    this[__private__dont__use].ccall(
      "wasm_set_query_string",
      null,
      [STRING],
      [e]
    );
  }
}, N = new WeakSet(), X = function(t) {
  this[__private__dont__use].ccall(
    "wasm_set_request_host",
    null,
    [STRING],
    [t]
  );
}, M = new WeakSet(), Q = function(t) {
  this[__private__dont__use].ccall(
    "wasm_set_request_port",
    null,
    [NUMBER],
    [t]
  );
}, j = new WeakSet(), ee = function(t, e) {
  let r;
  try {
    r = parseInt(new URL(t).port, 10);
  } catch {
  }
  return (!r || isNaN(r) || r === 80) && (r = e === "https" ? 443 : 80), r;
}, U = new WeakSet(), te = function(t) {
  this[__private__dont__use].ccall(
    "wasm_set_request_method",
    null,
    [STRING],
    [t]
  );
}, L = new WeakSet(), re = function(t) {
  t.cookie && this[__private__dont__use].ccall(
    "wasm_set_cookies",
    null,
    [STRING],
    [t.cookie]
  ), t["content-type"] && this[__private__dont__use].ccall(
    "wasm_set_content_type",
    null,
    [STRING],
    [t["content-type"]]
  ), t["content-length"] && this[__private__dont__use].ccall(
    "wasm_set_content_length",
    null,
    [NUMBER],
    [parseInt(t["content-length"], 10)]
  );
}, q = new WeakSet(), se = function(t) {
  let e, r;
  typeof t == "string" ? (logger.warn(
    "Passing a string as the request body is deprecated. Please use a Uint8Array instead. See https://github.com/WordPress/wordpress-playground/issues/997 for more details"
  ), r = this[__private__dont__use].lengthBytesUTF8(t), e = r + 1) : (r = t.byteLength, e = t.byteLength);
  const s = this[__private__dont__use].malloc(e);
  if (!s)
    throw new Error("Could not allocate memory for the request body.");
  return typeof t == "string" ? this[__private__dont__use].stringToUTF8(
    t,
    s,
    e + 1
  ) : this[__private__dont__use].HEAPU8.set(t, s), this[__private__dont__use].ccall(
    "wasm_set_request_body",
    null,
    [NUMBER],
    [s]
  ), this[__private__dont__use].ccall(
    "wasm_set_content_length",
    null,
    [NUMBER],
    [r]
  ), s;
}, b = new WeakSet(), V = function(t) {
  this[__private__dont__use].ccall(
    "wasm_set_path_translated",
    null,
    [STRING],
    [t]
  );
}, $ = new WeakSet(), ie = function(t, e) {
  this[__private__dont__use].ccall(
    "wasm_add_SERVER_entry",
    null,
    [STRING, STRING],
    [t, e]
  );
}, B = new WeakSet(), ne = function(t, e) {
  this[__private__dont__use].ccall(
    "wasm_add_ENV_entry",
    null,
    [STRING, STRING],
    [t, e]
  );
}, O = new WeakSet(), oe = async function() {
  var i;
  let t, e;
  try {
    t = await new Promise((n, o) => {
      var l;
      e = (c) => {
        logger.error(c), logger.error(c.error);
        const P = new Error("Rethrown");
        P.cause = c.error, P.betterMessage = c.message, o(P);
      }, (l = p(this, w)) == null || l.addEventListener(
        "error",
        e
      );
      const a = this[__private__dont__use].ccall(
        "wasm_sapi_handle_request",
        NUMBER,
        [],
        [],
        { async: !0 }
      );
      return a instanceof Promise ? a.then(n, o) : n(a);
    });
  } catch (n) {
    for (const c in this)
      typeof this[c] == "function" && (this[c] = () => {
        throw new Error(
          "PHP runtime has crashed – see the earlier error for details."
        );
      });
    this.functionsMaybeMissingFromAsyncify = getFunctionsMaybeMissingFromAsyncify();
    const o = n, a = "betterMessage" in o ? o.betterMessage : o.message, l = new Error(a);
    throw l.cause = o, logger.error(l), l;
  } finally {
    (i = p(this, w)) == null || i.removeEventListener("error", e);
  }
  const { headers: r, httpStatusCode: s } = d(this, C, Z).call(this);
  return new PHPResponse(
    t === 0 ? s : 500,
    r,
    this.readFileAsBuffer("/internal/stdout"),
    this.readFileAsText("/internal/stderr"),
    t
  );
};
function normalizeHeaders(t) {
  const e = {};
  for (const r in t)
    e[r.toLowerCase()] = t[r];
  return e;
}
function copyFS(t, e, r) {
  let s;
  try {
    s = t.lookupPath(r);
  } catch {
    return;
  }
  if (!("contents" in s.node))
    return;
  if (!t.isDir(s.node.mode)) {
    e.writeFile(r, t.readFile(r));
    return;
  }
  e.mkdirTree(r);
  const i = t.readdir(r).filter((n) => n !== "." && n !== "..");
  for (const n of i)
    copyFS(t, e, joinPaths(r, n));
}
async function getPhpIniEntries(t, e) {
  const r = parse(await t.readFileAsText(PHP_INI_PATH));
  if (e === void 0)
    return r;
  const s = {};
  for (const i of e)
    s[i] = r[i];
  return s;
}
async function setPhpIniEntries(t, e) {
  const r = parse(await t.readFileAsText(PHP_INI_PATH));
  for (const [s, i] of Object.entries(e))
    i == null ? delete r[s] : r[s] = i;
  await t.writeFile(PHP_INI_PATH, stringify(r));
}
async function withPHPIniValues(t, e, r) {
  const s = await t.readFileAsText(PHP_INI_PATH);
  try {
    return await setPhpIniEntries(t, e), await r();
  } finally {
    await t.writeFile(PHP_INI_PATH, s);
  }
}
class HttpCookieStore {
  constructor() {
    this.cookies = {};
  }
  rememberCookiesFromResponseHeaders(e) {
    if (e != null && e["set-cookie"])
      for (const r of e["set-cookie"])
        try {
          if (!r.includes("="))
            continue;
          const s = r.indexOf("="), i = r.substring(0, s), n = r.substring(s + 1).split(";")[0];
          this.cookies[i] = n;
        } catch (s) {
          logger.error(s);
        }
  }
  getCookieRequestHeader() {
    const e = [];
    for (const r in this.cookies)
      e.push(`${r}=${this.cookies[r]}`);
    return e.join("; ");
  }
}
function streamReadFileFromPHP(t, e) {
  return new ReadableStream({
    async pull(r) {
      const s = await t.readFileAsBuffer(e);
      r.enqueue(s), r.close();
    }
  });
}
async function* iteratePhpFiles(t, e, {
  relativePaths: r = !0,
  pathPrefix: s,
  exceptPaths: i = []
} = {}) {
  e = normalizePath(e);
  const n = [e];
  for (; n.length; ) {
    const o = n.pop();
    if (!o)
      return;
    const a = await t.listFiles(o);
    for (const l of a) {
      const c = `${o}/${l}`;
      if (i.includes(c.substring(e.length + 1)))
        continue;
      await t.isDir(c) ? n.push(c) : yield new StreamedFile(
        streamReadFileFromPHP(t, c),
        r ? joinPaths(
          s || "",
          c.substring(e.length + 1)
        ) : c
      );
    }
  }
}
function writeFilesStreamToPhp(t, e) {
  return new WritableStream({
    async write(r) {
      const s = joinPaths(e, r.name);
      r.type === "directory" ? await t.mkdir(s) : (await t.mkdir(dirname(s)), await t.writeFile(
        s,
        new Uint8Array(await r.arrayBuffer())
      ));
    }
  });
}
class MaxPhpInstancesError extends Error {
  constructor(e) {
    super(
      `Requested more concurrent PHP instances than the limit (${e}).`
    ), this.name = this.constructor.name;
  }
}
class PHPProcessManager {
  constructor(e) {
    this.primaryIdle = !0, this.nextInstance = null, this.allInstances = [], this.maxPhpInstances = (e == null ? void 0 : e.maxPhpInstances) ?? 5, this.phpFactory = e == null ? void 0 : e.phpFactory, this.primaryPhp = e == null ? void 0 : e.primaryPhp, this.semaphore = new Semaphore({
      concurrency: this.maxPhpInstances,
      /**
       * Wait up to 5 seconds for resources to become available
       * before assuming that all the PHP instances are deadlocked.
       */
      timeout: (e == null ? void 0 : e.timeout) || 5e3
    });
  }
  /**
   * Get the primary PHP instance.
   *
   * If the primary PHP instance is not set, it will be spawned
   * using the provided phpFactory.
   *
   * @throws {Error} when called twice before the first call is resolved.
   */
  async getPrimaryPhp() {
    if (!this.phpFactory && !this.primaryPhp)
      throw new Error(
        "phpFactory or primaryPhp must be set before calling getPrimaryPhp()."
      );
    if (!this.primaryPhp) {
      const e = await this.spawn({ isPrimary: !0 });
      this.primaryPhp = e.php;
    }
    return this.primaryPhp;
  }
  /**
   * Get a PHP instance.
   *
   * It could be either the primary PHP instance, an idle disposable PHP
   * instance, or a newly spawned PHP instance – depending on the resource
   * availability.
   *
   * @throws {MaxPhpInstancesError} when the maximum number of PHP instances is reached
   *                                and the waiting timeout is exceeded.
   */
  async acquirePHPInstance() {
    if (this.primaryIdle)
      return this.primaryIdle = !1, {
        php: await this.getPrimaryPhp(),
        reap: () => this.primaryIdle = !0
      };
    const e = this.nextInstance || this.spawn({ isPrimary: !1 });
    return this.semaphore.remaining > 0 ? this.nextInstance = this.spawn({ isPrimary: !1 }) : this.nextInstance = null, await e;
  }
  /**
   * Initiated spawning of a new PHP instance.
   * This function is synchronous on purpose – it needs to synchronously
   * add the spawn promise to the allInstances array without waiting
   * for PHP to spawn.
   */
  spawn(e) {
    if (e.isPrimary && this.allInstances.length > 0)
      throw new Error(
        "Requested spawning a primary PHP instance when another primary instance already started spawning."
      );
    const r = this.doSpawn(e);
    this.allInstances.push(r);
    const s = () => {
      this.allInstances = this.allInstances.filter(
        (i) => i !== r
      );
    };
    return r.catch((i) => {
      throw s(), i;
    }).then((i) => ({
      ...i,
      reap: () => {
        s(), i.reap();
      }
    }));
  }
  /**
   * Actually acquires the lock and spawns a new PHP instance.
   */
  async doSpawn(e) {
    let r;
    try {
      r = await this.semaphore.acquire();
    } catch (s) {
      throw s instanceof AcquireTimeoutError ? new MaxPhpInstancesError(this.maxPhpInstances) : s;
    }
    try {
      const s = await this.phpFactory(e);
      return {
        php: s,
        reap() {
          s.exit(), r();
        }
      };
    } catch (s) {
      throw r(), s;
    }
  }
  async [Symbol.asyncDispose]() {
    this.primaryPhp && this.primaryPhp.exit(), await Promise.all(
      this.allInstances.map(
        (e) => e.then(({ reap: r }) => r())
      )
    );
  }
}
const SupportedPHPVersions = [
  "8.3",
  "8.2",
  "8.1",
  "8.0",
  "7.4",
  "7.3",
  "7.2",
  "7.1",
  "7.0"
], LatestSupportedPHPVersion = SupportedPHPVersions[0], SupportedPHPVersionsList = SupportedPHPVersions, SupportedPHPExtensionsList = [
  "iconv",
  "mbstring",
  "xml-bundle",
  "gd"
], SupportedPHPExtensionBundles = {
  "kitchen-sink": SupportedPHPExtensionsList,
  light: []
}, DEFAULT_BASE_URL = "http://example.com";
function toRelativeUrl(t) {
  return t.toString().substring(t.origin.length);
}
function removePathPrefix(t, e) {
  return !e || !t.startsWith(e) ? t : t.substring(e.length);
}
function ensurePathPrefix(t, e) {
  return !e || t.startsWith(e) ? t : e + t;
}
async function encodeAsMultipart(t) {
  const e = `----${Math.random().toString(36).slice(2)}`, r = `multipart/form-data; boundary=${e}`, s = new TextEncoder(), i = [];
  for (const [l, c] of Object.entries(t))
    i.push(`--${e}\r
`), i.push(`Content-Disposition: form-data; name="${l}"`), c instanceof File && i.push(`; filename="${c.name}"`), i.push(`\r
`), c instanceof File && (i.push("Content-Type: application/octet-stream"), i.push(`\r
`)), i.push(`\r
`), c instanceof File ? i.push(await fileToUint8Array(c)) : i.push(c), i.push(`\r
`);
  i.push(`--${e}--\r
`);
  const n = i.reduce((l, c) => l + c.length, 0), o = new Uint8Array(n);
  let a = 0;
  for (const l of i)
    o.set(
      typeof l == "string" ? s.encode(l) : l,
      a
    ), a += l.length;
  return { bytes: o, contentType: r };
}
function fileToUint8Array(t) {
  return new Promise((e) => {
    const r = new FileReader();
    r.onload = () => {
      e(new Uint8Array(r.result));
    }, r.readAsArrayBuffer(t);
  });
}
const _default = "application/octet-stream", asx = "video/x-ms-asf", atom = "application/atom+xml", avi = "video/x-msvideo", avif = "image/avif", bin = "application/octet-stream", bmp = "image/x-ms-bmp", cco = "application/x-cocoa", css = "text/css", data = "application/octet-stream", deb = "application/octet-stream", der = "application/x-x509-ca-cert", dmg = "application/octet-stream", doc = "application/msword", docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document", eot = "application/vnd.ms-fontobject", flv = "video/x-flv", gif = "image/gif", gz = "application/gzip", hqx = "application/mac-binhex40", htc = "text/x-component", html = "text/html", ico = "image/x-icon", iso = "application/octet-stream", jad = "text/vnd.sun.j2me.app-descriptor", jar = "application/java-archive", jardiff = "application/x-java-archive-diff", jng = "image/x-jng", jnlp = "application/x-java-jnlp-file", jpg = "image/jpeg", jpeg = "image/jpeg", js = "application/javascript", json = "application/json", kml = "application/vnd.google-earth.kml+xml", kmz = "application/vnd.google-earth.kmz", m3u8 = "application/vnd.apple.mpegurl", m4a = "audio/x-m4a", m4v = "video/x-m4v", md = "text/plain", mid = "audio/midi", mml = "text/mathml", mng = "video/x-mng", mov = "video/quicktime", mp3 = "audio/mpeg", mp4 = "video/mp4", mpeg = "video/mpeg", msi = "application/octet-stream", odg = "application/vnd.oasis.opendocument.graphics", odp = "application/vnd.oasis.opendocument.presentation", ods = "application/vnd.oasis.opendocument.spreadsheet", odt = "application/vnd.oasis.opendocument.text", ogg = "audio/ogg", otf = "font/otf", pdf = "application/pdf", pl = "application/x-perl", png = "image/png", ppt = "application/vnd.ms-powerpoint", pptx = "application/vnd.openxmlformats-officedocument.presentationml.presentation", prc = "application/x-pilot", ps = "application/postscript", ra = "audio/x-realaudio", rar = "application/x-rar-compressed", rpm = "application/x-redhat-package-manager", rss = "application/rss+xml", rtf = "application/rtf", run = "application/x-makeself", sea = "application/x-sea", sit = "application/x-stuffit", svg = "image/svg+xml", swf = "application/x-shockwave-flash", tcl = "application/x-tcl", tar = "application/x-tar", tif = "image/tiff", ts = "video/mp2t", ttf = "font/ttf", txt = "text/plain", wasm = "application/wasm", wbmp = "image/vnd.wap.wbmp", webm = "video/webm", webp = "image/webp", wml = "text/vnd.wap.wml", wmlc = "application/vnd.wap.wmlc", wmv = "video/x-ms-wmv", woff = "font/woff", woff2 = "font/woff2", xhtml = "application/xhtml+xml", xls = "application/vnd.ms-excel", xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xml = "text/xml", xpi = "application/x-xpinstall", xspf = "application/xspf+xml", zip = "application/zip", mimeTypes = {
  _default,
  "3gpp": "video/3gpp",
  "7z": "application/x-7z-compressed",
  asx,
  atom,
  avi,
  avif,
  bin,
  bmp,
  cco,
  css,
  data,
  deb,
  der,
  dmg,
  doc,
  docx,
  eot,
  flv,
  gif,
  gz,
  hqx,
  htc,
  html,
  ico,
  iso,
  jad,
  jar,
  jardiff,
  jng,
  jnlp,
  jpg,
  jpeg,
  js,
  json,
  kml,
  kmz,
  m3u8,
  m4a,
  m4v,
  md,
  mid,
  mml,
  mng,
  mov,
  mp3,
  mp4,
  mpeg,
  msi,
  odg,
  odp,
  ods,
  odt,
  ogg,
  otf,
  pdf,
  pl,
  png,
  ppt,
  pptx,
  prc,
  ps,
  ra,
  rar,
  rpm,
  rss,
  rtf,
  run,
  sea,
  sit,
  svg,
  swf,
  tcl,
  tar,
  tif,
  ts,
  ttf,
  txt,
  wasm,
  wbmp,
  webm,
  webp,
  wml,
  wmlc,
  wmv,
  woff,
  woff2,
  xhtml,
  xls,
  xlsx,
  xml,
  xpi,
  xspf,
  zip
};
var y, R, k, v, F, f, S, H, D, ae, z, le, W, ce;
class PHPRequestHandler {
  /**
   * The request handler needs to decide whether to serve a static asset or
   * run the PHP interpreter. For static assets it should just reuse the primary
   * PHP even if there's 50 concurrent requests to serve. However, for
   * dynamic PHP requests, it needs to grab an available interpreter.
   * Therefore, it cannot just accept PHP as an argument as serving requests
   * requires access to ProcessManager.
   *
   * @param  php    - The PHP instance.
   * @param  config - Request Handler configuration.
   */
  constructor(e) {
    /**
     * Serves a static file from the PHP filesystem.
     *
     * @param  fsPath - Absolute path of the static file to serve.
     * @returns The response.
     */
    u(this, D);
    /**
     * Spawns a new PHP instance and dispatches a request to it.
     */
    u(this, z);
    /**
     * Runs the requested PHP file with all the request and $_SERVER
     * superglobals populated.
     *
     * @param  request - The request.
     * @returns The response.
     */
    u(this, W);
    u(this, y, void 0);
    u(this, R, void 0);
    u(this, k, void 0);
    u(this, v, void 0);
    u(this, F, void 0);
    u(this, f, void 0);
    u(this, S, void 0);
    u(this, H, void 0);
    const {
      documentRoot: r = "/www/",
      absoluteUrl: s = typeof location == "object" ? location == null ? void 0 : location.href : "",
      rewriteRules: i = [],
      getFileNotFoundAction: n = () => ({ type: "404" })
    } = e;
    "processManager" in e ? this.processManager = e.processManager : this.processManager = new PHPProcessManager({
      phpFactory: async (l) => {
        const c = await e.phpFactory({
          ...l,
          requestHandler: this
        });
        return c.requestHandler = this, c;
      },
      maxPhpInstances: e.maxPhpInstances
    }), h(this, H, new HttpCookieStore()), h(this, y, r);
    const o = new URL(s);
    h(this, k, o.hostname), h(this, v, o.port ? Number(o.port) : o.protocol === "https:" ? 443 : 80), h(this, R, (o.protocol || "").replace(":", ""));
    const a = p(this, v) !== 443 && p(this, v) !== 80;
    h(this, F, [
      p(this, k),
      a ? `:${p(this, v)}` : ""
    ].join("")), h(this, f, o.pathname.replace(/\/+$/, "")), h(this, S, [
      `${p(this, R)}://`,
      p(this, F),
      p(this, f)
    ].join("")), this.rewriteRules = i, this.getFileNotFoundAction = n;
  }
  async getPrimaryPhp() {
    return await this.processManager.getPrimaryPhp();
  }
  /**
   * Converts a path to an absolute URL based at the PHPRequestHandler
   * root.
   *
   * @param  path The server path to convert to an absolute URL.
   * @returns The absolute URL.
   */
  pathToInternalUrl(e) {
    return `${this.absoluteUrl}${e}`;
  }
  /**
   * Converts an absolute URL based at the PHPRequestHandler to a relative path
   * without the server pathname and scope.
   *
   * @param  internalUrl An absolute URL based at the PHPRequestHandler root.
   * @returns The relative path.
   */
  internalUrlToPath(e) {
    const r = new URL(e);
    return r.pathname.startsWith(p(this, f)) && (r.pathname = r.pathname.slice(p(this, f).length)), toRelativeUrl(r);
  }
  /**
   * The absolute URL of this PHPRequestHandler instance.
   */
  get absoluteUrl() {
    return p(this, S);
  }
  /**
   * The directory in the PHP filesystem where the server will look
   * for the files to serve. Default: `/var/www`.
   */
  get documentRoot() {
    return p(this, y);
  }
  /**
   * Serves the request – either by serving a static file, or by
   * dispatching it to the PHP runtime.
   *
   * The request() method mode behaves like a web server and only works if
   * the PHP was initialized with a `requestHandler` option (which the online
   * version of WordPress Playground does by default).
   *
   * In the request mode, you pass an object containing the request information
   * (method, headers, body, etc.) and the path to the PHP file to run:
   *
   * ```ts
   * const php = PHP.load('7.4', {
   * 	requestHandler: {
   * 		documentRoot: "/www"
   * 	}
   * })
   * php.writeFile("/www/index.php", `<?php echo file_get_contents("php://input");`);
   * const result = await php.request({
   * 	method: "GET",
   * 	headers: {
   * 		"Content-Type": "text/plain"
   * 	},
   * 	body: "Hello world!",
   * 	path: "/www/index.php"
   * });
   * // result.text === "Hello world!"
   * ```
   *
   * The `request()` method cannot be used in conjunction with `cli()`.
   *
   * @example
   * ```js
   * const output = await php.request({
   * 	method: 'GET',
   * 	url: '/index.php',
   * 	headers: {
   * 		'X-foo': 'bar',
   * 	},
   * 	body: {
   * 		foo: 'bar',
   * 	},
   * });
   * console.log(output.stdout); // "Hello world!"
   * ```
   *
   * @param  request - PHP Request data.
   */
  async request(e) {
    const r = e.url.startsWith("http://") || e.url.startsWith("https://"), s = new URL(
      // Remove the hash part of the URL as it's not meant for the server.
      e.url.split("#")[0],
      r ? void 0 : DEFAULT_BASE_URL
    ), i = applyRewriteRules(
      removePathPrefix(
        decodeURIComponent(s.pathname),
        p(this, f)
      ),
      this.rewriteRules
    ), n = await this.getPrimaryPhp();
    let o = joinPaths(p(this, y), i);
    if (n.isDir(o)) {
      if (!o.endsWith("/"))
        return new PHPResponse(
          301,
          { Location: [`${s.pathname}/`] },
          new Uint8Array(0)
        );
      for (const a of ["index.php", "index.html"]) {
        const l = joinPaths(o, a);
        if (n.isFile(l)) {
          o = l;
          break;
        }
      }
    }
    if (!n.isFile(o)) {
      const a = this.getFileNotFoundAction(
        i
      );
      switch (a.type) {
        case "response":
          return a.response;
        case "internal-redirect":
          o = joinPaths(p(this, y), a.uri);
          break;
        case "404":
          return PHPResponse.forHttpCode(404);
        default:
          throw new Error(
            `Unsupported file-not-found action type: '${a.type}'`
          );
      }
    }
    if (n.isFile(o))
      if (o.endsWith(".php")) {
        const a = {
          ...e,
          // Pass along URL with the #fragment filtered out
          url: s.toString()
        };
        return d(this, z, le).call(this, a, o);
      } else
        return d(this, D, ae).call(this, n, o);
    else
      return PHPResponse.forHttpCode(404);
  }
}
y = new WeakMap(), R = new WeakMap(), k = new WeakMap(), v = new WeakMap(), F = new WeakMap(), f = new WeakMap(), S = new WeakMap(), H = new WeakMap(), D = new WeakSet(), ae = function(e, r) {
  const s = e.readFileAsBuffer(r);
  return new PHPResponse(
    200,
    {
      "content-length": [`${s.byteLength}`],
      // @TODO: Infer the content-type from the arrayBuffer instead of the
      // file path. The code below won't return the correct mime-type if the
      // extension was tampered with.
      "content-type": [inferMimeType(r)],
      "accept-ranges": ["bytes"],
      "cache-control": ["public, max-age=0"]
    },
    s
  );
}, z = new WeakSet(), le = async function(e, r) {
  let s;
  try {
    s = await this.processManager.acquirePHPInstance();
  } catch (i) {
    return i instanceof MaxPhpInstancesError ? PHPResponse.forHttpCode(502) : PHPResponse.forHttpCode(500);
  }
  try {
    return await d(this, W, ce).call(this, s.php, e, r);
  } finally {
    s.reap();
  }
}, W = new WeakSet(), ce = async function(e, r, s) {
  let i = "GET";
  const n = {
    host: p(this, F),
    ...normalizeHeaders(r.headers || {}),
    cookie: p(this, H).getCookieRequestHeader()
  };
  let o = r.body;
  if (typeof o == "object" && !(o instanceof Uint8Array)) {
    i = "POST";
    const { bytes: a, contentType: l } = await encodeAsMultipart(o);
    o = a, n["content-type"] = l;
  }
  try {
    const a = await e.run({
      relativeUri: ensurePathPrefix(
        toRelativeUrl(new URL(r.url)),
        p(this, f)
      ),
      protocol: p(this, R),
      method: r.method || i,
      $_SERVER: {
        REMOTE_ADDR: "127.0.0.1",
        DOCUMENT_ROOT: p(this, y),
        HTTPS: p(this, S).startsWith("https://") ? "on" : ""
      },
      body: o,
      scriptPath: s,
      headers: n
    });
    return p(this, H).rememberCookiesFromResponseHeaders(
      a.headers
    ), a;
  } catch (a) {
    const l = a;
    if (l != null && l.response)
      return l.response;
    throw a;
  }
};
function inferMimeType(t) {
  const e = t.split(".").pop();
  return mimeTypes[e] || mimeTypes._default;
}
function applyRewriteRules(t, e) {
  for (const r of e)
    if (new RegExp(r.match).test(t))
      return t.replace(r.match, r.replacement);
  return t;
}
function rotatePHPRuntime({
  php: t,
  cwd: e,
  recreateRuntime: r,
  /*
   * 400 is an arbitrary number that should trigger a rotation
   * way before the memory gets too fragmented. If it doesn't,
   * let's explore:
   * * Rotating based on an actual memory usage and
   *   fragmentation.
   * * Resetting HEAP to its initial value.
   */
  maxRequests: s = 400
}) {
  let i = 0;
  async function n() {
    const l = await t.semaphore.acquire();
    try {
      t.hotSwapPHPRuntime(await r(), e), i = 0;
    } finally {
      l();
    }
  }
  async function o() {
    ++i < s || await n();
  }
  async function a(l) {
    l.type === "request.error" && l.source === "php-wasm" && await n();
  }
  return t.addEventListener("request.error", a), t.addEventListener("request.end", o), function() {
    t.removeEventListener("request.error", a), t.removeEventListener("request.end", o);
  };
}
async function writeFiles(t, e, r, { rmRoot: s = !1 } = {}) {
  s && await t.isDir(e) && await t.rmdir(e, { recursive: !0 });
  for (const [i, n] of Object.entries(r)) {
    const o = joinPaths(e, i);
    await t.fileExists(dirname(o)) || await t.mkdir(dirname(o)), n instanceof Uint8Array || typeof n == "string" ? await t.writeFile(o, n) : await writeFiles(t, o, n);
  }
}
function proxyFileSystem(t, e, r) {
  const s = Object.getOwnPropertySymbols(t)[0];
  for (const i of r)
    e.fileExists(i) || e.mkdir(i), t.fileExists(i) || t.mkdir(i), e[s].FS.mount(
      // @ts-ignore
      e[s].PROXYFS,
      {
        root: i,
        // @ts-ignore
        fs: t[s].FS
      },
      i
    );
}
export {
  DEFAULT_BASE_URL,
  FSHelpers,
  HttpCookieStore,
  LatestSupportedPHPVersion,
  PHP,
  PHPProcessManager,
  PHPRequestHandler,
  PHPResponse,
  PHPWorker,
  SupportedPHPExtensionBundles,
  SupportedPHPExtensionsList,
  SupportedPHPVersions,
  SupportedPHPVersionsList,
  UnhandledRejectionsTarget,
  __private__dont__use,
  applyRewriteRules,
  ensurePathPrefix,
  getLoadedRuntime,
  getPhpIniEntries,
  isExitCodeZero,
  iteratePhpFiles as iterateFiles,
  loadPHPRuntime,
  proxyFileSystem,
  removePathPrefix,
  rotatePHPRuntime,
  setPhpIniEntries,
  toRelativeUrl,
  withPHPIniValues,
  writeFiles,
  writeFilesStreamToPhp
};
