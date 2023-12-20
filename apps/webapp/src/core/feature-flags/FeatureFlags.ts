import posthog from "posthog-js";

export type FeatureFlagKeys = "autocapture-enabled" | "openbanking_enabled";

export class FeatureFlags {
  public static isFeatureEnabled(
    key: FeatureFlagKeys,
    options: { defaultValue: boolean } | null = null
  ): boolean {
    const defaultValue = options?.defaultValue ?? false;
    return posthog.isFeatureEnabled(key) ?? defaultValue;
  }
}
