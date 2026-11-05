<script setup>
// https://vue3-simple-icons.wyatt-herkamp.dev/
import {
  AndroidIcon,
  AppleIcon,
  DebianIcon,
  FacebookIcon,
  FirefoxBrowserIcon,
  GnuIcon,
  GoogleChromeIcon,
  GoogleIcon,
  HuaweiIcon,
  // InternetExplorerIcon,
  LinuxIcon,
  MacOsIcon,
  // MicrosoftEdgeIcon,
  OperaIcon,
  SafariIcon,
  SamsungIcon,
  UbuntuIcon,
  VivoIcon,
  WeChatIcon,
  WearOsIcon,
  // WindowsIcon,
  XIcon,
  XiaomiIcon,
  YandexCloudIcon,
} from 'vue3-simple-icons'

import {
  Globe,
  Laptop,
  MonitorCheck,
  Smartphone,
  Tablet,
  Terminal,
} from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'browser',
  },
})

const iconMaps = {
  'android': AndroidIcon,
  'android browser': AndroidIcon,
  'browser': Globe,
  'chrome': GoogleChromeIcon,
  'chrome headless': GoogleChromeIcon,
  'chrome webview': GoogleChromeIcon,
  'chromium': GoogleChromeIcon,
  'curl': Terminal,
  'debian': DebianIcon,
  'desktop': MonitorCheck,
  'facebook': FacebookIcon,
  'facebookexternalhit': FacebookIcon,
  'firefox': FirefoxBrowserIcon,
  'googlebot': GoogleIcon,
  'googlebot-image': GoogleIcon,
  'gnu': GnuIcon,
  'harmonyos': HuaweiIcon,
  'huawei browser': HuaweiIcon,
  // 'ie': InternetExplorerIcon,
  'ios': AppleIcon, // 替换带小写文字的 IOsIcon 为纯正 AppleIcon 矢量图形，杜绝 ios iOS 结巴
  'ipad': AppleIcon,
  'iphone': AppleIcon,
  'ipod': AppleIcon,
  'laptop': Laptop,
  'linux': LinuxIcon,
  'macintosh': AppleIcon,
  'macos': MacOsIcon,
  'miui browser': XiaomiIcon,
  'mobile': Smartphone,
  'mobile chrome': GoogleChromeIcon,
  'mobile firefox': FirefoxBrowserIcon,
  'mobile safari': SafariIcon,
  'opera': OperaIcon,
  'os': MonitorCheck,
  'safari': SafariIcon,
  'samsung internet': SamsungIcon,
  'tablet': Tablet,
  'twitterbot': XIcon,
  'ubuntu': UbuntuIcon,
  'vivo browser': VivoIcon,
  'wechat': WeChatIcon,
  'wearable': WearOsIcon,
  'yandex': YandexCloudIcon,
}

function formatDisplayName(name, type) {
  if (!name)
    return '(直接访问/未知)'
  const lower = name.toLowerCase().trim()

  // 1. 操作系统映射
  if (type === 'os') {
    if (lower === 'browser')
      return '移动端内置应用 / Webview'
    if (lower === 'ios')
      return '苹果 iOS'
    if (lower === 'macos' || lower === 'mac os')
      return '苹果 macOS'
    if (lower === 'android')
      return '安卓 Android'
    if (lower === 'windows')
      return '微软 Windows'
    if (lower === 'linux')
      return 'Linux'
    if (lower === 'harmonyos')
      return '华为鸿蒙 HarmonyOS'
  }

  // 2. 设备分类映射 (deviceType)
  if (type === 'deviceType') {
    if (lower === 'mobile')
      return '移动手机 (Mobile)'
    if (lower === 'desktop')
      return '桌面电脑 (Desktop)'
    if (lower === 'tablet')
      return '平板电脑 (Tablet)'
    if (lower === 'smarttv')
      return '智能电视'
    if (lower === 'wearable')
      return '智能穿戴'
  }

  // 3. 设备机型映射 (device)
  if (type === 'device') {
    if (lower === 'mobile')
      return '移动设备 (未上报具体机型)'
    if (lower === 'desktop')
      return '桌面电脑 (PC/Mac)'
    if (lower === 'tablet')
      return '平板设备'
    if (lower === 'iphone')
      return '苹果 iPhone'
    if (lower === 'ipad')
      return '苹果 iPad'
    if (lower === 'm2011k2c')
      return '小米 11 (M2011K2C)'
  }

  // 4. 浏览器内核映射 (browserType)
  if (type === 'browserType') {
    if (lower === 'webkit')
      return 'WebKit 内核'
    if (lower === 'blink')
      return 'Blink / Chromium 内核'
    if (lower === 'gecko')
      return 'Gecko 内核'
    if (lower === 'trident')
      return 'Trident 内核'
  }

  // 5. 浏览器映射 (browser)
  if (type === 'browser') {
    if (lower === 'mobile safari')
      return 'Mobile Safari (苹果浏览器)'
    if (lower === 'chrome' || lower === 'mobile chrome')
      return 'Google Chrome'
    if (lower === 'wechat')
      return '微信内置浏览器'
    if (lower === 'firefox' || lower === 'mobile firefox')
      return 'Firefox 火狐'
    if (lower === 'safari')
      return 'Safari (Mac桌面端)'
  }

  return name
}
</script>

<template>
  <div class="w-full truncate flex items-center gap-2">
    <component
      :is="iconMaps[props.name.toLowerCase()] || iconMaps[props.type]"
      class="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400"
    />
    <span class="truncate">{{ formatDisplayName(props.name, props.type) }}</span>
  </div>
</template>
