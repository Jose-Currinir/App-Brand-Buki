# Install into a native Android project

```bash
node scripts/install/native-android.mjs <module-dir> out/icons [productKey=buky]
```

- Copies `mipmap-mdpi … xxxhdpi/ic_launcher.png` + `_round.png`.
- Writes `mipmap-anydpi-v26/ic_launcher.xml` referencing `<foreground>`, `<background>`, and
  `<monochrome>` (the monochrome enables Android 13+ themed icons).
- Copies the adaptive `foreground`/`background`/`monochrome` drawables.
- For alternates: copies per-theme mipmaps and prints the `<activity-alias>` block to merge
  from `integration/android/activity_aliases.xml`.

Then add `integration/android/IconAliasHelper.kt` (or the KMP `IconManager.android.kt`), set
`BrandKitInit.app` in `Application.onCreate`, and read the remote theme per
`references/remote-switching.md`.

Note: changing the launcher alias may only refresh the icon after the next app launch on some
OEM launchers.
