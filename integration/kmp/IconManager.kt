package cl.butake.buky.icons

/**
 * Switches the app/launcher icon among alternates that are BUNDLED AT BUILD TIME.
 *
 * Hard platform limit: you can only SELECT among the icons shipped in the app — you cannot
 * download and apply a brand-new image over the air. Adding a new theme requires an app
 * update. This is by design on iOS and Play Store.
 *
 * Place in commonMain. See IconManager.android.kt / IconManager.ios.kt for the actuals.
 */
expect class IconManager() {
    /** Theme keys this build ships (matches brand.config.json themes / bundled alternates). */
    fun availableThemes(): List<String>

    /** Currently active theme key, or "default". */
    fun currentTheme(): String

    /** Activate a theme. Pass "default" (or a key not in availableThemes) to restore the primary icon. */
    fun setTheme(themeKey: String)
}

/** Themes the app ships with. Keep in sync with the generated alternates. */
val BUNDLED_THEMES = listOf("default", "pride", "halloween", "holiday")
