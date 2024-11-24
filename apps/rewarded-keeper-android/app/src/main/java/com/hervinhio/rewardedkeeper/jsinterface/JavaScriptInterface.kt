package com.hervinhio.rewardedkeeper.jsinterface

import android.content.Context
import android.content.res.Configuration
import android.content.res.Resources
import android.preference.PreferenceManager
import android.webkit.JavascriptInterface

enum class ThemeModes {
  dark,
  light,
  system,
}

class JavaScriptInterface(val context: Context, val resources: Resources) {
  @JavascriptInterface
  fun getThemeMode(): String {
    val prefs = PreferenceManager.getDefaultSharedPreferences(context)
    val themeMode = prefs.getString("themeMode", "system")

    if (themeMode == null || themeMode == "") {
      return ThemeModes.light.toString();
    } else if (themeMode === ThemeModes.system.toString()) {
      return if (this.isNightModeActive()) ThemeModes.dark.toString() else ThemeModes.light.toString()
    }

    return ThemeModes.valueOf(themeMode).toString()
  }

  private fun isNightModeActive(): Boolean {
    return resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK == Configuration.UI_MODE_NIGHT_YES
  }

  @JavascriptInterface
  fun authenticate() {

  }
}
