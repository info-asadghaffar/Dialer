import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "NexaDial",
  slug: "nexadial",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0D0F14"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.nexadial.app",
    infoPlist: {
      NSMicrophoneUsageDescription: "Allow NexaDial to access your microphone for VoIP calls."
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0D0F14"
    },
    permissions: [
        "RECORD_AUDIO",
        "MODIFY_AUDIO_SETTINGS",
        "BLUETOOTH",
        "INTERNET"
    ],
    package: "com.nexadial.app"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    [
      "@twilio/voice-react-native-sdk",
      {
        "microphonePermission": "Allow NexaDial to access your microphone for VoIP calls."
      }
    ]
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000"
  }
});
