import u, { useState as gr, useEffect as yr } from "react";
import { __experimentalTreeGrid as Er, __experimentalTreeGridRow as $e, __experimentalTreeGridCell as J, Button as br, SelectControl as Rr, __experimentalInputControl as _r } from "@wordpress/components";
import { forwardRef as Ie, cloneElement as wr, createElement as Pr } from "@wordpress/element";
import Tr from "clsx";
function Cr({
  icon: s,
  size: v = 24,
  ...b
}, h) {
  return wr(s, {
    width: v,
    height: v,
    ...b,
    ref: h
  });
}
const Or = Ie(Cr);
var le = { exports: {} }, Y = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Fe;
function Sr() {
  if (Fe)
    return Y;
  Fe = 1;
  var s = u, v = Symbol.for("react.element"), b = Symbol.for("react.fragment"), h = Object.prototype.hasOwnProperty, w = s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, P = { key: !0, ref: !0, __self: !0, __source: !0 };
  function S(d, i, g) {
    var f, C = {}, x = null, F = null;
    g !== void 0 && (x = "" + g), i.key !== void 0 && (x = "" + i.key), i.ref !== void 0 && (F = i.ref);
    for (f in i)
      h.call(i, f) && !P.hasOwnProperty(f) && (C[f] = i[f]);
    if (d && d.defaultProps)
      for (f in i = d.defaultProps, i)
        C[f] === void 0 && (C[f] = i[f]);
    return { $$typeof: v, type: d, key: x, ref: F, props: C, _owner: w.current };
  }
  return Y.Fragment = b, Y.jsx = S, Y.jsxs = S, Y;
}
var M = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ae;
function xr() {
  return Ae || (Ae = 1, process.env.NODE_ENV !== "production" && function() {
    var s = u, v = Symbol.for("react.element"), b = Symbol.for("react.portal"), h = Symbol.for("react.fragment"), w = Symbol.for("react.strict_mode"), P = Symbol.for("react.profiler"), S = Symbol.for("react.provider"), d = Symbol.for("react.context"), i = Symbol.for("react.forward_ref"), g = Symbol.for("react.suspense"), f = Symbol.for("react.suspense_list"), C = Symbol.for("react.memo"), x = Symbol.for("react.lazy"), F = Symbol.for("react.offscreen"), N = Symbol.iterator, X = "@@iterator";
    function p(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = N && e[N] || e[X];
      return typeof r == "function" ? r : null;
    }
    var R = s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function E(e) {
      {
        for (var r = arguments.length, t = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
          t[n - 1] = arguments[n];
        U("error", e, t);
      }
    }
    function U(e, r, t) {
      {
        var n = R.ReactDebugCurrentFrame, l = n.getStackAddendum();
        l !== "" && (r += "%s", t = t.concat([l]));
        var c = t.map(function(o) {
          return String(o);
        });
        c.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, c);
      }
    }
    var B = !1, H = !1, Ye = !1, Me = !1, Ve = !1, ue;
    ue = Symbol.for("react.module.reference");
    function Ne(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === h || e === P || Ve || e === w || e === g || e === f || Me || e === F || B || H || Ye || typeof e == "object" && e !== null && (e.$$typeof === x || e.$$typeof === C || e.$$typeof === S || e.$$typeof === d || e.$$typeof === i || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === ue || e.getModuleId !== void 0));
    }
    function Ue(e, r, t) {
      var n = e.displayName;
      if (n)
        return n;
      var l = r.displayName || r.name || "";
      return l !== "" ? t + "(" + l + ")" : t;
    }
    function ce(e) {
      return e.displayName || "Context";
    }
    function k(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && E("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case h:
          return "Fragment";
        case b:
          return "Portal";
        case P:
          return "Profiler";
        case w:
          return "StrictMode";
        case g:
          return "Suspense";
        case f:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case d:
            var r = e;
            return ce(r) + ".Consumer";
          case S:
            var t = e;
            return ce(t._context) + ".Provider";
          case i:
            return Ue(e, e.render, "ForwardRef");
          case C:
            var n = e.displayName || null;
            return n !== null ? n : k(e.type) || "Memo";
          case x: {
            var l = e, c = l._payload, o = l._init;
            try {
              return k(o(c));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var j = Object.assign, I = 0, fe, de, pe, ve, he, me, ge;
    function ye() {
    }
    ye.__reactDisabledLog = !0;
    function Be() {
      {
        if (I === 0) {
          fe = console.log, de = console.info, pe = console.warn, ve = console.error, he = console.group, me = console.groupCollapsed, ge = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: ye,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        I++;
      }
    }
    function Ge() {
      {
        if (I--, I === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: j({}, e, {
              value: fe
            }),
            info: j({}, e, {
              value: de
            }),
            warn: j({}, e, {
              value: pe
            }),
            error: j({}, e, {
              value: ve
            }),
            group: j({}, e, {
              value: he
            }),
            groupCollapsed: j({}, e, {
              value: me
            }),
            groupEnd: j({}, e, {
              value: ge
            })
          });
        }
        I < 0 && E("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var Z = R.ReactCurrentDispatcher, Q;
    function G(e, r, t) {
      {
        if (Q === void 0)
          try {
            throw Error();
          } catch (l) {
            var n = l.stack.trim().match(/\n( *(at )?)/);
            Q = n && n[1] || "";
          }
        return `
` + Q + e;
      }
    }
    var ee = !1, K;
    {
      var Ke = typeof WeakMap == "function" ? WeakMap : Map;
      K = new Ke();
    }
    function Ee(e, r) {
      if (!e || ee)
        return "";
      {
        var t = K.get(e);
        if (t !== void 0)
          return t;
      }
      var n;
      ee = !0;
      var l = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var c;
      c = Z.current, Z.current = null, Be();
      try {
        if (r) {
          var o = function() {
            throw Error();
          };
          if (Object.defineProperty(o.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(o, []);
            } catch (T) {
              n = T;
            }
            Reflect.construct(e, [], o);
          } else {
            try {
              o.call();
            } catch (T) {
              n = T;
            }
            e.call(o.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (T) {
            n = T;
          }
          e();
        }
      } catch (T) {
        if (T && n && typeof T.stack == "string") {
          for (var a = T.stack.split(`
`), _ = n.stack.split(`
`), m = a.length - 1, y = _.length - 1; m >= 1 && y >= 0 && a[m] !== _[y]; )
            y--;
          for (; m >= 1 && y >= 0; m--, y--)
            if (a[m] !== _[y]) {
              if (m !== 1 || y !== 1)
                do
                  if (m--, y--, y < 0 || a[m] !== _[y]) {
                    var O = `
` + a[m].replace(" at new ", " at ");
                    return e.displayName && O.includes("<anonymous>") && (O = O.replace("<anonymous>", e.displayName)), typeof e == "function" && K.set(e, O), O;
                  }
                while (m >= 1 && y >= 0);
              break;
            }
        }
      } finally {
        ee = !1, Z.current = c, Ge(), Error.prepareStackTrace = l;
      }
      var $ = e ? e.displayName || e.name : "", D = $ ? G($) : "";
      return typeof e == "function" && K.set(e, D), D;
    }
    function qe(e, r, t) {
      return Ee(e, !1);
    }
    function ze(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function q(e, r, t) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return Ee(e, ze(e));
      if (typeof e == "string")
        return G(e);
      switch (e) {
        case g:
          return G("Suspense");
        case f:
          return G("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case i:
            return qe(e.render);
          case C:
            return q(e.type, r, t);
          case x: {
            var n = e, l = n._payload, c = n._init;
            try {
              return q(c(l), r, t);
            } catch {
            }
          }
        }
      return "";
    }
    var W = Object.prototype.hasOwnProperty, be = {}, Re = R.ReactDebugCurrentFrame;
    function z(e) {
      if (e) {
        var r = e._owner, t = q(e.type, e._source, r ? r.type : null);
        Re.setExtraStackFrame(t);
      } else
        Re.setExtraStackFrame(null);
    }
    function Je(e, r, t, n, l) {
      {
        var c = Function.call.bind(W);
        for (var o in e)
          if (c(e, o)) {
            var a = void 0;
            try {
              if (typeof e[o] != "function") {
                var _ = Error((n || "React class") + ": " + t + " type `" + o + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[o] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw _.name = "Invariant Violation", _;
              }
              a = e[o](r, o, n, t, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (m) {
              a = m;
            }
            a && !(a instanceof Error) && (z(l), E("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", n || "React class", t, o, typeof a), z(null)), a instanceof Error && !(a.message in be) && (be[a.message] = !0, z(l), E("Failed %s type: %s", t, a.message), z(null));
          }
      }
    }
    var Xe = Array.isArray;
    function re(e) {
      return Xe(e);
    }
    function He(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, t = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t;
      }
    }
    function Ze(e) {
      try {
        return _e(e), !1;
      } catch {
        return !0;
      }
    }
    function _e(e) {
      return "" + e;
    }
    function we(e) {
      if (Ze(e))
        return E("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", He(e)), _e(e);
    }
    var L = R.ReactCurrentOwner, Qe = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Pe, Te, te;
    te = {};
    function er(e) {
      if (W.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function rr(e) {
      if (W.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function tr(e, r) {
      if (typeof e.ref == "string" && L.current && r && L.current.stateNode !== r) {
        var t = k(L.current.type);
        te[t] || (E('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', k(L.current.type), e.ref), te[t] = !0);
      }
    }
    function nr(e, r) {
      {
        var t = function() {
          Pe || (Pe = !0, E("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: t,
          configurable: !0
        });
      }
    }
    function ar(e, r) {
      {
        var t = function() {
          Te || (Te = !0, E("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: t,
          configurable: !0
        });
      }
    }
    var or = function(e, r, t, n, l, c, o) {
      var a = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: v,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: t,
        props: o,
        // Record the component responsible for creating this element.
        _owner: c
      };
      return a._store = {}, Object.defineProperty(a._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(a, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: n
      }), Object.defineProperty(a, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: l
      }), Object.freeze && (Object.freeze(a.props), Object.freeze(a)), a;
    };
    function ir(e, r, t, n, l) {
      {
        var c, o = {}, a = null, _ = null;
        t !== void 0 && (we(t), a = "" + t), rr(r) && (we(r.key), a = "" + r.key), er(r) && (_ = r.ref, tr(r, l));
        for (c in r)
          W.call(r, c) && !Qe.hasOwnProperty(c) && (o[c] = r[c]);
        if (e && e.defaultProps) {
          var m = e.defaultProps;
          for (c in m)
            o[c] === void 0 && (o[c] = m[c]);
        }
        if (a || _) {
          var y = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          a && nr(o, y), _ && ar(o, y);
        }
        return or(e, a, _, l, n, L.current, o);
      }
    }
    var ne = R.ReactCurrentOwner, Ce = R.ReactDebugCurrentFrame;
    function A(e) {
      if (e) {
        var r = e._owner, t = q(e.type, e._source, r ? r.type : null);
        Ce.setExtraStackFrame(t);
      } else
        Ce.setExtraStackFrame(null);
    }
    var ae;
    ae = !1;
    function oe(e) {
      return typeof e == "object" && e !== null && e.$$typeof === v;
    }
    function Oe() {
      {
        if (ne.current) {
          var e = k(ne.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function lr(e) {
      {
        if (e !== void 0) {
          var r = e.fileName.replace(/^.*[\\\/]/, ""), t = e.lineNumber;
          return `

Check your code at ` + r + ":" + t + ".";
        }
        return "";
      }
    }
    var Se = {};
    function sr(e) {
      {
        var r = Oe();
        if (!r) {
          var t = typeof e == "string" ? e : e.displayName || e.name;
          t && (r = `

Check the top-level render call using <` + t + ">.");
        }
        return r;
      }
    }
    function xe(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var t = sr(r);
        if (Se[t])
          return;
        Se[t] = !0;
        var n = "";
        e && e._owner && e._owner !== ne.current && (n = " It was passed a child from " + k(e._owner.type) + "."), A(e), E('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', t, n), A(null);
      }
    }
    function ke(e, r) {
      {
        if (typeof e != "object")
          return;
        if (re(e))
          for (var t = 0; t < e.length; t++) {
            var n = e[t];
            oe(n) && xe(n, r);
          }
        else if (oe(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var l = p(e);
          if (typeof l == "function" && l !== e.entries)
            for (var c = l.call(e), o; !(o = c.next()).done; )
              oe(o.value) && xe(o.value, r);
        }
      }
    }
    function ur(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var t;
        if (typeof r == "function")
          t = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === i || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === C))
          t = r.propTypes;
        else
          return;
        if (t) {
          var n = k(r);
          Je(t, e.props, "prop", n, e);
        } else if (r.PropTypes !== void 0 && !ae) {
          ae = !0;
          var l = k(r);
          E("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", l || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && E("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function cr(e) {
      {
        for (var r = Object.keys(e.props), t = 0; t < r.length; t++) {
          var n = r[t];
          if (n !== "children" && n !== "key") {
            A(e), E("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", n), A(null);
            break;
          }
        }
        e.ref !== null && (A(e), E("Invalid attribute `ref` supplied to `React.Fragment`."), A(null));
      }
    }
    var je = {};
    function De(e, r, t, n, l, c) {
      {
        var o = Ne(e);
        if (!o) {
          var a = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (a += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var _ = lr(l);
          _ ? a += _ : a += Oe();
          var m;
          e === null ? m = "null" : re(e) ? m = "array" : e !== void 0 && e.$$typeof === v ? (m = "<" + (k(e.type) || "Unknown") + " />", a = " Did you accidentally export a JSX literal instead of a component?") : m = typeof e, E("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", m, a);
        }
        var y = ir(e, r, t, l, c);
        if (y == null)
          return y;
        if (o) {
          var O = r.children;
          if (O !== void 0)
            if (n)
              if (re(O)) {
                for (var $ = 0; $ < O.length; $++)
                  ke(O[$], e);
                Object.freeze && Object.freeze(O);
              } else
                E("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              ke(O, e);
        }
        if (W.call(r, "key")) {
          var D = k(e), T = Object.keys(r).filter(function(mr) {
            return mr !== "key";
          }), ie = T.length > 0 ? "{key: someKey, " + T.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!je[D + ie]) {
            var hr = T.length > 0 ? "{" + T.join(": ..., ") + ": ...}" : "{}";
            E(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ie, D, hr, D), je[D + ie] = !0;
          }
        }
        return e === h ? cr(y) : ur(y), y;
      }
    }
    function fr(e, r, t) {
      return De(e, r, t, !0);
    }
    function dr(e, r, t) {
      return De(e, r, t, !1);
    }
    var pr = dr, vr = fr;
    M.Fragment = h, M.jsx = pr, M.jsxs = vr;
  }()), M;
}
process.env.NODE_ENV === "production" ? le.exports = Sr() : le.exports = xr();
var V = le.exports;
const We = (s) => Pr("path", s), se = Ie(
  /**
   * @param {SVGProps}                                    props isPressed indicates whether the SVG should appear as pressed.
   *                                                            Other props will be passed through to svg component.
   * @param {import('react').ForwardedRef<SVGSVGElement>} ref   The forwarded ref to the SVG element.
   *
   * @return {JSX.Element} Stop component
   */
  ({
    className: s,
    isPressed: v,
    ...b
  }, h) => {
    const w = {
      ...b,
      className: Tr(s, {
        "is-pressed": v
      }) || void 0,
      "aria-hidden": !0,
      focusable: !1
    };
    return /* @__PURE__ */ V.jsx("svg", {
      ...w,
      ref: h
    });
  }
);
se.displayName = "SVG";
const kr = /* @__PURE__ */ V.jsx(se, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: /* @__PURE__ */ V.jsx(We, {
    d: "M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z"
  })
}), jr = kr, Dr = /* @__PURE__ */ V.jsx(se, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: /* @__PURE__ */ V.jsx(We, {
    d: "M10.6 6L9.4 7l4.6 5-4.6 5 1.2 1 5.4-6z"
  })
}), Fr = Dr;
const Mr = ({
  files: s,
  initialState: v = {},
  onMappingChange: b = () => {
  }
}) => {
  const [h, w] = gr(v), P = (d, i) => {
    w((g) => ({
      ...g,
      [d]: {
        ...g[d],
        ...i
      }
    }));
  };
  yr(() => {
    const d = {};
    Object.keys(h).forEach((i) => {
      h[i].playgroundPath && (d[i] = h[i].playgroundPath);
    }), b(d);
  }, [h]);
  const S = (d, i = "") => i ? `${i}/${d.name}`.replaceAll(/\/+/g, "/") : d.name;
  return /* @__PURE__ */ u.createElement(Er, { className: "path-mapping-control" }, /* @__PURE__ */ u.createElement($e, { level: 0, positionInSet: 0, setSize: 1 }, /* @__PURE__ */ u.createElement(J, null, () => /* @__PURE__ */ u.createElement(u.Fragment, null, "File/Folder")), /* @__PURE__ */ u.createElement(J, null, () => /* @__PURE__ */ u.createElement(u.Fragment, null, "Absolute path in Playground"))), s.map((d, i) => /* @__PURE__ */ u.createElement(
    Le,
    {
      key: d.name,
      node: d,
      level: 0,
      position: i + 1,
      setSize: s.length,
      nodeStates: h,
      updateNodeState: P,
      generatePath: S
    }
  )));
}, Le = ({
  node: s,
  level: v,
  position: b,
  setSize: h,
  nodeStates: w,
  updateNodeState: P,
  generatePath: S,
  parentPath: d = "",
  parentMapping: i = ""
}) => {
  const g = S(s, d), f = w[g] || {
    isOpen: !1,
    playgroundPath: "",
    pathType: ""
  }, C = Ar({
    node: s,
    nodeState: f,
    parentMapping: i
  }), x = () => {
    P(g, { isOpen: !f.isOpen });
  }, F = (p) => {
    P(g, { playgroundPath: p });
  }, N = (p) => {
    switch (p) {
      case "plugin":
        P(g, {
          pathType: p,
          playgroundPath: "/wordpress/wp-content/plugins/" + s.name
        });
        break;
      case "theme":
        P(g, {
          pathType: p,
          playgroundPath: "/wordpress/wp-content/themes/" + s.name
        });
        break;
      case "wp-content":
        P(g, {
          pathType: p,
          playgroundPath: "/wordpress/wp-content"
        });
        break;
      default:
        P(g, { pathType: p, playgroundPath: "" });
        break;
    }
  }, X = (p) => {
    var R, E, U, B;
    if (p.key === "ArrowLeft")
      f.isOpen ? x() : (R = s.children) != null && R.length && ((E = document.querySelector(
        `[data-path="${d}"]`
      )) == null || E.focus()), p.preventDefault(), p.stopPropagation();
    else if (p.key === "ArrowRight") {
      if (f.isOpen) {
        if ((U = s.children) != null && U.length) {
          const H = S(s.children[0], g);
          (B = document.querySelector(
            `[data-path="${H}"]`
          )) == null || B.focus();
        }
      } else
        x();
      p.preventDefault(), p.stopPropagation();
    }
  };
  return /* @__PURE__ */ u.createElement(u.Fragment, null, /* @__PURE__ */ u.createElement(
    $e,
    {
      level: v,
      positionInSet: b,
      setSize: h
    },
    /* @__PURE__ */ u.createElement(J, null, () => /* @__PURE__ */ u.createElement(
      br,
      {
        onClick: x,
        onKeyDown: X,
        className: "file-node-button",
        "data-path": g
      },
      /* @__PURE__ */ u.createElement(
        $r,
        {
          node: s,
          isOpen: s.type === "folder" && f.isOpen,
          level: v
        }
      )
    )),
    /* @__PURE__ */ u.createElement(J, null, () => {
      var p;
      return /* @__PURE__ */ u.createElement(u.Fragment, null, !i && /* @__PURE__ */ u.createElement(
        Rr,
        {
          label: "Path",
          value: f.pathType,
          onChange: N,
          options: [
            { label: "Select a path", value: "" },
            { label: "Plugin", value: "plugin" },
            { label: "Theme", value: "theme" },
            {
              label: "wp-content",
              value: "wp-content"
            },
            {
              label: "Custom path",
              value: "custom-path"
            }
          ]
        }
      ), (i || f.pathType !== "") && /* @__PURE__ */ u.createElement(
        _r,
        {
          disabled: !!i || ((p = f.pathType) == null ? void 0 : p.trim()) !== "" && f.pathType !== "custom-path",
          value: C,
          onChange: F,
          onDrag: function() {
          },
          onDragEnd: function() {
          },
          onDragStart: function() {
          },
          onValidate: function() {
          }
        }
      ));
    })
  ), f.isOpen && s.children && s.children.map((p, R) => /* @__PURE__ */ u.createElement(
    Le,
    {
      key: p.name,
      node: p,
      level: v + 1,
      position: R + 1,
      setSize: s.children.length,
      nodeStates: w,
      updateNodeState: P,
      generatePath: S,
      parentPath: g,
      parentMapping: C
    }
  )));
};
function Ar({
  node: s,
  nodeState: v,
  parentMapping: b
}) {
  return b ? `${b}/${s.name}`.replace(/\/+/g, "/") : v.playgroundPath ? v.playgroundPath : "";
}
const $r = ({ node: s, level: v, isOpen: b }) => {
  const h = [];
  for (let w = 0; w < v; w++)
    h.push("&nbsp;&nbsp;&nbsp;&nbsp;");
  return /* @__PURE__ */ u.createElement(u.Fragment, null, /* @__PURE__ */ u.createElement(
    "span",
    {
      "aria-hidden": "true",
      dangerouslySetInnerHTML: { __html: h.join("") }
    }
  ), s.type === "folder" ? /* @__PURE__ */ u.createElement(Or, { width: 16, icon: b ? jr : Fr }) : /* @__PURE__ */ u.createElement("div", { style: { width: 16 } }, " "), s.name);
};
export {
  Mr as PathMappingControlDemo
};
