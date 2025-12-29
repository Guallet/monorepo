import { vexo, identifyDevice } from 'vexo-analytics';

export const initAnalytics = () => {
  if (__DEV__) {
    console.log('Analytics disabled in development mode.');
    return;
  }

  const vexoKey = process.env.EXPO_PUBLIC_VEXO_KEY;
  if (!vexoKey) {
    console.warn('VEXO Analytics key is not set. Analytics will be disabled.');
    return;
  }
  vexo(vexoKey);
};

export const setAnalyticsDeviceId = async (id: string | null) => {
  try {
    await identifyDevice(id);
  } catch (error) {
    console.error('Failed to set device identifier in VEXO Analytics:', error);
  }
};
