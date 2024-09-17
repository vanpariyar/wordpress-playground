import "@php-wasm/node-polyfills";
import { Semaphore as B } from "@php-wasm/util";
function U(...e) {
  const n = new Uint8Array(
    e.reduce((r, a) => r + a.length, 0)
  );
  let t = 0;
  for (const r of e)
    n.set(r, t), t += r.length;
  return n;
}
function S(e) {
  if (e === void 0) {
    let n = new Uint8Array();
    return new TransformStream({
      transform(t) {
        n = U(n, t);
      },
      flush(t) {
        t.enqueue(n);
      }
    });
  } else {
    const n = new ArrayBuffer(e || 0);
    let t = 0;
    return new TransformStream({
      transform(r) {
        new Uint8Array(n).set(r, t), t += r.byteLength;
      },
      flush(r) {
        r.enqueue(new Uint8Array(n));
      }
    });
  }
}
function A(e, n) {
  if (n === 0)
    return new ReadableStream({
      start(a) {
        a.close();
      }
    });
  const t = e.getReader({ mode: "byob" });
  let r = 0;
  return new ReadableStream({
    async pull(a) {
      const { value: i, done: s } = await t.read(
        new Uint8Array(n - r)
      );
      if (s) {
        t.releaseLock(), a.close();
        return;
      }
      r += i.length, a.enqueue(i), r >= n && (t.releaseLock(), a.close());
    },
    cancel() {
      t.cancel();
    }
  });
}
async function c(e, n) {
  return n !== void 0 && (e = A(e, n)), await e.pipeThrough(S(n)).getReader().read().then(({ value: t }) => t);
}
async function re(e, n) {
  return new File([await c(n)], e);
}
function _(e) {
  if (e instanceof ReadableStream)
    return e;
  let n;
  return Symbol.asyncIterator in e ? n = e[Symbol.asyncIterator]() : Symbol.iterator in e ? n = e[Symbol.iterator]() : n = e, new ReadableStream({
    async pull(t) {
      const { done: r, value: a } = await n.next();
      if (r) {
        t.close();
        return;
      }
      t.enqueue(a);
    }
  });
}
class ae extends File {
  /**
   * Creates a new StreamedFile instance.
   *
   * @param readableStream The readable stream containing the file data.
   * @param name The name of the file.
   * @param type The MIME type of the file.
   */
  constructor(n, t, r) {
    super([], t, { type: r }), this.readableStream = n;
  }
  /**
   * Overrides the slice() method of the File class.
   *
   * @returns A Blob representing a portion of the file.
   */
  slice() {
    throw new Error("slice() is not possible on a StreamedFile");
  }
  /**
   * Returns the readable stream associated with the file.
   *
   * @returns The readable stream.
   */
  stream() {
    return this.readableStream;
  }
  /**
   * Loads the file data into memory and then returns it as a string.
   *
   * @returns File data as text.
   */
  async text() {
    return new TextDecoder().decode(await this.arrayBuffer());
  }
  /**
   * Loads the file data into memory and then returns it as an ArrayBuffer.
   *
   * @returns File data as an ArrayBuffer.
   */
  async arrayBuffer() {
    return await c(this.stream());
  }
}
ReadableStream.prototype[Symbol.asyncIterator] || (ReadableStream.prototype[Symbol.asyncIterator] = async function* () {
  const e = this.getReader();
  try {
    for (; ; ) {
      const { done: n, value: t } = await e.read();
      if (n)
        return;
      yield t;
    }
  } finally {
    e.releaseLock();
  }
}, ReadableStream.prototype.iterate = // @ts-ignore
ReadableStream.prototype[Symbol.asyncIterator]);
const F = 32, h = 67324752, w = 33639248, g = 101010256, N = 0, E = 8;
function b(e) {
  return new TransformStream({
    transform(n, t) {
      e(n) && t.enqueue(n);
    }
  });
}
function q(e) {
  let n = !1;
  return new TransformStream({
    async transform(t, r) {
      n || (n = !0, r.enqueue(e)), r.enqueue(t);
    }
  });
}
function x(e) {
  return new TransformStream({
    async transform(n, t) {
      t.enqueue(n);
    },
    async flush(n) {
      n.enqueue(e);
    }
  });
}
function p(e, n) {
  return M(e, n).pipeThrough(
    new TransformStream({
      async transform(t, r) {
        const a = new File(
          [t.bytes],
          new TextDecoder().decode(t.path),
          {
            type: t.isDirectory ? "directory" : void 0
          }
        );
        r.enqueue(a);
      }
    })
  );
}
const k = () => !0;
function M(e, n = k) {
  return new ReadableStream({
    async pull(r) {
      const a = await v(e);
      if (!a) {
        r.close();
        return;
      }
      r.enqueue(a);
    }
  }).pipeThrough(
    b(({ signature: r }) => r === h)
  ).pipeThrough(
    b(n)
  );
}
async function v(e) {
  const t = new DataView((await c(e, 4)).buffer).getUint32(0, !0);
  return t === h ? await L(e, !0) : t === w ? await T(e, !0) : t === g ? await O(e, !0) : null;
}
async function L(e, n = !1) {
  if (!n && new DataView((await c(e, 4)).buffer).getUint32(0, !0) !== h)
    return null;
  const t = new DataView((await c(e, 26)).buffer), r = t.getUint16(22, !0), a = t.getUint16(24, !0), i = {
    signature: h,
    version: t.getUint32(0, !0),
    generalPurpose: t.getUint16(2, !0),
    compressionMethod: t.getUint16(4, !0),
    lastModifiedTime: t.getUint16(6, !0),
    lastModifiedDate: t.getUint16(8, !0),
    crc: t.getUint32(10, !0),
    compressedSize: t.getUint32(14, !0),
    uncompressedSize: t.getUint32(18, !0)
  };
  i.path = await c(e, r), i.isDirectory = R(i.path), i.extra = await c(e, a);
  let s = A(e, i.compressedSize);
  if (i.compressionMethod === E) {
    const o = new Uint8Array(10);
    o.set([31, 139, 8]);
    const f = new Uint8Array(8), u = new DataView(f.buffer);
    u.setUint32(0, i.crc, !0), u.setUint32(4, i.uncompressedSize % 2 ** 32, !0), s = s.pipeThrough(q(o)).pipeThrough(x(f)).pipeThrough(new DecompressionStream("gzip"));
  }
  return i.bytes = await s.pipeThrough(S(i.uncompressedSize)).getReader().read().then(({ value: o }) => o), i;
}
async function T(e, n = !1) {
  if (!n && new DataView((await c(e, 4)).buffer).getUint32(0, !0) !== w)
    return null;
  const t = new DataView((await c(e, 42)).buffer), r = t.getUint16(24, !0), a = t.getUint16(26, !0), i = t.getUint16(28, !0), s = {
    signature: w,
    versionCreated: t.getUint16(0, !0),
    versionNeeded: t.getUint16(2, !0),
    generalPurpose: t.getUint16(4, !0),
    compressionMethod: t.getUint16(6, !0),
    lastModifiedTime: t.getUint16(8, !0),
    lastModifiedDate: t.getUint16(10, !0),
    crc: t.getUint32(12, !0),
    compressedSize: t.getUint32(16, !0),
    uncompressedSize: t.getUint32(20, !0),
    diskNumber: t.getUint16(30, !0),
    internalAttributes: t.getUint16(32, !0),
    externalAttributes: t.getUint32(34, !0),
    firstByteAt: t.getUint32(38, !0)
  };
  return s.lastByteAt = s.firstByteAt + F + r + i + a + s.compressedSize - 1, s.path = await c(e, r), s.isDirectory = R(s.path), s.extra = await c(e, a), s.fileComment = await c(
    e,
    i
  ), s;
}
function R(e) {
  return e[e.byteLength - 1] == "/".charCodeAt(0);
}
async function O(e, n = !1) {
  if (!n && new DataView((await c(e, 4)).buffer).getUint32(0, !0) !== g)
    return null;
  const t = new DataView((await c(e, 18)).buffer), r = {
    signature: g,
    numberOfDisks: t.getUint16(0, !0),
    centralDirectoryStartDisk: t.getUint16(2, !0),
    numberCentralDirectoryRecordsOnThisDisk: t.getUint16(4, !0),
    numberCentralDirectoryRecords: t.getUint16(6, !0),
    centralDirectorySize: t.getUint32(8, !0),
    centralDirectoryOffset: t.getUint32(12, !0)
  }, a = t.getUint16(16, !0);
  return r.comment = await c(e, a), r;
}
const P = 110 * 1024, I = 10 * 1024, z = 1024 * 1024 * 1, V = new B({ concurrency: 10 }), D = () => !0;
async function ie(e, n = D) {
  if (n === D) {
    const d = await fetch(e);
    return p(d.body);
  }
  const t = await C(e);
  if (t <= z) {
    const d = await fetch(e);
    return p(d.body);
  }
  const r = await fetch(e, {
    headers: {
      // 0-0 looks weird, doesn't it?
      // The Range header is inclusive so it's actually
      // a valid header asking for the first byte.
      Range: "bytes=0-0",
      "Accept-Encoding": "none"
    }
  }), [a, i] = r.body.tee(), s = a.getReader(), { value: o } = await s.read(), { done: f } = await s.read();
  if (s.releaseLock(), a.cancel(), !((o == null ? void 0 : o.length) === 1 && f))
    return p(i);
  i.cancel();
  const l = await $(e, t);
  return H(l).pipeThrough(b(n)).pipeThrough(G()).pipeThrough(
    W(l)
  );
}
function H(e) {
  let n;
  return new ReadableStream({
    async start() {
      n = await Z(e);
    },
    async pull(t) {
      const r = await T(
        n
      );
      if (!r) {
        t.close();
        return;
      }
      t.enqueue(r);
    }
  });
}
async function Z(e) {
  const n = P;
  let t = new Uint8Array(), r = e.length;
  do {
    r = Math.max(0, r - n);
    const a = Math.min(
      r + n - 1,
      e.length - 1
    ), i = await c(
      await e.streamBytes(r, a)
    );
    t = U(i, t);
    const s = new DataView(i.buffer);
    for (let o = s.byteLength - 4; o >= 0; o--) {
      if (s.getUint32(o, !0) !== g)
        continue;
      const u = o + 12 + 4;
      if (t.byteLength < u + 4)
        throw new Error("Central directory not found");
      const l = s.getUint32(u, !0);
      if (l < r) {
        const d = await c(
          await e.streamBytes(l, r - 1)
        );
        t = U(
          d,
          t
        );
      } else
        l > r && (t = t.slice(
          l - r
        ));
      return new Blob([t]).stream();
    }
  } while (r >= 0);
  throw new Error("Central directory not found");
}
function G() {
  let e = 0, n = [];
  return new TransformStream({
    transform(t, r) {
      t.firstByteAt > e + I && (r.enqueue(n), n = []), e = t.lastByteAt, n.push(t);
    },
    flush(t) {
      t.enqueue(n);
    }
  });
}
function W(e) {
  let n = !1, t = 0, r;
  const a = [], i = new WritableStream({
    write(o, f) {
      o.length && (++t, Y(e, o).then((u) => {
        a.push([o, u]);
      }).catch((u) => {
        f.error(u);
      }).finally(() => {
        --t;
      }));
    },
    abort() {
      n = !0, r.close();
    },
    async close() {
      n = !0;
    }
  });
  return {
    readable: new ReadableStream({
      start(o) {
        r = o;
      },
      async pull(o) {
        for (; ; ) {
          if (n && !a.length && t === 0) {
            o.close();
            return;
          }
          if (!a.length) {
            await new Promise((m) => setTimeout(m, 50));
            continue;
          }
          const [l, d] = a[0], y = await L(d);
          if (!y) {
            a.shift();
            continue;
          }
          if (l.find(
            (m) => m.path === y.path
          )) {
            o.enqueue(y);
            break;
          }
        }
      }
    }),
    writable: i
  };
}
async function Y(e, n) {
  const t = await V.acquire();
  try {
    const r = n[n.length - 1];
    return await e.streamBytes(
      n[0].firstByteAt,
      r.lastByteAt
    );
  } finally {
    t();
  }
}
async function C(e) {
  return await fetch(e, { method: "HEAD" }).then((n) => n.headers.get("Content-Length")).then((n) => {
    if (!n)
      throw new Error("Content-Length header is missing");
    const t = parseInt(n, 10);
    if (isNaN(t) || t < 0)
      throw new Error("Content-Length header is invalid");
    return t;
  });
}
async function $(e, n) {
  return n === void 0 && (n = await C(e)), {
    length: n,
    streamBytes: async (t, r) => await fetch(e, {
      headers: {
        // The Range header is inclusive, so we need to subtract 1
        Range: `bytes=${t}-${r - 1}`,
        "Accept-Encoding": "none"
      }
    }).then((a) => a.body)
  };
}
function se(e) {
  return _(e).pipeThrough(K());
}
function K() {
  const e = /* @__PURE__ */ new Map();
  let n = 0;
  return new TransformStream({
    async transform(t, r) {
      const a = new Uint8Array(await t.arrayBuffer());
      let i = await c(
        new Blob([a]).stream().pipeThrough(new CompressionStream("gzip"))
      );
      const s = new DataView(i.buffer).getUint32(
        i.byteLength - 8,
        !0
      );
      i = i.slice(10, i.byteLength - 8);
      const o = new TextEncoder().encode(t.name), f = {
        signature: h,
        version: 2,
        generalPurpose: 0,
        compressionMethod: t.type === "directory" || i.byteLength === 0 ? N : E,
        lastModifiedTime: 0,
        lastModifiedDate: 0,
        crc: s,
        compressedSize: i.byteLength,
        uncompressedSize: a.byteLength,
        path: o,
        extra: new Uint8Array(0)
      };
      e.set(n, f);
      const u = j(f);
      r.enqueue(u), n += u.byteLength, r.enqueue(i), n += i.byteLength;
    },
    flush(t) {
      const r = n;
      let a = 0;
      for (const [
        o,
        f
      ] of e.entries()) {
        const u = {
          ...f,
          signature: w,
          fileComment: new Uint8Array(0),
          diskNumber: 1,
          internalAttributes: 0,
          externalAttributes: 0,
          firstByteAt: o
        }, l = J(
          u,
          o
        );
        t.enqueue(l), a += l.byteLength;
      }
      const i = {
        signature: g,
        numberOfDisks: 1,
        centralDirectoryOffset: r,
        centralDirectorySize: a,
        centralDirectoryStartDisk: 1,
        numberCentralDirectoryRecordsOnThisDisk: e.size,
        numberCentralDirectoryRecords: e.size,
        comment: new Uint8Array(0)
      }, s = Q(i);
      t.enqueue(s), e.clear();
    }
  });
}
function j(e) {
  const n = new ArrayBuffer(
    30 + e.path.byteLength + e.extra.byteLength
  ), t = new DataView(n);
  t.setUint32(0, e.signature, !0), t.setUint16(4, e.version, !0), t.setUint16(6, e.generalPurpose, !0), t.setUint16(8, e.compressionMethod, !0), t.setUint16(10, e.lastModifiedDate, !0), t.setUint16(12, e.lastModifiedTime, !0), t.setUint32(14, e.crc, !0), t.setUint32(18, e.compressedSize, !0), t.setUint32(22, e.uncompressedSize, !0), t.setUint16(26, e.path.byteLength, !0), t.setUint16(28, e.extra.byteLength, !0);
  const r = new Uint8Array(n);
  return r.set(e.path, 30), r.set(e.extra, 30 + e.path.byteLength), r;
}
function J(e, n) {
  const t = new ArrayBuffer(
    46 + e.path.byteLength + e.extra.byteLength
  ), r = new DataView(t);
  r.setUint32(0, e.signature, !0), r.setUint16(4, e.versionCreated, !0), r.setUint16(6, e.versionNeeded, !0), r.setUint16(8, e.generalPurpose, !0), r.setUint16(10, e.compressionMethod, !0), r.setUint16(12, e.lastModifiedDate, !0), r.setUint16(14, e.lastModifiedTime, !0), r.setUint32(16, e.crc, !0), r.setUint32(20, e.compressedSize, !0), r.setUint32(24, e.uncompressedSize, !0), r.setUint16(28, e.path.byteLength, !0), r.setUint16(30, e.extra.byteLength, !0), r.setUint16(32, e.fileComment.byteLength, !0), r.setUint16(34, e.diskNumber, !0), r.setUint16(36, e.internalAttributes, !0), r.setUint32(38, e.externalAttributes, !0), r.setUint32(42, n, !0);
  const a = new Uint8Array(t);
  return a.set(e.path, 46), a.set(e.extra, 46 + e.path.byteLength), a;
}
function Q(e) {
  const n = new ArrayBuffer(22 + e.comment.byteLength), t = new DataView(n);
  t.setUint32(0, e.signature, !0), t.setUint16(4, e.numberOfDisks, !0), t.setUint16(6, e.centralDirectoryStartDisk, !0), t.setUint16(8, e.numberCentralDirectoryRecordsOnThisDisk, !0), t.setUint16(10, e.numberCentralDirectoryRecords, !0), t.setUint32(12, e.centralDirectorySize, !0), t.setUint32(16, e.centralDirectoryOffset, !0), t.setUint16(20, e.comment.byteLength, !0);
  const r = new Uint8Array(n);
  return r.set(e.comment, 22), r;
}
export {
  ae as StreamedFile,
  c as collectBytes,
  re as collectFile,
  ie as decodeRemoteZip,
  p as decodeZip,
  se as encodeZip,
  _ as iteratorToStream
};
