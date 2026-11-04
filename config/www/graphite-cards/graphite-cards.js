// src/core/version.ts
var version = "0.14.0";

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t3, e4, o5) {
    if (this._$cssResult$ = true, o5 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3, this.t = e4;
  }
  get styleSheet() {
    let t3 = this.o;
    const s4 = this.t;
    if (e && void 0 === t3) {
      const e4 = void 0 !== s4 && 1 === s4.length;
      e4 && (t3 = o.get(s4)), void 0 === t3 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), e4 && o.set(s4, t3));
    }
    return t3;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t3) => new n("string" == typeof t3 ? t3 : t3 + "", void 0, s);
var i = (t3, ...e4) => {
  const o5 = 1 === t3.length ? t3[0] : e4.reduce((e5, s4, o6) => e5 + ((t4) => {
    if (true === t4._$cssResult$) return t4.cssText;
    if ("number" == typeof t4) return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t3[o6 + 1], t3[0]);
  return new n(o5, t3, s);
};
var S = (s4, o5) => {
  if (e) s4.adoptedStyleSheets = o5.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet);
  else for (const e4 of o5) {
    const o6 = document.createElement("style"), n4 = t.litNonce;
    void 0 !== n4 && o6.setAttribute("nonce", n4), o6.textContent = e4.cssText, s4.appendChild(o6);
  }
};
var c = e ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let e4 = "";
  for (const s4 of t4.cssRules) e4 += s4.cssText;
  return r(e4);
})(t3) : t3;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t3, s4) => t3;
var u = { toAttribute(t3, s4) {
  switch (s4) {
    case Boolean:
      t3 = t3 ? l : null;
      break;
    case Object:
    case Array:
      t3 = null == t3 ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, s4) {
  let i5 = t3;
  switch (s4) {
    case Boolean:
      i5 = null !== t3;
      break;
    case Number:
      i5 = null === t3 ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t3);
      } catch (t4) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t3, s4) => !i2(t3, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t3) {
    this._$Ei(), (this.l ??= []).push(t3);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t3, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t3) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t3, s4), !s4.noAccessor) {
      const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t3, i5, s4);
      void 0 !== h3 && e2(this.prototype, t3, h3);
    }
  }
  static getPropertyDescriptor(t3, s4, i5) {
    const { get: e4, set: r4 } = h(this.prototype, t3) ?? { get() {
      return this[s4];
    }, set(t4) {
      this[s4] = t4;
    } };
    return { get: e4, set(s5) {
      const h3 = e4?.call(this);
      r4?.call(this, s5), this.requestUpdate(t3, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t3 = n2(this);
    t3.finalize(), void 0 !== t3.l && (this.l = [...t3.l]), this.elementProperties = new Map(t3.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t4 = this.properties, s4 = [...r2(t4), ...o2(t4)];
      for (const i5 of s4) this.createProperty(i5, t4[i5]);
    }
    const t3 = this[Symbol.metadata];
    if (null !== t3) {
      const s4 = litPropertyMetadata.get(t3);
      if (void 0 !== s4) for (const [t4, i5] of s4) this.elementProperties.set(t4, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t4, s4] of this.elementProperties) {
      const i5 = this._$Eu(t4, s4);
      void 0 !== i5 && this._$Eh.set(i5, t4);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e4 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e4) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t3, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t3) => this.enableUpdating = t3), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t3) => t3(this));
  }
  addController(t3) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t3), void 0 !== this.renderRoot && this.isConnected && t3.hostConnected?.();
  }
  removeController(t3) {
    this._$EO?.delete(t3);
  }
  _$E_() {
    const t3 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t3.set(i5, this[i5]), delete this[i5]);
    t3.size > 0 && (this._$Ep = t3);
  }
  createRenderRoot() {
    const t3 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t3, this.constructor.elementStyles), t3;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t3) => t3.hostConnected?.());
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t3) => t3.hostDisconnected?.());
  }
  attributeChangedCallback(t3, s4, i5) {
    this._$AK(t3, i5);
  }
  _$ET(t3, s4) {
    const i5 = this.constructor.elementProperties.get(t3), e4 = this.constructor._$Eu(t3, i5);
    if (void 0 !== e4 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t3, null == h3 ? this.removeAttribute(e4) : this.setAttribute(e4, h3), this._$Em = null;
    }
  }
  _$AK(t3, s4) {
    const i5 = this.constructor, e4 = i5._$Eh.get(t3);
    if (void 0 !== e4 && this._$Em !== e4) {
      const t4 = i5.getPropertyOptions(e4), h3 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== t4.converter?.fromAttribute ? t4.converter : u;
      this._$Em = e4;
      const r4 = h3.fromAttribute(s4, t4.type);
      this[e4] = r4 ?? this._$Ej?.get(e4) ?? r4, this._$Em = null;
    }
  }
  requestUpdate(t3, s4, i5, e4 = false, h3) {
    if (void 0 !== t3) {
      const r4 = this.constructor;
      if (false === e4 && (h3 = this[t3]), i5 ??= r4.getPropertyOptions(t3), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t3) && !this.hasAttribute(r4._$Eu(t3, i5)))) return;
      this.C(t3, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t3, s4, { useDefault: i5, reflect: e4, wrapped: h3 }, r4) {
    i5 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t3) && (this._$Ej.set(t3, r4 ?? s4 ?? this[t3]), true !== h3 || void 0 !== r4) || (this._$AL.has(t3) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t3, s4)), true === e4 && this._$Em !== t3 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t3));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return null != t3 && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t5, s5] of this._$Ep) this[t5] = s5;
        this._$Ep = void 0;
      }
      const t4 = this.constructor.elementProperties;
      if (t4.size > 0) for (const [s5, i5] of t4) {
        const { wrapped: t5 } = i5, e4 = this[s5];
        true !== t5 || this._$AL.has(s5) || void 0 === e4 || this.C(s5, void 0, i5, e4);
      }
    }
    let t3 = false;
    const s4 = this._$AL;
    try {
      t3 = this.shouldUpdate(s4), t3 ? (this.willUpdate(s4), this._$EO?.forEach((t4) => t4.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t3 = false, this._$EM(), s5;
    }
    t3 && this._$AE(s4);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    this._$EO?.forEach((t4) => t4.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this._$Eq &&= this._$Eq.forEach((t4) => this._$ET(t4, this[t4])), this._$EM();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t3) => t3;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
var u2 = Array.isArray;
var d2 = (t3) => u2(t3) || "function" == typeof t3?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t3) => (i5, ...s4) => ({ _$litType$: t3, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t3, i5) {
  if (!u2(t3) || !t3.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t3, i5) => {
  const s4 = t3.length - 1, e4 = [];
  let n4, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t3[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n4 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n4 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n4 = void 0);
    const x2 = c4 === p2 && t3[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e4.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t3, l3 + (t3[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e4];
};
var S2 = class _S {
  constructor({ strings: t3, _$litType$: i5 }, e4) {
    let r4;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t3.length - 1, d3 = this.parts, [f3, v2] = N(t3, i5);
    if (this.el = _S.createElement(f3, e4), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t4 = this.el.content.firstChild;
      t4.replaceWith(...t4.childNodes);
    }
    for (; null !== (r4 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r4.nodeType) {
        if (r4.hasAttributes()) for (const t4 of r4.getAttributeNames()) if (t4.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r4.getAttribute(t4).split(o3), e5 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e5[2], strings: s4, ctor: "." === e5[1] ? I : "?" === e5[1] ? L : "@" === e5[1] ? z : H }), r4.removeAttribute(t4);
        } else t4.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r4.removeAttribute(t4));
        if (y2.test(r4.tagName)) {
          const t4 = r4.textContent.split(o3), i6 = t4.length - 1;
          if (i6 > 0) {
            r4.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r4.append(t4[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r4.append(t4[i6], c3());
          }
        }
      } else if (8 === r4.nodeType) if (r4.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t4 = -1;
        for (; -1 !== (t4 = r4.data.indexOf(o3, t4 + 1)); ) d3.push({ type: 7, index: l3 }), t4 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t3, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t3, s4;
  }
};
function M(t3, i5, s4 = t3, e4) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e4 ? s4._$Co?.[e4] : s4._$Cl;
  const o5 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o5 && (h3?._$AO?.(false), void 0 === o5 ? h3 = void 0 : (h3 = new o5(t3), h3._$AT(t3, s4, e4)), void 0 !== e4 ? (s4._$Co ??= [])[e4] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t3, h3._$AS(t3, i5.values), h3, e4)), i5;
}
var R = class {
  constructor(t3, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e4 = (t3?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e4;
    let h3 = P.nextNode(), o5 = 0, n4 = 0, r4 = s4[0];
    for (; void 0 !== r4; ) {
      if (o5 === r4.index) {
        let i6;
        2 === r4.type ? i6 = new k(h3, h3.nextSibling, this, t3) : 1 === r4.type ? i6 = new r4.ctor(h3, r4.name, r4.strings, this, t3) : 6 === r4.type && (i6 = new Z(h3, this, t3)), this._$AV.push(i6), r4 = s4[++n4];
      }
      o5 !== r4?.index && (h3 = P.nextNode(), o5++);
    }
    return P.currentNode = l2, e4;
  }
  p(t3) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t3, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t3[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t3, i5, s4, e4) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t3, this._$AB = i5, this._$AM = s4, this.options = e4, this._$Cv = e4?.isConnected ?? true;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t3?.nodeType && (t3 = i5.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i5 = this) {
    t3 = M(this, t3, i5), a2(t3) ? t3 === A || null == t3 || "" === t3 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t3 !== this._$AH && t3 !== E && this._(t3) : void 0 !== t3._$litType$ ? this.$(t3) : void 0 !== t3.nodeType ? this.T(t3) : d2(t3) ? this.k(t3) : this._(t3);
  }
  O(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  T(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.O(t3));
  }
  _(t3) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(l2.createTextNode(t3)), this._$AH = t3;
  }
  $(t3) {
    const { values: i5, _$litType$: s4 } = t3, e4 = "number" == typeof s4 ? this._$AC(t3) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e4) this._$AH.p(i5);
    else {
      const t4 = new R(e4, this), s5 = t4.u(this.options);
      t4.p(i5), this.T(s5), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i5 = C.get(t3.strings);
    return void 0 === i5 && C.set(t3.strings, i5 = new S2(t3)), i5;
  }
  k(t3) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e4 = 0;
    for (const h3 of t3) e4 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e4], s4._$AI(h3), e4++;
    e4 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e4), i5.length = e4);
  }
  _$AR(t3 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t3 !== this._$AB; ) {
      const s5 = i3(t3).nextSibling;
      i3(t3).remove(), t3 = s5;
    }
  }
  setConnected(t3) {
    void 0 === this._$AM && (this._$Cv = t3, this._$AP?.(t3));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t3, i5, s4, e4, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t3, this.name = i5, this._$AM = e4, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t3, i5 = this, s4, e4) {
    const h3 = this.strings;
    let o5 = false;
    if (void 0 === h3) t3 = M(this, t3, i5, 0), o5 = !a2(t3) || t3 !== this._$AH && t3 !== E, o5 && (this._$AH = t3);
    else {
      const e5 = t3;
      let n4, r4;
      for (t3 = h3[0], n4 = 0; n4 < h3.length - 1; n4++) r4 = M(this, e5[s4 + n4], i5, n4), r4 === E && (r4 = this._$AH[n4]), o5 ||= !a2(r4) || r4 !== this._$AH[n4], r4 === A ? t3 = A : t3 !== A && (t3 += (r4 ?? "") + h3[n4 + 1]), this._$AH[n4] = r4;
    }
    o5 && !e4 && this.j(t3);
  }
  j(t3) {
    t3 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === A ? void 0 : t3;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    this.element.toggleAttribute(this.name, !!t3 && t3 !== A);
  }
};
var z = class extends H {
  constructor(t3, i5, s4, e4, h3) {
    super(t3, i5, s4, e4, h3), this.type = 5;
  }
  _$AI(t3, i5 = this) {
    if ((t3 = M(this, t3, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e4 = t3 === A && s4 !== A || t3.capture !== s4.capture || t3.once !== s4.once || t3.passive !== s4.passive, h3 = t3 !== A && (s4 === A || e4);
    e4 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var Z = class {
  constructor(t3, i5, s4) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    M(this, t3);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t3, i5, s4) => {
  const e4 = s4?.renderBefore ?? i5;
  let h3 = e4._$litPart$;
  if (void 0 === h3) {
    const t4 = s4?.renderBefore ?? null;
    e4._$litPart$ = h3 = new k(i5.insertBefore(c3(), t4), t4, void 0, s4 ?? {});
  }
  return h3._$AI(t3), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t3 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t3.firstChild, t3;
  }
  update(t3) {
    const r4 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Do = D(r4, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ??= []).push("4.2.2");

// src/translations/de.json
var de_default = {
  time: {
    sinceMinutes: "seit {minutes} Min.",
    sinceHours: "seit {hours} Std.",
    sinceTime: "seit {time}",
    sinceYesterday: "seit gestern {time}",
    sinceDate: "seit {date}",
    agoMinutes: "vor {minutes} Min.",
    agoHours: "vor {hours} Std.",
    today: "heute {time}",
    yesterday: "gestern {time}",
    minutes: "{minutes} Min.",
    hoursMinutes: "{hours}:{minutes} h"
  },
  panel: {
    editor: {
      title: "Titel",
      info: "Status nach dem Titel (Text oder Jinja-Template)",
      info_alert: "Status in Akzentfarbe, wenn (YAML: entity, above, below, state)",
      chips: "Werte rechts als Chips (YAML-Liste: entity, label, unit, decimals, muted, alert, tap_action)",
      layout: "Anordnung",
      layoutVertical: "Vertikal",
      layoutHorizontal: "Horizontal",
      layoutGrid: "Raster",
      columns: "Spalten (nur Raster)",
      gap: "Abstand zwischen Karten (z.B. 8px)",
      padding: "Innenabstand (z.B. 16px)",
      min_column_width: "Mindestbreite pro Spalte (nur Raster, z.B. 380px \u2013 bricht auf schmalen Bildschirmen um)",
      frame: "Panel-Fl\xE4che anzeigen (aus = nur Layout-Container)"
    }
  },
  rows: {
    offline: "offline",
    unavailable: "keine Meldung",
    wallSwitchOff: "aus am Wandschalter",
    triggeredDefault: "ausgel\xF6st",
    attributeAgo: "{label} {ago}",
    never: "noch nie {label}",
    since: "{state} {since}",
    editor: {
      entity: "Entit\xE4t",
      name: "Name (Standard: Name der Entit\xE4t)",
      icon: "Icon (Standard: Icon der Entit\xE4t)",
      tap_action: "Aktion beim Tippen",
      hold_action: "Aktion beim Halten",
      double_tap_action: "Aktion beim Doppeltippen",
      since_line: "Zeile \xABseit \u2026\xBB unter dem Namen anzeigen",
      since_attribute: "Zeitstempel-Attribut statt letzter \xC4nderung (z.B. last_triggered)",
      since_attribute_label: "Wort vor der Zeit (Standard: ausgel\xF6st)",
      detail_entities: "Werte statt der Zeile \xABseit \u2026\xBB, solange eingeschaltet (YAML-Liste: entity, label)",
      online_entity: "Online-Entit\xE4t (Icon pulsiert, bis das Ger\xE4t erreichbar ist)",
      wall_switch: "Wandschalter-Lampe (nicht erreichbar = aus)",
      layout: "Darstellung"
    }
  },
  tiles: {
    editor: {
      entity: "Entit\xE4t",
      name: "Name (Standard: Name der Entit\xE4t)",
      icon: "Icon (Standard: Icon der Entit\xE4t)",
      online_entity: "Online-Entit\xE4t (Icon pulsiert, bis das Ger\xE4t erreichbar ist)",
      tap_action: "Aktion beim Tippen",
      hold_action: "Aktion beim Halten",
      double_tap_action: "Aktion beim Doppeltippen"
    }
  },
  meter: {
    editor: {
      entity: "Entit\xE4t (Messwert)",
      name: "Name (Standard: Name der Entit\xE4t)",
      style: "Darstellung (gradient = Farbskala mit Nadel, level = F\xFCllbalken)",
      min: "Minimum",
      max: "Maximum",
      decimals: "Nachkommastellen (Standard 1)",
      unit: "Einheit (Standard: Einheit der Entit\xE4t)",
      colors: 'Farbstufen (YAML: Wert: Farbe, z.B. 24: "#6fbf5a")',
      icon: "Icon oben rechts",
      show_icon: "Icon der Entit\xE4t anzeigen",
      secondary_entity: "Zweiter Wert rechts (z.B. Luftfeuchtigkeit)",
      secondary_decimals: "Nachkommastellen zweiter Wert",
      secondary_unit: "Einheit zweiter Wert",
      secondary_icon: "Icon vor dem zweiten Wert",
      tap_action: "Aktion beim Tippen",
      hold_action: "Aktion beim Halten",
      double_tap_action: "Aktion beim Doppeltippen",
      color: "Feste Farbe (statt Farbstufen)",
      low: "Bald leer unter (f\xFCr Verbrauchsmaterial, zeigt den Zustand)",
      layout: "Darstellung"
    }
  },
  effect: {
    editor: {
      name: "Name",
      colors: "Farben des Verlaufs (z.B. #ff7a3d)",
      entity: "Entit\xE4t (f\xFCr das Halten: More-Info, z.B. die Lampe)",
      tap_action: "Aktion beim Tippen (z.B. Effekt setzen)",
      hold_action: "Aktion beim Halten",
      double_tap_action: "Aktion beim Doppeltippen"
    }
  },
  image: {
    editor: {
      entity: "Entit\xE4t (z.B. das Skript, das gestartet wird)",
      name: "Name (Beschriftung ohne Bild, sonst nur f\xFCr Screenreader)",
      image: "Bild (/local/... oder media-source://...)",
      busy: "L\xE4uft-Anzeige (T\xF6nung und Kreisel, solange die Entit\xE4t an ist)",
      tap_action: "Aktion beim Tippen",
      hold_action: "Aktion beim Halten",
      double_tap_action: "Aktion beim Doppeltippen"
    }
  },
  stopwatch: {
    running: "l\xE4uft",
    paused: "pausiert",
    remaining: "noch {time}",
    minutes: "{minutes} Min.",
    hours: "{hours}:{minutes} h",
    editor: {
      entity: "Stoppuhr-Sensor (Stopwatch Plus)",
      name: "Name (Standard: Name der Entit\xE4t)",
      icon: "Icon (Standard: Icon der Entit\xE4t)",
      icon_position: "Icon-Position (watermark = oben rechts, left = links wie bei den Zeilen)",
      color: "Farbe des Streifens oben (ohne Farbe kein Streifen)",
      picture_entity: "Bild-Entit\xE4t (z.B. Gamerpic, rund links)",
      limit: "Tageslimit (Minuten oder Entit\xE4t; YAML pro Tag: weekday, weekend, mon \u2026 sun)",
      warn_before: "Hinweis so viele Minuten vor dem Limit (Standard 10)",
      day_start: "Tagesbeginn (Standard 03:00)",
      tap_action: "Aktion beim Tippen",
      hold_action: "Aktion beim Halten",
      double_tap_action: "Aktion beim Doppeltippen"
    }
  },
  todo: {
    empty: "Leer",
    unit: "Artikel",
    unitOne: "Artikel",
    editor: {
      entity: "Todo-Liste",
      name: "Name (Standard: Name der Liste)",
      icon: "Icon oben rechts",
      unit: "Einheit (Standard: Artikel)",
      unit_one: "Einheit bei 1 (Standard: wie Einheit)",
      empty_text: "Wert bei leerer Liste (Standard: Leer)",
      color: "Farbe des Streifens oben (ohne Farbe kein Streifen)",
      preview: "Erste offene Eintr\xE4ge rechts anzeigen",
      tap_action: "Aktion beim Tippen",
      hold_action: "Aktion beim Halten",
      double_tap_action: "Aktion beim Doppeltippen"
    }
  },
  ink: {
    printer: "Drucker",
    empty: "leer",
    low: "bald leer",
    ok: "OK",
    idle: "Bereit",
    printing: "Druckt",
    processing: "Druckt",
    stopped: "Gestoppt",
    editor: {
      entity: "Drucker-Entit\xE4t (Status, offline)",
      name: "Name (Standard: Name der Entit\xE4t oder Drucker)",
      cartridges: "F\xFCllstand-Sensoren der Patronen (%)",
      low_level: "Bald leer unter (%, Standard 20)",
      tap_action: "Aktion beim Tippen",
      hold_action: "Aktion beim Halten",
      double_tap_action: "Aktion beim Doppeltippen"
    }
  },
  pickup: {
    today: "Heute",
    todayHint: "Abfuhr",
    tomorrow: "Morgen",
    tomorrowHint: "bereitstellen",
    date: "{weekday} {day}.",
    inDays: "in {days} Tagen",
    editor: {
      entity: "Abfuhr-Kalender",
      name: "Name (Standard: Termin oder Name des Kalenders)",
      icon: "Icon oben rechts",
      color: "Farbe des Streifens oben",
      drop_after: "Abfuhr von heute gilt erledigt ab (HH:MM, Standard 12:00)",
      lookahead_days: "Tage vorausschauen (Standard 40)",
      tap_action: "Aktion beim Tippen",
      hold_action: "Aktion beim Halten",
      double_tap_action: "Aktion beim Doppeltippen"
    }
  },
  level: {
    ok: "OK",
    low: "bald leer",
    empty: "leer"
  }
};

// src/translations/en.json
var en_default = {
  time: {
    sinceMinutes: "for {minutes} min",
    sinceHours: "for {hours} h",
    sinceTime: "since {time}",
    sinceYesterday: "since yesterday {time}",
    sinceDate: "since {date}",
    agoMinutes: "{minutes} min ago",
    agoHours: "{hours} h ago",
    today: "today {time}",
    yesterday: "yesterday {time}",
    minutes: "{minutes} min",
    hoursMinutes: "{hours}:{minutes} h"
  },
  panel: {
    editor: {
      title: "Title",
      info: "Status after the title (text or Jinja template)",
      info_alert: "Status in accent color when (YAML: entity, above, below, state)",
      chips: "Values on the right as chips (YAML list: entity, label, unit, decimals, muted, alert, tap_action)",
      layout: "Layout",
      layoutVertical: "Vertical",
      layoutHorizontal: "Horizontal",
      layoutGrid: "Grid",
      columns: "Columns (grid only)",
      gap: "Gap between cards (e.g. 8px)",
      padding: "Padding (e.g. 16px)",
      min_column_width: "Minimum column width (grid only, e.g. 380px \u2013 wraps on narrow screens)",
      frame: "Show panel surface (off = layout container only)"
    }
  },
  rows: {
    offline: "offline",
    unavailable: "no report",
    wallSwitchOff: "off at the wall switch",
    triggeredDefault: "triggered",
    attributeAgo: "{label} {ago}",
    never: "never {label}",
    since: "{state} {since}",
    editor: {
      entity: "Entity",
      name: "Name (default: entity name)",
      icon: "Icon (default: entity icon)",
      tap_action: "Tap action",
      hold_action: "Hold action",
      double_tap_action: "Double tap action",
      since_line: 'Show the "since \u2026" line below the name',
      since_attribute: "Timestamp attribute instead of the last change (e.g. last_triggered)",
      since_attribute_label: "Word before the time (default: triggered)",
      detail_entities: 'Values instead of the "since \u2026" line while on (YAML list: entity, label)',
      online_entity: "Online entity (icon pulses until the device is reachable)",
      wall_switch: "Wall switch lamp (unavailable = off)",
      layout: "Layout"
    }
  },
  tiles: {
    editor: {
      entity: "Entity",
      name: "Name (default: entity name)",
      icon: "Icon (default: entity icon)",
      online_entity: "Online entity (icon pulses until the device is reachable)",
      tap_action: "Tap action",
      hold_action: "Hold action",
      double_tap_action: "Double tap action"
    }
  },
  meter: {
    editor: {
      entity: "Entity (measurement)",
      name: "Name (default: entity name)",
      style: "Style (gradient = color scale with needle, level = fill bar)",
      min: "Minimum",
      max: "Maximum",
      decimals: "Decimals (default 1)",
      unit: "Unit (default: entity unit)",
      colors: 'Color stops (YAML: value: color, e.g. 24: "#6fbf5a")',
      icon: "Icon top right",
      show_icon: "Show the entity icon",
      secondary_entity: "Second value on the right (e.g. humidity)",
      secondary_decimals: "Decimals of the second value",
      secondary_unit: "Unit of the second value",
      secondary_icon: "Icon before the second value",
      tap_action: "Tap action",
      hold_action: "Hold action",
      double_tap_action: "Double tap action",
      color: "Single color (instead of color stops)",
      low: "Low below (consumables, shows the status)",
      layout: "Layout"
    }
  },
  effect: {
    editor: {
      name: "Name",
      colors: "Gradient colors (e.g. #ff7a3d)",
      entity: "Entity (for hold: more-info, e.g. the lamp)",
      tap_action: "Tap action (e.g. set the effect)",
      hold_action: "Hold action",
      double_tap_action: "Double tap action"
    }
  },
  image: {
    editor: {
      entity: "Entity (e.g. the script that is started)",
      name: "Name (label without an image, else only for screen readers)",
      image: "Image (/local/... or media-source://...)",
      busy: "Busy indicator (tint and spinner while the entity is on)",
      tap_action: "Tap action",
      hold_action: "Hold action",
      double_tap_action: "Double tap action"
    }
  },
  stopwatch: {
    running: "running",
    paused: "paused",
    remaining: "{time} left",
    minutes: "{minutes} min",
    hours: "{hours}:{minutes} h",
    editor: {
      entity: "Stopwatch sensor (Stopwatch Plus)",
      name: "Name (default: entity name)",
      icon: "Icon (default: entity icon)",
      icon_position: "Icon position (watermark = top right, left = on the left like the rows)",
      color: "Color of the stripe on top (no stripe without a color)",
      picture_entity: "Picture entity (e.g. a gamer picture, round on the left)",
      limit: "Daily limit (minutes or an entity; YAML per day: weekday, weekend, mon \u2026 sun)",
      warn_before: "Hint this many minutes before the limit (default 10)",
      day_start: "Start of the day (default 03:00)",
      tap_action: "Tap action",
      hold_action: "Hold action",
      double_tap_action: "Double tap action"
    }
  },
  todo: {
    empty: "Empty",
    unit: "items",
    unitOne: "item",
    editor: {
      entity: "Todo list",
      name: "Name (default: list name)",
      icon: "Icon top right",
      unit: "Unit (default: items)",
      unit_one: "Unit for 1 (default: item)",
      empty_text: "Value of an empty list (default: Empty)",
      color: "Color of the stripe on top (no stripe without a color)",
      preview: "Show the first open items on the right",
      tap_action: "Tap action",
      hold_action: "Hold action",
      double_tap_action: "Double tap action"
    }
  },
  ink: {
    printer: "Printer",
    empty: "empty",
    low: "low",
    ok: "OK",
    idle: "Ready",
    printing: "Printing",
    processing: "Printing",
    stopped: "Stopped",
    editor: {
      entity: "Printer entity (status, offline)",
      name: "Name (default: entity name or Printer)",
      cartridges: "Cartridge level sensors (%)",
      low_level: "Soon empty below (%, default 20)",
      tap_action: "Tap action",
      hold_action: "Hold action",
      double_tap_action: "Double tap action"
    }
  },
  pickup: {
    today: "Today",
    todayHint: "collection",
    tomorrow: "Tomorrow",
    tomorrowHint: "put out",
    date: "{weekday} {day}",
    inDays: "in {days} days",
    editor: {
      entity: "Collection calendar",
      name: "Name (default: event or calendar name)",
      icon: "Icon top right",
      color: "Color of the stripe on top",
      drop_after: "Today's collection counts as done after (HH:MM, default 12:00)",
      lookahead_days: "Days to look ahead (default 40)",
      tap_action: "Tap action",
      hold_action: "Hold action",
      double_tap_action: "Double tap action"
    }
  },
  level: {
    ok: "OK",
    low: "low",
    empty: "empty"
  }
};

// src/core/i18n.ts
var translations = { de: de_default, en: en_default };
var fallbackLanguage = "en";
function supportedLanguage(language) {
  const code = (language || "").trim().toLowerCase();
  if (translations[code]) return code;
  const base = code.split("-")[0];
  return translations[base] ? base : fallbackLanguage;
}
function languageOf(element, hass) {
  const themeLanguage = element ? getComputedStyle(element).getPropertyValue("--graphite-language") : "";
  return supportedLanguage(themeLanguage.replaceAll('"', "") || hass?.locale?.language || hass?.language);
}
function lookup(tree, key) {
  let node = tree;
  for (const part of key.split(".")) {
    if (!node || typeof node === "string") return void 0;
    node = node[part];
  }
  return typeof node === "string" ? node : void 0;
}
function translate(language, key, params = {}) {
  const text = lookup(translations[language], key) ?? lookup(translations[fallbackLanguage], key) ?? key;
  return Object.entries(params).reduce((result, [name, value]) => result.split(`{${name}}`).join(String(value)), text);
}

// src/core/graphite-card.ts
var GraphiteCard = class extends i4 {
  // hass is set by Home Assistant on every state change anywhere; shouldUpdate filters it
  get hass() {
    return this.hassObject;
  }
  set hass(hass) {
    const previous = this.hassObject;
    this.hassObject = hass;
    if (previous?.locale?.language !== hass?.locale?.language) this.languageCache = void 0;
    this.hassChanged(hass);
    this.requestUpdate("hass", previous);
  }
  // called on every hass update, also when the card does not re-render (e.g. to pass hass on to child cards)
  hassChanged(_hass) {
  }
  // language of the texts: theme variable --graphite-language, else the Home Assistant language
  // (cached once the card is in the page, because the theme variable needs the computed style)
  get language() {
    if (this.languageCache) return this.languageCache;
    const language = languageOf(this.isConnected ? this : void 0, this.hass);
    if (this.isConnected) this.languageCache = language;
    return language;
  }
  // translated text, e.g. this.localize("time.sinceMinutes", { minutes: 5 })
  localize(key, params = {}) {
    return translate(this.language, key, params);
  }
  connectedCallback() {
    super.connectedCallback();
    this.languageCache = void 0;
  }
  // called by Home Assistant with the YAML / editor config; throw to show a config error
  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this.config = this.normalizeConfig(config);
  }
  // defaults and validation of a card; returns the config the card works with
  normalizeConfig(config) {
    return config;
  }
  // styles that depend on the config (e.g. the layout); undefined = the static styles only
  stylesForConfig() {
    return void 0;
  }
  // the shadow root gets the styles of the current layout before rendering
  willUpdate(changed) {
    super.willUpdate(changed);
    const styles = this.stylesForConfig();
    if (styles && styles !== this.appliedStyles && this.renderRoot instanceof ShadowRoot) {
      S(this.renderRoot, this.constructor.finalizeStyles(styles));
      this.appliedStyles = styles;
    }
  }
  // entities whose changes trigger a re-render (default: the card entity)
  watchedEntities() {
    return this.config?.entity ? [this.config.entity] : [];
  }
  // re-render on hass changes only when a watched entity or the language changed
  shouldUpdate(changed) {
    if (!this.config) return false;
    if (changed.size !== 1 || !changed.has("hass")) return true;
    const previous = changed.get("hass");
    if (!previous || !this.hass) return true;
    if (previous.locale?.language !== this.hass.locale?.language) return true;
    return this.watchedEntities().some((entityId) => previous.states[entityId] !== this.hass.states[entityId]);
  }
  getCardSize() {
    return 1;
  }
};
GraphiteCard.properties = {
  config: { state: true }
};

// src/core/actions.ts
var holdDelay = 500;
var doubleTapDelay = 250;
function hasAction(config) {
  return !!config && config.action !== "none";
}
function defaultHoldAction(entity) {
  return entity ? { action: "more-info" } : { action: "none" };
}
function fireAction(element, config, action) {
  element.dispatchEvent(new CustomEvent("hass-action", {
    detail: { config, action },
    bubbles: true,
    composed: true
  }));
}
var holdIndicator;
function showHoldIndicator(element, x2, y3, isTouch) {
  if (!holdIndicator) {
    holdIndicator = document.createElement("div");
    Object.assign(holdIndicator.style, {
      position: "fixed",
      borderRadius: "50%",
      opacity: "0.2",
      pointerEvents: "none",
      zIndex: "999",
      transform: "translate(-50%, -50%) scale(0)",
      transition: "transform 180ms ease-in-out"
    });
    document.body.appendChild(holdIndicator);
  }
  const size = isTouch ? "100px" : "50px";
  const styles = getComputedStyle(element);
  const color = styles.getPropertyValue("--graphite-accent").trim() || styles.getPropertyValue("--primary-color").trim() || "currentColor";
  Object.assign(holdIndicator.style, { width: size, height: size, background: color, left: `${x2}px`, top: `${y3}px` });
  requestAnimationFrame(() => {
    if (holdIndicator) holdIndicator.style.transform = "translate(-50%, -50%) scale(1)";
  });
}
function hideHoldIndicator() {
  if (holdIndicator) holdIndicator.style.transform = "translate(-50%, -50%) scale(0)";
}
function attachActionHandler(element, options, onAction) {
  let holdTimer;
  let tapTimer;
  let held = false;
  let pressed = false;
  let pointerType = "";
  let startX = 0;
  let startY = 0;
  const clearHold = () => {
    window.clearTimeout(holdTimer);
    holdTimer = void 0;
  };
  const cancel = () => {
    clearHold();
    if (held) hideHoldIndicator();
    held = false;
    pressed = false;
  };
  const onPointerDown = (event) => {
    pointerType = event.pointerType;
    if (event.button !== 0) return;
    pressed = true;
    held = false;
    startX = event.clientX;
    startY = event.clientY;
    if (options.hasHold()) {
      holdTimer = window.setTimeout(() => {
        held = true;
        showHoldIndicator(element, startX, startY, pointerType === "touch");
      }, holdDelay);
    }
  };
  const onPointerMove = (event) => {
    if (holdTimer && Math.hypot(event.clientX - startX, event.clientY - startY) > 10) clearHold();
  };
  const onPointerUp = (event) => {
    clearHold();
    if (event.button !== 0 || !pressed) return;
    pressed = false;
    if (held) {
      held = false;
      hideHoldIndicator();
      onAction("hold");
      return;
    }
    if (!options.hasDoubleTap()) {
      onAction("tap");
      return;
    }
    if (tapTimer) {
      window.clearTimeout(tapTimer);
      tapTimer = void 0;
      onAction("double_tap");
      return;
    }
    tapTimer = window.setTimeout(() => {
      tapTimer = void 0;
      onAction("tap");
    }, doubleTapDelay);
  };
  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onAction("tap");
    }
  };
  const onContextMenu = (event) => {
    if (pointerType === "touch" && options.hasHold()) event.preventDefault();
  };
  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerup", onPointerUp);
  element.addEventListener("pointercancel", cancel);
  element.addEventListener("pointerleave", cancel);
  element.addEventListener("keydown", onKeyDown);
  element.addEventListener("contextmenu", onContextMenu);
  return () => {
    clearHold();
    window.clearTimeout(tapTimer);
    element.removeEventListener("pointerdown", onPointerDown);
    element.removeEventListener("pointermove", onPointerMove);
    element.removeEventListener("pointerup", onPointerUp);
    element.removeEventListener("pointercancel", cancel);
    element.removeEventListener("pointerleave", cancel);
    element.removeEventListener("keydown", onKeyDown);
    element.removeEventListener("contextmenu", onContextMenu);
  };
}

// src/core/format.ts
var unavailableStates = ["unavailable", "unknown"];
function isUnavailable(stateObj) {
  return !stateObj || unavailableStates.includes(stateObj.state);
}
function formatState(hass, stateObj) {
  if (!stateObj) return "";
  return hass?.formatEntityState?.(stateObj) ?? stateObj.state;
}
function formatNumber(hass, value, digits) {
  const locale = hass?.locale?.language || "de-CH";
  return value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function startOfToday() {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
function sinceText(changed, language) {
  const minutes = Math.max(1, Math.floor((Date.now() - changed.getTime()) / 6e4));
  if (minutes < 60) return translate(language, "time.sinceMinutes", { minutes });
  if (minutes < 360) return translate(language, "time.sinceHours", { hours: Math.floor(minutes / 60) });
  const time = changed.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
  const today = startOfToday();
  if (changed >= today) return translate(language, "time.sinceTime", { time });
  if (changed >= new Date(today.getTime() - 864e5)) return translate(language, "time.sinceYesterday", { time });
  return translate(language, "time.sinceDate", { date: changed.toLocaleDateString(language, { day: "numeric", month: "short" }) });
}
function agoText(moment, language) {
  const minutes = Math.max(1, Math.floor((Date.now() - moment.getTime()) / 6e4));
  if (minutes < 60) return translate(language, "time.agoMinutes", { minutes });
  if (minutes < 360) return translate(language, "time.agoHours", { hours: Math.floor(minutes / 60) });
  const time = moment.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
  const today = startOfToday();
  if (moment >= today) return translate(language, "time.today", { time });
  if (moment >= new Date(today.getTime() - 864e5)) return translate(language, "time.yesterday", { time });
  return moment.toLocaleDateString(language, { day: "numeric", month: "short" });
}

// src/core/conditions.ts
function matchesCondition(condition, state) {
  if (!condition || state === void 0 || unavailableStates.includes(state)) return false;
  const number = Number(state);
  if (condition.above !== void 0 && !(number > Number(condition.above))) return false;
  if (condition.below !== void 0 && !(number < Number(condition.below))) return false;
  if (condition.state !== void 0 && ![].concat(condition.state).map(String).includes(String(state))) return false;
  return true;
}

// src/core/template.ts
function isTemplate(value) {
  return typeof value === "string" && (value.includes("{{") || value.includes("{%"));
}
async function subscribeTemplate(hass, template, onResult, variables = {}) {
  return hass.connection.subscribeMessage(
    (message) => onResult(message.result != null ? String(message.result) : ""),
    { type: "render_template", template, variables }
  );
}

// src/core/register.ts
var documentationBase = "https://github.com/bornste/ha-graphite-dashboard/blob/main/docs";
function registerCard(tag, element, info) {
  if (!customElements.get(tag)) customElements.define(tag, element);
  for (const alias of info.aliases ?? []) {
    const { tag: tag2, defaults } = typeof alias === "string" ? { tag: alias, defaults: void 0 } : alias;
    if (customElements.get(tag2)) continue;
    customElements.define(tag2, class extends element {
      setConfig(config) {
        super.setConfig(defaults ? { ...defaults, ...config } : config);
      }
    });
  }
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: tag,
    name: info.name,
    description: info.description,
    preview: info.preview ?? false,
    documentationURL: `${documentationBase}/${tag}.md`,
    version
  });
}
function registerElement(tag, element) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

// src/cards/graphite-panel-editor.ts
function editorSchema(language) {
  const text = (key) => translate(language, `panel.editor.${key}`);
  return [
    { name: "title", selector: { text: {} } },
    { name: "info", selector: { text: {} } },
    {
      type: "grid",
      name: "",
      schema: [
        {
          name: "layout",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "vertical", label: text("layoutVertical") },
                { value: "horizontal", label: text("layoutHorizontal") },
                { value: "grid", label: text("layoutGrid") }
              ]
            }
          }
        },
        { name: "columns", selector: { number: { min: 1, max: 6, mode: "box" } } },
        { name: "gap", selector: { text: {} } },
        { name: "padding", selector: { text: {} } },
        { name: "min_column_width", selector: { text: {} } },
        { name: "frame", selector: { boolean: {} } }
      ]
    },
    // the object selector renders a YAML editor
    { name: "info_alert", selector: { object: {} } },
    { name: "chips", selector: { object: {} } }
  ];
}
var objectKeys = ["info_alert"];
var GraphitePanelEditor = class extends HTMLElement {
  constructor() {
    super(...arguments);
    this.config = {};
  }
  setConfig(config) {
    this.config = config;
    this.render();
  }
  set hass(hass) {
    this.hassObject = hass;
    if (this.form) this.form.hass = hass;
    if (this.stackEditor) this.stackEditor.hass = hass;
  }
  set lovelace(lovelace) {
    this.lovelaceObject = lovelace;
    if (this.stackEditor) this.stackEditor.lovelace = lovelace;
  }
  render() {
    if (!this.form) {
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.gap = "16px";
      this.form = document.createElement("ha-form");
      this.form.addEventListener("value-changed", (event) => {
        event.stopPropagation();
        this.fireConfig({ ...this.config, ...event.detail.value });
      });
      this.stackEditor = document.createElement("hui-stack-card-editor");
      this.stackEditor.addEventListener("config-changed", (event) => {
        event.stopPropagation();
        this.fireConfig({ ...this.config, cards: event.detail.config.cards || [] });
      });
      wrapper.append(this.form, this.stackEditor);
      this.replaceChildren(wrapper);
    }
    const language = languageOf(this.isConnected ? this : void 0, this.hassObject);
    if (this.formLanguage !== language) {
      this.formLanguage = language;
      this.form.schema = editorSchema(language);
      this.form.computeLabel = (schema) => {
        if (!schema.name) return "";
        const key = `panel.editor.${schema.name}`;
        const label = translate(language, key);
        return label === key ? schema.name : label;
      };
    }
    if (this.hassObject) {
      this.form.hass = this.hassObject;
      this.stackEditor.hass = this.hassObject;
    }
    if (this.lovelaceObject) this.stackEditor.lovelace = this.lovelaceObject;
    const { title, info, info_alert, chips, layout, columns, gap, padding, min_column_width, frame } = this.config;
    this.form.data = {
      title,
      info,
      info_alert,
      chips,
      layout: layout || "vertical",
      columns,
      gap,
      padding,
      min_column_width,
      frame: frame !== false
    };
    this.stackEditor.setConfig({ type: "vertical-stack", cards: this.config.cards || [] });
    this.hideStackTitle();
  }
  // the stack editor has its own "title" field, which the panel does not use (it has "title" above)
  async hideStackTitle() {
    await this.stackEditor.updateComplete;
    for (const form of this.stackEditor.shadowRoot?.querySelectorAll("ha-form") || []) {
      if (Array.isArray(form.schema) && form.schema.some((field) => field.name === "title")) {
        form.style.display = "none";
      }
    }
  }
  fireConfig(config) {
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([key, value]) => {
        if (value === "" || value === void 0 || value === null) return false;
        if (objectKeys.includes(key) && (typeof value !== "object" || Object.keys(value).length === 0)) return false;
        if (key === "chips" && (!Array.isArray(value) || value.length === 0)) return false;
        if (key === "frame" && value !== false) return false;
        return true;
      })
    );
    this.config = cleanConfig;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cleanConfig }, bubbles: true, composed: true }));
  }
};

// src/cards/graphite-panel.ts
var layouts = ["vertical", "horizontal", "grid"];
var GraphitePanel = class extends GraphiteCard {
  constructor() {
    super(...arguments);
    this.childCards = [];
    this.buildId = 0;
    this.infoText = "";
  }
  // hass goes to the child cards on every update, even when the panel itself does not re-render
  hassChanged(hass) {
    for (const element of this.childCards) element.hass = hass;
    if (hass && this.isConnected && !this.infoUnsubscribe) this.subscribeInfo();
  }
  normalizeConfig(config) {
    if (!Array.isArray(config.cards)) throw new Error("graphite-panel: 'cards' must be a list of cards");
    const layout = config.layout || "vertical";
    if (!layouts.includes(layout)) throw new Error("graphite-panel: 'layout' must be vertical, horizontal or grid");
    return { ...config, layout };
  }
  setConfig(config) {
    super.setConfig(config);
    this.unsubscribeInfo();
    this.infoText = "";
    this.buildCards();
    if (this.isConnected) this.subscribeInfo();
  }
  watchedEntities() {
    const entities = this.chipConfigs().map((chip) => chip.entity);
    if (this.config?.info_alert?.entity) entities.push(this.config.info_alert.entity);
    return entities;
  }
  connectedCallback() {
    super.connectedCallback();
    this.subscribeInfo();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeInfo();
  }
  chipConfigs() {
    return Array.isArray(this.config?.chips) ? this.config.chips.filter((chip) => chip?.entity) : [];
  }
  // child cards are created once per config (not by the template), so they keep their state
  async buildCards() {
    const buildId = ++this.buildId;
    const helpers = customElements.get("hui-card") ? null : await window.loadCardHelpers?.();
    if (buildId !== this.buildId || !this.config) return;
    this.childCards = this.config.cards.map((cardConfig) => {
      let element;
      if (!helpers) {
        element = document.createElement("hui-card");
        element.config = cardConfig;
        element.preview = false;
        if (this.hass) element.hass = this.hass;
        element.load();
      } else {
        element = helpers.createCardElement(cardConfig);
        if (this.hass) element.hass = this.hass;
      }
      this.watchVisibility(element);
      return element;
    });
    await this.updateComplete;
    if (buildId === this.buildId) this.renderRoot.querySelector(".content")?.replaceChildren(...this.childCards);
  }
  // a child card that hides itself (card-visibility-changed) collapses its slot, so no gap remains
  watchVisibility(element) {
    element.addEventListener("card-visibility-changed", (event) => {
      element.toggleAttribute("collapsed", event.detail?.value === false);
    }, true);
  }
  async subscribeInfo() {
    const info = this.config?.info;
    if (!isTemplate(info) || !this.hass?.connection || this.infoUnsubscribe) return;
    this.infoUnsubscribe = subscribeTemplate(this.hass, info, (result) => {
      this.infoText = result;
      this.requestUpdate();
    });
    try {
      await this.infoUnsubscribe;
    } catch (error) {
      this.infoUnsubscribe = void 0;
      console.warn("graphite-panel: info template failed", error);
    }
  }
  unsubscribeInfo() {
    this.infoUnsubscribe?.then((unsubscribe) => unsubscribe()).catch(() => void 0);
    this.infoUnsubscribe = void 0;
  }
  updated(changed) {
    super.updated(changed);
    if (!changed.has("config") || !this.config) return;
    this.toggleAttribute("frameless", this.config.frame === false);
    const content = this.renderRoot.querySelector(".content");
    if (content && this.childCards.length && content.childElementCount === 0) content.replaceChildren(...this.childCards);
  }
  chipValue(chip) {
    const stateObj = this.hass?.states[chip.entity];
    const state = stateObj?.state;
    const isValid = state !== void 0 && state !== "unavailable" && state !== "unknown";
    let value = isValid ? state : "\u2013";
    const number = Number(state);
    if (isValid && state !== "" && !Number.isNaN(number)) {
      const decimals = chip.decimals ?? this.hass?.entities?.[chip.entity]?.display_precision;
      if (decimals !== void 0 && decimals !== null) value = number.toFixed(Number(decimals));
    }
    const unit = chip.unit ?? stateObj?.attributes?.unit_of_measurement ?? "";
    return { value, unit, state };
  }
  chipClick(event, chip) {
    event.stopPropagation();
    const tapAction = chip.tap_action === "none" ? { action: "none" } : chip.tap_action;
    if (tapAction?.action === "none") return;
    fireAction(this, { type: "chip", entity: chip.entity, tap_action: tapAction ?? { action: "more-info" } }, "tap");
  }
  renderChip(chip) {
    const { value, unit, state } = this.chipValue(chip);
    const isStatic = chip.tap_action === "none" || typeof chip.tap_action === "object" && chip.tap_action.action === "none";
    const classes = ["chip", isStatic ? "static" : "", chip.muted ? "muted" : "", matchesCondition(chip.alert, state) ? "alert" : ""].filter(Boolean).join(" ");
    return b2`<button class=${classes} @click=${(event) => this.chipClick(event, chip)}>${chip.label ? b2`<span class="label">${chip.label}</span>` : A}<span class="value">${value}</span><span class="unit">${unit}</span></button>`;
  }
  render() {
    const config = this.config;
    const chips = this.chipConfigs();
    const info = isTemplate(config.info) ? this.infoText : config.info || "";
    const alertState = config.info_alert?.entity ? this.hass?.states[config.info_alert.entity]?.state : void 0;
    const infoClass = matchesCondition(config.info_alert, alertState) ? "info alert" : "info";
    const showHeader = !!(config.title || config.info || chips.length);
    let columns = "";
    if (config.min_column_width) columns = `repeat(auto-fit, minmax(min(${config.min_column_width}, 100%), 1fr))`;
    else if (config.columns) columns = `repeat(${Number(config.columns)}, minmax(0, 1fr))`;
    const contentStyle = [
      columns ? `grid-template-columns: ${columns}` : "",
      config.gap ? `gap: ${config.gap}` : ""
    ].filter(Boolean).join("; ");
    const cardStyle = config.padding && config.frame !== false ? `padding: ${config.padding}` : "";
    const contentClass = `content ${config.layout}${config.min_column_width ? " responsive" : ""}`;
    return b2`<ha-card style=${cardStyle}>${showHeader ? b2`<div class="header"><span class="title">${config.title ?? ""}</span><span class=${infoClass}>${info}</span><span class="chips">${chips.map((chip) => this.renderChip(chip))}</span></div>` : A}<div class=${contentClass} style=${contentStyle}></div></ha-card>`;
  }
  getCardSize() {
    return 1 + this.childCards.length;
  }
  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 3 };
  }
  static getStubConfig() {
    return { title: "Panel", layout: "vertical", cards: [] };
  }
  static async getConfigElement() {
    if (!customElements.get("hui-stack-card-editor")) {
      const helpers = await window.loadCardHelpers();
      const stackCard = helpers.createCardElement({ type: "vertical-stack", cards: [] });
      await customElements.whenDefined(stackCard.localName);
      await customElements.get(stackCard.localName).getConfigElement();
    }
    return document.createElement("graphite-panel-editor");
  }
};
GraphitePanel.styles = i`
    :host {
      display: block;
    }
    /* context tokens for child cards; a frameless panel is only a layout container and passes none.
       The sbo-* names are read by the Bubble module and the not yet migrated cards. */
    :host(:not([frameless])) {
      --graphite-card-surface: var(--graphite-surface-tile);
      --graphite-card-inner-surface: var(--graphite-surface-tile-active);
      --graphite-card-radius: var(--graphite-radius-tile);
      --sbo-card-surface: var(--graphite-card-surface);
      --sbo-card-inner-surface: var(--graphite-card-inner-surface);
      --sbo-card-radius: var(--graphite-card-radius);
    }
    ha-card {
      background: var(--graphite-surface-panel);
      border-radius: var(--graphite-radius-panel);
      border: none;
      box-shadow: none;
      padding: var(--graphite-padding-panel, 16px);
      box-sizing: border-box;
      height: 100%;
      /* only colors animate; the theme applies after the first render and would animate the radius */
      transition: background-color 0.3s ease;
    }
    /* title and info share one baseline, separated by a thin line (same as dialogs and room cards) */
    .header {
      display: flex;
      justify-content: flex-start;
      align-items: baseline;
      gap: var(--graphite-gap-header, 12px);
      margin-bottom: var(--graphite-gap-header, 12px);
    }
    .title {
      flex: none;
      font-size: var(--graphite-title-size, 18px);
      font-weight: var(--graphite-title-weight, 400);
      line-height: 1.2;
      color: var(--graphite-title-color, var(--primary-text-color));
    }
    .title:empty {
      display: none;
    }
    .info {
      min-width: 0;
      padding-left: var(--graphite-gap-header, 12px);
      position: relative;
      /* 2px more room on top for the separator line (it reads too short at cap height);
         the negative margin keeps the text on the shared baseline */
      padding-top: 2px;
      margin-top: -2px;
      font-size: var(--graphite-font-label-size, 13px);
      line-height: 16px;
      color: var(--graphite-text-secondary, var(--secondary-text-color));
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* separator from the title's cap height down to the shared baseline
       (13px text in a 16px line: the baseline sits 3.5px above the bottom) */
    .info::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 3.5px;
      width: 1px;
      background: var(--graphite-separator);
    }
    .info:empty {
      display: none;
    }
    /* info_alert condition met: info in accent color */
    .info.alert {
      color: var(--graphite-accent, var(--accent-color));
      font-weight: 500;
    }
    /* values as pills on the right; the negative margin keeps the header at title height */
    .chips {
      display: flex;
      gap: var(--graphite-chip-gap, 6px);
      flex: none;
      margin-left: auto;
      align-self: center;
      margin-block: -2px;
    }
    .chips:empty {
      display: none;
    }
    .chip {
      display: inline-flex;
      align-items: baseline;
      gap: 3px;
      padding: var(--graphite-chip-padding, 4px 10px);
      border: none;
      border-radius: var(--graphite-radius-pill, 999px);
      background: var(--graphite-surface-tile);
      font: inherit;
      font-size: var(--graphite-font-label-size, 13px);
      line-height: 16px;
      font-variant-numeric: tabular-nums;
      color: var(--graphite-text-primary, var(--primary-text-color));
      white-space: nowrap;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    .chip.static {
      cursor: default;
    }
    .chip .label {
      margin-right: 3px;
    }
    .chip .label,
    .chip .unit {
      color: var(--graphite-text-muted, var(--secondary-text-color));
      font-size: var(--graphite-font-caption-size, 12px);
    }
    .chip.muted .value {
      color: var(--graphite-text-secondary, var(--secondary-text-color));
    }
    /* alert condition met: accent text on a tinted pill */
    .chip.alert {
      background: color-mix(in srgb, var(--graphite-accent) 18%, var(--graphite-surface-panel));
    }
    .chip.alert .value,
    .chip.alert .label,
    .chip.alert .unit {
      color: var(--graphite-accent, var(--accent-color));
    }
    .content {
      /* defaults for standard Home Assistant cards inside the panel */
      --ha-card-background: var(--graphite-card-surface);
      --ha-card-border-radius: var(--graphite-card-radius);
      --ha-card-border-width: 0px;
      --ha-card-box-shadow: none;
      gap: var(--graphite-gap-tile, 8px);
    }
    .content.vertical {
      display: flex;
      flex-direction: column;
    }
    .content.horizontal {
      display: flex;
      flex-direction: row;
    }
    .content.horizontal > * {
      flex: 1 1 0;
      min-width: 0;
    }
    .content.grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    /* responsive grid: as many columns of min_column_width as fit, one column on narrow screens */
    .content.grid.responsive {
      align-items: start;
    }
    .content > [hidden],
    .content > [collapsed] {
      display: none !important;
    }
    /* frameless: no surface, no padding (layout container only) */
    :host([frameless]) ha-card {
      background: none;
      padding: 0;
      border-radius: 0;
    }
  `;
registerElement("graphite-panel-editor", GraphitePanelEditor);
registerCard("graphite-panel", GraphitePanel, {
  name: "Graphite Panel",
  description: "Groups cards in one panel with title, status, chips and a vertical, horizontal or grid layout."
});

// src/core/offline-dot.ts
var offlineDot = b2`<svg class="offline-dot" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><circle
  cx="12" cy="12" r="7.5" fill="currentColor" opacity="0.3"></circle><circle cx="12" cy="12" r="7.5" fill="none"
  stroke="currentColor" stroke-width="2"></circle></svg>`;

// src/cards/rows/row-styles.ts
var rowStyles = i`
  :host {
    display: block;
  }
  .row {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: var(--graphite-row-height, 60px);
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    transition: background-color 0.3s ease;
  }
  .row.interactive {
    cursor: pointer;
  }
  .row.interactive:focus-visible {
    box-shadow: inset 0 0 0 2px var(--graphite-accent);
  }
  /* active (on, open, ...): soft accent tint, not for measured values */
  .row.active {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  /* 42px icon box like the rows of the Home Assistant style; at 9px (not 8px) the 20px visible glyph
     sits exactly between the edge and the text (20/20) */
  .icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    margin-left: 9px;
    margin-right: 9px;
    color: var(--graphite-text-secondary);
    --mdc-icon-size: var(--graphite-row-icon-size, 24px);
  }
  .row.active .icon {
    color: var(--graphite-accent);
  }
  .text {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }
  .name {
    font-size: var(--graphite-font-name-size, 15px);
    font-weight: 400;
    line-height: 18px;
    color: var(--graphite-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row.active .name {
    font-weight: 500;
  }
  .since {
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 15px;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .value {
    flex: none;
    margin-left: auto;
    padding: 0 14px 0 12px;
    font-size: var(--graphite-font-name-size, 15px);
    color: var(--graphite-text-secondary);
    white-space: nowrap;
  }
  .row.active .value {
    font-weight: 500;
    color: var(--graphite-accent);
  }
  /* toggle (switch row): pure display, the row itself switches */
  .toggle {
    flex: none;
    position: relative;
    width: 36px;
    height: 20px;
    margin: 0 14px 0 12px;
    border-radius: var(--graphite-radius-pill, 999px);
    background: var(--graphite-surface-track);
  }
  .toggle::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--graphite-text-secondary);
    transition: left 0.2s ease, background-color 0.2s ease;
  }
  .row.on .toggle {
    background: var(--graphite-accent);
  }
  .row.on .toggle::after {
    left: 19px;
    background: var(--graphite-accent-ink);
  }
  /* offline badge in place of the value or toggle */
  .offline {
    display: none;
    flex: none;
    align-items: center;
    gap: 4px;
    height: 20px;
    margin: 0 14px 0 auto;
    padding: 0 8px 0 6px;
    border-radius: var(--graphite-radius-pill, 999px);
    background: color-mix(in srgb, var(--graphite-danger) 14%, var(--graphite-surface-tile));
    color: var(--graphite-danger);
    font-size: 11px;
    font-weight: 500;
    line-height: 20px;
  }
  .offline-dot {
    flex: none;
    display: block;
  }
  /* unavailable: dimmed row, badge instead of value and toggle */
  .row.unavailable {
    background: color-mix(in srgb, var(--graphite-surface-tile) 40%, transparent);
  }
  .row.unavailable :is(.text, .icon) {
    opacity: 0.4;
  }
  .row.unavailable :is(.value, .toggle) {
    display: none;
  }
  .row.unavailable .offline {
    display: flex;
  }
  /* online_entity: the icon pulses until the device is reachable, then lights up */
  .row.connecting .icon {
    animation: graphite-connecting 1.6s ease-in-out infinite;
  }
  .row.online .icon {
    color: var(--graphite-accent);
  }
  @keyframes graphite-connecting {
    50% {
      opacity: 0.35;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .toggle::after {
      transition: none;
    }
    .row.connecting .icon {
      animation: none;
      opacity: 0.6;
    }
  }
`;

// src/cards/rows/graphite-row.ts
var activeStates = ["on", "open", "opening", "closing", "home", "playing", "active", "running", "true"];
var onlineStates = ["home", "on", "online", "connected"];
function isActiveState(state) {
  if (state === void 0) return false;
  return activeStates.includes(state) || Number(state) > 0;
}
var GraphiteRow = class extends GraphiteCard {
  normalizeConfig(config) {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { ...this.defaultActions(config.entity), ...config };
  }
  watchedEntities() {
    const config = this.config;
    const entities = [config.entity];
    if (config.online_entity) entities.push(config.online_entity);
    for (const detail of config.detail_entities ?? []) entities.push(typeof detail === "string" ? detail : detail.entity);
    return entities;
  }
  connectedCallback() {
    super.connectedCallback();
    this.refreshTimer = window.setInterval(() => this.requestUpdate(), 6e4);
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action)
    }, (action) => this.handleAction(action));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearInterval(this.refreshTimer);
    this.detachActions?.();
    this.detachActions = void 0;
  }
  // hand cursor, ripple and focus only when tapping does something; holding alone stays invisible.
  // An offline entity cannot be switched, so the row is not interactive then either.
  isInteractive(stateObj) {
    const config = this.config;
    if (this.unavailable(stateObj)) return false;
    return hasAction(config.tap_action) || hasAction(config.double_tap_action);
  }
  handleAction(action) {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`])) return;
    if (action !== "hold" && this.unavailable(this.hass?.states[config.entity])) return;
    fireAction(this, config, action);
  }
  // whether the entity counts as unavailable (a wall switch lamp is "off" instead)
  unavailable(stateObj) {
    return isUnavailable(stateObj) && !this.config.wall_switch;
  }
  // text below the name: details while on, a timestamp attribute, or "<state> seit <time>"
  sinceLine(stateObj) {
    const config = this.config;
    if (!stateObj) return "";
    const offline = isUnavailable(stateObj);
    if (!offline && stateObj.state !== "off" && config.detail_entities?.length) {
      const details = config.detail_entities.map((detail) => {
        const entityId = typeof detail === "string" ? detail : detail.entity;
        const detailState = this.hass?.states[entityId];
        if (isUnavailable(detailState)) return "";
        const value = formatState(this.hass, detailState);
        return typeof detail !== "string" && detail.label ? `${detail.label} ${value}` : value;
      }).filter(Boolean).join(" \xB7 ");
      if (details) return details;
    }
    if (config.since_attribute && !offline) {
      const label = config.since_attribute_label || this.localize("rows.triggeredDefault");
      const moment = stateObj.attributes?.[config.since_attribute] ? new Date(stateObj.attributes[config.since_attribute]) : null;
      return moment && !Number.isNaN(moment.getTime()) ? this.localize("rows.attributeAgo", { label, ago: agoText(moment, this.language) }) : this.localize("rows.never", { label });
    }
    const isMeasurement = !!stateObj.attributes?.unit_of_measurement;
    const showSince = typeof config.since_line === "boolean" ? config.since_line : !isMeasurement;
    if (!offline && !showSince) return "";
    const stateText = offline ? this.localize(config.wall_switch ? "rows.wallSwitchOff" : "rows.unavailable") : formatState(this.hass, stateObj).toLowerCase();
    return this.localize("rows.since", { state: stateText, since: sinceText(new Date(stateObj.last_changed), this.language) });
  }
  // classes of the row: active tint, on (toggle), unavailable, online status
  rowClasses(stateObj) {
    const config = this.config;
    const classes = ["row"];
    if (this.isInteractive(stateObj)) classes.push("interactive");
    if (this.unavailable(stateObj)) classes.push("unavailable");
    if (stateObj?.state === "on") classes.push("on");
    if (config.online_entity && stateObj?.state === "on") {
      const online = onlineStates.includes(String(this.hass?.states[config.online_entity]?.state || "").toLowerCase());
      classes.push(online ? "online" : "connecting");
    }
    return classes;
  }
  renderIcon(stateObj) {
    const icon = this.config.icon;
    if (icon || !customElements.get("ha-state-icon")) {
      return b2`<ha-icon .icon=${icon || stateObj?.attributes?.icon || "mdi:help-circle-outline"}></ha-icon>`;
    }
    return b2`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
  }
  render() {
    const config = this.config;
    const stateObj = this.hass?.states[config.entity];
    const unavailable = this.unavailable(stateObj);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const since = this.sinceLine(stateObj);
    const interactive = this.isInteractive(stateObj);
    return b2`<div class=${this.rowClasses(stateObj).join(" ")} role=${interactive ? "button" : A}
      tabindex=${interactive ? "0" : A}>${interactive ? b2`<ha-ripple></ha-ripple>` : A}<div
      class="icon">${this.renderIcon(stateObj)}</div><div class="text"><div class="name">${name}</div>${since ? b2`<div class="since">${since}</div>` : A}</div>${this.renderEnd(stateObj, unavailable)}<div
      class="offline">${offlineDot}<span>${this.localize("rows.offline")}</span></div></div>`;
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 3 };
  }
};
GraphiteRow.styles = rowStyles;

// src/core/form-editor.ts
var GraphiteFormEditor = class extends HTMLElement {
  constructor() {
    super(...arguments);
    this.config = {};
  }
  // changes when the schema depends on the config (e.g. the fields of the chosen layout)
  schemaKey() {
    return "";
  }
  // whether a value is left out of the stored config (besides empty values)
  skipValue(_key, _value) {
    return false;
  }
  setConfig(config) {
    this.config = config;
    this.render();
  }
  set hass(hass) {
    this.hassObject = hass;
    if (this.form) this.form.hass = hass;
    else this.render();
  }
  render() {
    if (!this.form) {
      this.form = document.createElement("ha-form");
      this.form.addEventListener("value-changed", (event) => {
        event.stopPropagation();
        this.fireConfig({ ...this.config, ...event.detail.value });
      });
      this.replaceChildren(this.form);
    }
    const language = languageOf(this.isConnected ? this : void 0, this.hassObject);
    if (this.formLanguage !== language || this.formSchemaKey !== this.schemaKey()) {
      this.formLanguage = language;
      this.formSchemaKey = this.schemaKey();
      this.form.schema = this.schema();
      this.form.computeLabel = (schema) => {
        if (!schema.name) return "";
        const key = `${this.labelPrefix()}.${schema.name}`;
        const label = translate(language, key);
        return label === key ? schema.name : label;
      };
    }
    if (this.hassObject) this.form.hass = this.hassObject;
    this.form.data = this.config;
  }
  fireConfig(config) {
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([key, value]) => value !== "" && value !== void 0 && value !== null && !this.skipValue(key, value))
    );
    this.config = cleanConfig;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cleanConfig }, bubbles: true, composed: true }));
  }
};

// src/core/layout.ts
function layoutOf(config, fallback) {
  return config?.layout === "row" || config?.layout === "tile" ? config.layout : fallback;
}
function layoutField() {
  return { name: "layout", selector: { select: { mode: "list", options: ["row", "tile"] } } };
}

// src/cards/rows/graphite-row-editor.ts
var GraphiteRowEditor = class extends GraphiteFormEditor {
  constructor() {
    super(...arguments);
    this.rowKind = "status";
  }
  labelPrefix() {
    return "rows.editor";
  }
  schemaKey() {
    return layoutOf(this.config, "row");
  }
  schema() {
    const isRow = this.rowKind === "status" || layoutOf(this.config, "row") === "row";
    return [
      ...this.rowKind === "switch" ? [layoutField()] : [],
      { name: "entity", required: true, selector: { entity: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }
        ]
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
      ...isRow ? [
        { name: "since_line", selector: { boolean: {} } },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "since_attribute", selector: { text: {} } },
            { name: "since_attribute_label", selector: { text: {} } }
          ]
        },
        { name: "detail_entities", selector: { object: {} } }
      ] : [],
      { name: "online_entity", selector: { entity: {} } },
      ...this.rowKind === "status" ? [{ name: "wall_switch", selector: { boolean: {} } }] : []
    ];
  }
  skipValue(key, value) {
    if (key === "detail_entities") return !Array.isArray(value) || value.length === 0;
    if (key === "wall_switch") return value !== true;
    if (key === "layout") return value === "row";
    return false;
  }
};

// src/cards/rows/graphite-status.ts
var GraphiteStatus = class extends GraphiteRow {
  defaultActions(entity) {
    return { tap_action: { action: "none" }, hold_action: defaultHoldAction(entity) };
  }
  rowClasses(stateObj) {
    const classes = super.rowClasses(stateObj);
    const isMeasurement = !!stateObj?.attributes?.unit_of_measurement;
    if (!isMeasurement && !classes.includes("unavailable") && isActiveState(stateObj?.state)) classes.push("active");
    return classes;
  }
  renderEnd(stateObj) {
    if (!stateObj) return b2`<div class="value"></div>`;
    const shown = this.config.wall_switch && ["unavailable", "unknown"].includes(stateObj.state) ? { ...stateObj, state: "off" } : stateObj;
    return b2`<div class="value">${formatState(this.hass, shown)}</div>`;
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("binary_sensor.")) ?? "";
    return { entity };
  }
  static async getConfigElement() {
    const editor = document.createElement("graphite-row-editor");
    editor.rowKind = "status";
    return editor;
  }
};
registerElement("graphite-row-editor", GraphiteRowEditor);
registerCard("graphite-status", GraphiteStatus, {
  name: "Graphite Status",
  description: 'Row with icon, name, "since" line and the state on the right.',
  aliases: ["graphite-status-row"]
});

// src/cards/tiles/tile-styles.ts
var tileStyles = i`
  :host {
    display: block;
  }
  .tile {
    position: relative;
    box-sizing: border-box;
    height: var(--graphite-tile-height, 80px);
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    transition: background-color 0.3s ease;
  }
  .tile.interactive {
    cursor: pointer;
  }
  .tile.interactive:focus-visible {
    box-shadow: inset 0 0 0 2px var(--graphite-accent);
  }
  /* on: soft accent tint */
  .tile.on {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  /* icon as watermark bottom right */
  .watermark {
    position: absolute;
    right: 6px;
    bottom: 7px;
    display: flex;
    width: var(--graphite-watermark-size, 34px);
    height: var(--graphite-watermark-size, 34px);
    color: var(--graphite-text-primary);
    opacity: 0.16;
    pointer-events: none;
    --mdc-icon-size: var(--graphite-watermark-size, 34px);
  }
  .tile.on .watermark {
    opacity: 0.3;
  }
  .name {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    right: var(--graphite-padding-tile, 12px);
    bottom: 9px;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    line-height: 18px;
    color: var(--graphite-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tile.on .name {
    font-weight: 500;
  }
  /* toggle top left: pure display, the tile itself switches */
  .toggle {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    top: var(--graphite-padding-tile, 12px);
    width: 36px;
    height: 20px;
    border-radius: var(--graphite-radius-pill, 999px);
    background: var(--graphite-surface-track);
  }
  .toggle::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--graphite-text-secondary);
    transition: left 0.2s ease, background-color 0.2s ease;
  }
  .tile.on .toggle {
    background: var(--graphite-accent);
  }
  .tile.on .toggle::after {
    left: 19px;
    background: var(--graphite-accent-ink);
  }
  /* offline badge top right, only while unavailable */
  .offline {
    display: none;
    position: absolute;
    top: 8px;
    right: 8px;
    align-items: center;
    gap: 4px;
    height: 20px;
    padding: 0 8px 0 6px;
    border-radius: var(--graphite-radius-pill, 999px);
    background: color-mix(in srgb, var(--graphite-danger) 14%, var(--graphite-surface-tile));
    color: var(--graphite-danger);
    font-size: 11px;
    font-weight: 500;
    line-height: 20px;
  }
  .offline-dot {
    flex: none;
    display: block;
  }
  /* unavailable: surface fades into the panel, text and icon faded, only the badge keeps full strength */
  .tile.unavailable {
    background: color-mix(in srgb, var(--graphite-surface-tile) 40%, transparent);
  }
  .tile.unavailable .name {
    opacity: 0.4;
  }
  .tile.unavailable .watermark {
    opacity: 0.08;
  }
  .tile.unavailable .toggle {
    display: none;
  }
  .tile.unavailable .offline {
    display: flex;
  }
  /* online_entity: while switched on, the watermark pulses until the device is reachable,
     then lights up in the accent color */
  .tile.online .watermark {
    color: var(--graphite-accent);
    opacity: 0.9;
  }
  .tile.connecting .watermark {
    animation: graphite-connecting 1.6s ease-in-out infinite;
  }
  @keyframes graphite-connecting {
    50% {
      opacity: 0.35;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .toggle::after {
      transition: none;
    }
    .tile.connecting .watermark {
      animation: none;
      opacity: 0.6;
    }
  }
`;

// src/cards/rows/graphite-switch.ts
var GraphiteSwitch = class extends GraphiteRow {
  stylesForConfig() {
    return layoutOf(this.config, "row") === "tile" ? tileStyles : rowStyles;
  }
  defaultActions(entity) {
    return { tap_action: { action: "toggle" }, hold_action: defaultHoldAction(entity) };
  }
  rowClasses(stateObj) {
    const classes = super.rowClasses(stateObj);
    if (classes.includes("on") && !classes.includes("unavailable")) classes.push("active");
    return classes;
  }
  renderEnd() {
    return b2`<div class="toggle"></div>`;
  }
  render() {
    if (layoutOf(this.config, "row") === "row") return super.render();
    const config = this.config;
    const stateObj = this.hass?.states[config.entity];
    const interactive = this.isInteractive(stateObj);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const classes = ["tile", ...this.rowClasses(stateObj).slice(1)].join(" ");
    return b2`<div class=${classes} role=${interactive ? "button" : A} tabindex=${interactive ? "0" : A}
      aria-label=${name}>${interactive ? b2`<ha-ripple></ha-ripple>` : A}<div class="watermark">${this.renderIcon(stateObj)}</div><div class="toggle"></div><div class="name">${name}</div><div
      class="offline">${offlineDot}<span>${this.localize("rows.offline")}</span></div></div>`;
  }
  getCardSize() {
    return layoutOf(this.config, "row") === "tile" ? 2 : 1;
  }
  getGridOptions() {
    return layoutOf(this.config, "row") === "tile" ? { columns: 3, rows: 2, min_columns: 2 } : { columns: 12, rows: "auto", min_columns: 3 };
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("switch.")) ?? "";
    return { entity };
  }
  static async getConfigElement() {
    const editor = document.createElement("graphite-row-editor");
    editor.rowKind = "switch";
    return editor;
  }
};
GraphiteSwitch.styles = [];
registerElement("graphite-row-editor", GraphiteRowEditor);
registerCard("graphite-switch", GraphiteSwitch, {
  name: "Graphite Switch",
  description: "Switch as a row (toggle on the right) or a tile (toggle, name, watermark icon); tapping switches.",
  aliases: [{ tag: "graphite-switch-row", defaults: { layout: "row" } }, { tag: "graphite-switch-tile", defaults: { layout: "tile" } }]
});

// src/cards/tiles/graphite-meter-editor.ts
var GraphiteMeterEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "meter.editor";
  }
  schemaKey() {
    return layoutOf(this.config, "tile");
  }
  schema() {
    const isTile = layoutOf(this.config, "tile") === "tile";
    return [
      layoutField(),
      { name: "entity", required: true, selector: { entity: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "style", selector: { select: { mode: "dropdown", options: ["gradient", "level"] } } }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "min", selector: { number: { mode: "box" } } },
          { name: "max", selector: { number: { mode: "box" } } },
          { name: "decimals", selector: { number: { mode: "box", min: 0, max: 4 } } },
          { name: "unit", selector: { text: {} } }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "color", selector: { text: {} } },
          { name: "low", selector: { number: { mode: "box" } } }
        ]
      },
      { name: "colors", selector: { object: {} } },
      ...isTile ? [{
        type: "grid",
        name: "",
        schema: [
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
          { name: "show_icon", selector: { boolean: {} } }
        ]
      }] : [],
      { name: "secondary_entity", selector: { entity: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "secondary_decimals", selector: { number: { mode: "box", min: 0, max: 4 } } },
          { name: "secondary_unit", selector: { text: {} } },
          { name: "secondary_icon", selector: { icon: {} } }
        ]
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } }
    ];
  }
  skipValue(key, value) {
    if (key === "show_icon") return value !== true;
    if (key === "layout") return value === "tile";
    if (key === "colors") return typeof value !== "object" || Object.keys(value).length === 0;
    return false;
  }
};

// src/cards/tiles/meter-styles.ts
var meterStyles = i`
  /* name on top (overrides the name at the bottom of the switch tile) */
  .name {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    right: var(--graphite-padding-tile, 12px);
    top: 10px;
    bottom: auto;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    line-height: 1.6;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* watermark icon top right */
  .meter-icon {
    position: absolute;
    right: 6px;
    top: 8px;
    display: flex;
    width: var(--graphite-watermark-size, 34px);
    height: var(--graphite-watermark-size, 34px);
    color: var(--graphite-text-primary);
    opacity: 0.16;
    pointer-events: none;
    --mdc-icon-size: var(--graphite-watermark-size, 34px);
  }
  .value-row {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    right: var(--graphite-padding-tile, 12px);
    bottom: 19px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px;
  }
  .value {
    font-size: var(--graphite-font-value-size, 22px);
    font-weight: var(--graphite-font-value-weight, 300);
    line-height: 1.1;
    white-space: nowrap;
    color: var(--graphite-text-primary);
  }
  /* unit and secondary value share the name size for a calm type scale */
  .unit {
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    margin-left: 3px;
    color: var(--graphite-text-muted);
  }
  /* a block (not flex), so a too long text ends with an ellipsis */
  .secondary {
    display: block;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    /* not taller than the value line: a taller line would lift the baseline of the whole row
       (the value then sits 1-2px higher than on tiles without a secondary value) */
    line-height: 1.2;
    white-space: nowrap;
    /* on narrow tiles the secondary value gives way (ellipsis) instead of running out of the tile */
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--graphite-text-muted);
    --mdc-icon-size: 13px;
  }
  /* icon sits on the text baseline like a glyph */
  .secondary ha-icon {
    display: inline-flex;
    width: 13px;
    height: 13px;
    margin-right: 3px;
    transform: translateY(1px);
  }
  .bar {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    right: var(--graphite-padding-tile, 12px);
    bottom: 9px;
    height: 4px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--graphite-ink) 14%, var(--graphite-card-surface, var(--graphite-surface-tile)));
  }
  .fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--meter-share, 0%);
    border-radius: 2px;
    background: var(--meter-color, var(--graphite-accent));
  }
  /* gradient: the whole color scale is visible, dimmed beyond the value,
     a needle marks the value (a needle, not a knob: it must not look like a slider) */
  .tile.gradient .bar {
    background: var(--meter-scale);
  }
  .tile.gradient .fill {
    left: var(--meter-share, 0%);
    right: 0;
    width: auto;
    border-radius: 0 2px 2px 0;
    background: color-mix(in srgb, var(--graphite-card-surface, var(--graphite-surface-tile)) var(--graphite-meter-dim, 65%), transparent);
  }
  .needle {
    position: absolute;
    top: -3px;
    left: var(--meter-share, 0%);
    width: 2px;
    height: 10px;
    margin-left: -1px;
    border-radius: 1px;
    background: var(--graphite-text-primary);
    box-shadow: 0 0 0 1.5px var(--graphite-card-surface, var(--graphite-surface-tile));
  }
  /* level: bar in the band color, track a muted step of it */
  .tile.level .bar {
    background: color-mix(in srgb, var(--meter-color, var(--graphite-accent)) 22%, var(--graphite-card-surface, var(--graphite-surface-tile)));
  }
  /* no value (unavailable, not numeric): empty bar, whole scale dimmed, no needle */
  .tile.novalue.level .fill,
  .tile.novalue .needle {
    display: none;
  }
  .tile.novalue.gradient .fill {
    left: 0;
    border-radius: 2px;
  }
  /* low (consumables): soon empty – status in accent; empty – accent tint as well */
  .tile.low .secondary,
  .tile.empty .secondary {
    color: var(--graphite-accent);
  }
  .tile.empty {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
`;
var meterRowStyles = i`
  :host {
    display: block;
  }
  .row {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 2px 12px;
    padding: 12px 14px;
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    transition: background-color 0.3s ease;
  }
  .row.interactive {
    cursor: pointer;
  }
  .row.interactive:focus-visible {
    box-shadow: inset 0 0 0 2px var(--graphite-accent);
  }
  .name {
    font-size: var(--graphite-font-name-size, 15px);
    line-height: 18px;
    color: var(--graphite-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .status {
    grid-column: 1;
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 15px;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .value {
    grid-row: 1 / span 2;
    grid-column: 2;
    font-size: var(--graphite-font-value-size, 22px);
    font-weight: var(--graphite-font-value-weight, 300);
    color: var(--graphite-text-primary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .unit {
    margin-left: 3px;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    color: var(--graphite-text-muted);
  }
  /* bar along the bottom: level fills in the band color, gradient shows the scale with a needle */
  .bar {
    position: relative;
    grid-column: 1 / -1;
    height: 4px;
    margin-top: 6px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--meter-color, var(--graphite-accent)) 22%, var(--graphite-card-surface, var(--graphite-surface-tile)));
  }
  .fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--meter-share, 0%);
    border-radius: 2px;
    background: var(--meter-color, var(--graphite-accent));
  }
  .row.gradient .bar {
    background: var(--meter-scale);
  }
  .row.gradient .fill {
    left: var(--meter-share, 0%);
    right: 0;
    width: auto;
    border-radius: 0 2px 2px 0;
    background: color-mix(in srgb, var(--graphite-card-surface, var(--graphite-surface-tile)) var(--graphite-meter-dim, 65%), transparent);
  }
  .needle {
    position: absolute;
    top: -3px;
    left: var(--meter-share, 0%);
    width: 2px;
    height: 10px;
    margin-left: -1px;
    border-radius: 1px;
    background: var(--graphite-text-primary);
    box-shadow: 0 0 0 1.5px var(--graphite-card-surface, var(--graphite-surface-tile));
  }
  .row.novalue.level .fill,
  .row.novalue .needle {
    display: none;
  }
  /* soon empty: value and status in accent; empty: accent tint as well */
  .row.low :is(.value, .status),
  .row.empty :is(.value, .status) {
    color: var(--graphite-accent);
  }
  .row.empty {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  /* offline: dimmed like every other offline row */
  .row.unavailable {
    background: color-mix(in srgb, var(--graphite-surface-tile) 40%, transparent);
  }
  .row.unavailable > * {
    opacity: 0.4;
  }
  .row.unavailable .value {
    font-size: var(--graphite-font-name-size, 15px);
    font-weight: 400;
  }
`;

// src/cards/tiles/graphite-meter.ts
var meterTileStyles = [tileStyles, meterStyles];
var GraphiteMeter = class extends GraphiteCard {
  stylesForConfig() {
    return layoutOf(this.config, "tile") === "row" ? meterRowStyles : meterTileStyles;
  }
  normalizeConfig(config) {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { tap_action: { action: "more-info" }, hold_action: defaultHoldAction(config.entity), ...config };
  }
  watchedEntities() {
    const config = this.config;
    return config.secondary_entity ? [config.entity, config.secondary_entity] : [config.entity];
  }
  connectedCallback() {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action)
    }, (action) => this.handleAction(action));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = void 0;
  }
  handleAction(action) {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`])) return;
    fireAction(this, config, action);
  }
  colorStops() {
    return Object.entries(this.config.colors ?? {}).map(([stopValue, color]) => ({ value: Number(stopValue), color: String(color) })).filter((stop) => Number.isFinite(stop.value) && stop.color).sort((first, second) => first.value - second.value);
  }
  secondaryText() {
    const config = this.config;
    if (!config.secondary_entity) return "";
    const secondaryState = this.hass?.states[config.secondary_entity];
    if (!secondaryState) return "";
    const value = parseFloat(secondaryState.state);
    if (!Number.isFinite(value)) return "\u2013";
    const unit = config.secondary_unit ?? secondaryState.attributes?.unit_of_measurement ?? "";
    return `${formatNumber(this.hass, value, config.secondary_decimals ?? 0)}${unit ? ` ${unit}` : ""}`;
  }
  renderIcon(stateObj) {
    const config = this.config;
    if (!config.icon && !config.show_icon) return A;
    const icon = config.icon ? b2`<ha-icon .icon=${config.icon}></ha-icon>` : b2`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return b2`<div class="meter-icon">${icon}</div>`;
  }
  // value, band color and scale shared by both layouts
  model() {
    const config = this.config;
    const style = config.style === "gradient" ? "gradient" : "level";
    const stateObj = this.hass?.states[config.entity];
    const value = stateObj ? parseFloat(stateObj.state) : NaN;
    const hasValue = Number.isFinite(value);
    const unit = config.unit ?? stateObj?.attributes?.unit_of_measurement ?? "";
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const minValue = Number.isFinite(Number(config.min)) ? Number(config.min) : 0;
    const maxValue = Number.isFinite(Number(config.max)) && Number(config.max) > minValue ? Number(config.max) : minValue + 100;
    const toShare = (number) => Math.min(100, Math.max(0, (number - minValue) / (maxValue - minValue) * 100));
    const stops = this.colorStops();
    let bandColor = config.color ?? "var(--graphite-accent)";
    if (stops.length > 0) {
      bandColor = stops[0].color;
      for (const stop of stops) if (hasValue && value >= stop.value) bandColor = stop.color;
    }
    const scale = stops.length > 0 ? stops.map((stop) => `${stop.color} ${toShare(stop.value)}%`).join(", ") : `${bandColor} 0%, ${bandColor} 100%`;
    const variables = `--meter-share: ${hasValue ? toShare(value) : 0}%; --meter-color: ${bandColor};` + (style === "gradient" ? ` --meter-scale: linear-gradient(90deg, ${scale});` : "");
    const hasLow = config.low !== void 0 && config.low !== null;
    const empty = hasLow && hasValue && value <= minValue;
    const low = hasLow && hasValue && !empty && value < Number(config.low);
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const valueText = hasValue ? formatNumber(this.hass, value, config.decimals ?? 1) : "\u2013";
    return { style, stateObj, hasValue, unit, name, variables, hasLow, empty, low, interactive, valueText };
  }
  // status of a consumable ("OK", "bald leer", "leer"); empty without "low"
  statusText(model) {
    if (!model.hasLow || !model.hasValue) return "";
    return this.localize(model.empty ? "level.empty" : model.low ? "level.low" : "level.ok");
  }
  render() {
    return layoutOf(this.config, "tile") === "row" ? this.renderRow() : this.renderTile();
  }
  renderTile() {
    const config = this.config;
    const model = this.model();
    const classes = [
      "tile",
      model.style,
      model.hasValue ? "" : "novalue",
      model.empty ? "empty" : "",
      model.low ? "low" : "",
      model.interactive ? "interactive" : ""
    ].filter(Boolean).join(" ");
    const status = model.empty || model.low ? this.statusText(model) : "";
    const secondary = status || this.secondaryText();
    return b2`<div class=${classes} style=${model.variables} role=${model.interactive ? "button" : A}
      tabindex=${model.interactive ? "0" : A} aria-label=${model.name}>${model.interactive ? b2`<ha-ripple></ha-ripple>` : A}${this.renderIcon(model.stateObj)}<div class="name">${model.name}</div><div
      class="value-row"><div class="value">${model.valueText}${model.hasValue && model.unit ? b2`<span class="unit">${model.unit}</span>` : A}</div>${secondary ? b2`<div class=${status ? "secondary status" : "secondary"}>${!status && config.secondary_icon ? b2`<ha-icon .icon=${config.secondary_icon}></ha-icon>` : A}${secondary}</div>` : A}</div><div class="bar"><div class="fill"></div>${model.style === "gradient" ? b2`<div class="needle"></div>` : A}</div></div>`;
  }
  // row: name and status line on the left, the value on the right, the bar along the bottom
  renderRow() {
    const model = this.model();
    const offline = isUnavailable(model.stateObj);
    let status = this.statusText(model) || this.secondaryText();
    if (offline && model.stateObj) {
      status = this.localize("rows.since", {
        state: this.localize("rows.unavailable"),
        since: sinceText(new Date(model.stateObj.last_changed), this.language)
      });
    }
    const classes = [
      "row",
      model.style,
      model.hasValue ? "" : "novalue",
      offline ? "unavailable" : "",
      model.empty ? "empty" : "",
      model.low ? "low" : "",
      model.interactive ? "interactive" : ""
    ].filter(Boolean).join(" ");
    return b2`<div class=${classes} style=${model.variables} role=${model.interactive ? "button" : A}
      tabindex=${model.interactive ? "0" : A} aria-label=${model.name}>${model.interactive ? b2`<ha-ripple></ha-ripple>` : A}<div class="name">${model.name}</div>${status ? b2`<div class="status">${status}</div>` : A}<div class="value">${offline ? this.localize("rows.offline") : b2`${model.valueText}${model.hasValue && model.unit ? b2`<span class="unit">${model.unit}</span>` : A}`}</div><div class="bar"><div class="fill"></div>${model.style === "gradient" ? b2`<div class="needle"></div>` : A}</div></div>`;
  }
  getCardSize() {
    return layoutOf(this.config, "tile") === "row" ? 1 : 2;
  }
  getGridOptions() {
    return layoutOf(this.config, "tile") === "row" ? { columns: 12, rows: "auto", min_columns: 3 } : { columns: 3, rows: 2, min_columns: 2 };
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("sensor.") && hass.states[id].attributes?.unit_of_measurement === "%") ?? "";
    return { entity, style: "level", min: 0, max: 100, decimals: 0 };
  }
  static async getConfigElement() {
    return document.createElement("graphite-meter-editor");
  }
};
GraphiteMeter.styles = [];
registerElement("graphite-meter-editor", GraphiteMeterEditor);
registerCard("graphite-meter", GraphiteMeter, {
  aliases: [{ tag: "graphite-meter-tile", defaults: { layout: "tile" } }],
  name: "Graphite Meter",
  description: "Sensor value with a color scale (gradient with needle) or a level bar, optional secondary value."
});

// src/cards/tiles/graphite-effect-editor.ts
var GraphiteEffectEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "effect.editor";
  }
  schema() {
    return [
      { name: "name", selector: { text: {} } },
      { name: "colors", required: true, selector: { text: { multiple: true } } },
      { name: "entity", selector: { entity: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } }
    ];
  }
  skipValue(key, value) {
    if (key === "colors") return !Array.isArray(value) || value.length === 0;
    return false;
  }
};

// src/cards/tiles/graphite-effect.ts
var effectStyles = i`
  /* the tile grows with a long name, at least the compact tile height */
  .tile {
    display: flex;
    align-items: flex-end;
    height: auto;
    min-height: var(--graphite-tile-height-compact, 72px);
  }
  .gradient {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 60%),
      var(--effect-gradient);
    filter: saturate(var(--graphite-effect-saturation, 0.85)) brightness(var(--graphite-effect-brightness, 0.88));
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    pointer-events: none;
  }
  /* name bottom left on the gradient, wraps instead of being cut off */
  .name {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    margin: var(--graphite-padding-tile, 12px) 14px 9px var(--graphite-padding-tile, 12px);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.1;
    color: #fff;
    white-space: normal;
    overflow-wrap: break-word;
    hyphens: auto;
  }
  .dots {
    position: absolute;
    top: 9px;
    right: 9px;
    display: flex;
    pointer-events: none;
  }
  .dots span {
    width: 13px;
    height: 13px;
    margin-left: -2px;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  }
`;
var GraphiteEffect = class extends GraphiteCard {
  normalizeConfig(config) {
    if (!Array.isArray(config.colors) || config.colors.length === 0) {
      throw new Error(`${this.localName}: 'colors' (list of colors) is required`);
    }
    return { tap_action: { action: "none" }, hold_action: defaultHoldAction(config.entity), ...config };
  }
  connectedCallback() {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action)
    }, (action) => this.handleAction(action));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = void 0;
  }
  handleAction(action) {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`])) return;
    fireAction(this, config, action);
  }
  render() {
    const config = this.config;
    const colors = config.colors.map((color) => String(color).trim()).filter(Boolean);
    const name = config.name ?? "";
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    return b2`<div class=${interactive ? "tile interactive" : "tile"} style=${`--effect-gradient: linear-gradient(90deg, ${colors.join(", ")})`} role=${interactive ? "button" : A} tabindex=${interactive ? "0" : A}
      aria-label=${name}><div class="gradient"></div>${interactive ? b2`<ha-ripple></ha-ripple>` : A}<div
      class="dots">${colors.map((color) => b2`<span style=${`background: ${color}`}></span>`)}</div><div
      class="name">${name}</div></div>`;
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 3, rows: "auto", min_columns: 2 };
  }
  static getStubConfig() {
    return { name: "Sunset", colors: ["#ffb25c", "#ff7a3d", "#c2408f"] };
  }
  static async getConfigElement() {
    return document.createElement("graphite-effect-editor");
  }
};
GraphiteEffect.styles = [tileStyles, effectStyles];
registerElement("graphite-effect-editor", GraphiteEffectEditor);
registerCard("graphite-effect", GraphiteEffect, {
  aliases: ["graphite-effect-tile"],
  name: "Graphite Effect",
  description: "Light effect or scene as a tile with its color gradient and color dots."
});

// src/cards/tiles/graphite-image-editor.ts
var GraphiteImageEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "image.editor";
  }
  schema() {
    return [
      { name: "entity", selector: { entity: {} } },
      { name: "name", selector: { text: {} } },
      { name: "image", selector: { text: {} } },
      { name: "busy", selector: { boolean: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } }
    ];
  }
  skipValue(key, value) {
    if (key === "busy") return value !== true;
    return false;
  }
};

// src/cards/tiles/graphite-image.ts
var imageCache = {};
var imageCacheTime = 2e4;
var imageStyles = i`
  .tile {
    height: var(--graphite-tile-height-compact, 72px);
    isolation: isolate;
  }
  .tile.busy {
    background: color-mix(in srgb, var(--graphite-accent) 12%, var(--graphite-surface-tile-active));
  }
  /* blurred, dimmed backdrop (slightly larger than the tile, so the blur has no soft edges) */
  .backdrop {
    position: absolute;
    inset: -16px;
    z-index: 0;
    background: var(--image) center / cover no-repeat;
    filter: blur(var(--graphite-image-blur, 8px)) saturate(1.3) brightness(var(--graphite-image-brightness, 0.6));
    transform: scale(1.1);
    pointer-events: none;
  }
  .thumbnail {
    position: absolute;
    left: 10px;
    bottom: 10px;
    z-index: 0;
    width: calc(var(--graphite-tile-height-compact, 72px) - 20px);
    height: calc(var(--graphite-tile-height-compact, 72px) - 20px);
    border-radius: 8px;
    background: var(--image) center / cover no-repeat;
    pointer-events: none;
  }
  /* label without an image: bottom left, wraps */
  .name {
    left: 10px;
    right: 10px;
    bottom: 8px;
    z-index: 2;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 1.15;
    white-space: normal;
  }
  .tile.busy .name {
    font-weight: 500;
  }
  /* with an image the name is only read by screen readers */
  .tile.has-image .name {
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  /* short press feedback: the tile starts something */
  .tile.interactive:active::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    background: color-mix(in srgb, var(--graphite-ink) 6%, transparent);
    pointer-events: none;
  }
  .tile.interactive.has-image:active::after {
    background: rgba(0, 0, 0, 0.25);
  }
  ha-ripple {
    z-index: 1;
  }
  .spinner {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 3;
    width: 14px;
    height: 14px;
    box-sizing: border-box;
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, var(--graphite-accent) 28%, transparent);
    border-top-color: var(--graphite-accent);
    pointer-events: none;
    animation: graphite-spin 0.9s linear infinite;
  }
  @keyframes graphite-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 3s;
    }
  }
`;
var GraphiteImage = class extends GraphiteCard {
  normalizeConfig(config) {
    return { tap_action: { action: "none" }, hold_action: defaultHoldAction(config.entity), ...config };
  }
  connectedCallback() {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action)
    }, (action) => this.handleAction(action));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = void 0;
  }
  handleAction(action) {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`])) return;
    fireAction(this, config, action);
  }
  // /local/... and http(s) images are used as they are, media-source://... is resolved once per source
  willUpdate(changed) {
    super.willUpdate(changed);
    const source = this.config?.image?.trim() ?? "";
    if (source === this.resolvedSource || !this.hass) return;
    this.resolvedSource = source;
    if (!source.startsWith("media-source://")) {
      this.imageUrl = source || void 0;
      return;
    }
    this.imageUrl = void 0;
    this.resolveMediaSource(source).then((url) => {
      if (this.resolvedSource === source) this.imageUrl = url;
    });
  }
  resolveMediaSource(source) {
    const cached = imageCache[source];
    if (cached?.url && Date.now() - cached.resolvedAt < imageCacheTime) return Promise.resolve(cached.url);
    if (cached?.pending) return cached.pending;
    const hass = this.hass;
    if (!hass?.callWS) return Promise.resolve(void 0);
    const pending = hass.callWS({ type: "media_source/resolve_media", media_content_id: source }).then((result) => {
      const url = hass.hassUrl ? hass.hassUrl(result.url) : result.url;
      imageCache[source] = { url, resolvedAt: Date.now() };
      return url;
    }).catch(() => {
      imageCache[source] = { resolvedAt: 0 };
      return void 0;
    });
    imageCache[source] = { resolvedAt: 0, pending };
    return pending;
  }
  render() {
    const config = this.config;
    const stateObj = config.entity ? this.hass?.states[config.entity] : void 0;
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity ?? "";
    const busy = !!config.busy && stateObj?.state === "on";
    const hasImage = !!this.imageUrl;
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", hasImage ? "has-image" : "", busy ? "busy" : "", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    return b2`<div class=${classes} style=${hasImage ? `--image: url("${this.imageUrl}")` : A}
      role=${interactive ? "button" : A} tabindex=${interactive ? "0" : A} aria-label=${name}>${hasImage ? b2`<div class="backdrop"></div><div class="thumbnail"></div>` : A}${interactive ? b2`<ha-ripple></ha-ripple>` : A}<div class="name">${name}</div>${busy ? b2`<div class="spinner"></div>` : A}</div>`;
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 3, rows: 2, min_columns: 2 };
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("script.")) ?? "";
    return { entity, busy: true, tap_action: { action: "toggle" } };
  }
  static async getConfigElement() {
    return document.createElement("graphite-image-editor");
  }
};
GraphiteImage.styles = [tileStyles, imageStyles];
GraphiteImage.properties = {
  ...GraphiteCard.properties,
  imageUrl: { state: true }
};
registerElement("graphite-image-editor", GraphiteImageEditor);
registerCard("graphite-image", GraphiteImage, {
  aliases: ["graphite-image-tile"],
  name: "Graphite Image",
  description: "Action tile with a picture (blurred backdrop and thumbnail) or a label; optional busy spinner."
});

// src/cards/tiles/graphite-stopwatch-editor.ts
var GraphiteStopwatchEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "stopwatch.editor";
  }
  schema() {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "sensor" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "icon_position", selector: { select: { mode: "dropdown", options: ["watermark", "left"] } } },
          { name: "color", selector: { text: {} } }
        ]
      },
      { name: "picture_entity", selector: { entity: {} } },
      { name: "limit", selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "warn_before", selector: { number: { mode: "box", min: 0 } } },
          { name: "day_start", selector: { text: {} } }
        ]
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } }
    ];
  }
  skipValue(key, value) {
    if (key === "limit") return value === null || typeof value === "object" && Object.keys(value).length === 0;
    if (key === "icon_position") return value === "watermark";
    return false;
  }
};

// src/cards/tiles/label-styles.ts
var labelStyles = i`
  .tile.label {
    height: var(--graphite-tile-height, 80px);
  }
  .tile.label.no-stripe {
    height: var(--graphite-tile-height-compact, 72px);
  }
  .stripe {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    top: 10px;
    width: 28px;
    height: 4px;
    border-radius: 2px;
    background: var(--label-color, var(--graphite-accent));
  }
  .tile.label .name {
    top: 20px;
  }
  .tile.label.no-stripe .name {
    top: 10px;
  }
  .tile.label .value-row {
    bottom: 9px;
  }
  /* words as value (e.g. "keine Artikel", "morgen") read larger than numbers: 20px */
  .value.text {
    font-size: var(--graphite-font-value-text-size, 20px);
  }
`;

// src/cards/tiles/graphite-stopwatch.ts
var weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
var tickInterval = 15e3;
var stopwatchStyles = i`
  /* running: accent tint, name in primary, secondary text in accent */
  .tile.running {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  .tile.running.over {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-alert, 28%), var(--graphite-surface-tile-active));
  }
  .tile.running .name {
    color: var(--graphite-text-primary);
  }
  .tile.running .secondary {
    color: var(--graphite-accent);
  }
  /* the muted unit is too weak on tinted tiles */
  .tile.running .unit {
    color: var(--graphite-text-secondary);
  }
  .tile.running .meter-icon {
    opacity: 0.3;
  }
  .tile.warn .secondary,
  .tile.over .secondary {
    color: var(--graphite-accent);
    font-weight: 500;
  }
  .tile.over .value {
    color: var(--graphite-accent);
  }
  /* round picture left of the text, 12px from the edge and 12px to the text at 60px (like the rows);
     the watermark icon stays top right */
  .picture {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    top: 50%;
    width: 36px;
    height: 36px;
    transform: translateY(-50%);
    border-radius: 50%;
    background: var(--graphite-surface-track) center / cover no-repeat;
    pointer-events: none;
  }
  /* icon left: the same 42px box as the row icons, at 9px */
  .left-icon {
    position: absolute;
    left: 9px;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    transform: translateY(-50%);
    color: var(--graphite-text-secondary);
    pointer-events: none;
    --mdc-icon-size: var(--graphite-row-icon-size, 24px);
  }
  .tile.running .left-icon {
    color: var(--graphite-accent);
  }
  .tile.inset .name,
  .tile.inset .value-row {
    left: 60px;
  }
`;
var GraphiteStopwatch = class extends GraphiteCard {
  normalizeConfig(config) {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { tap_action: { action: "none" }, hold_action: defaultHoldAction(config.entity), ...config };
  }
  watchedEntities() {
    const config = this.config;
    const limitEntities = typeof config.limit === "object" && config.limit !== null ? Object.values(config.limit).filter((value) => typeof value === "string") : typeof config.limit === "string" ? [config.limit] : [];
    return [config.entity, config.picture_entity, ...limitEntities].filter((id) => !!id);
  }
  connectedCallback() {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action)
    }, (action) => this.handleAction(action));
    this.tickTimer = window.setInterval(() => {
      if (this.stateObj?.attributes?.status === "running") this.requestUpdate();
    }, tickInterval);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = void 0;
    window.clearInterval(this.tickTimer);
  }
  get stateObj() {
    return this.hass?.states[this.config.entity];
  }
  handleAction(action) {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`])) return;
    fireAction(this, config, action);
  }
  // the "day" starts at day_start (default 03:00, like the nightly reset), so a late
  // Saturday evening still counts as Saturday
  limitMinutes() {
    const config = this.config;
    let limit;
    if (config.limit !== null && typeof config.limit === "object") {
      const [hours, minutes] = String(config.day_start ?? "03:00").split(":").map(Number);
      const dayStartMs = ((hours || 0) * 60 + (minutes || 0)) * 6e4;
      const dayIndex = new Date(Date.now() - dayStartMs).getDay();
      const isWeekend = dayIndex === 0 || dayIndex === 6;
      limit = config.limit[weekdayKeys[dayIndex]] ?? (isWeekend ? config.limit.weekend : config.limit.weekday);
    } else {
      limit = config.limit;
    }
    const value = this.limitValue(limit);
    return value !== null && value > 0 ? value : null;
  }
  // minutes of a limit: a number, or the state of an entity (unit "h" is converted, otherwise minutes)
  limitValue(limit) {
    if (typeof limit === "number") return limit;
    if (typeof limit !== "string" || !limit) return null;
    const stateObj = this.hass?.states[limit];
    const value = parseFloat(stateObj?.state ?? "");
    if (!Number.isFinite(value)) return null;
    const unit = String(stateObj?.attributes?.unit_of_measurement ?? "").trim().toLowerCase();
    return ["h", "hour", "hours", "std", "std."].includes(unit) ? value * 60 : value;
  }
  durationText(minutes) {
    return minutes >= 60 ? this.localize("stopwatch.hours", { hours: Math.floor(minutes / 60), minutes: String(minutes % 60).padStart(2, "0") }) : this.localize("stopwatch.minutes", { minutes });
  }
  renderIcon(stateObj, left) {
    const icon = this.config.icon ? b2`<ha-icon .icon=${this.config.icon}></ha-icon>` : b2`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return b2`<div class=${left ? "left-icon" : "meter-icon"}>${icon}</div>`;
  }
  render() {
    const config = this.config;
    const stateObj = this.stateObj;
    const attributes = stateObj?.attributes ?? {};
    const isRunning = attributes.status === "running";
    const isPaused = attributes.status === "paused";
    let elapsedSeconds = parseFloat(stateObj?.state ?? "") || 0;
    if (isRunning && attributes.running_since) {
      elapsedSeconds = (Number(attributes.accumulated_seconds) || 0) + Math.max(0, (Date.now() - new Date(attributes.running_since).getTime()) / 1e3);
    }
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedText = `${Math.floor(elapsedMinutes / 60)}:${String(elapsedMinutes % 60).padStart(2, "0")}`;
    const limit = this.limitMinutes();
    const isOver = limit !== null && elapsedMinutes >= limit;
    const isWarn = limit !== null && !isOver && isRunning && elapsedMinutes >= limit - (config.warn_before ?? 10);
    let secondary = isRunning ? this.localize("stopwatch.running") : isPaused ? this.localize("stopwatch.paused") : "";
    if (limit !== null) {
      const difference = this.durationText(Math.abs(limit - elapsedMinutes));
      secondary = isOver ? `+${difference}` : this.localize("stopwatch.remaining", { time: difference });
    }
    const pictureUrl = config.picture_entity ? this.hass?.states[config.picture_entity]?.attributes?.entity_picture : void 0;
    const iconLeft = !pictureUrl && config.icon_position === "left";
    const name = config.name ?? attributes.friendly_name ?? config.entity;
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = [
      "tile",
      "label",
      config.color ? "" : "no-stripe",
      isRunning ? "running" : "",
      isWarn ? "warn" : "",
      isOver ? "over" : "",
      pictureUrl || iconLeft ? "inset" : "",
      interactive ? "interactive" : ""
    ].filter(Boolean).join(" ");
    return b2`<div class=${classes} style=${config.color ? `--label-color: ${config.color}` : A}
      role=${interactive ? "button" : A} tabindex=${interactive ? "0" : A} aria-label=${name}>${interactive ? b2`<ha-ripple></ha-ripple>` : A}${pictureUrl ? b2`<div class="picture" style=${`background-image: url("${pictureUrl}")`}></div>` : A}${this.renderIcon(stateObj, iconLeft)}${config.color ? b2`<div class="stripe"></div>` : A}<div
      class="name">${name}</div><div class="value-row"><div class="value">${elapsedText}<span class="unit">h</span></div>${secondary ? b2`<div class="secondary">${secondary}</div>` : A}</div></div>`;
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 3 };
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("sensor.") && hass.states[id].attributes?.status !== void 0 && hass.states[id].attributes?.accumulated_seconds !== void 0) ?? "";
    return { entity };
  }
  static async getConfigElement() {
    return document.createElement("graphite-stopwatch-editor");
  }
};
GraphiteStopwatch.styles = [tileStyles, meterStyles, labelStyles, stopwatchStyles];
registerElement("graphite-stopwatch-editor", GraphiteStopwatchEditor);
registerCard("graphite-stopwatch", GraphiteStopwatch, {
  aliases: ["graphite-stopwatch-tile"],
  name: "Graphite Stopwatch",
  description: "Elapsed time of a Stopwatch Plus sensor, optional daily limit, picture or icon on the left."
});

// src/cards/tiles/graphite-todo-editor.ts
var GraphiteTodoEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "todo.editor";
  }
  schema() {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "todo" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "unit", selector: { text: {} } },
          { name: "unit_one", selector: { text: {} } },
          { name: "empty_text", selector: { text: {} } },
          { name: "color", selector: { text: {} } }
        ]
      },
      { name: "preview", selector: { boolean: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } }
    ];
  }
  skipValue(key, value) {
    if (key === "preview") return value !== true;
    return false;
  }
};

// src/cards/tiles/graphite-todo.ts
var previewCache = {};
var todoStyles = i`
  .tile.open .name {
    color: var(--graphite-text-primary);
  }
  .secondary {
    max-width: 62%;
  }
`;
var GraphiteTodo = class extends GraphiteCard {
  normalizeConfig(config) {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { tap_action: { action: "more-info" }, hold_action: defaultHoldAction(config.entity), ...config };
  }
  connectedCallback() {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action)
    }, (action) => this.handleAction(action));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = void 0;
  }
  get stateObj() {
    return this.hass?.states[this.config.entity];
  }
  handleAction(action) {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`])) return;
    fireAction(this, config, action);
  }
  // preview: names of the open items, loaded when the list changes
  willUpdate(changed) {
    super.willUpdate(changed);
    const config = this.config;
    const stateObj = this.stateObj;
    if (!config?.preview || !stateObj) return;
    const key = `${config.entity}|${stateObj.last_updated}`;
    if (key === this.previewKey) return;
    this.previewKey = key;
    this.loadPreview(config.entity, key).then((text) => {
      if (this.previewKey === key) this.previewText = text;
    });
  }
  loadPreview(entityId, key) {
    const cached = previewCache[entityId];
    if (cached?.key === key) return cached.pending ?? Promise.resolve(cached.text);
    const hass = this.hass;
    if (!hass?.callWS) return Promise.resolve("");
    const pending = hass.callWS({ type: "todo/item/list", entity_id: entityId }).then((result) => {
      const text = (result?.items ?? []).filter((item) => item.status === "needs_action").map((item) => item.summary).join(", ");
      previewCache[entityId] = { key, text };
      return text;
    }).catch(() => {
      previewCache[entityId] = { key, text: "" };
      return "";
    });
    previewCache[entityId] = { key, text: cached?.text ?? "", pending };
    return pending;
  }
  renderIcon(stateObj) {
    const icon = this.config.icon ? b2`<ha-icon .icon=${this.config.icon}></ha-icon>` : b2`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return b2`<div class="meter-icon">${icon}</div>`;
  }
  render() {
    const config = this.config;
    const stateObj = this.stateObj;
    const openCount = parseInt(stateObj?.state ?? "", 10);
    const hasOpen = Number.isFinite(openCount) && openCount > 0;
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const value = hasOpen ? String(openCount) : config.empty_text ?? this.localize("todo.empty");
    const unit = hasOpen ? openCount === 1 ? config.unit_one ?? config.unit ?? this.localize("todo.unitOne") : config.unit ?? this.localize("todo.unit") : "";
    const secondary = hasOpen && config.preview ? this.previewText ?? "" : "";
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", "label", config.color ? "" : "no-stripe", hasOpen ? "open" : "", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    return b2`<div class=${classes} style=${config.color ? `--label-color: ${config.color}` : A}
      role=${interactive ? "button" : A} tabindex=${interactive ? "0" : A} aria-label=${name}>${interactive ? b2`<ha-ripple></ha-ripple>` : A}${this.renderIcon(stateObj)}${config.color ? b2`<div class="stripe"></div>` : A}<div
      class="name">${name}</div><div class="value-row"><div class=${hasOpen ? "value" : "value text"}>${value}${unit ? b2`<span class="unit">${unit}</span>` : A}</div>${secondary ? b2`<div class="secondary">${secondary}</div>` : A}</div></div>`;
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 3 };
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("todo.")) ?? "";
    return { entity };
  }
  static async getConfigElement() {
    return document.createElement("graphite-todo-editor");
  }
};
GraphiteTodo.styles = [tileStyles, meterStyles, labelStyles, todoStyles];
GraphiteTodo.properties = {
  ...GraphiteCard.properties,
  previewText: { state: true }
};
registerElement("graphite-todo-editor", GraphiteTodoEditor);
registerCard("graphite-todo", GraphiteTodo, {
  aliases: ["graphite-todo-tile"],
  name: "Graphite Todo",
  description: "Open items of a todo list (e.g. shopping), optionally with the first item names."
});

// src/cards/tiles/graphite-ink-editor.ts
var GraphiteInkEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "ink.editor";
  }
  schema() {
    return [
      { name: "entity", selector: { entity: {} } },
      { name: "name", selector: { text: {} } },
      { name: "cartridges", required: true, selector: { entity: { multiple: true, domain: "sensor" } } },
      { name: "low_level", selector: { number: { mode: "box", min: 1, max: 50 } } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } }
    ];
  }
  skipValue(key, value) {
    if (key === "cartridges") return !Array.isArray(value) || value.length === 0;
    return false;
  }
};

// src/cards/tiles/graphite-ink.ts
var printerStates = ["idle", "printing", "processing", "stopped"];
var inkStyles = i`
  .tile.label .name {
    top: 10px;
    right: 84px;
  }
  .tile.label .value-row {
    right: 84px;
  }
  .tanks {
    position: absolute;
    right: var(--graphite-padding-tile, 12px);
    top: 12px;
    bottom: 12px;
    display: flex;
    gap: 4px;
  }
  .tanks span {
    position: relative;
    width: 8px;
    border-radius: 3px;
    overflow: hidden;
    background: color-mix(in srgb, var(--ink-color) 28%, var(--graphite-card-surface, var(--graphite-surface-tile)));
  }
  .tanks span::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: var(--ink-level, 0%);
    background: var(--ink-color);
  }
  /* soon empty (no empty cartridge): calm hint in the accent color, no tint */
  .tile.low .unit {
    color: var(--graphite-accent);
  }
  /* empty cartridge: accent tint, name primary, unit in accent */
  .tile.alert {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  .tile.alert .name {
    color: var(--graphite-text-primary);
  }
  .tile.alert .unit {
    color: var(--graphite-accent);
  }
  /* offline ("offline" itself is the badge class of the tile styles): dimmed like every other offline
     tile, the surface at 40% fades into the panel (no outline), the content is faded */
  .tile.printer-offline {
    background: color-mix(in srgb, var(--graphite-surface-tile) 40%, transparent);
  }
  .tile.printer-offline :is(.name, .value-row, .tanks) {
    opacity: 0.4;
  }
`;
var GraphiteInk = class extends GraphiteCard {
  normalizeConfig(config) {
    if (!Array.isArray(config.cartridges) || config.cartridges.length === 0) {
      throw new Error(`${this.localName}: 'cartridges' (list of level sensors) is required`);
    }
    return { tap_action: { action: "none" }, hold_action: defaultHoldAction(config.entity), ...config };
  }
  cartridges() {
    return this.config.cartridges.map((cartridge) => typeof cartridge === "string" ? { entity: cartridge } : cartridge);
  }
  watchedEntities() {
    const ids = this.cartridges().map((cartridge) => cartridge.entity);
    return this.config.entity ? [this.config.entity, ...ids] : ids;
  }
  connectedCallback() {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action)
    }, (action) => this.handleAction(action));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = void 0;
  }
  handleAction(action) {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`])) return;
    fireAction(this, config, action);
  }
  // cartridge color guessed from the entity id; black would vanish on the dark tile,
  // so it is shown light, like on printer displays in dark mode
  guessColor(entityId) {
    const id = entityId.toLowerCase();
    if (id.includes("cyan")) return "#2fb4e6";
    if (id.includes("magenta")) return "#e0479e";
    if (id.includes("yellow")) return "#f0c94a";
    if (id.includes("gray") || id.includes("grey")) return "#8e9399";
    return "#e4e4e6";
  }
  render() {
    const config = this.config;
    const lowLevel = Number(config.low_level ?? 20);
    let emptyCount = 0;
    let lowCount = 0;
    let knownCount = 0;
    const tanks = this.cartridges().map((cartridge) => {
      const stateObj = this.hass?.states[cartridge.entity];
      const level = parseFloat(stateObj?.state ?? "");
      const known = Number.isFinite(level);
      if (known) knownCount += 1;
      if (known && level <= 0) emptyCount += 1;
      else if (known && level < lowLevel) lowCount += 1;
      const style = `--ink-color: ${cartridge.color ?? this.guessColor(cartridge.entity)}; --ink-level: ${known ? Math.max(0, Math.min(100, level)) : 0}%`;
      const title = `${stateObj?.attributes?.friendly_name ?? cartridge.entity}: ${known ? `${level} %` : "\u2013"}`;
      return b2`<span style=${style} title=${title}></span>`;
    });
    const printer = config.entity ? this.hass?.states[config.entity] : void 0;
    const offline = knownCount === 0 || !!config.entity && isUnavailable(printer);
    let value;
    let unit = "";
    if (offline) {
      value = this.localize("rows.offline");
    } else if (emptyCount > 0) {
      value = String(emptyCount);
      unit = this.localize("ink.empty");
    } else if (lowCount > 0) {
      value = String(lowCount);
      unit = this.localize("ink.low");
    } else if (printer) {
      value = printerStates.includes(printer.state) ? this.localize(`ink.${printer.state}`) : formatState(this.hass, printer);
    } else {
      value = this.localize("ink.ok");
    }
    const isNumber = !offline && (emptyCount > 0 || lowCount > 0);
    const name = config.name ?? printer?.attributes?.friendly_name ?? this.localize("ink.printer");
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = [
      "tile",
      "label",
      "no-stripe",
      offline ? "printer-offline" : "",
      !offline && emptyCount > 0 ? "alert" : "",
      !offline && emptyCount === 0 && lowCount > 0 ? "low" : "",
      interactive ? "interactive" : ""
    ].filter(Boolean).join(" ");
    return b2`<div class=${classes} role=${interactive ? "button" : A} tabindex=${interactive ? "0" : A}
      aria-label=${name}>${interactive ? b2`<ha-ripple></ha-ripple>` : A}<div class="name">${name}</div><div
      class="value-row"><div class=${isNumber ? "value" : "value text"}>${value}${unit ? b2`<span class="unit">${unit}</span>` : A}</div></div><div class="tanks">${tanks}</div></div>`;
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 3 };
  }
  static getStubConfig(hass) {
    const cartridges = Object.keys(hass?.states ?? {}).filter((id) => id.startsWith("sensor.") && ["black", "cyan", "magenta", "yellow"].some((color) => id.includes(color))).slice(0, 4);
    return { cartridges };
  }
  static async getConfigElement() {
    return document.createElement("graphite-ink-editor");
  }
};
GraphiteInk.styles = [tileStyles, meterStyles, labelStyles, inkStyles];
registerElement("graphite-ink-editor", GraphiteInkEditor);
registerCard("graphite-ink", GraphiteInk, {
  aliases: ["graphite-ink-tile"],
  name: "Graphite Ink",
  description: "Printer with one small tank per cartridge; empty and soon empty cartridges are highlighted."
});

// src/core/pickup.ts
var cache = {};
var refreshMs = 30 * 60 * 1e3;
var dayMs = 864e5;
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function dayFromDateString(value) {
  const parts = String(value).substring(0, 10).split("-").map(Number);
  return parts.length === 3 && parts.every(Number.isFinite) ? new Date(parts[0], parts[1] - 1, parts[2]) : null;
}
function eventDay(start) {
  if (!start) return null;
  if (start.date) return dayFromDateString(start.date);
  const time = new Date(start.dateTime ?? start);
  return Number.isNaN(time.getTime()) ? null : startOfDay(time);
}
function loadDays(hass, entityId, lookaheadDays, onLoaded) {
  const today = startOfDay(/* @__PURE__ */ new Date());
  const entry = cache[entityId];
  const isFresh = entry && entry.day === today.getTime() && Date.now() - entry.fetchedAt < refreshMs;
  const api = hass;
  if (entry?.pending) {
    entry.pending.then(onLoaded);
  } else if (!isFresh && api.callApi) {
    const end = new Date(today.getTime() + lookaheadDays * dayMs);
    const pending = api.callApi("GET", `calendars/${entityId}?start=${encodeURIComponent(today.toISOString())}&end=${encodeURIComponent(end.toISOString())}`).then((events) => {
      const days = (Array.isArray(events) ? events : []).map((event) => eventDay(event.start)).filter((day) => !!day);
      cache[entityId] = { days, day: today.getTime(), fetchedAt: Date.now() };
    }).catch(() => {
      cache[entityId] = { days: entry?.days, day: today.getTime(), fetchedAt: Date.now() };
    });
    cache[entityId] = { days: entry?.days, day: entry?.day, fetchedAt: entry?.fetchedAt ?? 0, pending };
    pending.then(onLoaded);
  }
  return cache[entityId]?.days;
}
function nextPickup(hass, entityId, lookaheadDays, dropAfter, onLoaded) {
  const now = /* @__PURE__ */ new Date();
  const today = startOfDay(now);
  const [dropHours, dropMinutes] = String(dropAfter ?? "12:00").split(":").map(Number);
  const dropTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), dropHours || 0, dropMinutes || 0);
  let candidates = loadDays(hass, entityId, lookaheadDays, onLoaded);
  if (!candidates) {
    const start = hass.states[entityId]?.attributes?.start_time;
    const startDay = start ? dayFromDateString(start) : null;
    candidates = startDay ? [startDay] : [];
  }
  let next = null;
  for (const date of candidates) {
    const days = Math.round((date.getTime() - today.getTime()) / dayMs);
    if (days < 0 || days === 0 && now >= dropTime) continue;
    if (!next || days < next.days) next = { date, days };
  }
  return next;
}

// src/cards/tiles/graphite-pickup-editor.ts
var GraphitePickupEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "pickup.editor";
  }
  schema() {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "calendar" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "color", selector: { text: {} } },
          { name: "drop_after", selector: { text: {} } },
          { name: "lookahead_days", selector: { number: { mode: "box", min: 7, max: 120 } } }
        ]
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } }
    ];
  }
};

// src/cards/tiles/graphite-pickup.ts
var refreshInterval = 15 * 60 * 1e3;
var pickupStyles = i`
  .tile.due {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  .tile.due .name {
    color: var(--graphite-text-primary);
  }
  .tile.due .secondary {
    color: var(--graphite-accent);
  }
  .tile.due .meter-icon {
    opacity: 0.3;
  }
`;
var GraphitePickup = class extends GraphiteCard {
  normalizeConfig(config) {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { tap_action: { action: "more-info" }, hold_action: defaultHoldAction(config.entity), ...config };
  }
  connectedCallback() {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action)
    }, (action) => this.handleAction(action));
    this.refreshTimer = window.setInterval(() => this.requestUpdate(), refreshInterval);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = void 0;
    window.clearInterval(this.refreshTimer);
  }
  handleAction(action) {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`])) return;
    fireAction(this, config, action);
  }
  next() {
    const config = this.config;
    if (!this.hass) return null;
    const lookahead = Number(config.lookahead_days) > 0 ? Number(config.lookahead_days) : 40;
    return nextPickup(this.hass, config.entity, lookahead, config.drop_after, () => this.requestUpdate());
  }
  renderIcon(stateObj) {
    const icon = this.config.icon ? b2`<ha-icon .icon=${this.config.icon}></ha-icon>` : b2`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return b2`<div class="meter-icon">${icon}</div>`;
  }
  render() {
    const config = this.config;
    const stateObj = this.hass?.states[config.entity];
    const next = this.next();
    let value = "\u2013";
    let secondary = "";
    if (next?.days === 0) {
      value = this.localize("pickup.today");
      secondary = this.localize("pickup.todayHint");
    } else if (next?.days === 1) {
      value = this.localize("pickup.tomorrow");
      secondary = this.localize("pickup.tomorrowHint");
    } else if (next) {
      const weekday = next.date.toLocaleDateString(this.language, { weekday: "short" }).replace(".", "");
      value = this.localize("pickup.date", { weekday, day: next.date.getDate() });
      secondary = this.localize("pickup.inDays", { days: next.days });
    }
    const due = !!next && next.days <= 1;
    const name = config.name ?? stateObj?.attributes?.message ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", "label", config.color ? "" : "no-stripe", due ? "due" : "", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    return b2`<div class=${classes} style=${config.color ? `--label-color: ${config.color}` : A}
      role=${interactive ? "button" : A} tabindex=${interactive ? "0" : A} aria-label=${name}>${interactive ? b2`<ha-ripple></ha-ripple>` : A}${this.renderIcon(stateObj)}${config.color ? b2`<div class="stripe"></div>` : A}<div
      class="name">${name}</div><div class="value-row"><div class=${next ? "value text" : "value"}>${value}</div>${secondary ? b2`<div class="secondary">${secondary}</div>` : A}</div></div>`;
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 3 };
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("calendar.")) ?? "";
    return { entity, color: "#9aa3ad" };
  }
  static async getConfigElement() {
    return document.createElement("graphite-pickup-editor");
  }
};
GraphitePickup.styles = [tileStyles, meterStyles, labelStyles, pickupStyles];
registerElement("graphite-pickup-editor", GraphitePickupEditor);
registerCard("graphite-pickup", GraphitePickup, {
  aliases: ["graphite-pickup-tile"],
  name: "Graphite Pickup",
  description: "Next waste collection of a calendar entity; today and tomorrow are highlighted."
});

// src/index.ts
window.graphiteCards = { version };
console.info(
  `%c GRAPHITE-CARDS %c ${version} `,
  "background:#232327;color:#f3f3f4",
  "background:#f5c48a;color:#3a2410"
);
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
