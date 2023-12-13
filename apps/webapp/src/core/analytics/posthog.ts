import posthog from "posthog-js";

const isEnabled = import.meta.env.VITE_POSTHOG_ENABLED;
const api_host = import.meta.env.VITE_POSTHOG_API_URL;
const token = import.meta.env.VITE_POSTHOG_TOKEN;

export function initializePostHog() {
  if (isEnabled === true) {
    console.log("Initializing PostHog");
    posthog.init(token, {
      api_host: api_host,
    });
  }
}

declare type Property = unknown;
declare type Properties = Record<string, Property>;

async function captureEvent(
  eventName: string,
  properties: Properties | null = null
) {
  if (isEnabled) {
    const allProperties = { ...properties };
    posthog.capture(eventName, allProperties);
  }
}

async function setIdentity(
  userId: string,
  extra: { name: string; email: string; user_id: string } | null
) {
  if (isEnabled) {
    if (extra) {
      posthog.identify(userId, extra);
    } else {
      posthog.identify(userId);
    }
  }
}

async function resetIdentity() {
  if (isEnabled) {
    posthog.reset();
  }
}

export class Analytics {
  public static setIdentity(
    userId: string,
    extra: { name: string; email: string; user_id: string } | null
  ) {
    console.log("Setting analytics identity", { userId, extra });
    setIdentity(userId, extra);
  }

  public static resetIdentity() {
    console.log("Resetting analytics identity");
    resetIdentity();
  }

  public static captureEvent(
    eventName: string,
    properties: Properties | null = null
  ) {
    console.log(`Tracking event: ${eventName}`, {
      event: eventName,
      properties: properties,
    });
    captureEvent(eventName, properties);
  }
}
