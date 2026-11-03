// src/core/version.ts
var version = "0.5.0";

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
      variables: "CSS-Variablen (YAML, werden an die Karten im Panel vererbt)",
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
      wall_switch: "Wandschalter-Lampe (nicht erreichbar = aus)"
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
      variables: "CSS variables (YAML, inherited by the cards in the panel)",
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
      wall_switch: "Wall switch lamp (unavailable = off)"
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
    if (!customElements.get(alias)) customElements.define(alias, class extends element {
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
    { name: "variables", selector: { object: {} } }
  ];
}
var objectKeys = ["variables", "info_alert"];
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
    const { title, info, info_alert, chips, layout, columns, gap, padding, variables, min_column_width, frame } = this.config;
    this.form.data = {
      title,
      info,
      info_alert,
      chips,
      layout: layout || "vertical",
      columns,
      gap,
      padding,
      variables,
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
    for (const [name, value] of Object.entries(this.config.variables || {})) {
      this.style.setProperty(name.startsWith("--") ? name : `--${name}`, String(value));
    }
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
      --graphite-card-surface: var(--graphite-panel-child-surface, var(--graphite-surface-tile));
      --graphite-card-inner-surface: var(--graphite-panel-child-inner-surface, var(--graphite-surface-tile-active));
      --graphite-card-radius: var(--graphite-panel-child-radius, var(--graphite-radius-tile));
      --sbo-card-surface: var(--graphite-card-surface);
      --sbo-card-inner-surface: var(--graphite-card-inner-surface);
      --sbo-card-radius: var(--graphite-card-radius);
    }
    ha-card {
      background: var(--graphite-panel-surface, var(--graphite-surface-panel));
      border-radius: var(--graphite-panel-radius, var(--graphite-radius-panel));
      border: none;
      box-shadow: none;
      padding: var(--graphite-panel-padding, var(--graphite-padding-panel, 16px));
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
      gap: var(--graphite-space-header, 12px);
      margin-bottom: var(--graphite-space-header, 12px);
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
      padding-left: var(--graphite-space-header, 12px);
      position: relative;
      /* 2px more room on top for the separator line (it reads too short at cap height);
         the negative margin keeps the text on the shared baseline */
      padding-top: 2px;
      margin-top: -2px;
      font-size: var(--graphite-font-label, 13px);
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
      font-size: var(--graphite-font-label, 13px);
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
      font-size: var(--graphite-font-caption, 12px);
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
      gap: var(--graphite-panel-gap, var(--graphite-gap-tile, 8px));
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
    --mdc-icon-size: var(--graphite-icon-size, 24px);
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
    font-size: var(--graphite-font-name, 15px);
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
    font-size: var(--graphite-font-caption, 12px);
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
    font-size: var(--graphite-font-name, 15px);
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
    --mdc-icon-size: 12px;
  }
  .offline ha-icon {
    display: flex;
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
  // hand cursor, ripple and focus only when tapping does something; holding alone stays invisible
  isInteractive() {
    const config = this.config;
    return hasAction(config.tap_action) || hasAction(config.double_tap_action);
  }
  handleAction(action) {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`])) return;
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
    if (this.isInteractive()) classes.push("interactive");
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
    const interactive = this.isInteractive();
    return b2`<div class=${this.rowClasses(stateObj).join(" ")} role=${interactive ? "button" : A}
      tabindex=${interactive ? "0" : A}>${interactive ? b2`<ha-ripple></ha-ripple>` : A}<div
      class="icon">${this.renderIcon(stateObj)}</div><div class="text"><div class="name">${name}</div>${since ? b2`<div class="since">${since}</div>` : A}</div>${this.renderEnd(stateObj, unavailable)}<div
      class="offline"><ha-icon icon="mdi:wifi-off"></ha-icon><span>${this.localize("rows.offline")}</span></div></div>`;
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
    if (this.formLanguage !== language) {
      this.formLanguage = language;
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

// src/cards/rows/graphite-row-editor.ts
var GraphiteRowEditor = class extends GraphiteFormEditor {
  constructor() {
    super(...arguments);
    this.rowKind = "status";
  }
  labelPrefix() {
    return "rows.editor";
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
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
      { name: "since_line", selector: { boolean: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "since_attribute", selector: { text: {} } },
          { name: "since_attribute_label", selector: { text: {} } }
        ]
      },
      { name: "detail_entities", selector: { object: {} } },
      { name: "online_entity", selector: { entity: {} } },
      ...this.rowKind === "status" ? [{ name: "wall_switch", selector: { boolean: {} } }] : []
    ];
  }
  skipValue(key, value) {
    if (key === "detail_entities") return !Array.isArray(value) || value.length === 0;
    if (key === "wall_switch") return value !== true;
    return false;
  }
};

// src/cards/rows/graphite-status-row.ts
var GraphiteStatusRow = class extends GraphiteRow {
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
registerCard("graphite-status-row", GraphiteStatusRow, {
  name: "Graphite Status Row",
  description: 'Row with icon, name, "since" line and the state on the right.'
});

// src/cards/rows/graphite-switch-row.ts
var GraphiteSwitchRow = class extends GraphiteRow {
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
registerElement("graphite-row-editor", GraphiteRowEditor);
registerCard("graphite-switch-row", GraphiteSwitchRow, {
  name: "Graphite Switch Row",
  description: 'Row with icon, name, "since" line and a toggle; tapping the row switches.'
});

// src/cards/tiles/graphite-switch-tile-editor.ts
var GraphiteSwitchTileEditor = class extends GraphiteFormEditor {
  labelPrefix() {
    return "tiles.editor";
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
      { name: "online_entity", selector: { entity: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } }
    ];
  }
};

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
    left: 12px;
    right: 12px;
    bottom: 9px;
    font-size: var(--graphite-font-label, 13px);
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
    left: 12px;
    top: 12px;
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
    --mdc-icon-size: 12px;
  }
  .offline ha-icon {
    display: flex;
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

// src/cards/tiles/graphite-switch-tile.ts
var onlineStates2 = ["home", "on", "online", "connected"];
var GraphiteSwitchTile = class extends GraphiteCard {
  normalizeConfig(config) {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { tap_action: { action: "toggle" }, hold_action: defaultHoldAction(config.entity), ...config };
  }
  watchedEntities() {
    const config = this.config;
    return config.online_entity ? [config.entity, config.online_entity] : [config.entity];
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
  // an offline device cannot be switched: tap and double tap do nothing, holding still opens more-info
  handleAction(action) {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`])) return;
    if (action !== "hold" && isUnavailable(this.stateObj)) return;
    fireAction(this, config, action);
  }
  isInteractive(unavailable) {
    const config = this.config;
    return !unavailable && (hasAction(config.tap_action) || hasAction(config.double_tap_action));
  }
  tileClasses(stateObj, unavailable, interactive) {
    const config = this.config;
    const classes = ["tile"];
    if (interactive) classes.push("interactive");
    if (unavailable) classes.push("unavailable");
    else if (stateObj?.state === "on") {
      classes.push("on");
      if (config.online_entity) {
        const online = onlineStates2.includes(String(this.hass?.states[config.online_entity]?.state || "").toLowerCase());
        classes.push(online ? "online" : "connecting");
      }
    }
    return classes.join(" ");
  }
  renderIcon(stateObj) {
    const icon = this.config.icon;
    if (icon || !customElements.get("ha-state-icon")) {
      return b2`<ha-icon .icon=${icon || stateObj?.attributes?.icon || "mdi:toggle-switch-outline"}></ha-icon>`;
    }
    return b2`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
  }
  render() {
    const config = this.config;
    const stateObj = this.stateObj;
    const unavailable = isUnavailable(stateObj);
    const interactive = this.isInteractive(unavailable);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    return b2`<div class=${this.tileClasses(stateObj, unavailable, interactive)} role=${interactive ? "button" : A}
      tabindex=${interactive ? "0" : A} aria-label=${name}>${interactive ? b2`<ha-ripple></ha-ripple>` : A}<div
      class="watermark">${this.renderIcon(stateObj)}</div><div class="toggle"></div><div class="name">${name}</div><div
      class="offline"><ha-icon icon="mdi:wifi-off"></ha-icon><span>${this.localize("rows.offline")}</span></div></div>`;
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 3, rows: 2, min_columns: 2 };
  }
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("switch.")) ?? "";
    return { entity };
  }
  static async getConfigElement() {
    return document.createElement("graphite-switch-tile-editor");
  }
};
GraphiteSwitchTile.styles = tileStyles;
registerElement("graphite-switch-tile-editor", GraphiteSwitchTileEditor);
registerCard("graphite-switch-tile", GraphiteSwitchTile, {
  name: "Graphite Switch Tile",
  description: "Tile with toggle, name and watermark icon; tapping the tile switches. Optional online status."
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
