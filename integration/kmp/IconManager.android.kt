package cl.butake.buky.icons

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager

/**
 * Android implementation: toggles <activity-alias> entries declared in the manifest.
 * Exactly one launcher alias must stay enabled, or the app vanishes from the launcher,
 * so setTheme() enables the target and disables the rest.
 *
 * Initialize once at startup: BrandKitInit.app = applicationContext (in Application.onCreate).
 */
object BrandKitInit { lateinit var app: Context }

actual class IconManager actual constructor() {

    private val ctx get() = BrandKitInit.app
    private val pkg get() = ctx.packageName

    // theme key -> fully-qualified activity-alias name (see integration/android/activity_aliases.xml)
    private val aliases = mapOf(
        "default" to ".MainActivityDefault",
        "pride" to ".MainActivityPride",
        "halloween" to ".MainActivityHalloween",
        "holiday" to ".MainActivityHoliday",
    )

    actual fun availableThemes(): List<String> = aliases.keys.toList()

    actual fun currentTheme(): String {
        val pm = ctx.packageManager
        return aliases.entries.firstOrNull { (_, alias) ->
            pm.getComponentEnabledSetting(ComponentName(pkg, pkg + alias)) ==
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED
        }?.key ?: "default"
    }

    actual fun setTheme(themeKey: String) {
        val target = if (aliases.containsKey(themeKey)) themeKey else "default"
        val pm = ctx.packageManager
        aliases.forEach { (key, alias) ->
            val state = if (key == target) PackageManager.COMPONENT_ENABLED_STATE_ENABLED
                        else PackageManager.COMPONENT_ENABLED_STATE_DISABLED
            pm.setComponentEnabledSetting(ComponentName(pkg, pkg + alias), state, PackageManager.DONT_KILL_APP)
        }
        // Note: some launchers only refresh the icon after the app is relaunched.
    }
}
