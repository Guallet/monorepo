import posthog from "posthog-js";

export enum FeatureFlagKeys {
  ANALYTICS_AUTOCAPTURE_ENABLED = "autocapture-enabled",
}

export class FeatureFlags {
  public static isFeatureEnabled(
    name: string | FeatureFlagKeys,
    options: { defaultValue: boolean } | null = null
  ): boolean {
    const defaultValue = options?.defaultValue ?? false;
    if (typeof name === "string") {
      return posthog.isFeatureEnabled(name) ?? defaultValue;
    } else if (isFeatureFlagKey(name)) {
      return posthog.isFeatureEnabled(name) ?? defaultValue;
    } else return defaultValue;
  }
}

function isFeatureFlagKey(name: string): name is FeatureFlagKeys {
  return Object.values(FeatureFlagKeys).includes(name as FeatureFlagKeys);
}
