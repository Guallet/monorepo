import posthog from "posthog-js";

const isAnalyticsEnabled = import.meta.env.VITE_POSTHOG_ENABLED === "true";
const api_host = import.meta.env.VITE_POSTHOG_API_URL;
const token = import.meta.env.VITE_POSTHOG_TOKEN;

export function initializePostHog() {
  console.log("Initializing PostHog", { AnalyticsEnabled: isAnalyticsEnabled });
  posthog.init(token, {
    api_host: api_host,
    autocapture: isAnalyticsEnabled,
    capture_pageview: isAnalyticsEnabled,
    capture_pageleave: isAnalyticsEnabled,
    disable_session_recording: !isAnalyticsEnabled,

    loaded: function (posthog) {
      if (import.meta.env.DEV) {
        console.log("Posthog loaded", {
          bootstrap: posthog.config.bootstrap,
        });
      }

      if (posthog.isFeatureEnabled("autocapture-enabled")) {
        if (import.meta.env.DEV) {
          console.log("Enabling PostHog auto capture via feature flag");
        }
        posthog.config.autocapture = true;
        posthog.config.capture_pageview = true;
        posthog.config.capture_pageleave = true;
        posthog.config.disable_session_recording = false;
      }
    },
  });

  posthog.onFeatureFlags(function (featureFlags) {
    if (import.meta.env.DEV) {
      console.log("Posthog feature flags loaded", {
        featureflags: featureFlags,
      });
    }
  });
}

declare type Property = unknown;
declare type Properties = Record<string, Property>;

export async function captureEvent(
  eventName: string,
  properties: Properties | null = null
) {
  if (isAnalyticsEnabled) {
    const allProperties = { ...properties };
    posthog.capture(eventName, allProperties);
  }
}

export async function setIdentity(
  userId: string,
  extra: { name: string; email: string; user_id: string } | null
) {
  if (isAnalyticsEnabled) {
    if (extra) {
      posthog.identify(userId, extra);
    } else {
      posthog.identify(userId);
    }
  }
}

export async function resetIdentity() {
  if (isAnalyticsEnabled) {
    posthog.reset();
  }
}
