function p(e) {
  return e.pathname.startsWith("/scope:");
}
function s(e) {
  return p(e) ? e.pathname.split("/")[1].split(":")[1] : null;
}
function o(e, n) {
  let t = new URL(e);
  if (p(t))
    if (n) {
      const a = t.pathname.split("/");
      a[1] = `scope:${n}`, t.pathname = a.join("/");
    } else
      t = i(t);
  else if (n) {
    const a = t.pathname === "/" ? "" : t.pathname;
    t.pathname = `/scope:${n}${a}`;
  }
  return t;
}
function i(e) {
  if (!p(e))
    return e;
  const n = new URL(e), t = n.pathname.split("/");
  return n.pathname = "/" + t.slice(2).join("/"), n;
}
export {
  s as getURLScope,
  p as isURLScoped,
  i as removeURLScope,
  o as setURLScope
};
