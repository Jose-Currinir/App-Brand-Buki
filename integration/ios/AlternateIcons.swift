import UIKit

/// Switches among alternate icons bundled in the app. Native-iOS (non-KMP) version.
/// The icon PNGs must be added to the app bundle and declared in Info.plist
/// (see Info-AlternateIcons.plist). You cannot download a new icon at runtime.
enum BukyIcon {
    /// Pass "default" to restore the primary icon. Other keys must match CFBundleAlternateIcons.
    static func setTheme(_ themeKey: String) {
        guard UIApplication.shared.supportsAlternateIcons else { return }
        let name: String? = (themeKey == "default") ? nil : themeKey
        DispatchQueue.main.async {
            UIApplication.shared.setAlternateIconName(name) { error in
                if let error = error { print("brandkit: icon change failed: \(error.localizedDescription)") }
            }
        }
    }

    static var current: String { UIApplication.shared.alternateIconName ?? "default" }
}
