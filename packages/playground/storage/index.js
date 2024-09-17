import { Semaphore as d, normalizePath as g, joinPaths as m } from "@php-wasm/util";
import { Octokit as b } from "octokit";
function B(t) {
  return new b({
    auth: t
  });
}
function H(t, e = "") {
  e.length && !e.endsWith("/") && (e += "/");
  const r = {};
  for (const a of t)
    a.path.startsWith(e) && (r[a.path.substring(e.length)] = a.content);
  return r;
}
async function F(t, e, r, a, n, s = {}) {
  s.progress || (s.progress = {
    foundFiles: 0,
    downloadedFiles: 0
  });
  const { onProgress: i } = s, o = [], f = [], { data: u } = await t.rest.repos.getContent({
    owner: e,
    repo: r,
    path: n,
    ref: a
  });
  if (!Array.isArray(u))
    throw new Error(
      `Expected the list of files to be an array, but got ${typeof u}`
    );
  for (const c of u)
    c.type === "file" ? (++s.progress.foundFiles, i == null || i(s.progress), o.push(
      P(t, e, r, a, c).then((y) => (++s.progress.downloadedFiles, i == null || i(s.progress), y))
    )) : c.type === "dir" && f.push(
      F(
        t,
        e,
        r,
        a,
        c.path,
        s
      )
    );
  const l = await Promise.all(o), p = (await Promise.all(f)).flatMap(
    (c) => c
  );
  return [...l, ...p];
}
const T = new d({ concurrency: 15 });
async function P(t, e, r, a, n) {
  const s = await T.acquire();
  try {
    const { data: i } = await t.rest.repos.getContent({
      owner: e,
      repo: r,
      ref: a,
      path: n.path
    });
    if (!("content" in i))
      throw new Error(`No content found for ${n.path}`);
    return {
      name: n.name,
      path: n.path,
      content: A(i.content)
    };
  } finally {
    s();
  }
}
function A(t) {
  const e = window.atob(t), r = e.length, a = new Uint8Array(r);
  for (let n = 0; n < r; n++)
    a[n] = e.charCodeAt(n);
  return a;
}
async function M(t, e, r, a, n) {
  var l;
  const { data: s } = await t.rest.pulls.get({
    owner: e,
    repo: r,
    pull_number: a
  }), o = (l = (await t.rest.actions.listWorkflowRuns({
    owner: e,
    repo: r,
    branch: s.head.ref,
    workflow_id: n
  })).data.workflow_runs[0]) == null ? void 0 : l.id, f = await t.rest.actions.listWorkflowRunArtifacts({
    owner: e,
    repo: r,
    run_id: o
  });
  return (await t.rest.actions.downloadArtifact({
    owner: e,
    repo: r,
    artifact_id: f.data.artifacts[0].id,
    archive_format: "zip"
  })).data;
}
async function k(t, e, r) {
  var s;
  const { data: a, headers: n } = await t.request(
    "GET /repos/{owner}/{repo}",
    {
      owner: e,
      repo: r
    }
  );
  return !(!n["x-oauth-scopes"] || !((s = a.permissions) != null && s.push));
}
async function R(t, e, r, a, n) {
  await t.request("GET /repos/{owner}/{repo}/branches/{branch}", {
    owner: e,
    repo: r,
    branch: a
  }).then(
    () => !0,
    () => !1
  ) ? await t.request("PATCH /repos/{owner}/{repo}/git/refs/{ref}", {
    owner: e,
    repo: r,
    sha: n,
    ref: `heads/${a}`
  }) : await t.request("POST /repos/{owner}/{repo}/git/refs", {
    owner: e,
    repo: r,
    sha: n,
    ref: `refs/heads/${a}`
  });
}
async function _(t, e, r) {
  const a = await t.request("GET /user");
  return (await t.request("GET /repos/{owner}/{repo}/forks", {
    owner: e,
    repo: r
  })).data.find(
    (i) => i.owner && i.owner.login === a.data.login
  ) || await t.request("POST /repos/{owner}/{repo}/forks", {
    owner: e,
    repo: r
  }), a.data.login;
}
async function j(t, e, r, a, n, s) {
  const {
    data: { sha: i }
  } = await t.request("POST /repos/{owner}/{repo}/git/commits", {
    owner: e,
    repo: r,
    message: a,
    tree: s,
    parents: [n]
  });
  return i;
}
async function G(t, e, r, a, n) {
  const s = await q(
    t,
    e,
    r,
    a,
    n
  );
  if (s.length === 0)
    return null;
  const {
    data: { sha: i }
  } = await t.request("POST /repos/{owner}/{repo}/git/trees", {
    owner: e,
    repo: r,
    base_tree: a,
    tree: s
  });
  return i;
}
async function q(t, e, r, a, n) {
  const s = [];
  for (const [i, o] of n.create)
    s.push(h(t, e, r, i, o));
  for (const [i, o] of n.update)
    s.push(h(t, e, r, i, o));
  for (const i of n.delete)
    s.push(E(t, e, r, a, i));
  return Promise.all(s).then(
    (i) => i.filter((o) => !!o)
  );
}
const w = new d({ concurrency: 10 });
async function h(t, e, r, a, n) {
  const s = await w.acquire();
  try {
    if (ArrayBuffer.isView(n))
      try {
        const i = new TextDecoder("utf-8", {
          fatal: !0
        }).decode(n);
        return {
          path: a,
          content: i,
          mode: "100644"
        };
      } catch {
        const {
          data: { sha: o }
        } = await t.rest.git.createBlob({
          owner: e,
          repo: r,
          encoding: "base64",
          content: D(n)
        });
        return {
          path: a,
          sha: o,
          mode: "100644"
        };
      }
    else
      return {
        path: a,
        content: n,
        mode: "100644"
      };
  } finally {
    s();
  }
}
async function E(t, e, r, a, n) {
  const s = await w.acquire();
  try {
    return await t.request("HEAD /repos/{owner}/{repo}/contents/:path", {
      owner: e,
      repo: r,
      ref: a,
      path: n
    }), {
      path: n,
      mode: "100644",
      sha: null
    };
  } catch {
    return;
  } finally {
    s();
  }
}
function D(t) {
  const e = [], r = t.byteLength;
  for (let a = 0; a < r; a++)
    e.push(String.fromCharCode(t[a]));
  return window.btoa(e.join(""));
}
async function* N(t, e, { exceptPaths: r = [] } = {}) {
  if (e = g(e), !await t.isDir(e)) {
    await t.fileExists(e) && (yield {
      path: e,
      read: async () => await t.readFileAsBuffer(e)
    });
    return;
  }
  const a = [e];
  for (; a.length; ) {
    const n = a.pop();
    if (!n)
      return;
    const s = await t.listFiles(n);
    for (const i of s) {
      const o = m(n, i);
      r.includes(o.substring(e.length + 1)) || (await t.isDir(o) ? a.push(o) : yield {
        path: o,
        read: async () => await t.readFileAsBuffer(o)
      });
    }
  }
}
async function U(t, e) {
  const r = {
    create: /* @__PURE__ */ new Map(),
    update: /* @__PURE__ */ new Map(),
    delete: /* @__PURE__ */ new Set()
  }, a = /* @__PURE__ */ new Set();
  for await (const n of e) {
    a.add(n.path);
    const s = t.get(n.path), i = await n.read();
    s ? C(s, i) || r.update.set(n.path, i) : r.create.set(n.path, i);
  }
  for (const n of t.keys())
    a.has(n) || r.delete.add(n);
  return r;
}
function C(t, e) {
  return t.length === e.length && t.every((r, a) => r === e[a]);
}
async function S(t) {
  return t.type === "local-fs" ? t.handle : O(t.path);
}
async function O(t) {
  const e = t.split("/").filter((a) => a.length > 0);
  let r = await navigator.storage.getDirectory();
  for (const a of e)
    r = await r.getDirectoryHandle(a);
  return r;
}
async function W(t) {
  const r = await (await navigator.storage.getDirectory()).resolve(t);
  if (r === null)
    throw new DOMException(
      "Unable to resolve path of OPFS directory handle.",
      "NotFoundError"
    );
  return "/" + r.join("/");
}
async function $(t) {
  const e = await S(t);
  for await (const r of e.keys())
    await e.removeEntry(r, {
      recursive: !0
    });
}
export {
  U as changeset,
  $ as clearContentsFromMountDevice,
  B as createClient,
  j as createCommit,
  R as createOrUpdateBranch,
  G as createTree,
  h as createTreeNode,
  q as createTreeNodes,
  E as deleteFile,
  S as directoryHandleFromMountDevice,
  W as directoryHandleToOpfsPath,
  H as filesListToObject,
  _ as fork,
  M as getArtifact,
  F as getFilesFromDirectory,
  N as iterateFiles,
  k as mayPush,
  O as opfsPathToDirectoryHandle
};
