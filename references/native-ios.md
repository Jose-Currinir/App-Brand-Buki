# Install into a native iOS project

```bash
node scripts/install/native-ios.mjs <xcodeproj-dir> out/icons [productKey=buky]
```

- Primary icon → `Assets.xcassets/AppIcon.appiconset` (the script writes the PNG + a valid
  single-size `Contents.json` for Xcode 14+).
- Alternate icons (themes) → **loose PNGs in the app target** named `pride@2x.png`,
  `pride@3x.png`, etc. They must NOT live in the asset catalog (iOS limitation for
  `setAlternateIconName`).
- Merge `integration/ios/Info-AlternateIcons.plist` into Info.plist.
- Add `integration/ios/AlternateIcons.swift` and call `BukyIcon.setTheme(themeKey)`.

STUB / needs provisioning:
- Adding loose files to the `.pbxproj` is an Xcode step (or use a pbxproj tool). The script
  prints exactly which files to drag in.
- Shipping to the App Store needs a paid Apple Developer account. Switching/testing on a
  simulator works without it.
- `setAlternateIconName` shows a system alert by default — that's expected iOS behavior.
