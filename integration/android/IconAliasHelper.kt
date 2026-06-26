package cl.butake.buky.icons

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager

/** Native-Android (non-KMP) icon switcher. Toggles <activity-alias> entries. */
object IconAliasHelper {
    private val aliases = mapOf(
        "default" to ".MainActivityDefault",
        "pride" to ".MainActivityPride",
        "halloween" to ".MainActivityHalloween",
        "holiday" to ".MainActivityHoliday",
    )

    fun current(ctx: Context): String {
        val pm = ctx.packageManager
        return aliases.entries.firstOrNull { (_, a) ->
            pm.getComponentEnabledSetting(ComponentName(ctx.packageName, ctx.packageName + a)) ==
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED
        }?.key ?: "default"
    }

    fun setTheme(ctx: Context, themeKey: String) {
        val target = if (aliases.containsKey(themeKey)) themeKey else "default"
        val pm = ctx.packageManager
        aliases.forEach { (key, a) ->
            pm.setComponentEnabledSetting(
                ComponentName(ctx.packageName, ctx.packageName + a),
                if (key == target) PackageManager.COMPONENT_ENABLED_STATE_ENABLED
                else PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP,
            )
        }
    }
}
