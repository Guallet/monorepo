import { Properties } from "posthog-js";
import * as PostHog from "./posthog";

export class Analytics {
  public static setIdentity(
    userId: string,
    extra: { name: string; email: string; user_id: string } | null
  ) {
    PostHog.setIdentity(userId, extra);
  }

  public static resetIdentity() {
    PostHog.resetIdentity();
  }

  public static captureEvent(
    eventName: string,
    properties: Properties | null = null
  ) {
    console.log(`Tracking event: ${eventName}`, {
      event: eventName,
      properties: properties,
    });
    PostHog.captureEvent(eventName, properties);
  }
}
