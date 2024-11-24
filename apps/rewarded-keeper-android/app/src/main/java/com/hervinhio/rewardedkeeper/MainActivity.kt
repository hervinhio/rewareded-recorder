package com.hervinhio.rewardedkeeper

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.hervinhio.rewardedkeeper.jsinterface.JavaScriptInterface
import com.hervinhio.rewardedkeeper.ui.theme.RewardedKeeperTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val wv = WebView(super.getBaseContext())
        wv.loadUrl("http://10.0.2.2:4201")
        wv.addJavascriptInterface(JavaScriptInterface(this.baseContext, resources = this.resources,), "android")
        wv.settings.javaScriptEnabled = true

        setContentView(wv)
        enableEdgeToEdge()
    }
}
