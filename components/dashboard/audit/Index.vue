<script setup>
import {
  Clock,
  FileText,
  Loader,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Terminal,
  User,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const logs = ref([])
const loading = ref(true)
const searchQuery = ref('')

async function fetchLogs() {
  loading.value = true
  try {
    const res = await useAPI('/api/audit/list')
    logs.value = res.logs || []
  }
  catch (e) {
    toast.error('加载操作审计记录失败', { description: e.message })
  }
  finally {
    loading.value = false
  }
}

const filteredLogs = computed(() => {
  if (!searchQuery.value)
    return logs.value
  const q = searchQuery.value.toLowerCase().trim()
  return logs.value.filter(item =>
    item.target.toLowerCase().includes(q)
    || item.operatorName.toLowerCase().includes(q)
    || item.operatorUsername.toLowerCase().includes(q)
    || item.actionLabel.toLowerCase().includes(q)
    || item.details.toLowerCase().includes(q)
    || item.ip.includes(q),
  )
})

function getActionBadge(action) {
  if (action.includes('DELETE')) {
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
  }
  if (action.includes('UPDATE')) {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
  }
  return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400'
}

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="space-y-6">
    <DashboardNav>
      <div class="flex items-center space-x-2">
        <div class="relative w-64">
          <Search class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索操作人、通道或关键字..."
            class="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
        </div>
        <Button
          variant="outline"
          size="sm"
          class="h-8 text-xs"
          @click="fetchLogs"
        >
          <RefreshCw
            class="w-3.5 h-3.5 mr-1"
            :class="{ 'animate-spin': loading }"
          />
          刷新
        </Button>
      </div>
    </DashboardNav>

    <!-- 安全警示说明 -->
    <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-4 h-4 text-green-600 shrink-0" />
        <span>系统启用不可篡改的操作审计留痕机制，所有账号的增、删、改记录均自动封存，仅限只读调阅。</span>
      </div>
      <div class="font-mono">
        共记录 {{ logs.length }} 条审计流水
      </div>
    </div>

    <!-- 加载中 -->
    <div
      v-if="loading"
      class="flex justify-center items-center py-20"
    >
      <Loader class="w-8 h-8 animate-spin text-red-600" />
    </div>

    <!-- 时间轴列表 -->
    <div
      v-else-if="filteredLogs.length"
      class="space-y-3"
    >
      <Card
        v-for="log in filteredLogs"
        :key="log.id"
        class="border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow transition-shadow"
      >
        <div class="p-4 space-y-3">
          <!-- 顶栏：动作、目标、时间 -->
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center space-x-2">
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                :class="getActionBadge(log.action)"
              >
                {{ log.actionLabel }}
              </span>
              <span class="font-mono font-bold text-sm text-gray-900 dark:text-gray-100">
                {{ log.target }}
              </span>
            </div>
            <div class="flex items-center text-xs text-gray-400 font-mono gap-1">
              <Clock class="w-3.5 h-3.5" />
              <span>{{ log.timeString }}</span>
            </div>
          </div>

          <!-- 变更明细内容 -->
          <div class="p-3 bg-gray-50 dark:bg-gray-900/70 rounded-lg text-xs leading-relaxed font-mono text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
            {{ log.details }}
          </div>

          <!-- 底栏：责任人、物理IP、地理位置 -->
          <div class="flex flex-wrap items-center justify-between text-[11px] text-gray-400 pt-1">
            <div class="flex items-center gap-1 text-gray-600 dark:text-gray-300 font-medium">
              <User class="w-3.5 h-3.5 text-gray-400" />
              <span>操作人：{{ log.operatorName }}</span>
              <span class="text-gray-400">({{ log.operatorUsername }})</span>
            </div>
            <div class="flex items-center space-x-3 font-mono">
              <span class="flex items-center gap-1">
                <Terminal class="w-3.5 h-3.5 text-gray-400" />
                IP: {{ log.ip }}
              </span>
              <span
                v-if="log.location"
                class="flex items-center gap-1"
              >
                <MapPin class="w-3.5 h-3.5 text-gray-400" />
                {{ log.location }}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 空数据 -->
    <div
      v-else
      class="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800"
    >
      <FileText class="w-12 h-12 mx-auto text-gray-300 mb-3" />
      <h3 class="text-base font-bold text-gray-800 dark:text-gray-200">
        暂无匹配的操作审计日志
      </h3>
      <p class="text-xs text-gray-500 mt-1">
        当员工在后台执行新增、编辑或删除操作时，系统将在此处自动记录完整的责任流水。
      </p>
    </div>
  </div>
</template>
