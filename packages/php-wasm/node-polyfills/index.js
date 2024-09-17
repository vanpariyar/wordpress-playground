const u = function() {
  var o;
  return typeof process < "u" && ((o = process.release) == null ? void 0 : o.name) === "node" ? "NODE" : typeof window < "u" ? "WEB" : (
    // @ts-ignore
    typeof WorkerGlobalScope < "u" && // @ts-ignore
    self instanceof WorkerGlobalScope ? "WORKER" : "NODE"
  );
}();
if (u === "NODE") {
  let o = function(e) {
    return new Promise(function(t, n) {
      e.onload = e.onerror = function(i) {
        e.onload = e.onerror = null, i.type === "load" ? t(e.result) : n(new Error("Failed to read the blob/file"));
      };
    });
  }, a = function() {
    const e = new Uint8Array([1, 2, 3, 4]), n = new File([e], "test").stream();
    try {
      return n.getReader({ mode: "byob" }), !0;
    } catch {
      return !1;
    }
  };
  if (typeof File > "u") {
    class e extends Blob {
      constructor(n, i, s) {
        super(n);
        let r;
        s != null && s.lastModified && (r = /* @__PURE__ */ new Date()), (!r || isNaN(r.getFullYear())) && (r = /* @__PURE__ */ new Date()), this.lastModifiedDate = r, this.lastModified = r.getMilliseconds(), this.name = i || "";
      }
    }
    global.File = e;
  }
  typeof Blob.prototype.arrayBuffer > "u" && (Blob.prototype.arrayBuffer = function() {
    const t = new FileReader();
    return t.readAsArrayBuffer(this), o(t);
  }), typeof Blob.prototype.text > "u" && (Blob.prototype.text = function() {
    const t = new FileReader();
    return t.readAsText(this), o(t);
  }), (typeof Blob.prototype.stream > "u" || !a()) && (Blob.prototype.stream = function() {
    let e = 0;
    const t = this;
    return new ReadableStream({
      type: "bytes",
      // 0.5 MB seems like a reasonable chunk size, let's adjust
      // this if needed.
      autoAllocateChunkSize: 512 * 1024,
      async pull(n) {
        const i = n.byobRequest.view, r = await t.slice(
          e,
          e + i.byteLength
        ).arrayBuffer(), f = new Uint8Array(r);
        new Uint8Array(i.buffer).set(f);
        const l = f.byteLength;
        n.byobRequest.respond(l), e += l, e >= t.size && n.close();
      }
    });
  });
}
if (u === "NODE" && typeof CustomEvent > "u") {
  class o extends Event {
    constructor(e, t = {}) {
      super(e, t), this.detail = t.detail;
    }
    initCustomEvent() {
    }
  }
  globalThis.CustomEvent = o;
}
