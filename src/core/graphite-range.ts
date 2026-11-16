// graphite-range: the shared slider of the light tile and the slider card. A label row (label left,
// value right, 12/16px) above a 6px track with a slim handle (4 x 24px) like a large meter needle,
// 46px in total. The track is cut out on both sides of the handle (4px gap), like the ring the meter
// needle has: filled on the left, empty on the right. Ticks below the track show the steps. The touch
// area (24px) is inset by half a handle, so the handle stays inside at 0 and 100 %. Fill mode: the
// left part is filled; color mode: a color track (e.g. white temperature) runs through both parts.
// Reports "range-input" while dragging and "range-change" on release, both with detail.share (0..1);
// the parent turns the share into a value.
import { css, html, LitElement, nothing } from "lit";

const handleWidth = 4;
const handleHeight = 24;
const trackHeight = 6;
// space between the handle and the track on both sides
const handleGap = 4;
const trackTop = (handleHeight - trackHeight) / 2;
// below this distance in px the step ticks would be too dense: quarters instead
const minTickGap = 12;

export interface RangeTick {
  share: number;
  major: boolean;
}

export type TickMode = "auto" | "steps" | "quarters" | "none";

const quarterTicks: RangeTick[] = [0, 0.25, 0.5, 0.75, 1].map((share) => ({ share, major: share === 0 || share === 0.5 || share === 1 }));

export class GraphiteRange extends LitElement {
  static properties = {
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
    dragShare: { state: true },
  };

  declare label: string;
  declare valueText: string;
  declare share: number;
  declare mode: "fill" | "color";
  declare track: string;
  declare disabled: boolean;
  // without the label row (the card shows name and value itself): 20px high
  declare compact: boolean;
  // ticks of the steps (incl. both ends) and when to show them; quarters when the steps are too dense
  declare stepTicks: RangeTick[];
  declare tickMode: TickMode;
  // ticks independent of the steps (e.g. every 10 % on a 1 % slider); the knob still snaps to the steps
  declare markTicks?: RangeTick[];
  // the knob jumps from step to step (the shares of stepTicks are the possible values)
  declare snap: boolean;
  declare areaWidth: number;
  private resizeObserver?: ResizeObserver;
  // share per arrow key press
  declare keyStep: number;
  declare dragShare?: number;

  private dragging = false;

  constructor() {
    super();
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

  static styles = css`
    :host {
      display: block;
      position: relative;
      height: ${22 + handleHeight}px;
      --range-track: var(--graphite-slider-track, color-mix(in srgb, var(--graphite-ink) 16%, var(--graphite-card-surface, var(--graphite-surface-tile))));
      --range-fill: var(--graphite-slider-fill, var(--graphite-accent));
      -webkit-tap-highlight-color: transparent;
    }
    :host([compact]) {
      height: ${handleHeight}px;
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
    /* touch area: inset by half a handle; track parts, ticks and handle are placed inside it */
    .area {
      position: absolute;
      left: ${handleWidth / 2}px;
      right: ${handleWidth / 2}px;
      top: 22px;
      height: ${handleHeight}px;
      cursor: pointer;
      touch-action: pan-y;
      outline: none;
    }
    :host([disabled]) .area {
      cursor: default;
    }
    /* the two parts of the track: filled up to the handle, empty after it; round outer ends, small
       inner corners at the gap */
    .part {
      position: absolute;
      top: ${trackTop}px;
      height: ${trackHeight}px;
      background: var(--range-track);
      pointer-events: none;
    }
    .part.before {
      border-radius: ${trackHeight / 2}px 2px 2px ${trackHeight / 2}px;
    }
    .part.after {
      border-radius: 2px ${trackHeight / 2}px ${trackHeight / 2}px 2px;
    }
    .part.fill {
      background: var(--range-fill);
    }
    /* color track: one gradient over the whole width, each part shows its section of it */
    .part.color {
      background: var(--range-color-track) no-repeat;
    }
    /* ticks below the track, like a ruler; round values (and both ends) longer */
    .tick {
      position: absolute;
      top: ${trackTop + trackHeight + 3}px;
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
    /* handle: a slim bar in the color of the meter needle */
    .handle {
      position: absolute;
      top: 0;
      width: ${handleWidth}px;
      height: ${handleHeight}px;
      margin-left: -${handleWidth / 2}px;
      border-radius: ${handleWidth / 2}px;
      background: var(--graphite-slider-handle, var(--graphite-text-primary));
      pointer-events: none;
    }
    .area:focus-visible .handle {
      box-shadow: 0 0 0 2px var(--graphite-accent);
    }
  `;

  connectedCallback(): void {
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

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  private ticks(): RangeTick[] {
    if (this.tickMode === "none") return [];
    if (this.markTicks?.length) return this.markTicks;
    if (this.tickMode === "quarters") return quarterTicks;
    const steps = this.stepTicks ?? [];
    if (this.tickMode === "steps") return steps;
    // auto: every step while they are far enough apart
    const gaps = steps.length - 1;
    if (gaps >= 1 && this.areaWidth > 0 && this.areaWidth / gaps >= minTickGap) return steps;
    return quarterTicks;
  }

  private get shownShare(): number {
    const share = this.dragShare ?? this.share;
    return Number.isFinite(share) ? Math.min(1, Math.max(0, share)) : 0;
  }

  private shareAt(event: PointerEvent): number {
    const area = this.renderRoot.querySelector(".area") as HTMLElement;
    const rect = area.getBoundingClientRect();
    const share = rect.width > 0 ? Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) : 0;
    return this.snapped(share);
  }

  // nearest possible value while dragging, so the knob never rests between two steps
  private snapped(share: number): number {
    const points = this.snap ? this.stepTicks ?? [] : [];
    if (points.length < 2) return share;
    let best = points[0].share;
    for (const point of points) if (Math.abs(point.share - share) < Math.abs(best - share)) best = point.share;
    return best;
  }

  private emit(name: string, share: number): void {
    this.dispatchEvent(new CustomEvent(name, { detail: { share }, bubbles: true, composed: true }));
  }

  // the parent card must not see the gesture (e.g. the light tile toggles on tap)
  private stop = (event: Event) => event.stopPropagation();

  private onPointerDown = (event: PointerEvent) => {
    event.stopPropagation();
    if (this.disabled || event.button !== 0) return;
    this.dragging = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.dragShare = this.shareAt(event);
    this.emit("range-input", this.dragShare);
  };

  private onPointerMove = (event: PointerEvent) => {
    if (!this.dragging) return;
    this.dragShare = this.shareAt(event);
    this.emit("range-input", this.dragShare);
  };

  private onPointerUp = (event: PointerEvent) => {
    event.stopPropagation();
    if (!this.dragging) return;
    this.dragging = false;
    const share = this.shareAt(event);
    this.emit("range-change", share);
    // keep the dragged position until the new state arrives
    this.dragShare = share;
  };

  private onPointerCancel = () => {
    this.dragging = false;
    this.dragShare = undefined;
  };

  private onKeyDown = (event: KeyboardEvent) => {
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

  // a new state from Home Assistant replaces the dragged position
  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("share") && !this.dragging) this.dragShare = undefined;
  }

  protected render() {
    const share = this.shownShare;
    const width = this.areaWidth;
    const fill = this.mode === "fill";
    // in px inside the area: the handle centre and the ends of both parts (the track reaches half a
    // handle beyond the area on both sides)
    const x = share * width;
    const beforeEnd = x - handleWidth / 2 - handleGap;
    const afterStart = x + handleWidth / 2 + handleGap;
    const trackStart = -handleWidth / 2;
    const trackEnd = width + handleWidth / 2;
    const colorTrack = !fill && this.track ? this.track : "";
    // a color track keeps its full width in both parts, shifted to the part's position
    const colorStyle = (left: number) => colorTrack
      ? `--range-color-track: ${colorTrack}; background-size: ${trackEnd - trackStart}px 100%; background-position: ${trackStart - left}px 0;` : "";
    const parts = width > 0 ? html`${beforeEnd - trackStart > 0.5 ? html`<div class=${`part before${fill ? " fill" : ""}${colorTrack ? " color" : ""}`}
      style=${`left: ${trackStart}px; width: ${beforeEnd - trackStart}px; ${colorStyle(trackStart)}`}></div>` : nothing}${trackEnd - afterStart > 0.5
      ? html`<div class=${`part after${colorTrack ? " color" : ""}`}
      style=${`left: ${afterStart}px; width: ${trackEnd - afterStart}px; ${colorStyle(afterStart)}`}></div>` : nothing}` : nothing;
    return html`<div class="labels"><span class="label">${this.label}</span><span class="value">${this.valueText}</span></div><div
      class="area" role="slider" tabindex=${this.disabled ? "-1" : "0"}
      aria-label=${this.label} aria-valuemin="0" aria-valuemax="100" aria-valuenow=${Math.round(share * 100)}
      aria-valuetext=${this.valueText || nothing} aria-disabled=${this.disabled ? "true" : "false"}
      @pointerdown=${this.onPointerDown} @pointermove=${this.onPointerMove} @pointerup=${this.onPointerUp}
      @pointercancel=${this.onPointerCancel} @click=${this.stop} @dblclick=${this.stop} @keydown=${this.onKeyDown}>${parts}${this.ticks()
      .map((tick) => html`<div class=${tick.major ? "tick major" : "tick"} style=${`left: ${tick.share * 100}%`}></div>`)}${width > 0
      ? html`<div class="handle" style=${`left: ${x}px`}></div>` : nothing}</div>`;
  }
}

if (!customElements.get("graphite-range")) customElements.define("graphite-range", GraphiteRange);
