// graphite-calendar-event: the details of one calendar event as content of a graphite-dialog.
// graphite-calendar opens it with the dialog layer (openDetached); the texts come prepared from
// the calendar, so this element only lays them out. Not offered in the card picker.
import { css, html, LitElement, nothing } from "lit";
import { registerElement } from "../../core/register";

export interface CalendarEventDetails {
  when: string;
  calendar: string;
  icon: string;
  color: string;
  location?: string;
  description?: string;
}

export class GraphiteCalendarEvent extends LitElement {
  static properties = {
    details: { state: true },
  };

  declare details?: CalendarEventDetails;

  static styles = css`
    :host {
      display: block;
    }
    /* a panel inside the dialog, like the content of the other dialogs */
    .panel {
      display: grid;
      grid-template-columns: 20px 1fr;
      gap: 10px 12px;
      padding: 16px;
      border-radius: var(--graphite-radius-panel, 20px);
      background: var(--graphite-surface-panel);
      font-size: 14px;
      line-height: 20px;
      color: var(--graphite-text-secondary);
      --mdc-icon-size: 18px;
    }
    ha-icon {
      color: var(--graphite-text-muted);
    }
    /* the calendar row carries the icon of the event in its color */
    ha-icon.event {
      color: var(--event-color, var(--graphite-accent));
    }
    .description {
      white-space: pre-line;
      color: var(--graphite-text-primary);
    }
  `;

  setConfig(config: { details?: CalendarEventDetails }): void {
    this.details = config?.details;
  }

  // the content does not depend on states
  set hass(_hass: unknown) {}

  protected render() {
    const details = this.details;
    if (!details) return nothing;
    return html`<div class="panel" style=${`--event-color: ${details.color}`}><ha-icon icon="mdi:clock-outline"></ha-icon><div>${details.when}</div><ha-icon
      class="event" .icon=${details.icon}></ha-icon><div>${details.calendar}</div>${details.location
      ? html`<ha-icon icon="mdi:map-marker-outline"></ha-icon><div>${details.location}</div>` : nothing}${details.description
      ? html`<ha-icon icon="mdi:text"></ha-icon><div class="description">${details.description}</div>` : nothing}</div>`;
  }

  getCardSize(): number {
    return 2;
  }
}

registerElement("graphite-calendar-event", GraphiteCalendarEvent);
