# Remote icon switching (the "gestor")

## What's possible — read this first

- ❌ You cannot download and apply a **new** icon image to an installed app. No OS API
  exists; iOS and Play Store forbid it.
- ✅ You can **bundle a set of alternate icons at build time** and **remotely choose which
  one is active**. The app reads a remote config value and calls the native switch API.
- Consequence: switching among **shipped** themes is remote + instant. A **new** theme means
  a new app release (it has to bundle the new image).

This is exactly how seasonal app icons work in the wild.

## The flow

```
Firebase Remote Config  ──active_icon_theme="pride"──▶  App on launch
        (the gestor)                                         │
                                                             ▼
                                        IconManager().setTheme("pride")
                                                             │
                  iOS: setAlternateIconName  ·  Android: enable activity-alias  ·  web: swap <link rel=icon>
```

## Firebase Remote Config setup (free tier, no server)

1. Create a Firebase project (free). Register the Android app (package name) and the iOS app
   (bundle id). Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS).
   — STUB: needs your Firebase project; the iOS app id eventually needs an Apple Developer
   account to ship, but you can wire and test Remote Config on the free tier.
2. Add a Remote Config parameter: key `active_icon_theme`, default `default`.
3. KMP: add `dev.gitlive:firebase-config` to commonMain and use `RemoteThemeClient` (see
   `integration/kmp/RemoteThemeClient.kt`). Native: use the platform Firebase SDKs and read
   the same key, then call the native switcher.
4. To flip the icon for everyone: change `active_icon_theme` in the console and publish. Apps
   pick it up on the next fetch (set a short `minimumFetchInterval` while testing).

## Native APIs (reference)

- **iOS** — `UIApplication.shared.setAlternateIconName(_:completion:)`. Names come from
  `CFBundleAlternateIcons` in Info.plist; the PNGs must be loose bundle files, not in the
  asset catalog. `nil` restores the primary. A system alert is shown (standard). See
  `integration/ios/`.
- **Android** — toggle `<activity-alias>` with
  `PackageManager.setComponentEnabledSetting(..., DONT_KILL_APP)`. Keep exactly one launcher
  alias enabled. Themed icons (13+) are a separate, system-driven layer (`<monochrome>`). See
  `integration/android/`.
- **Web/PWA** — swap `document.querySelector("link[rel=icon]").href` at runtime (instant).
  The installed-PWA icon comes from the manifest and updates on the next visit.
