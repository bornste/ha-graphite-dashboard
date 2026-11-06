// graphite-range: the shared slider of the light tile and the slider card. A label row (label left,
// value right, 12/16px) above a thin 4px track with a round 16px knob, 42px in total like the
// Bubble sliders. The touch area (20px) is inset by half a knob, so the knob stays fully visible at
// 0 and 100 %. Fill mode: the track fills up to the knob; color mode: a color track (e.g. white
// temperature) with the knob only. Reports "range-input" while dragging and "range-change" on
// release, both with detail.share (0..1); the parent turns the share into a value.
import { css, html, LitElement, nothing } from "lit";

const knobSize = 16;
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
    const position = `calc(${share * 100}%)`;
    return html`<div class="labels"><span class="label">${this.label}</span><span class="value">${this.valueText}</span></div><div
      class=${this.mode === "color" ? "track color" : "track"} style=${this.mode === "color" && this.track
      ? `--range-color-track: ${this.track}` : nothing}></div><div class="area" role="slider" tabindex=${this.disabled ? "-1" : "0"}
      aria-label=${this.label} aria-valuemin="0" aria-valuemax="100" aria-valuenow=${Math.round(share * 100)}
      aria-valuetext=${this.valueText || nothing} aria-disabled=${this.disabled ? "true" : "false"}
      @pointerdown=${this.onPointerDown} @pointermove=${this.onPointerMove} @pointerup=${this.onPointerUp}
      @pointercancel=${this.onPointerCancel} @click=${this.stop} @dblclick=${this.stop} @keydown=${this.onKeyDown}>${this.ticks()
      .map((tick) => html`<div class=${tick.major ? "tick major" : "tick"} style=${`left: ${tick.share * 100}%`}></div>`)}${this.mode === "fill"
      ? html`<div class="fill" style=${`width: calc(${position} + ${knobSize / 2}px)`}></div>` : nothing}<div class="knob"
      style=${`left: ${position}`}></div></div>`;
  }
}

if (!customElements.get("graphite-range")) customElements.define("graphite-range", GraphiteRange);
