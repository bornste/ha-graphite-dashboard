// src/core/version.ts
var version = "0.24.1";

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
      frame: "Panel-Fl\xE4che anzeigen (aus = nur Layout-Container)",
      buttons: "Kn\xF6pfe rechts im Kopf (Liste: icon, entity, name, active, tap_action)"
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
  },
  calendar: {
    today: "Heute",
    tomorrow: "Morgen",
    nextWeek: "n\xE4chste Woche",
    allDay: "ganztags",
    days: "{days} Tage",
    inOneDay: "in 1 Tag",
    inDays: "in {days} Tagen",
    past: "vorbei",
    until: "bis {date}",
    more: "+ {count} weitere bis {date}",
    empty: "Keine Eintr\xE4ge bis {date}",
    close: "Schliessen",
    editor: {
      calendars: "Kalender (Liste: entity, name, color, icon, highlight)",
      range: {
        today: "Heute",
        this_week: "Diese Woche",
        this_and_next_week: "Diese und n\xE4chste Woche",
        days: "N\xE4chste Tage"
      },
      days: "Anzahl Tage",
      max_items: "Max. Eintr\xE4ge",
      secondary: {
        calendar_location: "Kalender und Ort",
        calendar: "Kalender",
        location: "Ort",
        description: "Beschreibung",
        none: "Keine"
      },
      highlight_days: "Hervorheben bis (Tage voraus)",
      show_past_today: "Heutige vergangene Eintr\xE4ge anzeigen",
      rules: "Stichwort-Regeln (Liste: starts_with/contains, color, icon, highlight)",
      empty_text: "Text ohne Eintr\xE4ge",
      hide_empty: "Ohne Eintr\xE4ge ausblenden",
      tap_action: "Aktion beim Tippen (More-Info = Details)",
      hold_action: "Aktion beim Halten (auf den Kalender)"
    }
  },
  slider: {
    editor: {
      entity: "Entit\xE4t (number, input_number oder Licht)",
      name: "Bezeichnung (Standard: Name der Entit\xE4t bzw. was gesteuert wird)",
      min: "Minimum",
      max: "Maximum",
      step: "Schritt (Werte sind Vielfache davon)",
      value_format: "Wertanzeige",
      valueFormat: {
        percent: "Prozent des Bereichs",
        state: "Wert der Entit\xE4t"
      },
      attribute: "Steuert (nur Licht)",
      allow_off: "Ganz links schaltet das Licht aus",
      attributes: {
        brightness: "Helligkeit",
        color_temp: "Weisston",
        hue: "Farbe",
        saturation: "S\xE4ttigung"
      },
      layout: "Darstellung",
      icon: "Icon links (Zeile: Standard Icon der Entit\xE4t)",
      layouts: {
        inline: "Eingebettet (ohne Fl\xE4che, Bezeichnung \xFCber dem Regler)",
        row: "Zeile (eigene Fl\xE4che wie die Status-Zeilen)"
      },
      ticks: "Ticks unter der Linie",
      major_every: "Lange Ticks alle (Standard: runder Wert)",
      tickModes: {
        auto: "Automatisch (Schritte, sonst Viertel)",
        steps: "Jeder Schritt",
        quarters: "Viertel",
        none: "Keine"
      },
      tick_every: "Ticks alle (statt bei jedem Schritt)"
    },
    brightness: "Helligkeit",
    color_temp: "Weisston",
    hue: "Farbe",
    saturation: "S\xE4ttigung"
  },
  light: {
    editor: {
      entity: "Lampe",
      name: "Name (Standard: Name der Entit\xE4t)",
      icon: "Icon",
      sliders: "Welche Regler (leer: Helligkeit, Weisston falls m\xF6glich)",
      allow_off: "Helligkeit ganz links schaltet aus",
      wall_switch: "Wandschalter (statt Schalter)",
      since_line: "\xABseit\xBB-Zeile anzeigen",
      tap_action: "Aktion beim Tippen",
      hold_action: "Aktion beim Halten",
      double_tap_action: "Aktion beim Doppeltippen",
      attributes: {
        brightness: "Helligkeit",
        color_temp: "Weisston",
        hue: "Farbe",
        saturation: "S\xE4ttigung"
      },
      unavailable_sliders: "Regler, wenn nicht erreichbar oder am Wandschalter aus",
      unavailableSliders: {
        show: "Gesperrt anzeigen (Layout bleibt)",
        hide: "Ausblenden (nur der Kopf)"
      },
      show_sliders: "Regler anzeigen"
    }
  },
  scene: {
    editor: {
      entity: "Szene (oder andere Entit\xE4t)",
      name: "Name",
      icon: "Icon (Wasserzeichen)",
      colors: 'Farben des Verlaufs (Liste, z.B. ["#f5c48a", "#e89a5c"])',
      active: "Aktiv wenn (z.B. {entity: input_select.wohnzimmer_szenen, state: Relax})",
      tap_action: "Aktion beim Tippen (Standard: Szene aktivieren)",
      hold_action: "Aktion beim Halten",
      double_tap_action: "Aktion beim Doppeltippen"
    }
  },
  nowPlaying: {
    justStarted: "gerade gestartet",
    sinceMinutes: "seit {minutes} Min.",
    sinceHours: "seit {hours}:{minutes} h",
    paused: "pausiert",
    remaining: "noch {minutes} Min.",
    editor: {
      sources: "Quellen in Reihenfolge der Priorit\xE4t (Liste: entity, name, icon, requires, title_entity, image_entity, subtitle, fallback_title, titles, images)"
    }
  },
  vacuum: {
    room: "Raum {id}",
    roomMissing: "ID {id} gibt es auf der Karte nicht",
    roomChanged: "ID {id} ist jetzt \xAB{name}\xBB",
    roomNewId: "(neu ID {id})",
    roomIssuesTitle: "Raum-IDs passen nicht zur Karte",
    roomIssuesHint: "Diese R\xE4ume sind ausgeblendet, bis die IDs in der Karte angepasst sind.",
    minutes: "{minutes} Min.",
    hours: "{hours} Std.",
    hoursMinutes: "{hours} Std. {minutes} Min.",
    today: "heute {time}",
    yesterday: "gestern {time}",
    due: "{name} f\xE4llig",
    refillWater: "Wasser auff\xFCllen",
    dirtyWater: "Schmutzwasser",
    freshWater: "Frischwasser",
    dustBag: "Staubbeutel",
    maintenanceCount: "{count} Wartungen f\xE4llig",
    battery: "Akku {battery} %",
    intermediateWash: "Zwischenw\xE4sche",
    remaining: "noch {duration}",
    actionFailed: "Aktion fehlgeschlagen",
    resume: "Fortsetzen",
    pause: "Pausieren",
    cleaningTitle: "Reinigung",
    presetsTitle: "Kurzwahl",
    mode: "Modus",
    suction: "Saugkraft",
    boostActive: "{name} aktiv \u2013 maximale Saugkraft f\xFCr diese Reinigung",
    boostHint: "{name}: maximale Saugkraft nur f\xFCr diese Reinigung",
    rooms: "R\xE4ume",
    selectNone: "keine",
    selectAll: "alle w\xE4hlen",
    cleanOneRoom: "1 Raum reinigen",
    cleanRooms: "{count} R\xE4ume reinigen",
    chooseRooms: "R\xE4ume w\xE4hlen",
    toStation: "Zur Station",
    stationOk: "Station ok",
    lastCleaning: "zuletzt {time}",
    stationTitle: "Station & Wartung",
    confirmReset: "sicher?",
    reset: "zur\xFCcksetzen",
    states: {
      offline: "offline",
      error: "Fehler",
      returningToWash: "F\xE4hrt zum Waschen",
      washingPaused: "Mopp-W\xE4sche pausiert",
      washing: "W\xE4scht Mopp",
      returning: "F\xE4hrt zur Station",
      paused: "Pausiert",
      cleaning: "Reinigt",
      drying: "Trocknet Mopp",
      charging: "L\xE4dt",
      ready: "Bereit"
    },
    modes: {
      sweeping: "Saugen",
      mopping: "Wischen",
      sweeping_and_mopping: "Saugen + Wischen",
      mopping_after_sweeping: "Saugen, dann Wischen"
    },
    suctionLevels: {
      quiet: "Leise",
      standard: "Standard",
      strong: "Stark",
      turbo: "Turbo"
    },
    maintenance: {
      main_brush: "Hauptb\xFCrste",
      side_brush: "Seitenb\xFCrste",
      filter: "Filter",
      sensor_dirty: "Sensoren"
    },
    maintenanceDue: {
      main_brush: "Hauptb\xFCrste ersetzen",
      side_brush: "Seitenb\xFCrste ersetzen",
      filter: "Filter ersetzen",
      sensor_dirty: "Sensoren reinigen"
    },
    actions: {
      self_clean: "Mopp waschen",
      manual_drying: "Trocknen",
      base_station_cleaning: "Station reinigen",
      start_auto_empty: "Absaugen"
    },
    station: {
      ok: "ok",
      missing: "fehlt",
      full: "voll",
      low: "niedrig",
      check: "pr\xFCfen",
      empty: "leer"
    },
    editor: {
      entity: "Saugroboter",
      layout: "Layout",
      layouts: {
        tile: "Kachel",
        panel: "Panel"
      },
      name: "Name",
      prefix: "Entit\xE4ts-Pr\xE4fix (optional)",
      navigation_path: "Ziel beim Antippen",
      rooms: "R\xE4ume (YAML)",
      presets: "Kurzwahl (YAML)",
      maintenance_threshold: "Wartung f\xE4llig ab",
      boost: "Max+ anzeigen"
    }
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
      frame: "Show panel surface (off = layout container only)",
      buttons: "Buttons on the right of the header (list: icon, entity, name, active, tap_action)"
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
  },
  calendar: {
    today: "Today",
    tomorrow: "Tomorrow",
    nextWeek: "next week",
    allDay: "all day",
    days: "{days} days",
    inOneDay: "in 1 day",
    inDays: "in {days} days",
    past: "over",
    until: "until {date}",
    more: "+ {count} more until {date}",
    empty: "No events until {date}",
    close: "Close",
    editor: {
      calendars: "Calendars (list: entity, name, color, icon, highlight)",
      range: {
        today: "Today",
        this_week: "This week",
        this_and_next_week: "This and next week",
        days: "Next days"
      },
      days: "Number of days",
      max_items: "Max. events",
      secondary: {
        calendar_location: "Calendar and location",
        calendar: "Calendar",
        location: "Location",
        description: "Description",
        none: "None"
      },
      highlight_days: "Highlight up to (days ahead)",
      show_past_today: "Show today's past events",
      rules: "Keyword rules (list: starts_with/contains, color, icon, highlight)",
      empty_text: "Text without events",
      hide_empty: "Hide without events",
      tap_action: "Tap action (more-info = details)",
      hold_action: "Hold action (on the calendar)"
    }
  },
  slider: {
    editor: {
      entity: "Entity (number, input_number or light)",
      name: "Label (default: entity name or what is controlled)",
      min: "Minimum",
      max: "Maximum",
      step: "Step (values are multiples of it)",
      value_format: "Value display",
      valueFormat: {
        percent: "Percent of the range",
        state: "Entity value"
      },
      attribute: "Controls (lights only)",
      allow_off: "Leftmost turns the light off",
      attributes: {
        brightness: "Brightness",
        color_temp: "White temperature",
        hue: "Color",
        saturation: "Saturation"
      },
      layout: "Layout",
      icon: "Icon on the left (row: default entity icon)",
      layouts: {
        inline: "Inline (no surface, label above the slider)",
        row: "Row (own surface like the status rows)"
      },
      ticks: "Ticks below the track",
      major_every: "Long ticks every (default: round value)",
      tickModes: {
        auto: "Automatic (steps, else quarters)",
        steps: "Every step",
        quarters: "Quarters",
        none: "None"
      },
      tick_every: "Ticks every (instead of each step)"
    },
    brightness: "Brightness",
    color_temp: "White",
    hue: "Color",
    saturation: "Saturation"
  },
  light: {
    editor: {
      entity: "Lamp",
      name: "Name (default: entity name)",
      icon: "Icon",
      sliders: "Which sliders (empty: brightness, white temperature if supported)",
      allow_off: "Brightness leftmost turns off",
      wall_switch: "Wall switch (instead of the toggle)",
      since_line: "Show the \xABsince\xBB line",
      tap_action: "Tap action",
      hold_action: "Hold action",
      double_tap_action: "Double tap action",
      attributes: {
        brightness: "Brightness",
        color_temp: "White temperature",
        hue: "Color",
        saturation: "Saturation"
      },
      unavailable_sliders: "Sliders while unreachable or off at the wall",
      unavailableSliders: {
        show: "Show locked (layout stays)",
        hide: "Hide (head only)"
      },
      show_sliders: "Show sliders"
    }
  },
  scene: {
    editor: {
      entity: "Scene (or another entity)",
      name: "Name",
      icon: "Icon (watermark)",
      colors: 'Gradient colors (list, e.g. ["#f5c48a", "#e89a5c"])',
      active: "Active when (e.g. {entity: input_select.living_room_scenes, state: Relax})",
      tap_action: "Tap action (default: activate the scene)",
      hold_action: "Hold action",
      double_tap_action: "Double tap action"
    }
  },
  nowPlaying: {
    justStarted: "just started",
    sinceMinutes: "for {minutes} min",
    sinceHours: "for {hours}:{minutes} h",
    paused: "paused",
    remaining: "{minutes} min left",
    editor: {
      sources: "Sources in order of priority (list: entity, name, icon, requires, title_entity, image_entity, subtitle, fallback_title, titles, images)"
    }
  },
  vacuum: {
    room: "Room {id}",
    roomMissing: "ID {id} does not exist on the map",
    roomChanged: "ID {id} is now \xAB{name}\xBB",
    roomNewId: "(new ID {id})",
    roomIssuesTitle: "Room IDs do not match the map",
    roomIssuesHint: "These rooms stay hidden until the IDs in the card are updated.",
    minutes: "{minutes} min",
    hours: "{hours} h",
    hoursMinutes: "{hours} h {minutes} min",
    today: "today {time}",
    yesterday: "yesterday {time}",
    due: "{name} due",
    refillWater: "Refill water",
    dirtyWater: "Dirty water",
    freshWater: "Clean water",
    dustBag: "Dust bag",
    maintenanceCount: "{count} maintenance items due",
    battery: "Battery {battery} %",
    intermediateWash: "Intermediate wash",
    remaining: "{duration} left",
    actionFailed: "Action failed",
    resume: "Resume",
    pause: "Pause",
    cleaningTitle: "Cleaning",
    presetsTitle: "Quick picks",
    mode: "Mode",
    suction: "Suction",
    boostActive: "{name} on \u2013 maximum suction for this cleaning",
    boostHint: "{name}: maximum suction for this cleaning only",
    rooms: "Rooms",
    selectNone: "none",
    selectAll: "select all",
    cleanOneRoom: "Clean 1 room",
    cleanRooms: "Clean {count} rooms",
    chooseRooms: "Choose rooms",
    toStation: "To the station",
    stationOk: "Station ok",
    lastCleaning: "last {time}",
    stationTitle: "Station & maintenance",
    confirmReset: "sure?",
    reset: "reset",
    states: {
      offline: "offline",
      error: "Error",
      returningToWash: "Returning to wash",
      washingPaused: "Mop wash paused",
      washing: "Washing mop",
      returning: "Returning to station",
      paused: "Paused",
      cleaning: "Cleaning",
      drying: "Drying mop",
      charging: "Charging",
      ready: "Ready"
    },
    modes: {
      sweeping: "Vacuum",
      mopping: "Mop",
      sweeping_and_mopping: "Vacuum + mop",
      mopping_after_sweeping: "Vacuum, then mop"
    },
    suctionLevels: {
      quiet: "Quiet",
      standard: "Standard",
      strong: "Strong",
      turbo: "Turbo"
    },
    maintenance: {
      main_brush: "Main brush",
      side_brush: "Side brush",
      filter: "Filter",
      sensor_dirty: "Sensors"
    },
    maintenanceDue: {
      main_brush: "Replace main brush",
      side_brush: "Replace side brush",
      filter: "Replace filter",
      sensor_dirty: "Clean sensors"
    },
    actions: {
      self_clean: "Wash mop",
      manual_drying: "Dry",
      base_station_cleaning: "Clean station",
      start_auto_empty: "Empty bin"
    },
    station: {
      ok: "ok",
      missing: "missing",
      full: "full",
      low: "low",
      check: "check",
      empty: "empty"
    },
    editor: {
      entity: "Robot vacuum",
      layout: "Layout",
      layouts: {
        tile: "Tile",
        panel: "Panel"
      },
      name: "Name",
      prefix: "Entity prefix (optional)",
      navigation_path: "Tap target",
      rooms: "Rooms (YAML)",
      presets: "Quick picks (YAML)",
      maintenance_threshold: "Maintenance due at",
      boost: "Show Max+"
    }
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
    { name: "chips", selector: { object: {} } },
    { name: "buttons", selector: { object: {} } }
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
    for (const button of this.buttonConfigs()) {
      if (button.entity) entities.push(button.entity);
      if (button.active?.entity) entities.push(button.active.entity);
    }
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
  buttonConfigs() {
    return Array.isArray(this.config?.buttons) ? this.config.buttons.filter((button) => button && (button.icon || button.entity)) : [];
  }
  // default: a scene is activated, other entities open more-info
  buttonClick(event, button) {
    event.stopPropagation();
    const entity = button.entity;
    const fallback = entity?.startsWith("scene.") ? { action: "perform-action", perform_action: "scene.turn_on", target: { entity_id: entity } } : { action: entity ? "more-info" : "none" };
    fireAction(this, { type: "button", entity, tap_action: button.tap_action ?? fallback }, "tap");
  }
  renderButton(button) {
    const activeState = button.active?.entity ? this.hass?.states[button.active.entity]?.state : button.entity ? this.hass?.states[button.entity]?.state : void 0;
    const stateObj = button.entity ? this.hass?.states[button.entity] : void 0;
    const icon = button.icon ? b2`<ha-icon .icon=${button.icon}></ha-icon>` : b2`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    const label = button.name ?? stateObj?.attributes?.friendly_name ?? "";
    return b2`<button class=${matchesCondition(button.active, activeState) ? "button active" : "button"} title=${label}
      aria-label=${label} @click=${(event) => this.buttonClick(event, button)}>${icon}</button>`;
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
    const buttons = this.buttonConfigs();
    const showHeader = !!(config.title || config.info || chips.length || buttons.length);
    let columns = "";
    if (config.min_column_width) columns = `repeat(auto-fit, minmax(min(${config.min_column_width}, 100%), 1fr))`;
    else if (config.columns) columns = `repeat(${Number(config.columns)}, minmax(0, 1fr))`;
    const contentStyle = [
      columns ? `grid-template-columns: ${columns}` : "",
      config.gap ? `gap: ${config.gap}` : ""
    ].filter(Boolean).join("; ");
    const cardStyle = config.padding && config.frame !== false ? `padding: ${config.padding}` : "";
    const contentClass = `content ${config.layout}${config.min_column_width ? " responsive" : ""}`;
    return b2`<ha-card style=${cardStyle}>${showHeader ? b2`<div class="header"><div class="heading"><span class="title">${config.title ?? ""}</span><span class=${infoClass}>${info}</span></div><span
        class="chips">${chips.map((chip) => this.renderChip(chip))}</span>${buttons.length ? b2`<span class="buttons">${buttons.map((button) => this.renderButton(button))}</span>` : A}</div>` : A}<div class=${contentClass} style=${contentStyle}></div></ha-card>`;
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
      align-items: center;
      gap: var(--graphite-gap-header, 12px);
      margin-bottom: var(--graphite-gap-header, 12px);
    }
    /* title and info share one baseline; with buttons the row is as high as the buttons */
    .heading {
      flex: 1 1 auto;
      display: flex;
      align-items: baseline;
      gap: var(--graphite-gap-header, 12px);
      min-width: 0;
    }
    .buttons {
      display: flex;
      flex: none;
      gap: var(--graphite-gap-tile, 8px);
    }
    .button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 36px;
      padding: 0;
      border: none;
      border-radius: var(--graphite-radius-tile, 12px);
      background: var(--graphite-surface-tile);
      color: var(--graphite-text-secondary);
      cursor: pointer;
      font: inherit;
      -webkit-tap-highlight-color: transparent;
      --mdc-icon-size: 18px;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    .button:focus-visible {
      outline: 2px solid var(--graphite-accent);
      outline-offset: 2px;
    }
    .button.active {
      background: var(--graphite-accent);
      color: var(--graphite-accent-ink);
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
    if (config.since_line === false) return "";
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
  // values the card uses when an option is not set; the form shows them, and a value equal to its
  // default (or an empty list) is not stored, so the card falls back to its default again
  defaults() {
    return {};
  }
  // translated label of a select option, e.g. optionLabel("range.days") -> "<prefix>.range.days"
  optionLabel(key) {
    const fullKey = `${this.labelPrefix()}.${key}`;
    const label = translate(languageOf(this.isConnected ? this : void 0, this.hassObject), fullKey);
    return label === fullKey ? key : label;
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
    this.form.data = { ...this.defaults(), ...this.config };
  }
  fireConfig(config) {
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([key, value]) => value !== "" && value !== void 0 && value !== null && !(Array.isArray(value) && value.length === 0) && this.defaults()[key] !== value && !this.skipValue(key, value))
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
    right: var(--graphite-watermark-inset, 9px);
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
    right: var(--graphite-watermark-inset, 9px);
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

// src/cards/tiles/graphite-scene-editor.ts
var GraphiteSceneEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "scene.editor";
  }
  schema() {
    return [
      { name: "entity", required: true, selector: { entity: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }
        ]
      },
      { name: "colors", selector: { object: {} } },
      { name: "active", selector: { object: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } }
    ];
  }
};

// src/cards/tiles/graphite-scene.ts
var sceneStyles = i`
  .tile.scene {
    height: var(--graphite-tile-height-scene, 64px);
  }
  .tile.scene .stripe {
    background: var(--scene-gradient, var(--graphite-accent));
  }
  /* active: the whole tile in the scene colors */
  .tile.scene.active {
    background: var(--scene-gradient, var(--graphite-accent));
  }
  .tile.scene.active .name {
    font-weight: 500;
    color: var(--scene-ink);
  }
  .tile.scene.active .stripe {
    background: color-mix(in srgb, var(--scene-ink) 60%, transparent);
  }
  .tile.scene.active .watermark {
    color: var(--scene-ink);
    opacity: 0.3;
  }
`;
function luminanceOf(color) {
  const hex = color.trim().replace("#", "");
  if (hex.length !== 6) return null;
  const channels = [0, 2, 4].map((start) => parseInt(hex.substring(start, start + 2), 16) / 255);
  if (channels.some((channel) => Number.isNaN(channel))) return null;
  const linear = channels.map((channel) => channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
var GraphiteScene = class extends GraphiteCard {
  normalizeConfig(config) {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    const tapAction = config.entity.startsWith("scene.") ? { action: "perform-action", perform_action: "scene.turn_on", target: { entity_id: config.entity } } : { action: "more-info" };
    return { tap_action: tapAction, hold_action: defaultHoldAction(config.entity), ...config };
  }
  watchedEntities() {
    const config = this.config;
    return config.active?.entity ? [config.entity, config.active.entity] : [config.entity];
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
    const stateObj = this.hass?.states[config.entity];
    const colors = (Array.isArray(config.colors) ? config.colors : []).map((color) => String(color).trim()).filter(Boolean);
    const gradient = colors.length > 1 ? `linear-gradient(90deg, ${colors.join(", ")})` : colors[0] ?? "";
    const luminances = colors.map(luminanceOf).filter((value) => value !== null);
    const average = luminances.length ? luminances.reduce((sum, value) => sum + value, 0) / luminances.length : 0;
    const ink = average > 0.35 ? "#2a1a0c" : "#ffffff";
    const activeState = config.active?.entity ? this.hass?.states[config.active.entity]?.state : stateObj?.state;
    const active = matchesCondition(config.active, activeState);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", "scene", active ? "active" : "", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    const style = [gradient ? `--scene-gradient: ${gradient}` : "", `--scene-ink: ${ink}`].filter(Boolean).join("; ");
    const icon = config.icon ? b2`<ha-icon .icon=${config.icon}></ha-icon>` : b2`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return b2`<div class=${classes} style=${style} role=${interactive ? "button" : A} tabindex=${interactive ? "0" : A}
      aria-label=${name} aria-pressed=${active ? "true" : "false"}>${interactive ? b2`<ha-ripple></ha-ripple>` : A}<div
      class="stripe"></div><div class="watermark">${icon}</div><div class="name">${name}</div></div>`;
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return { columns: 3, rows: "auto", min_columns: 2 };
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("scene.")) ?? "";
    return { entity, colors: ["#f5c48a", "#e89a5c", "#c9733f"] };
  }
  static async getConfigElement() {
    return document.createElement("graphite-scene-editor");
  }
};
GraphiteScene.styles = [tileStyles, labelStyles, sceneStyles];
registerElement("graphite-scene-editor", GraphiteSceneEditor);
registerCard("graphite-scene", GraphiteScene, {
  name: "Graphite Scene",
  description: "Scene as a tile: color stripe and watermark, filled with the scene colors while active."
});

// src/cards/media/graphite-now-playing-editor.ts
var GraphiteNowPlayingEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "nowPlaying.editor";
  }
  schema() {
    return [{ name: "sources", required: true, selector: { object: {} } }];
  }
};

// src/cards/media/graphite-now-playing.ts
var activeStates2 = ["on", "playing", "paused", "buffering"];
var defaultIgnoredTitles = ["off", "standby", "home", "screensaver", "unknown", "unavailable", ""];
var maxGapMinutes = 10;
var startTimeCache = /* @__PURE__ */ new Map();
var imageLoadCache = /* @__PURE__ */ new Map();
function isTechnicalName(text) {
  return text.includes(".") && !text.includes(" ");
}
var GraphiteNowPlaying = class extends GraphiteCard {
  normalizeConfig(config) {
    if (!Array.isArray(config.sources) || config.sources.length === 0) {
      throw new Error(`${this.localName}: 'sources' must be a list of media sources`);
    }
    return config;
  }
  watchedEntities() {
    return this.config.sources.flatMap((source) => [
      source.entity,
      source.title_entity,
      source.image_entity,
      ...[].concat(source.requires ?? [])
    ]).filter((entity) => !!entity);
  }
  connectedCallback() {
    super.connectedCallback();
    this.refreshTimer = window.setInterval(() => this.requestUpdate(), 6e4);
    if (this.shownVisible !== void 0) requestAnimationFrame(() => this.announceVisibility());
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearInterval(this.refreshTimer);
  }
  // first active source with its resolved title, or null
  activeSource() {
    const hass = this.hass;
    for (const source of this.config.sources) {
      const stateObj = hass.states[source.entity];
      const sourceStates = Array.isArray(source.states) && source.states.length ? source.states.map(String) : activeStates2;
      if (!stateObj || !sourceStates.includes(stateObj.state)) continue;
      const required = [].concat(source.requires ?? []);
      if (required.some((entityId) => !activeStates2.includes(hass.states[entityId]?.state ?? ""))) continue;
      const titleState = source.title_entity ? hass.states[source.title_entity] : void 0;
      const attributes = stateObj.attributes ?? {};
      const candidates = [titleState?.state, attributes.media_title, attributes.app_name].map((text) => String(text ?? "").trim());
      const ignored = (source.ignore_titles ?? defaultIgnoredTitles).map((text) => String(text).toLowerCase());
      const rawTitle = candidates.find((text) => text && (source.titles?.[text] !== void 0 || !ignored.includes(text.toLowerCase()) && !isTechnicalName(text))) ?? "";
      const title = rawTitle ? source.titles?.[rawTitle] ?? rawTitle : source.fallback_title ?? "";
      if (!title) continue;
      return { source, stateObj, titleState, title, rawTitle, fallback: !rawTitle };
    }
    return null;
  }
  // start of the current state: last_changed, corrected from the history so that short unavailable
  // gaps (e.g. Xbox Live dropouts) and restarts do not reset the time
  startTime(stateObj) {
    const lastChanged = new Date(stateObj.last_changed).getTime();
    const key = `${stateObj.entity_id}|${stateObj.state}`;
    const cached = startTimeCache.get(key);
    if (cached && cached.lastChanged === lastChanged) return cached.start ?? lastChanged;
    startTimeCache.set(key, { lastChanged, start: null });
    const since = new Date(Date.now() - 24 * 36e5).toISOString();
    const api = this.hass;
    api?.callApi?.("GET", `history/period/${since}?filter_entity_id=${stateObj.entity_id}&minimal_response&no_attributes`).then((result) => {
      const history2 = result?.[0] ?? [];
      let start = lastChanged;
      let gapEnd = null;
      for (let index = history2.length - 1; index >= 0; index -= 1) {
        const entry = history2[index];
        const changed = new Date(entry.last_changed).getTime();
        if (entry.state === stateObj.state) {
          start = changed;
          gapEnd = null;
        } else if (["unavailable", "unknown"].includes(entry.state)) {
          gapEnd = gapEnd ?? (index + 1 < history2.length ? new Date(history2[index + 1].last_changed).getTime() : Date.now());
          if (gapEnd - changed > maxGapMinutes * 6e4) break;
        } else {
          break;
        }
      }
      startTimeCache.set(key, { lastChanged, start: Math.min(start, lastChanged) });
      this.requestUpdate();
    }).catch(() => void 0);
    return lastChanged;
  }
  sinceText(stateObj) {
    const minutes = Math.max(0, Math.floor((Date.now() - this.startTime(stateObj)) / 6e4));
    if (minutes < 1) return this.localize("nowPlaying.justStarted");
    if (minutes < 60) return this.localize("nowPlaying.sinceMinutes", { minutes });
    return this.localize("nowPlaying.sinceHours", { hours: Math.floor(minutes / 60), minutes: String(minutes % 60).padStart(2, "0") });
  }
  // subtitle from attributes of the title entity; empty while a placeholder has no value
  formatSubtitle(source, titleState) {
    if (!source.subtitle || !titleState) return "";
    const attributes = titleState.attributes ?? {};
    let missing = false;
    const text = String(source.subtitle).split("{").map((part, index) => {
      if (index === 0) return part;
      const closing = part.indexOf("}");
      if (closing < 0) return `{${part}`;
      const value = attributes[part.slice(0, closing)];
      if (value === void 0 || value === null || value === "") missing = true;
      return `${value ?? ""}${part.slice(closing + 1)}`;
    }).join("");
    return missing ? "" : text.trim();
  }
  progressInfo(stateObj) {
    const attributes = stateObj.attributes ?? {};
    const duration = Number(attributes.media_duration);
    if (!duration || attributes.media_position === void 0) return null;
    let position = Number(attributes.media_position) || 0;
    if (stateObj.state === "playing" && attributes.media_position_updated_at) {
      position += (Date.now() - new Date(attributes.media_position_updated_at).getTime()) / 1e3;
    }
    position = Math.min(Math.max(position, 0), duration);
    const text = stateObj.state === "paused" ? this.localize("nowPlaying.paused") : this.localize("nowPlaying.remaining", { minutes: Math.ceil((duration - position) / 60) });
    return { percent: Math.round(position / duration * 1e3) / 10, text };
  }
  // image candidates: real cover, the image entity or helper, the card mapping (by title or app name)
  imageCandidates(active) {
    const { source, stateObj, title, rawTitle } = active;
    const attributes = stateObj.attributes ?? {};
    const hass = this.hass;
    const resolve = (url) => hass?.hassUrl ? hass.hassUrl(url) : url;
    const candidates = [];
    const picture = attributes.entity_picture_local || (String(attributes.entity_picture ?? "").startsWith("/api/") || String(attributes.entity_picture ?? "").startsWith("http") ? attributes.entity_picture : "");
    if (picture) candidates.push(resolve(picture));
    if (source.image_entity) {
      const imageState = this.hass.states[source.image_entity];
      const imagePicture = imageState?.attributes?.entity_picture;
      if (imagePicture) candidates.push(resolve(imagePicture));
      else if (imageState?.state?.startsWith("/")) candidates.push(imageState.state);
    }
    for (const key of [title, rawTitle, attributes.app_name]) {
      if (key && source.images?.[key]) candidates.push(source.images[key]);
    }
    return candidates;
  }
  // first candidate known to load; an unknown one is probed first (monogram meanwhile)
  usableImage(candidates) {
    for (const url of candidates) {
      const status = imageLoadCache.get(url);
      if (status === "ok") return url;
      if (status === "failed") continue;
      if (status !== "loading") {
        imageLoadCache.set(url, "loading");
        const probe = new Image();
        probe.onload = () => {
          imageLoadCache.set(url, "ok");
          this.requestUpdate();
        };
        probe.onerror = () => {
          imageLoadCache.set(url, "failed");
          this.requestUpdate();
        };
        probe.src = url;
      }
      return "";
    }
    return "";
  }
  // calm, muted hue per title so the monogram tiles differ without getting loud
  monogramColor(title) {
    let seed = 0;
    for (const character of title) seed = seed * 31 + character.charCodeAt(0) >>> 0;
    return `hsl(${seed % 360} 22% 32%)`;
  }
  setVisible(visible) {
    if (this.shownVisible === visible) return;
    this.shownVisible = visible;
    this.toggleAttribute("inactive", !visible);
    this.announceVisibility();
  }
  // lets the panel collapse the whole slot (no gap)
  announceVisibility() {
    this.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: this.shownVisible }, bubbles: true, composed: true }));
  }
  render() {
    if (!this.hass) return A;
    const active = this.activeSource();
    this.setVisible(!!active);
    if (!active) return A;
    const { source, stateObj, titleState, title } = active;
    const attributes = stateObj.attributes ?? {};
    const progress = this.progressInfo(stateObj);
    const appName = String(attributes.app_name ?? "");
    const readableApp = appName && !isTechnicalName(appName) && appName !== active.rawTitle ? source.titles?.[appName] ?? appName : "";
    const details = active.fallback ? source.fallback_subtitle ?? "" : this.formatSubtitle(source, titleState) || attributes.media_artist || attributes.media_series_title || readableApp;
    const subtitle = [details, progress ? progress.text : this.sinceText(titleState ?? stateObj)].filter(Boolean).join(" \xB7 ");
    const image = this.usableImage(this.imageCandidates(active));
    const backdrop = !!image && source.backdrop !== false;
    const label = `${source.name ?? attributes.friendly_name ?? source.entity}: ${title}`;
    return b2`<div class=${backdrop ? "card has-backdrop" : "card"} aria-label=${label}><div class="backdrop"
      style=${backdrop ? `background-image: url("${image}")` : A}></div><div class="watermark"><ha-icon
      .icon=${source.icon ?? attributes.icon ?? "mdi:play-circle-outline"}></ha-icon></div><div class=${image ? "art has-image" : "art"}
      style=${`--art-color: ${this.monogramColor(title)};${image ? ` background-image: url("${image}")` : ""}`}>${image ? "" : title.charAt(0).toUpperCase()}</div><div class="text"><div class="label">${source.name ?? attributes.friendly_name ?? source.entity}</div><div class="title">${title}</div><div class="subtitle">${subtitle}</div>${progress ? b2`<div class="progress"><div style=${`width: ${progress.percent}%`}></div></div>` : A}</div></div>`;
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 12, rows: "auto" };
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("media_player.")) ?? "media_player.example";
    return { sources: [{ entity }] };
  }
  static async getConfigElement() {
    return document.createElement("graphite-now-playing-editor");
  }
};
GraphiteNowPlaying.styles = i`
    :host {
      display: block;
    }
    :host([inactive]) {
      display: none;
    }
    /* 88px like the media tiles: 12px padding, 64px cover */
    .card {
      position: relative;
      display: grid;
      grid-template-columns: var(--graphite-tile-height-scene, 64px) minmax(0, 1fr);
      gap: 14px;
      align-items: center;
      box-sizing: border-box;
      min-height: var(--graphite-tile-height-media, 88px);
      padding: var(--graphite-padding-tile, 12px) 14px var(--graphite-padding-tile, 12px) var(--graphite-padding-tile, 12px);
      border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
      background: color-mix(in srgb, var(--graphite-accent) var(--graphite-light-tint, 10%), var(--graphite-surface-tile-active));
      overflow: hidden;
      isolation: isolate;
    }
    /* cover as blurred, dimmed backdrop over the whole card */
    .backdrop {
      position: absolute;
      inset: -24px;
      z-index: -1;
      background: center / cover no-repeat;
      filter: blur(22px) saturate(1.3) brightness(0.42);
      transform: scale(1.1);
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }
    .card.has-backdrop {
      background: var(--graphite-surface-tile-active);
    }
    .card.has-backdrop .backdrop {
      opacity: 1;
    }
    .card.has-backdrop :is(.label, .subtitle) {
      color: rgba(255, 255, 255, 0.72);
    }
    @media (prefers-reduced-motion: reduce) {
      .backdrop {
        transition: none;
      }
    }
    .art {
      width: var(--graphite-tile-height-scene, 64px);
      height: var(--graphite-tile-height-scene, 64px);
      border-radius: var(--graphite-radius-tile, 12px);
      background: var(--art-color, var(--graphite-surface-tile)) center / cover no-repeat;
      display: grid;
      place-items: center;
      font-size: var(--graphite-font-value-size, 22px);
      font-weight: 400;
      color: rgba(255, 255, 255, 0.88);
      overflow: hidden;
    }
    .art.has-image {
      color: transparent;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    }
    /* source as watermark top right, at the same place as the meter and stopwatch icons */
    .watermark {
      position: absolute;
      top: 8px;
      right: var(--graphite-watermark-inset, 9px);
      display: flex;
      width: var(--graphite-watermark-size, 34px);
      height: var(--graphite-watermark-size, 34px);
      color: var(--graphite-text-primary);
      opacity: 0.16;
      pointer-events: none;
      --mdc-icon-size: var(--graphite-watermark-size, 34px);
    }
    /* text column as high as the cover (like Dreamie): label at its top, details at its bottom,
       the free space sits between label and title */
    .text {
      min-width: 0;
      height: var(--graphite-tile-height-scene, 64px);
      display: flex;
      flex-direction: column;
      padding-right: 32px;
    }
    .label {
      font-size: var(--graphite-font-label-size, 13px);
      line-height: 13px;
      color: var(--graphite-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .title {
      margin-top: auto;
      font-size: var(--graphite-font-value-text-size, 20px);
      font-weight: var(--graphite-font-value-weight, 300);
      line-height: 1.1;
      color: var(--graphite-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .subtitle {
      margin-top: 3px;
      font-size: var(--graphite-font-caption-size, 12px);
      line-height: 12px;
      color: var(--graphite-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .progress {
      flex: none;
      margin-top: 6px;
      height: 4px;
      border-radius: 2px;
      background: var(--graphite-surface-tile);
      overflow: hidden;
    }
    .progress > div {
      height: 100%;
      border-radius: 2px;
      background: var(--graphite-accent);
    }
  `;
registerElement("graphite-now-playing-editor", GraphiteNowPlayingEditor);
registerCard("graphite-now-playing", GraphiteNowPlaying, {
  name: "Graphite Now Playing",
  description: "What runs on the most important active media device: cover, title, details, running time."
});

// src/cards/media/graphite-vacuum-editor.ts
var GraphiteVacuumEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "vacuum.editor";
  }
  skipValue(key, value) {
    return key === "layout" && value === "tile";
  }
  defaults() {
    return { boost: true, maintenance_threshold: 10 };
  }
  schemaKey() {
    return this.config.layout === "panel" ? "panel" : "tile";
  }
  schema() {
    const panel = this.config.layout === "panel";
    const tileFields = [
      { name: "navigation_path", selector: { navigation: {} } }
    ];
    const panelFields = [
      { name: "rooms", selector: { object: {} } },
      { name: "presets", selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "maintenance_threshold", selector: { number: { mode: "box", min: 0, max: 100, unit_of_measurement: "%" } } },
          { name: "boost", selector: { boolean: {} } }
        ]
      }
    ];
    return [
      { name: "entity", required: true, selector: { entity: { domain: "vacuum" } } },
      { name: "layout", selector: { select: { mode: "list", options: ["tile", "panel"].map((value) => ({ value, label: this.optionLabel(`layouts.${value}`) })) } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "prefix", selector: { text: {} } }
        ]
      },
      ...panel ? panelFields : tileFields
    ];
  }
};

// src/cards/media/vacuum-art.ts
var robotArt = b2`
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g class="dock"><rect x="10" y="48" width="44" height="12" rx="4" fill="var(--vacDock)" style="fill-opacity: var(--vacTone)" stroke="var(--vacDock)" stroke-width="1.4"/><rect x="18" y="55.5" width="28" height="2.5" rx="1.25" fill="var(--vacDock)"/></g>
  <g class="robot">
    <g class="pads">
      <g transform="translate(25 44)"><g class="pad"><circle r="7" fill="var(--vacWater)" style="fill-opacity: var(--vacTone)" stroke="var(--vacWater)" stroke-width="1.4"/><path d="M-4 0 H4 M0 -4 V4" stroke="var(--vacWater)" stroke-width="1.2" opacity=".8"/></g></g>
      <g transform="translate(39 44)"><g class="pad"><circle r="7" fill="var(--vacWater)" style="fill-opacity: var(--vacTone)" stroke="var(--vacWater)" stroke-width="1.4"/><path d="M-4 0 H4 M0 -4 V4" stroke="var(--vacWater)" stroke-width="1.2" opacity=".8"/></g></g>
    </g>
    <g transform="translate(20 17)"><g class="brush"><path d="M0 0 L-8 -3 M0 0 L1 -8 M0 0 L-5 6" stroke="var(--vacLine)" stroke-width="1.4" stroke-linecap="round"/></g></g>
    <circle cx="32" cy="30" r="19" fill="var(--vacBody)"/>
    <circle cx="32" cy="30" r="19" fill="var(--vacLine)" style="fill-opacity: var(--vacTone)" stroke="var(--vacLine)" stroke-width="1.6"/>
    <path d="M16.5 30 A15.5 15.5 0 0 1 47.5 30" fill="none" stroke="var(--vacLine)" stroke-width="1.4"/>
    <path d="M14 29 L16.5 30 L16.5 33 M50 29 L47.5 30 L47.5 33" fill="none" stroke="var(--vacLine)" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M19 22 H26 M38 22 H45" stroke="var(--vacLine)" stroke-width="1.2"/>
    <circle cx="32" cy="22" r="5.5" fill="none" stroke="var(--vacLine)" stroke-width="1.4"/>
    <rect class="eye" x="30.8" y="37" width="2.4" height="5" rx="1.2" fill="var(--vacAccent)"/>
  </g>
  <g class="drops"><path class="drop" d="M12 42 q3 4 0 6 q-3 -2 0 -6z" fill="var(--vacWater)"/><path class="drop" d="M52 42 q3 4 0 6 q-3 -2 0 -6z" fill="var(--vacWater)"/><path class="drop" d="M8 34 q3 4 0 6 q-3 -2 0 -6z" fill="var(--vacWater)"/></g>
  <g class="heat" fill="none" stroke="var(--vacAccent)" stroke-width="1.8" stroke-linecap="round"><path class="wave" d="M24 8 q2 -3 0 -6"/><path class="wave" d="M32 8 q2 -3 0 -6"/><path class="wave" d="M40 8 q2 -3 0 -6"/></g>
  <path class="bolt" d="M51 2 l-5 9 h4 l-2 7 l6 -10 h-4 l2 -6z" fill="var(--vacAccent)"/>
</svg>`;
var artStyles = i`
  :host {
    display: block;
    container-type: inline-size;
    --vacTile: var(--graphite-surface-tile, #1f1f20);
    --vacTileHi: var(--graphite-surface-tile-active, #2b2b2c);
    --vacText: var(--graphite-text-primary, #f3f3f4);
    --vacText2: var(--graphite-text-secondary, #b4b4b8);
    --vacText3: var(--graphite-text-muted, #8f8f92);
    --vacAccent: var(--graphite-accent, #f5c48a);
    --vacAccentInk: var(--graphite-accent-ink, #3a2410);
    --vacDanger: var(--graphite-danger, #e8908a);
    --vacWater: #7cc4f0;
    --vacLine: #c4c4c8;
    --vacDock: #6a6a70;
    /* second tone of the two-tone artwork, matches the dimmed icons of the other tiles */
    --vacTone: var(--graphite-vacuum-tone, 0.12);
    --vacRadius: var(--graphite-radius-tile, 12px);
  }
  button {
    border: none;
    font: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:disabled { cursor: default; opacity: 0.45; }
  /* robot artwork */
  .art {
    --vacBody: var(--vacArtBg);
    --vacTurret: var(--vacArtBg);
    width: 64px;
    height: 64px;
    border-radius: var(--vacRadius);
    background: var(--vacArtBg);
    display: grid;
    place-items: center;
    overflow: hidden;
    flex: none;
  }
  .art svg { width: 56px; height: 56px; overflow: visible; }
  .brush, .pad { transform-box: view-box; }
  .run .brush, .return .brush { animation: vacSpin 0.6s linear infinite; }
  .run .robot, .return .robot { animation: vacDrive 3s ease-in-out infinite; }
  .run.mopping .pad, .wash .pad { animation: vacSpin 1s linear infinite; }
  .drops, .heat, .bolt, .dock { opacity: 0; }
  .wash .drops { opacity: 1; }
  .wash .drop { animation: vacFall 1s ease-in infinite; }
  .wash .drop:nth-child(2) { animation-delay: 0.33s; }
  .wash .drop:nth-child(3) { animation-delay: 0.66s; }
  .dry .heat { opacity: 1; }
  .dry .wave { animation: vacRise 1.8s ease-in-out infinite; }
  .dry .wave:nth-child(2) { animation-delay: 0.6s; }
  .dry .wave:nth-child(3) { animation-delay: 1.2s; }
  .charge .bolt { opacity: 1; animation: vacPulse 1.6s ease-in-out infinite; }
  .docked .dock, .charge .dock, .wash .dock, .dry .dock { opacity: 1; }
  .err .eye { fill: var(--vacDanger); }
  .err .robot { animation: vacShake 0.5s ease-in-out 3; }
  .sleep .eye { opacity: 0.35; }
  .offline svg { opacity: 0.4; }
  @keyframes vacSpin { to { transform: rotate(360deg); } }
  @keyframes vacDrive { 0%, 100% { transform: translate(0, 0) rotate(0); } 25% { transform: translate(3px, -2px) rotate(8deg); } 75% { transform: translate(-3px, 2px) rotate(-6deg); } }
  @keyframes vacFall { 0% { transform: translateY(-6px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(6px); opacity: 0; } }
  @keyframes vacRise { 0% { transform: translateY(4px); opacity: 0; } 50% { opacity: 0.9; } 100% { transform: translateY(-6px); opacity: 0; } }
  @keyframes vacPulse { 50% { opacity: 0.35; } }
  @keyframes vacShake { 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
  @media (prefers-reduced-motion: reduce) { .art * { animation: none !important; } }
`;

// src/cards/media/vacuum-styles.ts
var tileStyles2 = i`
  ha-card {
    --vacArtBg: color-mix(in srgb, var(--vacText) 6%, var(--vacTile));
    background: var(--vacTile);
    border-radius: var(--vacRadius);
    border: none;
    box-shadow: none;
    padding: 12px 14px 12px 12px;
    box-sizing: border-box;
    min-height: var(--graphite-tile-height-media, 88px);
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  ha-card.active {
    --vacArtBg: var(--vacTile);
    background: color-mix(in srgb, var(--vacAccent) 10%, var(--vacTileHi));
  }
  /* text column as high as the robot: name aligned to its top, details to its bottom */
  .text {
    min-width: 0;
    height: 64px;
    display: flex;
    flex-direction: column;
  }
  .name {
    font-size: var(--graphite-font-label-size, 13px);
    line-height: var(--graphite-font-label-size, 13px);
    color: var(--vacText2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* state as text: 20/300 (numbers would be 22/300, words read larger) */
  .title {
    margin-top: auto;
    font-size: var(--graphite-font-value-text-size, 20px);
    font-weight: 300;
    line-height: 1.1;
    color: var(--vacText);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .subtitle {
    margin-top: 3px;
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: var(--graphite-font-caption-size, 12px);
    color: var(--vacText2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* progress as last line, 4px like the media tiles */
  .progress {
    margin-top: 6px;
    flex: none;
    height: 4px;
    border-radius: 2px;
    background: var(--vacTile);
    overflow: hidden;
  }
  .progress > div { height: 100%; border-radius: 2px; background: var(--vacAccent); }
  /* quick control like the panel buttons: 44 x 36 */
  .control {
    width: 44px;
    height: 36px;
    border-radius: var(--vacRadius);
    background: var(--vacTile);
    color: var(--vacText2);
    display: grid;
    place-items: center;
    padding: 0;
    --mdc-icon-size: 18px;
    align-self: end;
  }
  .control:active { transform: scale(0.96); }
  /* maintenance or station hint as chip, takes the place of the control (never both) */
  .pill {
    max-width: 150px;
    padding: var(--graphite-chip-padding, 4px 10px);
    border-radius: var(--graphite-radius-pill, 999px);
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: color-mix(in srgb, var(--vacAccent) 16%, var(--vacTile));
    color: var(--vacAccent);
  }
`;
var panelStyles = i`
  .columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--graphite-gap-panel, 16px);
    align-items: start;
  }
  .column {
    background: var(--graphite-surface-panel, #161617);
    border-radius: var(--graphite-radius-panel, 20px);
    padding: var(--graphite-padding-panel, 16px);
    min-width: 0;
  }
  .columns.plain .column { background: none; padding: 0; }
  .panelTitle {
    font-size: var(--graphite-title-size, 18px);
    font-weight: var(--graphite-title-weight, 400);
    line-height: 1.2;
    color: var(--graphite-title-color, var(--vacText));
    margin-bottom: var(--graphite-gap-header, 12px);
  }
  .label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 500;
    color: var(--vacText);
    margin: var(--graphite-gap-panel, 16px) 0 var(--graphite-gap-tile, 8px);
  }
  .panelTitle + .label { margin-top: 0; }
  .label button {
    background: none;
    padding: 0;
    font-size: var(--graphite-font-caption-size, 12px);
    font-weight: 400;
    color: var(--vacText3);
  }
  /* configured rooms that do not match the map (e.g. after the map was recreated) */
  .roomWarning {
    display: flex;
    gap: var(--graphite-gap-tile, 8px);
    align-items: flex-start;
    margin: 0 0 var(--graphite-gap-tile, 8px);
    padding: var(--graphite-padding-tile, 12px);
    border-radius: var(--vacRadius);
    background: color-mix(in srgb, var(--vacAccent) 14%, var(--vacTile));
    color: var(--vacAccent);
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 16px;
  }
  .roomWarning ha-icon { --mdc-icon-size: 18px; flex: none; margin-top: -1px; }
  .roomWarning strong { display: block; font-size: var(--graphite-font-label-size, 13px); font-weight: 500; margin-bottom: 2px; }
  .roomWarning span { display: block; color: var(--vacText2); }
  .presets, .modes, .rooms, .suctions, .actions {
    display: grid;
    gap: var(--graphite-gap-tile, 8px);
  }
  .presets, .modes, .rooms { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  /* all tiles and buttons of the panel share the row height */
  .preset, .room, .mode, .suction, .boost, .start, .toStation, .action {
    height: var(--graphite-row-height, 60px);
    border-radius: var(--vacRadius);
    background: var(--vacTile);
    min-width: 0;
  }
  .preset, .room {
    display: flex;
    align-items: center;
    gap: var(--graphite-gap-tile, 8px);
    padding: 0 var(--graphite-padding-tile, 12px);
    font-size: var(--graphite-font-label-size, 13px);
    color: var(--vacText2);
    text-align: left;
    --mdc-icon-size: 18px;
  }
  .preset span, .room span {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .preset ha-icon, .room ha-icon { flex: none; opacity: 0.75; }
  .preset {
    color: var(--vacText);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vacAccent) 30%, var(--vacTile));
  }
  .preset.selected {
    background: color-mix(in srgb, var(--vacAccent) 20%, var(--vacTileHi));
    box-shadow: inset 0 0 0 1.5px var(--vacAccent);
  }
  .room.selected {
    background: color-mix(in srgb, var(--vacAccent) 20%, var(--vacTileHi));
    color: var(--vacText);
  }
  .room .order { flex: none; font-size: var(--graphite-font-caption-size, 12px); color: var(--vacAccent); }
  .mode {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0 var(--graphite-gap-tile, 8px);
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 1.2;
    color: var(--vacText2);
    --mdc-icon-size: 18px;
  }
  .mode.selected { background: var(--vacAccent); color: var(--vacAccentInk); }
  .suctions { grid-template-columns: repeat(var(--suctionCount, 4), minmax(0, 1fr)) 64px; }
  .suctions.noBoost { grid-template-columns: repeat(var(--suctionCount, 4), minmax(0, 1fr)); }
  .suction {
    font-size: var(--graphite-font-caption-size, 12px);
    color: var(--vacText2);
    padding: 0 4px;
  }
  .suction.selected { background: color-mix(in srgb, var(--vacAccent) 20%, var(--vacTileHi)); color: var(--vacText); }
  .boost {
    font-size: var(--graphite-font-caption-size, 12px);
    color: var(--vacAccent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vacAccent) 45%, var(--vacTile));
  }
  .boost.on { background: var(--vacAccent); color: var(--vacAccentInk); font-weight: 500; box-shadow: none; }
  .hint { font-size: var(--graphite-font-caption-size, 12px); color: var(--vacText3); margin-top: var(--graphite-gap-tile, 8px); }
  .startRow {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--graphite-row-height, 60px);
    gap: var(--graphite-gap-tile, 8px);
    margin-top: var(--graphite-gap-panel, 16px);
  }
  .start {
    background: var(--vacAccent);
    color: var(--vacAccentInk);
    font-size: var(--graphite-font-name-size, 15px);
    font-weight: 500;
  }
  .start.idle { background: var(--vacTile); color: var(--vacText3); opacity: 1; }
  .toStation {
    color: var(--vacText2);
    display: grid;
    place-items: center;
    --mdc-icon-size: 18px;
  }
  .robotInfo { display: flex; gap: 14px; align-items: center; margin-bottom: var(--graphite-gap-panel, 16px); }
  .robotInfo .art { --vacArtBg: var(--vacTile); width: 88px; height: 88px; }
  .robotInfo .art svg { width: 76px; height: 76px; }
  .facts { font-size: var(--graphite-font-caption-size, 12px); line-height: 1.7; color: var(--vacText2); min-width: 0; }
  .facts b { color: var(--vacText); font-weight: 500; }
  .facts .warn { color: var(--vacAccent); }
  .wear {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px var(--graphite-gap-tile, 8px);
    align-items: center;
    margin-bottom: var(--graphite-padding-tile, 12px);
  }
  .wear .name { font-size: var(--graphite-font-label-size, 13px); color: var(--vacText); }
  .wear .value { font-size: var(--graphite-font-caption-size, 12px); color: var(--vacText2); }
  .wear .line { grid-column: 1 / -1; height: 4px; border-radius: 2px; background: var(--vacTile); overflow: hidden; }
  .wear .line div { height: 100%; background: var(--vacText2); }
  .wear.due .value { color: var(--vacAccent); }
  .wear.due .line div { background: var(--vacAccent); }
  .reset {
    height: 36px;
    padding: 0 var(--graphite-padding-tile, 12px);
    border-radius: var(--graphite-radius-pill, 999px);
    font-size: var(--graphite-font-caption-size, 12px);
    color: var(--vacAccent);
    background: color-mix(in srgb, var(--vacAccent) 14%, var(--vacTile));
  }
  .reset.confirm { background: var(--vacAccent); color: var(--vacAccentInk); }
  .actions { grid-template-columns: 1fr 1fr; margin-top: var(--graphite-gap-panel, 16px); }
  .action {
    font-size: var(--graphite-font-caption-size, 12px);
    color: var(--vacText2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--graphite-gap-tile, 8px);
    --mdc-icon-size: 18px;
  }
  .action.done { color: var(--vacAccent); }
  .error { font-size: var(--graphite-font-caption-size, 12px); color: var(--vacDanger); margin-top: var(--graphite-gap-tile, 8px); }
  @container (min-width: 640px) {
    .columns { grid-template-columns: minmax(0, 1fr) 320px; }
  }
  @container (max-width: 380px) {
    .presets, .rooms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;

// src/cards/media/graphite-vacuum.ts
var defaultModes = [
  { value: "sweeping", icon: "mdi:vacuum-outline" },
  { value: "mopping_after_sweeping", icon: "mdi:water-sync" },
  { value: "sweeping_and_mopping", icon: "mdi:water-plus-outline" }
];
var knownModes = ["sweeping", "mopping", "sweeping_and_mopping", "mopping_after_sweeping"];
var vacuumModeKeys = {
  "Sweeping": "sweeping",
  "Mopping": "mopping",
  "Sweeping and mopping": "sweeping_and_mopping",
  "Mopping after sweeping": "mopping_after_sweeping"
};
var defaultSuctionLevels = [{ value: "quiet" }, { value: "standard" }, { value: "strong" }, { value: "turbo" }];
var stationStates = {
  "installed": "ok",
  "not installed": "missing",
  "full": "full",
  "low": "low",
  "check": "check",
  "enabled": "ok"
};
var hintStates = ["ready", "charging", "drying", "error"];
var confirmMilliseconds = 4e3;
var pressedMilliseconds = 2500;
var GraphiteVacuum = class extends GraphiteCard {
  constructor() {
    super();
    this.modes = [];
    this.suctionLevels = [];
    this.maintenance = [];
    this.stationActions = [];
    this.warnedIssues = 0;
    this.selected = [];
    this.errorText = "";
  }
  normalizeConfig(config) {
    if (!config.entity) throw new Error("entity is required");
    const prefix = config.prefix || config.entity.split(".")[1];
    this.entities = {
      mode: config.mode_entity || `select.${prefix}_cleaning_mode`,
      suction: config.suction_entity || `select.${prefix}_suction_level`,
      boost: config.boost_entity || `switch.${prefix}_max_suction_power`,
      history: config.history_entity || `sensor.${prefix}_cleaning_history`,
      error: config.error_entity || `sensor.${prefix}_error`,
      dryingLeft: config.drying_left_entity || `sensor.${prefix}_drying_left`
    };
    this.modes = (config.modes || defaultModes).map((mode) => typeof mode === "string" ? defaultModes.find((item) => item.value === mode) || { value: mode } : mode);
    this.suctionLevels = (config.suction_levels || defaultSuctionLevels).map((level) => typeof level === "string" ? defaultSuctionLevels.find((item) => item.value === level) || { value: level } : level);
    this.maintenance = config.maintenance || [
      { key: "main_brush", reset: `button.${prefix}_reset_main_brush` },
      { key: "side_brush", reset: `button.${prefix}_reset_side_brush` },
      { key: "filter", reset: `button.${prefix}_reset_filter` },
      { key: "sensor_dirty", reset: `button.${prefix}_reset_sensor` }
    ];
    this.stationActions = config.actions || [
      { key: "self_clean", icon: "mdi:water-sync", entity: `button.${prefix}_self_clean` },
      { key: "manual_drying", icon: "mdi:heat-wave", entity: `button.${prefix}_manual_drying` },
      { key: "base_station_cleaning", icon: "mdi:spray-bottle", entity: `button.${prefix}_base_station_cleaning` },
      { key: "start_auto_empty", icon: "mdi:delete-empty-outline", entity: `button.${prefix}_start_auto_empty` }
    ];
    return config;
  }
  // not "isPanel": Home Assistant sets that property on cards in panel views
  get panelLayout() {
    return this.config?.layout === "panel";
  }
  stylesForConfig() {
    return this.panelLayout ? [artStyles, panelStyles] : [artStyles, tileStyles2];
  }
  watchedEntities() {
    if (!this.config) return [];
    return [this.config.entity, ...Object.values(this.entities), ...this.stationActions.map((action) => action.entity)];
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearTimeout(this.confirmTimer);
    window.clearTimeout(this.pressedTimer);
  }
  // ---------- texts ----------
  t(key, params = {}) {
    return this.localize(`vacuum.${key}`, params);
  }
  // name of a configured or default item: own name, else the translation of its key, else the key
  itemName(item, group) {
    if (item.name) return item.name;
    const id = String(item.key ?? item.value ?? "");
    const key = `${group}.${id}`;
    const text = this.t(key);
    return text === `vacuum.${key}` ? id : text;
  }
  get locale() {
    return this.hass?.locale?.language || this.language;
  }
  // ---------- state helpers ----------
  stateOf(entityId) {
    return this.hass?.states[entityId];
  }
  get vacuumAttributes() {
    return this.stateOf(this.config.entity)?.attributes || {};
  }
  // config name, otherwise the entity id in readable form ("vacuum.robot" -> "Robot")
  deviceName() {
    if (typeof this.config.name === "string" && this.config.name) return this.config.name;
    const objectId = this.config.entity.split(".")[1] || "";
    return objectId.charAt(0).toUpperCase() + objectId.slice(1).split("_").join(" ");
  }
  // rooms of the selected map as the integration reports them
  mapRooms() {
    const attributes = this.vacuumAttributes;
    const rooms = attributes.rooms || {};
    return rooms[attributes.selected_map] || Object.values(rooms)[0] || [];
  }
  // a room by segment id or by name
  findRoom(rooms, key) {
    return rooms.find((room) => room.id === Number(key)) || rooms.find((room) => String(room.name).toLowerCase() === String(key).toLowerCase());
  }
  configuredRooms() {
    return this.config.rooms?.map((entry) => typeof entry === "object" ? entry : { id: entry });
  }
  // rooms in config order (rooms that do not fit the map are left out, so a button never cleans
  // the wrong room), otherwise all rooms of the map in the cleaning sequence
  rooms() {
    const mapRooms = this.mapRooms();
    const configured = this.configuredRooms();
    if (configured) {
      const issueIds = this.roomIssues().map((issue) => issue.id);
      return configured.flatMap((room) => {
        if (issueIds.includes(Number(room.id))) return [];
        const known = this.findRoom(mapRooms, room.id);
        return known ? [{ id: known.id, name: room.name || known.name, icon: room.icon || known.icon || "mdi:floor-plan" }] : [];
      });
    }
    const sequence = this.vacuumAttributes.cleaning_sequence || [];
    const position = (id) => sequence.indexOf(id) < 0 ? 999 : sequence.indexOf(id);
    return [...mapRooms].sort((first, second) => position(first.id) - position(second.id)).map((room) => ({ id: room.id, name: room.name, icon: room.icon || "mdi:floor-plan" }));
  }
  // configured rooms that do not fit the current map: the id is missing, or it belongs to another room
  // whose name differs while the configured name exists on the map under another id (map recreated);
  // a renamed room (own name that is not on the map) is no issue
  roomIssues() {
    const configured = this.configuredRooms();
    const mapRooms = this.mapRooms();
    if (!configured || !mapRooms.length) return [];
    const sameName = (first, second) => String(first).toLowerCase() === String(second).toLowerCase();
    return configured.flatMap((room) => {
      const id = Number(room.id);
      const known = mapRooms.find((mapRoom) => mapRoom.id === id);
      const byName = room.name ? mapRooms.find((mapRoom) => sameName(mapRoom.name, room.name)) : void 0;
      if (!known)
        return [{ id, name: room.name || this.t("room", { id }), text: this.t("roomMissing", { id }), newId: byName?.id }];
      if (room.name && !sameName(known.name, room.name) && byName && byName.id !== id)
        return [{ id, name: room.name, text: this.t("roomChanged", { id, name: known.name }), newId: byName.id }];
      return [];
    });
  }
  roomName(id) {
    return this.findRoom(this.rooms(), id)?.name || "";
  }
  currentMode() {
    if (this.chosenMode) return this.chosenMode;
    const selectState = this.stateOf(this.entities.mode)?.state;
    if (selectState && selectState !== "unavailable") return selectState;
    return vacuumModeKeys[this.vacuumAttributes.cleaning_mode] || "";
  }
  currentSuction() {
    return this.chosenSuction || this.stateOf(this.entities.suction)?.state || "";
  }
  currentBoost() {
    if (this.chosenBoost !== void 0) return this.chosenBoost;
    return this.stateOf(this.entities.boost)?.state === "on";
  }
  modeName(value) {
    const mode = this.modes.find((item) => item.value === value);
    if (mode) return this.itemName(mode, "modes");
    return knownModes.includes(value) ? this.t(`modes.${value}`) : "";
  }
  formatDuration(minutes) {
    const total = Math.max(0, Math.round(minutes));
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    if (hours === 0) return this.t("minutes", { minutes: rest });
    return rest ? this.t("hoursMinutes", { hours, minutes: rest }) : this.t("hours", { hours });
  }
  formatLastCleaning() {
    const value = this.stateOf(this.entities.history)?.state;
    const date = value ? new Date(value) : void 0;
    if (!date || isNaN(date.getTime())) return "";
    const time = date.toLocaleTimeString(this.locale, { hour: "2-digit", minute: "2-digit" });
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const days = Math.round((today.getTime() - day.getTime()) / 864e5);
    if (days === 0) return this.t("today", { time });
    if (days === 1) return this.t("yesterday", { time });
    if (days < 7) return `${date.toLocaleDateString(this.locale, { weekday: "short" }).split(".").join("")} ${time}`;
    return date.toLocaleDateString(this.locale, { day: "numeric", month: "numeric" });
  }
  stationValue(raw) {
    if (raw === void 0 || raw === null || raw === "") return "";
    const key = stationStates[String(raw).toLowerCase()];
    return key ? this.t(`station.${key}`) : String(raw).toLowerCase();
  }
  // maintenance items with remaining life; due at or below the threshold
  wearItems() {
    const attributes = this.vacuumAttributes;
    const threshold = Number(this.config.maintenance_threshold ?? 10);
    return this.maintenance.flatMap((item) => {
      const left = attributes[`${item.key}_left`];
      if (left === void 0) return [];
      const hours = attributes[`${item.key}_time_left`];
      const name = this.itemName(item, "maintenance");
      const dueKey = `maintenanceDue.${item.key}`;
      const ownDue = item.name ? void 0 : this.t(dueKey);
      const dueText = item.due || (ownDue && ownDue !== `vacuum.${dueKey}` ? ownDue : this.t("due", { name }));
      return [{ key: item.key, reset: item.reset, name, left: Number(left), hours: hours === void 0 ? null : Number(hours), due: Number(left) <= threshold, dueText }];
    });
  }
  // hints for the tile chip (only shown while not cleaning)
  hints() {
    const attributes = this.vacuumAttributes;
    const hints = [];
    if (attributes.low_water) hints.push(this.t("refillWater"));
    const dirty = this.stationValue(attributes.dirty_water_tank_status);
    if (dirty && dirty !== this.t("station.ok")) hints.push(`${this.t("dirtyWater")} ${dirty}`);
    const due = this.wearItems().filter((item) => item.due);
    if (due.length === 1) hints.push(due[0].dueText);
    else if (due.length > 1) hints.push(this.t("maintenanceCount", { count: due.length }));
    return hints;
  }
  // what the robot is doing: text, animation classes and quick control
  status() {
    const entity = this.stateOf(this.config.entity);
    if (!entity || entity.state === "unavailable" || entity.state === "unknown")
      return { key: "offline", art: "offline sleep", title: this.t("states.offline"), subtitle: "", active: false };
    const attributes = entity.attributes;
    const battery = attributes.battery ?? attributes.battery_level;
    const batteryText = battery !== void 0 ? this.t("battery", { battery }) : "";
    const mode = vacuumModeKeys[attributes.cleaning_mode] || this.stateOf(this.entities.mode)?.state || "";
    const mopping = mode !== "" && mode !== "sweeping";
    const progressParts = [this.modeName(mode)];
    if (attributes.cleaning_progress) progressParts.push(`${attributes.cleaning_progress} %`);
    if (attributes.cleaned_area) progressParts.push(`${attributes.cleaned_area} m\xB2`);
    const progressText = progressParts.filter(Boolean).join(" \xB7 ");
    const currentRoom = attributes.current_segment ? this.roomName(attributes.current_segment) : "";
    if (attributes.has_error || entity.state === "error") {
      const description = this.stateOf(this.entities.error)?.attributes?.description || attributes.error || "";
      return { key: "error", art: "err", title: this.t("states.error"), subtitle: description, active: false, hint: this.t("states.error") };
    }
    if (attributes.returning_to_wash)
      return { key: "returning", art: "return", title: this.t("states.returningToWash"), subtitle: progressText, active: true, control: "pause" };
    if (attributes.washing || attributes.washing_paused)
      return {
        key: "washing",
        art: "wash docked",
        title: attributes.washing_paused ? this.t("states.washingPaused") : this.t("states.washing"),
        subtitle: attributes.started ? `${this.t("intermediateWash")} \xB7 ${progressText}` : batteryText,
        active: true,
        progress: attributes.started ? attributes.cleaning_progress : null
      };
    if (attributes.returning || entity.state === "returning")
      return { key: "returning", art: "return", title: this.t("states.returning"), subtitle: progressText || batteryText, active: true, control: "pause" };
    if (attributes.paused || entity.state === "paused")
      return {
        key: "paused",
        art: "",
        title: this.t("states.paused"),
        subtitle: [currentRoom, progressText].filter(Boolean).join(" \xB7 "),
        active: true,
        control: "resume",
        progress: attributes.cleaning_progress
      };
    if (attributes.running || entity.state === "cleaning")
      return {
        key: "cleaning",
        art: `run${mopping ? " mopping" : ""}`,
        title: currentRoom || this.t("states.cleaning"),
        subtitle: progressText,
        active: true,
        control: "pause",
        progress: attributes.cleaning_progress
      };
    if (attributes.drying) {
      const left = Number(this.stateOf(this.entities.dryingLeft)?.state ?? attributes.drying_left);
      return {
        key: "drying",
        art: "dry docked",
        title: this.t("states.drying"),
        subtitle: left > 0 ? this.t("remaining", { duration: this.formatDuration(left) }) : batteryText,
        active: false
      };
    }
    if (attributes.charging)
      return { key: "charging", art: "charge", title: this.t("states.charging"), subtitle: batteryText, active: false };
    const last = this.formatLastCleaning();
    return {
      key: "ready",
      art: `${attributes.docked ? "docked " : ""}sleep`,
      title: this.t("states.ready"),
      subtitle: [batteryText, last].filter(Boolean).join(" \xB7 "),
      active: false
    };
  }
  // ---------- actions ----------
  async callService(domain, service, data, entityId) {
    this.errorText = "";
    try {
      await this.hass.callService(domain, service, data, { entity_id: entityId });
    } catch (error) {
      this.errorText = error?.message || this.t("actionFailed");
      throw error;
    }
  }
  // service call whose error is only shown below the start button
  run(domain, service, data, entityId) {
    this.callService(domain, service, data, entityId).catch(() => void 0);
  }
  openPanel() {
    const path = this.config.navigation_path;
    if (path) {
      history.pushState(null, "", path);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
    } else {
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: this.config.entity }, bubbles: true, composed: true }));
    }
  }
  onTileKey(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.openPanel();
  }
  onControl(event, control) {
    event.stopPropagation();
    this.run("vacuum", control === "resume" ? "start" : "pause", {}, this.config.entity);
  }
  // applies mode, suction and boost if they were changed in the panel, then cleans the selected rooms
  async startCleaning() {
    if (this.selected.length === 0) return;
    try {
      if (this.chosenMode && this.chosenMode !== this.stateOf(this.entities.mode)?.state)
        await this.callService("select", "select_option", { option: this.chosenMode }, this.entities.mode);
      if (this.chosenSuction && this.chosenSuction !== this.stateOf(this.entities.suction)?.state)
        await this.callService("select", "select_option", { option: this.chosenSuction }, this.entities.suction);
      if (this.chosenBoost !== void 0 && this.chosenBoost !== (this.stateOf(this.entities.boost)?.state === "on"))
        await this.callService("switch", this.chosenBoost ? "turn_on" : "turn_off", {}, this.entities.boost);
      await this.callService("dreame_vacuum", "vacuum_clean_segment", { segments: [...this.selected] }, this.config.entity);
      this.selected = [];
      this.chosenMode = void 0;
      this.chosenSuction = void 0;
      this.chosenBoost = void 0;
    } catch {
    }
  }
  onStart(status) {
    if (status.control === "pause" && status.key !== "returning") this.run("vacuum", "pause", {}, this.config.entity);
    else if (status.control === "resume") this.run("vacuum", "start", {}, this.config.entity);
    else this.startCleaning();
  }
  // preset rooms by id, by shown name or by the name of the integration
  presetRooms(preset) {
    const rooms = this.rooms();
    const mapRooms = this.mapRooms();
    return (preset.rooms || []).flatMap((key) => {
      const room = this.findRoom(rooms, key) || this.findRoom(mapRooms, key);
      return room ? [room.id] : [];
    });
  }
  presetMatches(preset) {
    const rooms = this.presetRooms(preset);
    if (rooms.length !== this.selected.length || !rooms.every((id) => this.selected.includes(id))) return false;
    if (preset.mode && preset.mode !== this.currentMode()) return false;
    if (preset.suction && preset.suction !== this.currentSuction()) return false;
    return true;
  }
  choosePreset(preset) {
    this.selected = this.presetRooms(preset);
    if (preset.mode) this.chosenMode = preset.mode;
    if (preset.suction) this.chosenSuction = preset.suction;
  }
  toggleRoom(id) {
    this.selected = this.selected.includes(id) ? this.selected.filter((room) => room !== id) : [...this.selected, id];
  }
  toggleAllRooms() {
    const all = this.rooms().map((room) => room.id);
    this.selected = this.selected.length === all.length ? [] : all;
  }
  // two taps: the first one asks for confirmation
  onReset(entityId) {
    window.clearTimeout(this.confirmTimer);
    if (this.confirmReset === entityId) {
      this.confirmReset = void 0;
      this.run("button", "press", {}, entityId);
      return;
    }
    this.confirmReset = entityId;
    this.confirmTimer = window.setTimeout(() => {
      this.confirmReset = void 0;
    }, confirmMilliseconds);
  }
  async onPress(entityId) {
    try {
      await this.callService("button", "press", {}, entityId);
    } catch {
      return;
    }
    this.pressedAction = entityId;
    window.clearTimeout(this.pressedTimer);
    this.pressedTimer = window.setTimeout(() => {
      this.pressedAction = void 0;
    }, pressedMilliseconds);
  }
  // ---------- rendering ----------
  willUpdate(changed) {
    super.willUpdate(changed);
    const issues = this.panelLayout && this.hass ? this.roomIssues() : [];
    if (issues.length && issues.length !== this.warnedIssues) console.warn("graphite-vacuum: room ids do not match the map", issues);
    this.warnedIssues = issues.length;
  }
  render() {
    if (!this.config || !this.hass) return A;
    return this.panelLayout ? this.renderPanel() : this.renderTile();
  }
  renderArt(status) {
    return b2`<div class="art ${status.art}">${robotArt}</div>`;
  }
  renderTile() {
    const status = this.status();
    const hasProgress = status.active && status.progress !== void 0 && status.progress !== null;
    const progress = Math.min(100, Math.max(0, Number(status.progress) || 0));
    const hints = hintStates.includes(status.key) ? status.hint ? [status.hint] : this.hints() : [];
    return b2`
      <ha-card class=${status.active ? "active" : ""} role="button" tabindex="0" @click=${this.openPanel} @keydown=${this.onTileKey}>
        ${this.renderArt(status)}
        <div class="text">
          ${this.config.name === false ? A : b2`<div class="name">${this.deviceName()}</div>`}
          <div class="title">${status.title}</div>
          <div class="subtitle">${status.subtitle}</div>
          ${hasProgress ? b2`<div class="progress"><div style="width: ${progress}%"></div></div>` : A}
        </div>
        ${status.control ? b2`<button class="control" aria-label=${status.control === "resume" ? this.t("resume") : this.t("pause")}
              @click=${(event) => this.onControl(event, status.control)}>
              <ha-icon icon=${status.control === "resume" ? "mdi:play" : "mdi:pause"}></ha-icon>
            </button>` : hints.length ? b2`<span class="pill" title=${hints.join(", ")}>${hints[0]}</span>` : A}
      </ha-card>
    `;
  }
  renderPanel() {
    const status = this.status();
    return b2`
      <div class="columns ${this.config.panels === false ? "plain" : ""}">
        <div class="column">${this.renderCleaning(status)}</div>
        <div class="column">${this.renderStation(status)}</div>
      </div>
    `;
  }
  renderCleaning(status) {
    const config = this.config;
    const presets = config.presets || [];
    const rooms = this.rooms();
    const mode = this.currentMode();
    const suction = this.currentSuction();
    const boost = this.currentBoost();
    const boostName = config.boost_name || "Max+";
    const hasBoost = config.boost !== false && !!this.stateOf(this.entities.boost);
    const allSelected = rooms.length > 0 && this.selected.length === rooms.length;
    const issues = this.roomIssues();
    return b2`
      <div class="panelTitle">${config.cleaning_title || this.t("cleaningTitle")}</div>
      ${presets.length ? b2`
          <div class="label">${config.presets_title || this.t("presetsTitle")}</div>
          <div class="presets">
            ${presets.map((preset) => b2`
              <button class="preset ${this.presetMatches(preset) ? "selected" : ""}" @click=${() => this.choosePreset(preset)}>
                ${preset.icon ? b2`<ha-icon icon=${preset.icon}></ha-icon>` : A}<span>${preset.name}</span>
              </button>`)}
          </div>` : A}
      <div class="label">${this.t("mode")}</div>
      <div class="modes">
        ${this.modes.map((item) => b2`
          <button class="mode ${item.value === mode ? "selected" : ""}" @click=${() => {
      this.chosenMode = item.value;
    }}>
            ${item.icon ? b2`<ha-icon icon=${item.icon}></ha-icon>` : A}<span>${this.itemName(item, "modes")}</span>
          </button>`)}
      </div>
      <div class="label">${this.t("suction")}</div>
      <div class="suctions ${hasBoost ? "" : "noBoost"}" style="--suctionCount: ${this.suctionLevels.length}">
        ${this.suctionLevels.map((level) => b2`
          <button class="suction ${level.value === suction ? "selected" : ""}" @click=${() => {
      this.chosenSuction = level.value;
    }}>
            ${this.itemName(level, "suctionLevels")}
          </button>`)}
        ${hasBoost ? b2`<button class="boost ${boost ? "on" : ""}" aria-pressed=${boost ? "true" : "false"} @click=${() => {
      this.chosenBoost = !this.currentBoost();
    }}>${boostName}</button>` : A}
      </div>
      ${hasBoost ? b2`<div class="hint">${this.t(boost ? "boostActive" : "boostHint", { name: boostName })}</div>` : A}
      <div class="label">
        ${this.t("rooms")}
        <button @click=${this.toggleAllRooms}>${allSelected ? this.t("selectNone") : this.t("selectAll")}</button>
      </div>
      ${issues.length ? this.renderRoomIssues(issues) : A}
      <div class="rooms">
        ${rooms.map((room) => {
      const order = this.selected.indexOf(room.id);
      return b2`
            <button class="room ${order >= 0 ? "selected" : ""}" aria-pressed=${order >= 0 ? "true" : "false"} @click=${() => this.toggleRoom(room.id)}>
              <ha-icon icon=${room.icon}></ha-icon><span>${room.name}</span>${order >= 0 ? b2`<span class="order">${order + 1}</span>` : A}
            </button>`;
    })}
      </div>
      ${this.renderStartRow(status)}
      ${this.errorText ? b2`<div class="error">${this.errorText}</div>` : A}
    `;
  }
  renderRoomIssues(issues) {
    return b2`
      <div class="roomWarning">
        <ha-icon icon="ic:twotone-warning-amber"></ha-icon>
        <div>
          <strong>${this.t("roomIssuesTitle")}</strong>
          ${issues.map((issue) => b2`<span>${issue.name}: ${issue.text}${issue.newId !== void 0 ? ` ${this.t("roomNewId", { id: issue.newId })}` : ""}</span>`)}
          <span>${this.t("roomIssuesHint")}</span>
        </div>
      </div>
    `;
  }
  renderStartRow(status) {
    let text;
    let idle = false;
    if (status.control === "pause" && status.key !== "returning") text = this.t("pause");
    else if (status.control === "resume") text = this.t("resume");
    else if (this.selected.length) text = this.selected.length === 1 ? this.t("cleanOneRoom") : this.t("cleanRooms", { count: this.selected.length });
    else {
      text = this.t("chooseRooms");
      idle = true;
    }
    return b2`
      <div class="startRow">
        <button class="start ${idle ? "idle" : ""}" ?disabled=${idle} @click=${() => this.onStart(status)}>${text}</button>
        <button class="toStation" aria-label=${this.t("toStation")} title=${this.t("toStation")}
          @click=${() => this.run("vacuum", "return_to_base", {}, this.config.entity)}>
          <ha-icon icon="mdi:home-import-outline"></ha-icon>
        </button>
      </div>
    `;
  }
  // robot state, battery, station (one line when everything is fine, otherwise what needs attention), last cleaning
  facts(status) {
    const attributes = this.vacuumAttributes;
    const battery = attributes.battery ?? attributes.battery_level;
    const facts = [b2`<b>${status.title}</b>`];
    if (status.subtitle && status.key !== "ready") facts.push(status.subtitle);
    if (battery !== void 0) facts.push(this.t("battery", { battery }));
    const ok = this.t("station.ok");
    const stationParts = [
      [this.t("freshWater"), attributes.low_water ? this.t("station.empty") : this.stationValue(attributes.clean_water_tank_status)],
      [this.t("dirtyWater"), this.stationValue(attributes.dirty_water_tank_status)],
      [this.t("dustBag"), this.stationValue(attributes.dust_bag_status)]
    ];
    const known = stationParts.filter(([, value]) => value);
    const issues = known.filter(([, value]) => value !== ok);
    if (issues.length) facts.push(...issues.map(([name, value]) => b2`<span class="warn">${name} ${value}</span>`));
    else if (known.length) facts.push(this.t("stationOk"));
    const last = this.formatLastCleaning();
    if (last) facts.push(this.t("lastCleaning", { time: last }));
    return facts;
  }
  renderStation(status) {
    const actions = this.stationActions.filter((action) => this.stateOf(action.entity));
    return b2`
      <div class="panelTitle">${this.config.station_title || this.t("stationTitle")}</div>
      <div class="robotInfo">
        ${this.renderArt(status)}
        <div class="facts">${this.facts(status).map((fact, index) => b2`${index ? b2`<br>` : A}${fact}`)}</div>
      </div>
      ${this.wearItems().map((item) => this.renderWear(item))}
      ${actions.length ? b2`<div class="actions">${actions.map((action) => {
      const done = this.pressedAction === action.entity;
      return b2`
            <button class="action ${done ? "done" : ""}" ?disabled=${this.stateOf(action.entity)?.state === "unavailable"} @click=${() => this.onPress(action.entity)}>
              ${action.icon ? b2`<ha-icon icon=${done ? "mdi:check" : action.icon}></ha-icon>` : A}
              <span>${this.itemName(action, "actions")}</span>
            </button>`;
    })}</div>` : A}
    `;
  }
  renderWear(item) {
    const confirming = this.confirmReset === item.reset;
    const value = item.due && item.reset ? b2`<button class="reset ${confirming ? "confirm" : ""}" @click=${() => this.onReset(item.reset)}>
          ${confirming ? this.t("confirmReset") : this.t("reset")}
        </button>` : b2`<span class="value">${item.left} %${item.hours !== null ? ` \xB7 ${item.hours} h` : ""}</span>`;
    return b2`
      <div class="wear ${item.due ? "due" : ""}">
        <div class="name">${item.name}</div>
        ${value}
        <div class="line"><div style="width: ${Math.max(2, Math.min(100, item.left))}%"></div></div>
      </div>
    `;
  }
  getCardSize() {
    return this.panelLayout ? 8 : 2;
  }
  getGridOptions() {
    return this.panelLayout ? { columns: 12, rows: "auto" } : { columns: 12, rows: "auto", min_rows: 2 };
  }
  static getStubConfig() {
    return { entity: "vacuum.robot" };
  }
  static async getConfigElement() {
    return document.createElement("graphite-vacuum-editor");
  }
};
GraphiteVacuum.properties = {
  ...GraphiteCard.properties,
  selected: { state: true },
  chosenMode: { state: true },
  chosenSuction: { state: true },
  chosenBoost: { state: true },
  confirmReset: { state: true },
  pressedAction: { state: true },
  errorText: { state: true }
};
GraphiteVacuum.styles = artStyles;
registerElement("graphite-vacuum-editor", GraphiteVacuumEditor);
registerCard("graphite-vacuum", GraphiteVacuum, {
  name: "Graphite Vacuum",
  description: "Robot vacuum (Dreame) as animated tile and as panel with quick picks, rooms and maintenance."
});

// src/core/calendar.ts
var cache2 = {};
var refreshMs2 = 5 * 60 * 1e3;
var dayMs2 = 864e5;
function startOfDay2(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
function daysBetween(from, to) {
  return Math.round((startOfDay2(to).getTime() - startOfDay2(from).getTime()) / dayMs2);
}
function parseDate(value) {
  const parts = String(value).substring(0, 10).split("-").map(Number);
  return parts.length === 3 && parts.every(Number.isFinite) ? new Date(parts[0], parts[1] - 1, parts[2]) : null;
}
function parseMoment(value) {
  if (!value) return null;
  if (typeof value === "object" && value.date) {
    const date2 = parseDate(value.date);
    return date2 ? { date: date2, allDay: true } : null;
  }
  const raw = typeof value === "object" ? value.dateTime : value;
  if (typeof raw === "string" && raw.length === 10) {
    const date2 = parseDate(raw);
    return date2 ? { date: date2, allDay: true } : null;
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : { date, allDay: false };
}
function toEvent(entityId, raw) {
  const start = parseMoment(raw?.start);
  if (!start) return null;
  const end = parseMoment(raw?.end);
  const fallbackEnd = start.allDay ? addDays(start.date, 1) : start.date;
  const endDate = end && end.date.getTime() > start.date.getTime() ? end.date : fallbackEnd;
  return {
    entityId,
    summary: String(raw.summary ?? ""),
    description: raw.description || void 0,
    location: raw.location || void 0,
    start: start.date,
    end: endDate,
    allDay: start.allDay
  };
}
function calendarEvents(hass, entityId, start, end, onLoaded) {
  const key = `${entityId}|${start.getTime()}|${end.getTime()}`;
  const entry = cache2[key];
  const api = hass;
  const isFresh = entry && Date.now() - entry.fetchedAt < refreshMs2;
  if (entry?.pending) {
    entry.pending.then(onLoaded);
  } else if (!isFresh && api.callApi) {
    const path = `calendars/${entityId}?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;
    const pending = api.callApi("GET", path).then((events) => {
      const list = (Array.isArray(events) ? events : []).map((event) => toEvent(entityId, event)).filter((event) => !!event);
      cache2[key] = { events: list, fetchedAt: Date.now() };
    }).catch(() => {
      cache2[key] = { events: entry?.events ?? [], fetchedAt: Date.now() };
    });
    cache2[key] = { events: entry?.events, fetchedAt: entry?.fetchedAt ?? 0, pending };
    pending.then(onLoaded);
  }
  return cache2[key]?.events;
}

// src/cards/lists/calendar-styles.ts
var calendarStyles = i`
  :host {
    display: block;
  }
  :host([hidden-empty]) {
    display: none;
  }
  .day {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin: 14px 0 6px;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 18px;
    color: var(--graphite-text-secondary);
  }
  .day.first {
    margin-top: 0;
  }
  .day b {
    font-weight: 500;
    color: var(--graphite-text-primary);
  }
  .day.today b {
    color: var(--graphite-accent);
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: var(--graphite-gap-tile, 8px);
  }
  .event {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    min-height: var(--graphite-row-height, 60px);
    padding: 9px 0;
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
    overflow: hidden;
    cursor: pointer;
    outline: none;
    -webkit-tap-highlight-color: transparent;
    --event-color: var(--graphite-accent);
  }
  .event:focus-visible {
    box-shadow: inset 0 0 0 2px var(--graphite-accent);
  }
  .event::before {
    content: "";
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--event-color);
  }
  .icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    margin: 0 9px;
    color: var(--event-color);
    --mdc-icon-size: var(--graphite-row-icon-size, 24px);
  }
  .text {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .name {
    font-size: var(--graphite-font-name-size, 15px);
    line-height: 18px;
    color: var(--graphite-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sub {
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 15px;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .when {
    flex: none;
    margin-left: auto;
    padding: 0 14px 0 12px;
    text-align: right;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 18px;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
  }
  .when .time {
    font-size: var(--graphite-font-name-size, 15px);
    color: var(--graphite-text-primary);
  }
  .when .hint {
    display: block;
  }
  .event.highlight {
    background: color-mix(in srgb, var(--event-color) 16%, var(--graphite-card-surface, var(--graphite-surface-tile)));
  }
  .event.highlight .when {
    color: var(--event-color);
  }
  .event.running .when .time {
    color: var(--graphite-accent);
  }
  .event.past {
    opacity: 0.45;
  }
  .event.past .name {
    text-decoration: line-through;
    text-decoration-color: color-mix(in srgb, var(--graphite-ink) 50%, transparent);
  }
  .more {
    margin-top: 10px;
    text-align: center;
    font-size: var(--graphite-font-caption-size, 12px);
    color: var(--graphite-text-muted);
  }
  .empty {
    display: flex;
    align-items: center;
    min-height: var(--graphite-row-height, 60px);
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
    font-size: 14px;
    color: var(--graphite-text-secondary);
  }
  .empty .icon {
    color: var(--graphite-success);
  }
  /* details of an event: native dialog, so it sits above pop-ups and transformed parents */
  dialog {
    box-sizing: border-box;
    width: min(420px, calc(100vw - 32px));
    padding: 20px;
    border: none;
    border-radius: var(--graphite-radius-panel, 20px);
    background: var(--graphite-surface-panel);
    color: var(--graphite-text-primary);
    font-family: inherit;
    --event-color: var(--graphite-accent);
  }
  dialog::backdrop {
    background: var(--graphite-overlay, rgba(0, 0, 0, 0.6));
    backdrop-filter: blur(10px);
  }
  .dialog-head {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .dialog-head .icon {
    margin: 0;
    width: 24px;
    height: 24px;
  }
  .dialog-title {
    flex: 1;
    font-size: var(--graphite-title-size, 18px);
    line-height: 24px;
  }
  .close {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin: -6px -6px 0 0;
    border: none;
    border-radius: var(--graphite-radius-tile, 12px);
    background: var(--graphite-surface-tile);
    color: var(--graphite-text-primary);
    cursor: pointer;
    --mdc-icon-size: 20px;
  }
  .details {
    display: grid;
    grid-template-columns: 20px 1fr;
    gap: 10px 12px;
    margin-top: 16px;
    font-size: 14px;
    line-height: 20px;
    color: var(--graphite-text-secondary);
    --mdc-icon-size: 18px;
  }
  .details ha-icon {
    color: var(--graphite-text-muted);
  }
  .details .description {
    white-space: pre-line;
    color: var(--graphite-text-primary);
  }
`;

// src/cards/lists/graphite-calendar-editor.ts
var GraphiteCalendarEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "calendar.editor";
  }
  schemaKey() {
    return String(this.config.range ?? "this_and_next_week");
  }
  schema() {
    const range = this.config.range ?? "this_and_next_week";
    return [
      { name: "calendars", required: true, selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "range", selector: { select: { mode: "dropdown", options: ["today", "this_week", "this_and_next_week", "days"].map((value) => ({ value, label: this.optionLabel(`range.${value}`) })) } } },
          ...range === "days" ? [{ name: "days", selector: { number: { mode: "box", min: 1, max: 120 } } }] : [],
          { name: "max_items", selector: { number: { mode: "box", min: 1, max: 100 } } }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "secondary", selector: { select: { mode: "dropdown", options: ["calendar_location", "calendar", "location", "description", "none"].map((value) => ({ value, label: this.optionLabel(`secondary.${value}`) })) } } },
          { name: "highlight_days", selector: { number: { mode: "box", min: 0, max: 60 } } }
        ]
      },
      { name: "show_past_today", selector: { boolean: {} } },
      { name: "rules", selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "empty_text", selector: { text: {} } },
          { name: "hide_empty", selector: { boolean: {} } }
        ]
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } }
    ];
  }
};

// src/cards/lists/graphite-calendar.ts
var refreshInterval2 = 60 * 1e3;
var defaultIcon = "mdi:calendar-blank-outline";
var lineBreak = String.fromCharCode(10);
var GraphiteCalendar = class extends GraphiteCard {
  constructor() {
    super(...arguments);
    this.pressedIndex = -1;
    this.pointerUsed = false;
    this.shown = [];
    this.rememberRow = (event) => {
      const row = event.composedPath().find((element) => element instanceof HTMLElement && element.dataset.index !== void 0);
      this.pressedIndex = row instanceof HTMLElement ? Number(row.dataset.index) : -1;
      this.pointerUsed = true;
    };
  }
  normalizeConfig(config) {
    const calendars = config.calendars ?? (config.entity ? [config.entity] : []);
    if (!Array.isArray(calendars) || calendars.length === 0) throw new Error(`${this.localName}: 'calendars' is required`);
    return {
      range: "this_and_next_week",
      show_past_today: true,
      secondary: "calendar_location",
      highlight_days: 7,
      tap_action: { action: "more-info" },
      hold_action: { action: "more-info" },
      ...config,
      calendars
    };
  }
  sources() {
    return this.config.calendars.map((source) => typeof source === "string" ? { entity: source } : source).filter((source) => !!source?.entity);
  }
  watchedEntities() {
    return this.sources().map((source) => source.entity);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("pointerdown", this.rememberRow, true);
    this.detachActions = attachActionHandler(this, {
      hasHold: () => this.pressedIndex >= 0 && hasAction(this.config?.hold_action),
      hasDoubleTap: () => false
    }, (action) => this.handleAction(action));
    this.refreshTimer = window.setInterval(() => this.requestUpdate(), refreshInterval2);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("pointerdown", this.rememberRow, true);
    this.detachActions?.();
    this.detachActions = void 0;
    window.clearInterval(this.refreshTimer);
  }
  handleAction(action) {
    const config = this.config;
    let index = this.pressedIndex;
    const focused = this.shadowRoot?.activeElement;
    if (!this.pointerUsed && focused instanceof HTMLElement && focused.dataset.index !== void 0) index = Number(focused.dataset.index);
    const event = this.shown[index];
    this.pressedIndex = -1;
    this.pointerUsed = false;
    if (!config || !event) return;
    const actionConfig = config[`${action}_action`];
    if (!hasAction(actionConfig)) return;
    if (action === "tap" && actionConfig.action === "more-info") {
      this.openDetails(event);
      return;
    }
    fireAction(this, { ...config, entity: event.entityId }, action);
  }
  openDetails(event) {
    this.selected = event;
    this.requestUpdate();
    this.updateComplete.then(() => {
      const dialog = this.shadowRoot?.querySelector("dialog");
      if (dialog && !dialog.open) dialog.showModal();
    });
  }
  closeDetails() {
    this.shadowRoot?.querySelector("dialog")?.close();
  }
  // range [today 00:00, end) of the configured period
  rangeEnd(today) {
    const config = this.config;
    const toMonday = (8 - today.getDay()) % 7 || 7;
    if (config.range === "today") return addDays(today, 1);
    if (config.range === "this_week") return addDays(today, toMonday);
    if (config.range === "days") return addDays(today, Math.max(1, Math.round(Number(config.days) || 14)));
    return addDays(today, toMonday + 7);
  }
  matchRule(summary) {
    const title = summary.toLocaleLowerCase();
    return (this.config.rules ?? []).find((rule) => {
      if (rule.starts_with && title.startsWith(String(rule.starts_with).toLocaleLowerCase())) return true;
      return !!rule.contains && title.includes(String(rule.contains).toLocaleLowerCase());
    });
  }
  // all events of the range, decorated and sorted; undefined while nothing is loaded yet
  collect(today, end) {
    const config = this.config;
    const now = /* @__PURE__ */ new Date();
    const highlightDays = Number.isFinite(Number(config.highlight_days)) ? Number(config.highlight_days) : 7;
    let loaded = false;
    const events = [];
    for (const source of this.sources()) {
      const list = this.hass ? calendarEvents(this.hass, source.entity, today, end, () => this.requestUpdate()) : void 0;
      if (!list) continue;
      loaded = true;
      const stateObj = this.hass?.states[source.entity];
      const calendarName = source.name ?? stateObj?.attributes?.friendly_name ?? source.entity;
      for (const event of list) {
        if (event.end.getTime() <= today.getTime() || event.start.getTime() >= end.getTime()) continue;
        const past = event.end.getTime() <= now.getTime();
        if (past && !config.show_past_today) continue;
        const rule = this.matchRule(event.summary);
        const day = event.start.getTime() < today.getTime() ? today : startOfDay2(event.start);
        const daysAhead = daysBetween(today, day);
        const lastDay = event.allDay ? addDays(event.end, -1) : event.end;
        events.push({
          ...event,
          day,
          color: rule?.color ?? source.color ?? "var(--graphite-accent)",
          icon: rule?.icon ?? source.icon ?? stateObj?.attributes?.icon ?? defaultIcon,
          calendarName,
          past,
          running: !past && !event.allDay && event.start.getTime() <= now.getTime(),
          highlight: !past && !!(rule?.highlight ?? source.highlight) && daysAhead <= highlightDays,
          multiDay: daysBetween(event.start, lastDay) > 0
        });
      }
    }
    if (!loaded) return void 0;
    return events.sort((first, second) => first.day.getTime() - second.day.getTime() || Number(first.allDay) - Number(second.allDay) || first.start.getTime() - second.start.getTime() || first.summary.localeCompare(second.summary));
  }
  time(date) {
    return date.toLocaleTimeString(this.language, { hour: "2-digit", minute: "2-digit" });
  }
  weekday(date) {
    return date.toLocaleDateString(this.language, { weekday: "short" }).replace(".", "");
  }
  date(date) {
    return date.toLocaleDateString(this.language, { day: "numeric", month: "short" });
  }
  // "Fr 13. Nov."
  longDate(date) {
    return `${this.weekday(date)} ${this.date(date)}`;
  }
  lastDay(event) {
    return event.allDay ? addDays(event.end, -1) : event.end;
  }
  renderDayHeader(day, today, nextMonday, isFirst, marksNextWeek) {
    const offset = daysBetween(today, day);
    const weekday = day.toLocaleDateString(this.language, { weekday: "long" });
    const date = day.toLocaleDateString(this.language, { day: "numeric", month: "long" });
    const label = offset === 0 ? this.localize("calendar.today") : offset === 1 ? this.localize("calendar.tomorrow") : weekday;
    const rest = offset <= 1 ? `${weekday} ${date}` : date;
    const nextWeek = marksNextWeek && day.getTime() >= nextMonday.getTime();
    return b2`<div class=${["day", isFirst ? "first" : "", offset === 0 ? "today" : ""].filter(Boolean).join(" ")}><b>${label}</b>
      ${rest}${nextWeek ? b2`<span>· ${this.localize("calendar.nextWeek")}</span>` : A}</div>`;
  }
  secondaryText(event) {
    const mode = this.config.secondary;
    const parts = [];
    if (mode === "calendar" || mode === "calendar_location") parts.push(event.calendarName);
    if ((mode === "location" || mode === "calendar_location") && event.location) parts.push(event.location);
    if (mode === "description" && event.description) parts.push(event.description.split(lineBreak)[0]);
    if (mode !== "none" && event.multiDay) parts.push(this.localize("calendar.until", { date: this.longDate(this.lastDay(event)) }));
    return parts.join(" \xB7 ");
  }
  renderWhen(event, today) {
    let hint = "";
    if (event.past) hint = this.localize("calendar.past");
    else if (event.highlight) {
      const days = daysBetween(today, event.day);
      if (days === 1) hint = this.localize("calendar.inOneDay");
      else if (days > 1) hint = this.localize("calendar.inDays", { days });
    }
    let main;
    if (event.multiDay) {
      main = this.localize("calendar.days", { days: daysBetween(event.start, this.lastDay(event)) + 1 });
    } else if (event.allDay) {
      main = this.localize("calendar.allDay");
    } else {
      const range = !hint && event.end.getTime() > event.start.getTime() ? `${this.time(event.start)}\u2013${this.time(event.end)}` : this.time(event.start);
      main = b2`<span class="time">${range}</span>`;
    }
    return b2`<div class="when">${main}${hint ? b2`<span class="hint">${hint}</span>` : A}</div>`;
  }
  renderEvent(event, index, today) {
    const secondary = this.secondaryText(event);
    const classes = ["event", event.past ? "past" : "", event.running ? "running" : "", event.highlight ? "highlight" : ""].filter(Boolean).join(" ");
    return b2`<div class=${classes} style=${`--event-color: ${event.color}`} data-index=${index} role="button" tabindex="0"
      aria-label=${event.summary}><div class="icon"><ha-icon .icon=${event.icon}></ha-icon></div><div class="text"><div
      class="name">${event.summary}</div>${secondary ? b2`<div class="sub">${secondary}</div>` : A}</div>${this.renderWhen(event, today)}</div>`;
  }
  renderDetails() {
    const event = this.selected;
    if (!event) return b2`<dialog></dialog>`;
    const lastDay = this.lastDay(event);
    let when;
    if (event.allDay) {
      when = event.multiDay ? `${this.longDate(event.start)} \u2013 ${this.longDate(lastDay)}` : `${this.longDate(event.start)}, ${this.localize("calendar.allDay")}`;
    } else if (event.multiDay) {
      when = `${this.longDate(event.start)} ${this.time(event.start)} \u2013 ${this.longDate(event.end)} ${this.time(event.end)}`;
    } else {
      when = `${this.longDate(event.start)}, ${this.time(event.start)}\u2013${this.time(event.end)}`;
    }
    return b2`<dialog style=${`--event-color: ${event.color}`} @click=${(clickEvent) => {
      if (clickEvent.target === clickEvent.currentTarget) this.closeDetails();
    }} @close=${() => {
      this.selected = void 0;
      this.requestUpdate();
    }}><div class="dialog-head"><div class="icon"><ha-icon
      .icon=${event.icon}></ha-icon></div><div class="dialog-title">${event.summary}</div><button class="close"
      aria-label=${this.localize("calendar.close")} @click=${() => this.closeDetails()}><ha-icon icon="mdi:close"></ha-icon></button></div><div
      class="details"><ha-icon icon="mdi:clock-outline"></ha-icon><div>${when}</div><ha-icon icon="mdi:calendar-blank-outline"></ha-icon><div>${event.calendarName}</div>${event.location ? b2`<ha-icon icon="mdi:map-marker-outline"></ha-icon><div>${event.location}</div>` : A}${event.description ? b2`<ha-icon icon="mdi:text"></ha-icon><div class="description">${event.description}</div>` : A}</div></dialog>`;
  }
  render() {
    const config = this.config;
    const today = startOfDay2(/* @__PURE__ */ new Date());
    const end = this.rangeEnd(today);
    const lastRangeDay = this.longDate(addDays(end, -1));
    const events = this.collect(today, end);
    const limit = Number(config.max_items) > 0 ? Math.round(Number(config.max_items)) : Infinity;
    this.shown = (events ?? []).slice(0, limit);
    const hiddenCount = (events?.length ?? 0) - this.shown.length;
    const isEmpty = !!events && events.length === 0;
    this.toggleAttribute("hidden-empty", isEmpty && !!config.hide_empty);
    if (!events) return b2``;
    if (isEmpty) {
      const text = config.empty_text ?? this.localize("calendar.empty", { date: lastRangeDay });
      return b2`<div class="empty"><div class="icon"><ha-icon icon="mdi:check-circle"></ha-icon></div>${text}</div>`;
    }
    const nextMonday = addDays(today, (8 - today.getDay()) % 7 || 7);
    const marksNextWeek = this.shown.some((event) => event.day.getTime() < nextMonday.getTime());
    const groups = [];
    this.shown.forEach((event, index) => {
      const last = groups[groups.length - 1];
      if (last && last.day.getTime() === event.day.getTime()) last.items.push({ event, index });
      else groups.push({ day: event.day, items: [{ event, index }] });
    });
    let markedNextWeek = false;
    return b2`${groups.map((group, groupIndex) => {
      const marks = marksNextWeek && !markedNextWeek && group.day.getTime() >= nextMonday.getTime();
      if (marks) markedNextWeek = true;
      return b2`${this.renderDayHeader(group.day, today, nextMonday, groupIndex === 0, marks)}<div class="list">${group.items.map((item) => this.renderEvent(item.event, item.index, today))}</div>`;
    })}${hiddenCount > 0 ? b2`<div class="more">${this.localize("calendar.more", { count: hiddenCount, date: lastRangeDay })}</div>` : A}${this.renderDetails()}`;
  }
  getCardSize() {
    return Math.max(2, this.shown.length + 1);
  }
  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }
  static getStubConfig(hass) {
    const calendars = Object.keys(hass?.states ?? {}).filter((id) => id.startsWith("calendar.")).slice(0, 1);
    return { calendars, range: "this_and_next_week", max_items: 10 };
  }
  static async getConfigElement() {
    return document.createElement("graphite-calendar-editor");
  }
};
GraphiteCalendar.styles = calendarStyles;
registerElement("graphite-calendar-editor", GraphiteCalendarEditor);
registerCard("graphite-calendar", GraphiteCalendar, {
  name: "Graphite Calendar",
  description: "Events of one or more calendars, grouped by day, with color and icon per calendar or keyword."
});

// src/core/graphite-range.ts
var knobSize = 16;
var minTickGap = 12;
var quarterTicks = [0, 0.25, 0.5, 0.75, 1].map((share) => ({ share, major: share === 0 || share === 0.5 || share === 1 }));
var GraphiteRange = class extends i4 {
  constructor() {
    super();
    this.dragging = false;
    // the parent card must not see the gesture (e.g. the light tile toggles on tap)
    this.stop = (event) => event.stopPropagation();
    this.onPointerDown = (event) => {
      event.stopPropagation();
      if (this.disabled || event.button !== 0) return;
      this.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      this.dragShare = this.shareAt(event);
      this.emit("range-input", this.dragShare);
    };
    this.onPointerMove = (event) => {
      if (!this.dragging) return;
      this.dragShare = this.shareAt(event);
      this.emit("range-input", this.dragShare);
    };
    this.onPointerUp = (event) => {
      event.stopPropagation();
      if (!this.dragging) return;
      this.dragging = false;
      const share = this.shareAt(event);
      this.emit("range-change", share);
      this.dragShare = share;
    };
    this.onPointerCancel = () => {
      this.dragging = false;
      this.dragShare = void 0;
    };
    this.onKeyDown = (event) => {
      if (this.disabled) return;
      let share = this.shownShare;
      if (event.key === "ArrowRight" || event.key === "ArrowUp") share += this.keyStep;
      else if (event.key === "ArrowLeft" || event.key === "ArrowDown") share -= this.keyStep;
      else if (event.key === "Home") share = 0;
      else if (event.key === "End") share = 1;
      else return;
      event.preventDefault();
      event.stopPropagation();
      share = this.snapped(Math.min(1, Math.max(0, share)));
      this.dragShare = share;
      this.emit("range-change", share);
    };
    this.label = "";
    this.valueText = "";
    this.share = 0;
    this.mode = "fill";
    this.track = "";
    this.disabled = false;
    this.compact = false;
    this.stepTicks = [];
    this.tickMode = "auto";
    this.snap = true;
    this.areaWidth = 0;
    this.keyStep = 0.01;
  }
  connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (Math.abs(width - this.areaWidth) >= 1) this.areaWidth = width;
    });
    this.updateComplete.then(() => {
      const area = this.renderRoot.querySelector(".area");
      if (area && this.resizeObserver) this.resizeObserver.observe(area);
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = void 0;
  }
  ticks() {
    if (this.tickMode === "none") return [];
    if (this.markTicks?.length) return this.markTicks;
    if (this.tickMode === "quarters") return quarterTicks;
    const steps = this.stepTicks ?? [];
    if (this.tickMode === "steps") return steps;
    const gaps = steps.length - 1;
    if (gaps >= 1 && this.areaWidth > 0 && this.areaWidth / gaps >= minTickGap) return steps;
    return quarterTicks;
  }
  get shownShare() {
    const share = this.dragShare ?? this.share;
    return Number.isFinite(share) ? Math.min(1, Math.max(0, share)) : 0;
  }
  shareAt(event) {
    const area = this.renderRoot.querySelector(".area");
    const rect = area.getBoundingClientRect();
    const share = rect.width > 0 ? Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) : 0;
    return this.snapped(share);
  }
  // nearest possible value while dragging, so the knob never rests between two steps
  snapped(share) {
    const points = this.snap ? this.stepTicks ?? [] : [];
    if (points.length < 2) return share;
    let best = points[0].share;
    for (const point of points) if (Math.abs(point.share - share) < Math.abs(best - share)) best = point.share;
    return best;
  }
  emit(name, share) {
    this.dispatchEvent(new CustomEvent(name, { detail: { share }, bubbles: true, composed: true }));
  }
  // a new state from Home Assistant replaces the dragged position
  willUpdate(changed) {
    if (changed.has("share") && !this.dragging) this.dragShare = void 0;
  }
  render() {
    const share = this.shownShare;
    const position = `calc(${share * 100}%)`;
    return b2`<div class="labels"><span class="label">${this.label}</span><span class="value">${this.valueText}</span></div><div
      class=${this.mode === "color" ? "track color" : "track"} style=${this.mode === "color" && this.track ? `--range-color-track: ${this.track}` : A}></div><div class="area" role="slider" tabindex=${this.disabled ? "-1" : "0"}
      aria-label=${this.label} aria-valuemin="0" aria-valuemax="100" aria-valuenow=${Math.round(share * 100)}
      aria-valuetext=${this.valueText || A} aria-disabled=${this.disabled ? "true" : "false"}
      @pointerdown=${this.onPointerDown} @pointermove=${this.onPointerMove} @pointerup=${this.onPointerUp}
      @pointercancel=${this.onPointerCancel} @click=${this.stop} @dblclick=${this.stop} @keydown=${this.onKeyDown}>${this.ticks().map((tick) => b2`<div class=${tick.major ? "tick major" : "tick"} style=${`left: ${tick.share * 100}%`}></div>`)}${this.mode === "fill" ? b2`<div class="fill" style=${`width: calc(${position} + ${knobSize / 2}px)`}></div>` : A}<div class="knob"
      style=${`left: ${position}`}></div></div>`;
  }
};
GraphiteRange.properties = {
  label: {},
  valueText: { attribute: false },
  share: { type: Number },
  mode: {},
  track: {},
  disabled: { type: Boolean, reflect: true },
  compact: { type: Boolean, reflect: true },
  stepTicks: { attribute: false },
  markTicks: { attribute: false },
  snap: { type: Boolean },
  tickMode: {},
  areaWidth: { state: true },
  keyStep: { type: Number, attribute: false },
  dragShare: { state: true }
};
GraphiteRange.styles = i`
    :host {
      display: block;
      position: relative;
      height: 42px;
      --range-track: var(--graphite-slider-track, color-mix(in srgb, var(--graphite-ink) 16%, var(--graphite-card-surface, var(--graphite-surface-tile))));
      --range-fill: var(--graphite-slider-fill, var(--graphite-accent));
      -webkit-tap-highlight-color: transparent;
    }
    :host([compact]) {
      height: 20px;
    }
    :host([compact]) .labels {
      display: none;
    }
    :host([compact]) .area {
      top: 0;
    }
    .labels {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      height: 16px;
      font-size: var(--graphite-font-caption-size, 12px);
      line-height: 16px;
      color: var(--graphite-slider-text, var(--graphite-text-secondary));
      white-space: nowrap;
    }
    .label {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .track {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 8px;
      height: 4px;
      border-radius: 2px;
      background: var(--range-track);
    }
    .track.color {
      background: var(--range-color-track);
    }
    /* touch area: inset by half a knob */
    .area {
      position: absolute;
      left: ${knobSize / 2}px;
      right: ${knobSize / 2}px;
      top: 22px;
      height: 20px;
      cursor: pointer;
      touch-action: pan-y;
      outline: none;
    }
    :host([disabled]) .area {
      cursor: default;
    }
    .area:focus-visible .knob {
      box-shadow: 0 0 0 2px var(--graphite-accent), 0 1px 4px rgba(0, 0, 0, 0.5);
    }
    /* fill from the left edge to the knob center */
    .fill {
      position: absolute;
      left: -${knobSize / 2}px;
      top: 8px;
      height: 4px;
      border-radius: 2px;
      background: var(--range-fill);
    }
    /* ticks below the track, like a ruler; round values (and both ends) longer */
    .tick {
      position: absolute;
      top: 14px;
      width: 1px;
      height: 3px;
      margin-left: -0.5px;
      border-radius: 1px;
      background: var(--graphite-slider-tick, var(--graphite-text-muted));
      pointer-events: none;
    }
    .tick.major {
      height: 5px;
      background: var(--graphite-slider-tick-major, var(--graphite-text-secondary));
    }
    .knob {
      position: absolute;
      top: 2px;
      width: ${knobSize}px;
      height: ${knobSize}px;
      margin-left: -${knobSize / 2}px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    }
  `;
if (!customElements.get("graphite-range")) customElements.define("graphite-range", GraphiteRange);

// src/cards/controls/graphite-slider-editor.ts
var GraphiteSliderEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "slider.editor";
  }
  isLight() {
    return String(this.config.entity ?? "").startsWith("light.");
  }
  skipValue(key, value) {
    return key === "layout" && value === "inline";
  }
  schemaKey() {
    return `${this.isLight()}|${this.config.attribute ?? "brightness"}`;
  }
  schema() {
    const attribute = this.config.attribute ?? "brightness";
    const lightFields = [
      { name: "attribute", selector: { select: { mode: "dropdown", options: ["brightness", "color_temp", "hue", "saturation"].map((value) => ({ value, label: this.optionLabel(`attributes.${value}`) })) } } },
      ...attribute === "brightness" ? [{ name: "allow_off", selector: { boolean: {} } }] : []
    ];
    const numberFields = [
      { name: "value_format", selector: { select: { mode: "dropdown", options: ["percent", "state"].map((value) => ({ value, label: this.optionLabel(`valueFormat.${value}`) })) } } }
    ];
    return [
      { name: "entity", required: true, selector: { entity: { domain: ["number", "input_number", "light"] } } },
      { name: "layout", selector: { select: { mode: "list", options: ["inline", "row"].map((value) => ({ value, label: this.optionLabel(`layouts.${value}`) })) } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }
        ]
      },
      ...this.isLight() ? lightFields : numberFields,
      {
        type: "grid",
        name: "",
        schema: [
          { name: "min", selector: { number: { mode: "box", step: "any" } } },
          { name: "max", selector: { number: { mode: "box", step: "any" } } },
          { name: "step", selector: { number: { mode: "box", step: "any" } } }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "ticks", selector: { select: { mode: "dropdown", options: ["auto", "steps", "quarters", "none"].map((value) => ({ value, label: this.optionLabel(`tickModes.${value}`) })) } } },
          { name: "tick_every", selector: { number: { mode: "box", step: "any" } } },
          { name: "major_every", selector: { number: { mode: "box", step: "any" } } }
        ]
      }
    ];
  }
};

// src/cards/controls/graphite-slider.ts
var colorModes = ["hs", "xy", "rgb", "rgbw", "rgbww"];
var hueTrack = "linear-gradient(90deg, #f00, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00)";
var whiteTrack = "linear-gradient(90deg, rgb(210, 231, 255), rgb(243, 247, 255) 35%, rgb(255, 241, 224) 65%, rgb(255, 181, 107))";
var GraphiteSlider = class extends GraphiteCard {
  constructor() {
    super(...arguments);
    this.onInput = (event) => {
      const model = this.model();
      if (!model) return;
      this.dragValue = this.valueOf(model, event.detail.share);
      this.requestUpdate();
    };
    this.onChange = (event) => {
      const model = this.model();
      if (!model || !this.hass) return;
      const value = this.valueOf(model, event.detail.share);
      const entity = this.config.entity;
      const target = { entity_id: entity };
      if (this.isLight()) {
        const attributes = this.hass.states[entity]?.attributes ?? {};
        const hs = attributes.hs_color ?? [0, 100];
        const attribute = this.attribute();
        if (attribute === "color_temp") this.hass.callService("light", "turn_on", { color_temp_kelvin: value }, target);
        else if (attribute === "hue") {
          this.setHue = value;
          this.hass.callService("light", "turn_on", { hs_color: [value % 360, hs[1] || 100] }, target);
        } else if (attribute === "saturation") this.hass.callService("light", "turn_on", { hs_color: [hs[0] ?? 0, value] }, target);
        else if (value <= 0) this.hass.callService("light", "turn_off", {}, target);
        else this.hass.callService("light", "turn_on", { brightness_pct: value }, target);
      } else {
        const domain = entity.split(".")[0] === "input_number" ? "input_number" : "number";
        this.hass.callService(domain, "set_value", { value }, target);
      }
      this.dragValue = value;
      this.requestUpdate();
    };
  }
  pinnedHue(hue) {
    if (!Number.isFinite(hue) || this.setHue === void 0) return hue;
    const distance = Math.abs(((hue - this.setHue) % 360 + 540) % 360 - 180);
    if (distance <= 1) return this.setHue;
    this.setHue = void 0;
    return hue;
  }
  normalizeConfig(config) {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return config;
  }
  isLight() {
    return this.config.entity.startsWith("light.");
  }
  attribute() {
    return this.config.attribute ?? "brightness";
  }
  configNumber(key, fallback) {
    const value = Number(this.config[key]);
    return this.config[key] !== void 0 && Number.isFinite(value) ? value : fallback;
  }
  lightModel(stateObj) {
    const attributes = stateObj.attributes;
    const isOn = stateObj.state === "on";
    const modes = attributes.supported_color_modes ?? [];
    const attribute = this.attribute();
    if (attribute === "color_temp") {
      const min = this.configNumber("min", Number(attributes.min_color_temp_kelvin ?? 2e3));
      const max = this.configNumber("max", Number(attributes.max_color_temp_kelvin ?? 6500));
      return {
        min,
        max,
        step: this.configNumber("step", 50),
        value: Number(attributes.color_temp_kelvin ?? NaN),
        reversed: true,
        mode: "color",
        track: whiteTrack,
        supported: modes.includes("color_temp")
      };
    }
    const hs = attributes.hs_color;
    if (attribute === "hue") {
      return {
        min: 0,
        max: 360,
        step: this.configNumber("step", 1),
        value: this.pinnedHue(Number(hs?.[0] ?? NaN)),
        reversed: false,
        mode: "color",
        track: hueTrack,
        supported: modes.some((mode) => colorModes.includes(mode))
      };
    }
    if (attribute === "saturation") {
      const hue = Number(hs?.[0] ?? 0);
      return {
        min: 0,
        max: 100,
        step: this.configNumber("step", 1),
        value: Number(hs?.[1] ?? NaN),
        reversed: false,
        mode: "color",
        track: `linear-gradient(90deg, #fff, hsl(${hue}, 100%, 50%))`,
        supported: modes.some((mode) => colorModes.includes(mode))
      };
    }
    const allowOff = !!this.config.allow_off;
    const brightness = isOn ? Math.round(Number(attributes.brightness ?? 0) / 2.55) : 0;
    return {
      min: this.configNumber("min", allowOff ? 0 : 1),
      max: this.configNumber("max", 100),
      step: this.configNumber("step", 1),
      value: brightness,
      reversed: false,
      mode: "fill",
      track: "",
      supported: true
    };
  }
  model() {
    const stateObj = this.hass?.states[this.config.entity];
    if (!stateObj) return null;
    const model = this.isLight() ? this.lightModel(stateObj) : {
      min: this.configNumber("min", Number(stateObj.attributes.min ?? 0)),
      max: this.configNumber("max", Number(stateObj.attributes.max ?? 100)),
      step: this.configNumber("step", Number(stateObj.attributes.step ?? 1)),
      value: parseFloat(stateObj.state),
      reversed: false,
      mode: "fill",
      track: "",
      supported: true
    };
    if (!(model.max > model.min)) model.max = model.min + 1;
    if (!(model.step > 0)) model.step = 1;
    return model;
  }
  decimals(step) {
    const text = String(step);
    return text.includes(".") ? text.split(".")[1].length : 0;
  }
  // value of a share: whole multiples of the step, kept inside min and max
  valueOf(model, share) {
    const position = model.reversed ? 1 - share : share;
    const raw = model.min + position * (model.max - model.min);
    const stepped = Math.round(raw / model.step) * model.step;
    return Number(Math.min(model.max, Math.max(model.min, stepped)).toFixed(this.decimals(model.step)));
  }
  shareOf(model, value) {
    if (!Number.isFinite(value)) return 0;
    const share = Math.min(1, Math.max(0, (value - model.min) / (model.max - model.min)));
    return model.reversed ? 1 - share : share;
  }
  valueText(model, value) {
    if (!Number.isFinite(value)) return "";
    if (this.isLight()) {
      const attribute = this.attribute();
      if (attribute === "color_temp") return `${Math.round(value)} K`;
      if (attribute === "hue") return `${Math.round(value)}\xB0`;
      return `${Math.round(value)} %`;
    }
    if (this.config.value_format === "state") {
      const stateObj = this.hass.states[this.config.entity];
      return this.hass?.formatEntityState?.(stateObj, String(value)) ?? String(value);
    }
    return `${Math.round((value - model.min) / (model.max - model.min) * 100)} %`;
  }
  // a round multiple of the step for the longer ticks: 60 for minutes, otherwise the smallest nice
  // number that gives at most 10 intervals
  majorEvery(model) {
    const configured = Number(this.config.major_every);
    if (configured > 0) return configured;
    const isMultiple = (value) => Math.abs(value / model.step - Math.round(value / model.step)) < 1e-6;
    const unit = this.hass?.states[this.config.entity]?.attributes?.unit_of_measurement;
    if (unit === "min" && isMultiple(60)) return 60;
    const span = model.max - model.min;
    for (let magnitude = 1e-3; magnitude <= 1e6; magnitude *= 10) {
      for (const factor of [1, 2, 2.5, 5]) {
        const candidate = Number((factor * magnitude).toPrecision(6));
        if (candidate >= model.step && isMultiple(candidate) && span / candidate <= 10) return candidate;
      }
    }
    return span;
  }
  // one tick per step (whole multiples of the step, like the values) plus both ends
  stepTicks(model) {
    const span = model.max - model.min;
    const count = Math.floor(model.max / model.step) - Math.ceil(model.min / model.step) + 1;
    if (count > 400) return [];
    const major = this.majorEvery(model);
    const ticks = [{ share: 0, major: true }];
    for (let index = Math.ceil(model.min / model.step); index <= Math.floor(model.max / model.step); index++) {
      const value = index * model.step;
      const share = (value - model.min) / span;
      if (share <= 1e-6 || share >= 1 - 1e-6) continue;
      const ratio = value / major;
      ticks.push({ share: model.reversed ? 1 - share : share, major: Math.abs(ratio - Math.round(ratio)) < 1e-6 });
    }
    ticks.push({ share: 1, major: true });
    return ticks;
  }
  // ticks every tick_every (independent of the step) plus both ends; long ticks every major_every
  // (default: five ticks)
  markTicks(model) {
    const every = Number(this.config.tick_every);
    if (!(every > 0)) return void 0;
    const span = model.max - model.min;
    if (span / every > 400) return void 0;
    const major = Number(this.config.major_every) > 0 ? Number(this.config.major_every) : every * 5;
    const ticks = [{ share: 0, major: true }];
    for (let index = Math.ceil(model.min / every); index <= Math.floor(model.max / every); index++) {
      const value = index * every;
      const share = (value - model.min) / span;
      if (share <= 1e-6 || share >= 1 - 1e-6) continue;
      const ratio = value / major;
      ticks.push({ share: model.reversed ? 1 - share : share, major: Math.abs(ratio - Math.round(ratio)) < 1e-6 });
    }
    ticks.push({ share: 1, major: true });
    return ticks;
  }
  label(stateObj) {
    const config = this.config;
    if (config.name) return config.name;
    if (this.isLight()) return this.localize(`slider.${this.attribute()}`);
    return stateObj?.attributes?.friendly_name ?? config.entity;
  }
  render() {
    const config = this.config;
    const stateObj = this.hass?.states[config.entity];
    const model = this.model();
    const offline = isUnavailable(stateObj);
    const usable = !!model && !offline && model.supported;
    this.toggleAttribute("inactive", !usable);
    this.style.setProperty("--graphite-slider-fill", this.isLight() && stateObj?.state !== "on" ? "var(--graphite-text-muted)" : "");
    if (this.dragValue !== void 0 && model && Math.abs(model.value - this.dragValue) < model.step / 2) this.dragValue = void 0;
    const value = this.dragValue ?? model?.value ?? NaN;
    const range = model ? Math.abs(model.max - model.min) : 1;
    const isRow = config.layout === "row";
    const valueText = model && usable ? this.valueText(model, value) : "";
    this.toggleAttribute("on", this.isLight() && stateObj?.state === "on");
    const slider = b2`<graphite-range .label=${isRow ? "" : this.label(stateObj)} .valueText=${isRow ? "" : valueText}
      .share=${model ? this.shareOf(model, model.value) : 0} .keyStep=${model ? model.step / range : 0.01}
      .mode=${model?.mode ?? "fill"} .track=${model?.track ?? ""} ?disabled=${!usable} ?compact=${isRow}
      .stepTicks=${model ? this.stepTicks(model) : []} .markTicks=${model ? this.markTicks(model) : void 0}
      .tickMode=${config.ticks ?? "auto"}
      @range-input=${this.onInput} @range-change=${this.onChange}></graphite-range>`;
    const icon = config.icon ? b2`<div class="icon"><ha-icon .icon=${config.icon}></ha-icon></div>` : isRow ? b2`<div class="icon"><ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon></div>` : A;
    if (isRow) {
      return b2`<div class="row"><div class="head">${icon}<div class="name">${this.label(stateObj)}</div><div
        class="value">${valueText}</div></div>${slider}</div>`;
    }
    return b2`<div class="inline">${icon}${slider}</div>`;
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 3 };
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("number.") || id.startsWith("input_number.")) ?? "";
    return { entity };
  }
  static async getConfigElement() {
    return document.createElement("graphite-slider-editor");
  }
};
GraphiteSlider.styles = i`
    :host {
      display: block;
    }
    .inline {
      display: flex;
      align-items: center;
      padding-top: 4px;
    }
    .inline graphite-range {
      flex: 1;
      min-width: 0;
    }
    /* row: 72px like the compact tiles; icon centered on the left, name and value in the first line,
       the slider below the name (text and slider at 60px) */
    .row {
      box-sizing: border-box;
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr) auto;
      grid-template-rows: 24px 20px;
      row-gap: 4px;
      column-gap: 10px;
      padding: 12px 14px 12px 8px;
      border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
      background: var(--graphite-card-surface, var(--graphite-surface-tile));
    }
    .head {
      display: contents;
    }
    /* icon box like the rows: 42px */
    .icon {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      color: var(--graphite-text-secondary);
      --mdc-icon-size: var(--graphite-row-icon-size, 24px);
    }
    .inline .icon {
      margin-right: 6px;
    }
    .row .icon {
      grid-row: 1 / 3;
      grid-column: 1;
      align-self: center;
    }
    :host([on]) .icon {
      color: var(--graphite-accent);
    }
    .name {
      min-width: 0;
      align-self: center;
      font-size: var(--graphite-font-name-size, 15px);
      line-height: 18px;
      color: var(--graphite-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .row .name {
      grid-row: 1;
      grid-column: 2;
    }
    .value {
      align-self: center;
      margin-left: 12px;
      font-size: var(--graphite-font-name-size, 15px);
      line-height: 18px;
      color: var(--graphite-text-secondary);
      white-space: nowrap;
    }
    .row .value {
      grid-row: 1;
      grid-column: 3;
    }
    .row graphite-range {
      grid-row: 2;
      grid-column: 2 / 4;
    }
    :host([inactive]) graphite-range,
    :host([inactive]) .value {
      opacity: 0.5;
    }
  `;
registerElement("graphite-slider-editor", GraphiteSliderEditor);
registerCard("graphite-slider", GraphiteSlider, {
  name: "Graphite Slider",
  description: "A single slider without a surface: number, input_number, or brightness, white temperature, hue or saturation of a light."
});

// src/cards/controls/graphite-light-editor.ts
var GraphiteLightEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "light.editor";
  }
  defaults() {
    return { since_line: true, unavailable_sliders: "show", show_sliders: true };
  }
  schemaKey() {
    return String(this.config.show_sliders !== false);
  }
  schema() {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "light" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }
        ]
      },
      { name: "show_sliders", selector: { boolean: {} } },
      ...this.config.show_sliders === false ? [] : [
        { name: "sliders", selector: { select: { multiple: true, mode: "list", options: ["brightness", "color_temp", "hue", "saturation"].map((value) => ({ value, label: this.optionLabel(`attributes.${value}`) })) } } },
        { name: "unavailable_sliders", selector: { select: { mode: "dropdown", options: ["show", "hide"].map((value) => ({ value, label: this.optionLabel(`unavailableSliders.${value}`) })) } } }
      ],
      {
        type: "grid",
        name: "",
        schema: [
          { name: "allow_off", selector: { boolean: {} } },
          { name: "wall_switch", selector: { boolean: {} } }
        ]
      },
      { name: "since_line", selector: { boolean: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } }
    ];
  }
};

// src/cards/controls/graphite-light.ts
var sliderOrder = ["brightness", "color_temp", "hue", "saturation"];
var lightStyles = i`
  .row.light {
    display: block;
    height: auto;
    padding: 12px;
  }
  /* on: soft accent tint, weaker than the switch tile (the sliders carry more surface) */
  .row.light.active {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-light-tint, 10%), var(--graphite-surface-tile-active));
  }
  .head {
    position: relative;
    display: flex;
    align-items: center;
    height: 36px;
  }
  .row.light .icon {
    margin: -3px 10px -3px -4px;
  }
  .row.light .toggle {
    margin: 0 2px 0 12px;
  }
  .row.light .offline {
    margin: 0 2px 0 auto;
  }
  /* wall switch: an icon in the toggle's place, no surface (it is no button) */
  .wall-switch {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin: 0 2px 0 12px;
    color: var(--graphite-text-secondary);
    --mdc-icon-size: 24px;
  }
  .row.light:not(.on) .wall-switch {
    opacity: 0.5;
  }
  /* sliders aligned with the name (60px) and the toggle (14px from the right) */
  .sliders {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 6px 2px 0 48px;
  }
  .row.light.unavailable .sliders {
    pointer-events: none;
  }
`;
var GraphiteLight = class extends GraphiteRow {
  get lightConfig() {
    return this.config;
  }
  defaultActions(entity) {
    return { tap_action: { action: "toggle" }, hold_action: defaultHoldAction(entity) };
  }
  normalizeConfig(config) {
    const normalized = super.normalizeConfig(config);
    if (config.wall_switch && !config.tap_action) normalized.tap_action = { action: "none" };
    return normalized;
  }
  rowClasses(stateObj) {
    const classes = super.rowClasses(stateObj);
    classes.splice(1, 0, "light");
    if (classes.includes("on") && !classes.includes("unavailable")) classes.push("active");
    return classes;
  }
  // brightness, and the white temperature when the lamp supports it. While the lamp is unreachable
  // (or off at the wall) the sliders stay locked in place, or are hidden with unavailable_sliders: hide
  sliderAttributes(stateObj) {
    if (this.lightConfig.show_sliders === false) return [];
    if (isUnavailable(stateObj) && this.lightConfig.unavailable_sliders === "hide") return [];
    const configured = this.lightConfig.sliders;
    if (Array.isArray(configured) && configured.length > 0) return sliderOrder.filter((attribute) => configured.includes(attribute));
    const modes = stateObj?.attributes?.supported_color_modes ?? [];
    const sliders = [];
    if (!modes.length || modes.some((mode) => mode !== "onoff")) sliders.push("brightness");
    if (modes.includes("color_temp")) sliders.push("color_temp");
    return sliders;
  }
  renderEnd(stateObj) {
    if (this.config.wall_switch) {
      return b2`<div class="wall-switch"><ha-icon .icon=${this.lightConfig.wall_switch_icon ?? "ic:twotone-electrical-services"}></ha-icon></div>`;
    }
    return stateObj ? b2`<div class="toggle"></div>` : A;
  }
  render() {
    const config = this.lightConfig;
    const stateObj = this.hass?.states[config.entity];
    const unavailable = this.unavailable(stateObj);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const since = this.sinceLine(stateObj);
    const interactive = this.isInteractive(stateObj);
    const sliders = this.sliderAttributes(stateObj);
    return b2`<div class=${this.rowClasses(stateObj).join(" ")} role=${interactive ? "button" : A}
      tabindex=${interactive ? "0" : A} aria-label=${name}>${interactive ? b2`<ha-ripple></ha-ripple>` : A}<div
      class="head"><div class="icon">${this.renderIcon(stateObj)}</div><div class="text"><div class="name">${name}</div>${since ? b2`<div class="since">${since}</div>` : A}</div>${this.renderEnd(stateObj)}<div
      class="offline">${offlineDot}<span>${this.localize("rows.offline")}</span></div></div>${sliders.length ? b2`<div class="sliders">${sliders.map((attribute) => b2`<graphite-slider .hass=${this.hass}
        .config=${{
      type: "custom:graphite-slider",
      entity: config.entity,
      attribute,
      ...attribute === "brightness" && config.allow_off ? { allow_off: true } : {},
      // ticks only for the brightness (every 10 %, long at 50 %); the color tracks speak for themselves
      ...attribute === "brightness" ? { tick_every: 10 } : { ticks: "none" }
    }}></graphite-slider>`)}</div>` : A}</div>`;
  }
  getCardSize() {
    return 1 + this.sliderAttributes(this.hass?.states[this.config.entity]).length;
  }
  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("light.")) ?? "";
    return { entity };
  }
  static async getConfigElement() {
    return document.createElement("graphite-light-editor");
  }
};
GraphiteLight.styles = [rowStyles, lightStyles];
registerElement("graphite-light-editor", GraphiteLightEditor);
registerCard("graphite-light", GraphiteLight, {
  name: "Graphite Light",
  description: "Lamp as a tile: switch row head (toggle or wall switch) with brightness and white temperature sliders."
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
