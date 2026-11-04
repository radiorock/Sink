<script setup>
import { 
  Globe, 
  Plus, 
  Copy, 
  CopyCheck, 
  QrCode, 
  SquarePen, 
  Trash2, 
  ExternalLink, 
  Loader, 
  CheckCircle2, 
  PauseCircle, 
  Calendar,
  AlertCircle
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useClipboard } from '@vueuse/core'
import QRCode from '../links/QRCode.vue'

const subdomains = ref([])
const loading = ref(true)

// 创建弹窗状态
const createDialogOpen = ref(false)
const createForm = ref({
  subdomain: '',
  url: '',
  title: '',
  comment: '',
})
const creating = ref(false)

// 编辑弹窗状态
const editDialogOpen = ref(false)
const currentEdit = ref(null)
const editing = ref(false)

// 二维码弹窗状态
const qrDialogOpen = ref(false)
const currentQrUrl = ref('')
const currentQrTitle = ref('')

async function fetchSubdomains() {
  loading.value = true
  try {
    const res = await useAPI('/api/subdomain/list')
    subdomains.value = res.subdomains || []
  }
  catch (e) {
    toast.error('获取二级域名列表失败', { description: e.message })
  }
  finally {
    loading.value = false
  }
}

async function handleCreate() {
  if (!createForm.value.subdomain || !createForm.value.url || !createForm.value.title) {
    toast.error('请填写完整的二级域名前缀、跳转目标与通道名称')
    return
  }
  creating.value = true
  try {
    await useAPI('/api/subdomain/create', {
      method: 'POST',
      body: createForm.value,
    })
    toast.success(`专属二级域名 ${createForm.value.subdomain}.showtime.ing 创建成功！`)
    createDialogOpen.value = false
    createForm.value = { subdomain: '', url: '', title: '', comment: '' }
    await fetchSubdomains()
  }
  catch (e) {
    toast.error('创建失败', { description: e.data?.statusText || e.message })
  }
  finally {
    creating.value = false
  }
}

function openEdit(item) {
  currentEdit.value = { ...item }
  editDialogOpen.value = true
}

async function handleUpdate() {
  if (!currentEdit.value.url || !currentEdit.value.title) {
    toast.error('跳转目标链接与通道名称不能为空')
    return
  }
  editing.value = true
  try {
    await useAPI('/api/subdomain/update', {
      method: 'PUT',
      body: {
        subdomain: currentEdit.value.subdomain,
        url: currentEdit.value.url,
        title: currentEdit.value.title,
        comment: currentEdit.value.comment,
        status: currentEdit.value.status,
      },
    })
    toast.success('二级域名通道已更新！')
    editDialogOpen.value = false
    await fetchSubdomains()
  }
  catch (e) {
    toast.error('更新失败', { description: e.data?.statusText || e.message })
  }
  finally {
    editing.value = false
  }
}

async function handleDelete(item) {
  if (!confirm(`确定要彻底删除专属二级域名 [${item.fullDomain}] 吗？删除后该域名将立即停止跳转服务！`)) {
    return
  }
  try {
    await useAPI('/api/subdomain/delete', {
      method: 'POST',
      body: { subdomain: item.subdomain },
    })
    toast.success(`二级域名 [${item.fullDomain}] 已删除`)
    await fetchSubdomains()
  }
  catch (e) {
    toast.error('删除失败', { description: e.data?.statusText || e.message })
  }
}

const copiedDomain = ref('')
function copyLink(domain) {
  const full = `https://${domain}`
  navigator.clipboard.writeText(full)
  copiedDomain.value = domain
  toast.success(`已复制 ${full}`)
  setTimeout(() => {
    copiedDomain.value = ''
  }, 1500)
}

function showQR(item) {
  currentQrUrl.value = `https://${item.fullDomain}`
  currentQrTitle.value = `${item.title} (${item.fullDomain})`
  qrDialogOpen.value = true
}

onMounted(() => {
  fetchSubdomains()
})
</script>

<template>
  <div class="space-y-6">
    <DashboardNav>
      <Dialog v-model:open="createDialogOpen">
        <DialogTrigger as-child>
          <Button class="bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm">
            <Plus class="w-4 h-4 mr-1.5" />
            新增专属二级域名
          </Button>
        </DialogTrigger>
        <DialogContent class="max-w-[95svw] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>创建专属二级域名通道</DialogTitle>
            <DialogDescription>
              创建后全球即时生效，自动匹配官方 HTTPS 证书，无需手动配置 DNS。
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4 py-2">
            <div>
              <label class="text-sm font-medium mb-1.5 block">二级域名前缀 (Subdomain)</label>
              <div class="flex items-center">
                <input
                  v-model="createForm.subdomain"
                  type="text"
                  placeholder="例如 ten、eva、live"
                  class="flex-1 px-3 py-2 text-sm border rounded-l-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
                >
                <span class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-lg">
                  .showtime.ing
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-1">仅支持英文字母与数字，生成后即为唯一专属域名。</p>
            </div>

            <div>
              <label class="text-sm font-medium mb-1.5 block">通道名称 / 艺人项目</label>
              <input
                v-model="createForm.title"
                type="text"
                placeholder="例如：TEN 艺人周边官方商城"
                class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
            </div>

            <div>
              <label class="text-sm font-medium mb-1.5 block">目标跳转链接 (URL)</label>
              <input
                v-model="createForm.url"
                type="url"
                placeholder="例如：https://shop155894470.youzan.com/..."
                class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
              >
            </div>

            <div>
              <label class="text-sm font-medium mb-1.5 block">备注说明 (可选)</label>
              <textarea
                v-model="createForm.comment"
                rows="2"
                placeholder="填写通道使用场景、宣发渠道或责任人"
                class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              @click="createDialogOpen = false"
            >
              取消
            </Button>
            <Button
              class="bg-red-600 hover:bg-red-700 text-white"
              :disabled="creating"
              @click="handleCreate"
            >
              <Loader
                v-if="creating"
                class="w-4 h-4 mr-1 animate-spin"
              />
              确认创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardNav>

    <!-- 加载中 -->
    <div
      v-if="loading"
      class="flex justify-center items-center py-20"
    >
      <Loader class="w-8 h-8 animate-spin text-red-600" />
    </div>

    <!-- 列表展示 -->
    <div
      v-else-if="subdomains.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <Card
        v-for="item in subdomains"
        :key="item.subdomain"
        class="border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      >
        <div class="p-5 space-y-4">
          <!-- 标题与状态 -->
          <div class="flex items-start justify-between gap-2">
            <div class="space-y-1">
              <h4 class="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Globe class="w-4 h-4 text-red-600 shrink-0" />
                {{ item.title }}
              </h4>
              <p
                v-if="item.comment"
                class="text-xs text-gray-500 line-clamp-1"
              >
                {{ item.comment }}
              </p>
            </div>
            <span
              v-if="item.status === 'active'"
              class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-green-700 bg-green-50 dark:bg-green-950/40 dark:text-green-400 rounded-full border border-green-200/60"
            >
              <CheckCircle2 class="w-3 h-3" />
              运行中
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 rounded-full border border-amber-200/60"
            >
              <PauseCircle class="w-3 h-3" />
              已暂停
            </span>
          </div>

          <!-- 域名显示栏 -->
          <div class="p-2.5 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span class="font-mono font-bold text-sm text-gray-800 dark:text-gray-200">
              {{ item.fullDomain }}
            </span>
            <div class="flex items-center space-x-1">
              <button
                class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded"
                title="复制完整网址"
                @click="copyLink(item.fullDomain)"
              >
                <CopyCheck
                  v-if="copiedDomain === item.fullDomain"
                  class="w-4 h-4 text-green-600"
                />
                <Copy
                  v-else
                  class="w-4 h-4"
                />
              </button>
              <button
                class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded"
                title="生成高清物料二维码"
                @click="showQR(item)"
              >
                <QrCode class="w-4 h-4" />
              </button>
              <a
                :href="`https://${item.fullDomain}`"
                target="_blank"
                class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded"
                title="在新窗口测试访问"
              >
                <ExternalLink class="w-4 h-4" />
              </a>
            </div>
          </div>

          <!-- 目标跳转地址 -->
          <div class="space-y-1">
            <div class="text-[11px] font-medium text-gray-400">当前目标跳转地址：</div>
            <p
              class="text-xs font-mono text-gray-600 dark:text-gray-300 truncate bg-muted/40 p-1.5 rounded"
              :title="item.url"
            >
              {{ item.url }}
            </p>
          </div>

          <!-- 底部元信息与操作 -->
          <div class="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <div class="flex items-center gap-1">
              <Calendar class="w-3.5 h-3.5" />
              <span>{{ shortDate(item.updatedAt || item.createdAt) }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <button
                class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 flex items-center gap-1 font-medium"
                @click="openEdit(item)"
              >
                <SquarePen class="w-3.5 h-3.5" />
                编辑
              </button>
              <span class="text-gray-200 dark:text-gray-800">|</span>
              <button
                class="text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 font-medium"
                @click="handleDelete(item)"
              >
                <Trash2 class="w-3.5 h-3.5" />
                删除
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 空数据提示 -->
    <div
      v-else
      class="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800"
    >
      <Globe class="w-12 h-12 mx-auto text-gray-300 mb-3" />
      <h3 class="text-base font-bold text-gray-800 dark:text-gray-200">暂无生效中的二级域名</h3>
      <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
        点击右上角“新增专属二级域名”，可立即为签约艺人或重大演出建立专属域名通道。
      </p>
    </div>

    <!-- 编辑弹窗 -->
    <Dialog v-model:open="editDialogOpen">
      <DialogContent
        v-if="currentEdit"
        class="max-w-[95svw] md:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>编辑二级域名: {{ currentEdit.fullDomain }}</DialogTitle>
          <DialogDescription>
            修改目标链接后全球即时生效，所有访客将立即跳转至新地址。
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div>
            <label class="text-sm font-medium mb-1.5 block">通道名称 / 艺人项目</label>
            <input
              v-model="currentEdit.title"
              type="text"
              class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
          </div>

          <div>
            <label class="text-sm font-medium mb-1.5 block">目标跳转链接 (URL)</label>
            <input
              v-model="currentEdit.url"
              type="url"
              class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
            >
          </div>

          <div>
            <label class="text-sm font-medium mb-1.5 block">通道状态</label>
            <select
              v-model="currentEdit.status"
              class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="active">运行中 (正常跳转)</option>
              <option value="paused">已暂停 (临时维护或下架)</option>
            </select>
          </div>

          <div>
            <label class="text-sm font-medium mb-1.5 block">备注说明</label>
            <textarea
              v-model="currentEdit.comment"
              rows="2"
              class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="editDialogOpen = false"
          >
            取消
          </Button>
          <Button
            class="bg-red-600 hover:bg-red-700 text-white"
            :disabled="editing"
            @click="handleUpdate"
          >
            <Loader
              v-if="editing"
              class="w-4 h-4 mr-1 animate-spin"
            />
            保存修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 二维码物料弹窗 -->
    <Dialog v-model:open="qrDialogOpen">
      <DialogContent class="max-w-xs text-center">
        <DialogHeader>
          <DialogTitle class="text-center font-bold text-base">现场物料二维码</DialogTitle>
          <DialogDescription class="text-center text-xs">
            {{ currentQrTitle }}
          </DialogDescription>
        </DialogHeader>
        <div class="flex justify-center p-4 bg-white rounded-xl my-2 border">
          <QRCode
            v-if="currentQrUrl"
            :data="currentQrUrl"
          />
        </div>
        <p class="text-xs text-gray-400 font-mono break-all">{{ currentQrUrl }}</p>
      </DialogContent>
    </Dialog>
  </div>
</template>
