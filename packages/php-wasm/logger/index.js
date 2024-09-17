import "@php-wasm/node-polyfills";
const E = "playground-log", d = (e, ...r) => {
  T.dispatchEvent(
    new CustomEvent(E, {
      detail: {
        log: e,
        args: r
      }
    })
  );
}, w = (e, ...r) => {
  switch (typeof e.message == "string" ? Reflect.set(e, "message", c(e.message)) : e.message.message && typeof e.message.message == "string" && Reflect.set(
    e.message,
    "message",
    c(e.message.message)
  ), e.severity) {
    case "Debug":
      console.debug(e.message, ...r);
      break;
    case "Info":
      console.info(e.message, ...r);
      break;
    case "Warn":
      console.warn(e.message, ...r);
      break;
    case "Error":
      console.error(e.message, ...r);
      break;
    case "Fatal":
      console.error(e.message, ...r);
      break;
    default:
      console.log(e.message, ...r);
  }
}, y = (e) => e instanceof Error ? [e.message, e.stack].join(`
`) : JSON.stringify(e, null, 2), u = [], g = (e) => {
  u.push(e);
}, i = (e) => {
  if (e.raw === !0)
    g(e.message);
  else {
    const r = M(
      typeof e.message == "object" ? y(e.message) : e.message,
      e.severity ?? "Info",
      e.prefix ?? "JavaScript"
    );
    g(r);
  }
};
let o = 0;
const l = "/wordpress/wp-content/debug.log", b = async (e) => await e.fileExists(l) ? await e.readFileAsText(l) : "", k = (e, r) => {
  r.addEventListener("request.end", async () => {
    const s = await b(r);
    if (s.length > o) {
      const t = s.substring(o);
      e.logMessage({
        message: t,
        raw: !0
      }), o = s.length;
    }
  }), r.addEventListener("request.error", (s) => {
    s = s, s.error && (e.logMessage({
      message: `${s.error.message} ${s.error.stack}`,
      severity: "Fatal",
      prefix: s.source === "request" ? "PHP" : "WASM Crash"
    }), e.dispatchEvent(
      new CustomEvent(e.fatalErrorEvent, {
        detail: {
          logs: e.getLogs(),
          source: s.source
        }
      })
    ));
  });
};
class L extends EventTarget {
  // constructor
  constructor(r = []) {
    super(), this.handlers = r, this.fatalErrorEvent = "playground-fatal-error";
  }
  /**
   * Get all logs.
   * @returns string[]
   */
  getLogs() {
    return this.handlers.includes(i) ? [...u] : (this.error(`Logs aren't stored because the logToMemory handler isn't registered.
				If you're using a custom logger instance, make sure to register logToMemory handler.
			`), []);
  }
  /**
   * Log message with severity.
   *
   * @param message any
   * @param severity LogSeverity
   * @param raw boolean
   * @param args any
   */
  logMessage(r, ...s) {
    for (const t of this.handlers)
      t(r, ...s);
  }
  /**
   * Log message
   *
   * @param message any
   * @param args any
   */
  log(r, ...s) {
    this.logMessage(
      {
        message: r,
        severity: void 0,
        prefix: "JavaScript",
        raw: !1
      },
      ...s
    );
  }
  /**
   * Log debug message
   *
   * @param message any
   * @param args any
   */
  debug(r, ...s) {
    this.logMessage(
      {
        message: r,
        severity: "Debug",
        prefix: "JavaScript",
        raw: !1
      },
      ...s
    );
  }
  /**
   * Log info message
   *
   * @param message any
   * @param args any
   */
  info(r, ...s) {
    this.logMessage(
      {
        message: r,
        severity: "Info",
        prefix: "JavaScript",
        raw: !1
      },
      ...s
    );
  }
  /**
   * Log warning message
   *
   * @param message any
   * @param args any
   */
  warn(r, ...s) {
    this.logMessage(
      {
        message: r,
        severity: "Warn",
        prefix: "JavaScript",
        raw: !1
      },
      ...s
    );
  }
  /**
   * Log error message
   *
   * @param message any
   * @param args any
   */
  error(r, ...s) {
    this.logMessage(
      {
        message: r,
        severity: "Error",
        prefix: "JavaScript",
        raw: !1
      },
      ...s
    );
  }
}
const v = () => {
  try {
    if (process.env.NODE_ENV === "test")
      return [i, d];
  } catch {
  }
  return [i, w, d];
}, T = new L(v()), c = (e) => e.replace(/\t/g, ""), M = (e, r, s) => {
  const t = /* @__PURE__ */ new Date(), a = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC"
  }).format(t).replace(/ /g, "-"), p = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !1,
    timeZone: "UTC",
    timeZoneName: "short"
  }).format(t), h = a + " " + p;
  return e = c(e), `[${h}] ${s} ${r}: ${e}`;
}, x = (e, r) => {
  e.addEventListener(e.fatalErrorEvent, r);
}, P = (e, r) => {
  e.logMessage({
    message: `${r.message} in ${r.filename} on line ${r.lineno}:${r.colno}`,
    severity: "Error"
  });
}, f = (e, r) => {
  if (!(r != null && r.reason))
    return;
  const s = (r == null ? void 0 : r.reason.stack) ?? r.reason;
  e.logMessage({
    message: s,
    severity: "Error"
  });
};
let n = 0;
const O = (e) => {
  navigator.serviceWorker.addEventListener("message", (r) => {
    var s, t, a;
    ((s = r.data) == null ? void 0 : s.numberOfOpenPlaygroundTabs) !== void 0 && n !== ((t = r.data) == null ? void 0 : t.numberOfOpenPlaygroundTabs) && (n = (a = r.data) == null ? void 0 : a.numberOfOpenPlaygroundTabs, e.debug(
      `Number of open Playground tabs is: ${n}`
    ));
  });
};
let m = !1;
const S = (e) => {
  m || (O(e), !(typeof window > "u") && (window.addEventListener(
    "error",
    (r) => P(e, r)
  ), window.addEventListener(
    "unhandledrejection",
    (r) => f(e, r)
  ), window.addEventListener(
    "rejectionhandled",
    (r) => f(e, r)
  ), m = !0));
}, C = (e) => {
  e.addEventListener("activate", () => {
    e.clients.matchAll().then((r) => {
      const s = {
        numberOfOpenPlaygroundTabs: r.filter(
          // Only count top-level frames to get the number of tabs.
          (t) => t.frameType === "top-level"
        ).length
      };
      for (const t of r)
        t.postMessage(s);
    });
  });
};
export {
  L as Logger,
  x as addCrashListener,
  k as collectPhpLogs,
  S as collectWindowErrors,
  l as errorLogPath,
  M as formatLogEntry,
  E as logEventType,
  T as logger,
  c as prepareLogMessage,
  C as reportServiceWorkerMetrics
};
