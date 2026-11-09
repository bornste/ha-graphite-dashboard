// graphite-image: action tile (e.g. start a game or an app). With an image: the picture as a
// blurred, dimmed backdrop and as a square thumbnail bottom left, no text (the name stays for screen
// readers). Without an image: the name as label. Optional busy state: accent tint and a spinner while
// the entity is on (e.g. a running script).
import { css, html, nothing, type PropertyValues } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig } from "../../core/types";
import { GraphiteImageEditor } from "./graphite-image-editor";
import { tileStyles } from "./tile-styles";

export interface ImageConfig extends GraphiteCardConfig {
  entity?: string;
  name?: string;
  image?: string;
  busy?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

// media-source images need a signed URL; signatures are short-lived, so results are cached briefly
const imageCache: Record<string, { url?: string; resolvedAt: number; pending?: Promise<string | undefined> }> = {};
const imageCacheTime = 20000;

const imageStyles = css`
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

export class GraphiteImage extends GraphiteCard<ImageConfig> {
  static styles = [tileStyles, imageStyles];

  static properties = {
    ...GraphiteCard.properties,
    imageUrl: { state: true },
  };

  declare imageUrl?: string;

  private detachActions?: () => void;
  private resolvedSource?: string;

  protected normalizeConfig(config: ImageConfig): ImageConfig {
    return { tap_action: { action: "none" }, hold_action: defaultHoldAction(config.entity), ...config };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action),
    }, (action: ActionKind) => this.handleAction(action));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = undefined;
  }

  private handleAction(action: ActionKind): void {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`] as ActionConfig | undefined)) return;
    fireAction(this, config, action);
  }

  // /local/... and http(s) images are used as they are, media-source://... is resolved once per source
  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    const source = this.config?.image?.trim() ?? "";
    if (source === this.resolvedSource || !this.hass) return;
    this.resolvedSource = source;
    if (!source.startsWith("media-source://")) {
      this.imageUrl = source || undefined;
      return;
    }
    this.imageUrl = undefined;
    this.resolveMediaSource(source).then((url) => {
      if (this.resolvedSource === source) this.imageUrl = url;
    });
  }

  private resolveMediaSource(source: string): Promise<string | undefined> {
    const cached = imageCache[source];
    if (cached?.url && Date.now() - cached.resolvedAt < imageCacheTime) return Promise.resolve(cached.url);
    if (cached?.pending) return cached.pending;
    const hass: any = this.hass;
    if (!hass?.callWS) return Promise.resolve(undefined);
    const pending: Promise<string | undefined> = hass
      .callWS({ type: "media_source/resolve_media", media_content_id: source })
      .then((result: { url: string }) => {
        const url = hass.hassUrl ? hass.hassUrl(result.url) : result.url;
        imageCache[source] = { url, resolvedAt: Date.now() };
        return url;
      })
      .catch(() => {
        imageCache[source] = { resolvedAt: 0 };
        return undefined;
      });
    imageCache[source] = { resolvedAt: 0, pending };
    return pending;
  }

  protected render() {
    const config = this.config!;
    const stateObj = config.entity ? this.hass?.states[config.entity] : undefined;
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity ?? "";
    const busy = !!config.busy && stateObj?.state === "on";
    const hasImage = !!this.imageUrl;
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", hasImage ? "has-image" : "", busy ? "busy" : "", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    return html`<div class=${classes} style=${hasImage ? `--image: url("${this.imageUrl}")` : nothing}
      role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing} aria-label=${name}>${hasImage
      ? html`<div class="backdrop"></div><div class="thumbnail"></div>` : nothing}${interactive
      ? html`<ha-ripple></ha-ripple>` : nothing}<div class="name">${name}</div>${busy
      ? html`<div class="spinner"></div>` : nothing}</div>`;
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions() {
    return { columns: 3, rows: 2, min_columns: 2 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("script.")) ?? "";
    return { entity, busy: true, tap_action: { action: "toggle" } };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-image-editor");
  }
}

registerElement("graphite-image-editor", GraphiteImageEditor);
registerCard("graphite-image", GraphiteImage, {
  name: "Graphite Image",
  description: "Action tile with a picture (blurred backdrop and thumbnail) or a label; optional busy spinner.",
});
