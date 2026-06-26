# Install into a KMP / Compose Multiplatform project

A KMP app usually has `androidApp/` (or `composeApp/`) and `iosApp/`. brandkit installs the
Android side fully and stages the iOS side.

```bash
node scripts/install/kmp.mjs <target-project-dir> out/icons [productKey=buky]
```

What it does:
- **Android** — copies adaptive layers + mipmaps into `…/src/main/res/`, writes
  `mipmap-anydpi-v26/ic_launcher.xml` (with `<foreground>`, `<background>`, `<monochrome>`),
  and copies per-theme mipmaps for the alternates. Merge `integration/android/activity_aliases.xml`
  into the manifest and add `IconManager.android.kt` + `BrandKitInit`.
- **iOS** — stages PNGs into `iosApp/.../Assets.xcassets/AppIcon.appiconset` and the loose
  alternate PNGs into the app target. STUB: adding files to the `.pbxproj` and declaring
  `CFBundleAlternateIcons` is done in Xcode (or with a pbxproj tool) — the script prints the
  exact files + Info.plist block to add (`integration/ios/Info-AlternateIcons.plist`).

Then wire remote switching: drop `integration/kmp/*` into `commonMain` / `androidMain` /
`iosMain`, adjust the package name, and follow `references/remote-switching.md`.
