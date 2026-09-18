package com.teamdowith.letmedowith2

import android.os.Bundle;
import android.util.TypedValue
import com.zoontek.rnbootsplash.RNBootSplash
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "LetMeDoWith"
  override fun onCreate(savedInstanceState: Bundle?) {
      // BootTheme을 스플래시로 띄운다. JS에서 BootSplash.hide()로 내린다.
      RNBootSplash.init(this, R.style.BootTheme)
      super.onCreate(null)
      restoreSystemBarColors()
    }

  /*
   * BootTheme이 액티비티 창에 남긴 시스템 바 색을 AppTheme 기준으로 되돌린다.
   *
   * 스플래시는 BootTheme을 쓰는 별도 Dialog로 그려지고, 바 색도 그 다이얼로그가 칠한다.
   * 반면 액티비티 창에도 BootTheme이 먼저 적용되는데 RNBootSplash.init은 setTheme만 하고
   * 이미 창에 박힌 바 색은 되돌리지 않는다. 그대로 두면 스플래시가 끝난 뒤에도 브랜드 색이 남는다.
   * 값을 하드코딩하지 않고 교체된 테마(AppTheme)에서 다시 읽어 적용한다.
   */
  private fun restoreSystemBarColors() {
      val value = TypedValue()

      if (theme.resolveAttribute(android.R.attr.statusBarColor, value, true)) {
          window.statusBarColor = value.data
      }
      if (theme.resolveAttribute(android.R.attr.navigationBarColor, value, true)) {
          window.navigationBarColor = value.data
      }
    }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
