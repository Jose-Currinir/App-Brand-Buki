package cl.butake.buky.icons

import dev.gitlive.firebase.Firebase
import dev.gitlive.firebase.remoteconfig.remoteConfig

/**
 * Reads the active icon theme from Firebase Remote Config (the "gestor").
 * Uses the GitLive Firebase KMP SDK so the same code runs on Android + iOS:
 *   commonMain: implementation("dev.gitlive:firebase-config:<version>")
 *
 * Remote Config key: "active_icon_theme" (string). Set it from the Firebase console to flip
 * the icon for everyone who opens the app next — among the themes the build already ships.
 *
 * STUB: requires a Firebase project (free tier is fine) with this app registered, and the
 * google-services.json / GoogleService-Info.plist added. No paid account needed.
 */
class RemoteThemeClient {

    private val rc = Firebase.remoteConfig

    /** Fetches + activates and returns the active theme key, or [fallback] on any failure. */
    suspend fun activeTheme(fallback: String = "default"): String = try {
        rc.settings { minimumFetchInterval = /* 1h in prod; 0 while testing */ 3600.toDuration() }
        rc.fetchAndActivate()
        rc.getValue("active_icon_theme").asString().ifBlank { fallback }
    } catch (t: Throwable) {
        fallback
    }
}

// Glue — call once after launch (e.g. from your app's init / first composition):
//   val theme = RemoteThemeClient().activeTheme()
//   IconManager().setTheme(theme)

private fun Int.toDuration() = this // placeholder; use kotlin.time.Duration.seconds in your codebase
