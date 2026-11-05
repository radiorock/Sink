<script setup>
import {
  Ban,
  Calendar,
  CheckCircle2,
  Edit3,
  KeyRound,
  Loader,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const users = ref([])
const loading = ref(true)

// 创建成员弹窗
const createDialogOpen = ref(false)
const createForm = ref({
  username: '',
  name: '',
  role: 'operator',
  password: '',
})
const creating = ref(false)

// 重置密码弹窗
const resetPasswordDialogOpen = ref(false)
const resetTargetUser = ref(null)
const newPassword = ref('')
const resetting = ref(false)

// 编辑成员弹窗
const editDialogOpen = ref(false)
const editForm = ref({
  username: '',
  name: '',
  role: 'operator',
  status: 'active',
})
const updating = ref(false)

async function fetchUsers() {
  loading.value = true
  try {
    const res = await useAPI('/api/user/list')
    users.value = res.users || []
  }
  catch (e) {
    toast.error('加载成员列表失败', { description: e.data?.statusText || e.message })
  }
  finally {
    loading.value = false
  }
}

async function handleCreateUser() {
  if (!createForm.value.username || !createForm.value.name || !createForm.value.password) {
    toast.error('请填写完整的账号、姓名与初始密码')
    return
  }
  creating.value = true
  try {
    await useAPI('/api/user/create', {
      method: 'POST',
      body: createForm.value,
    })
    toast.success(`成员 [${createForm.value.name}] 添加成功！`)
    createDialogOpen.value = false
    createForm.value = { username: '', name: '', role: 'operator', password: '' }
    await fetchUsers()
  }
  catch (e) {
    toast.error('添加成员失败', { description: e.data?.statusText || e.message })
  }
  finally {
    creating.value = false
  }
}

function openResetPassword(user) {
  resetTargetUser.value = user
  newPassword.value = ''
  resetPasswordDialogOpen.value = true
}

async function handleResetPassword() {
  if (!newPassword.value || newPassword.value.length < 6) {
    toast.error('新密码长度不能少于 6 位')
    return
  }
  resetting.value = true
  try {
    await useAPI('/api/user/update', {
      method: 'PUT',
      body: {
        username: resetTargetUser.value.username,
        password: newPassword.value,
      },
    })
    toast.success(`成员 [${resetTargetUser.value.name}] 密码已成功重置！`)
    resetPasswordDialogOpen.value = false
  }
  catch (e) {
    toast.error('重置密码失败', { description: e.data?.statusText || e.message })
  }
  finally {
    resetting.value = false
  }
}

function openEdit(user) {
  editForm.value = {
    username: user.username,
    name: user.name,
    role: user.role,
    status: user.status,
  }
  editDialogOpen.value = true
}

async function handleUpdateUser() {
  updating.value = true
  try {
    await useAPI('/api/user/update', {
      method: 'PUT',
      body: editForm.value,
    })
    toast.success('成员权限与信息已更新！')
    editDialogOpen.value = false
    await fetchUsers()
  }
  catch (e) {
    toast.error('更新失败', { description: e.data?.statusText || e.message })
  }
  finally {
    updating.value = false
  }
}

async function handleDeleteUser(user) {
  if (user.username === 'admin') {
    toast.error('系统超级总控账号禁止删除')
    return
  }
  // eslint-disable-next-line no-alert
  if (!confirm(`确定要彻底注销并删除成员 [${user.name} (${user.username})] 吗？删除后该员工将无法再登录后台！`)) {
    return
  }
  try {
    await useAPI('/api/user/delete', {
      method: 'POST',
      body: { username: user.username },
    })
    toast.success(`成员 [${user.name}] 已注销`)
    await fetchUsers()
  }
  catch (e) {
    toast.error('删除失败', { description: e.data?.statusText || e.message })
  }
}

function getRoleBadge(role) {
  if (role === 'admin') {
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
  }
  if (role === 'operator') {
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400'
  }
  return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
}

function getRoleLabel(role) {
  if (role === 'admin')
    return '超级管理员 (总控)'
  if (role === 'operator')
    return '项目/运营执行'
  return '只读观察员'
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="space-y-6">
    <DashboardNav />

    <!-- 页面标题与操作栏 (Page Header) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/80">
      <div>
        <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">
          团队成员
        </h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          管理后台操作账号、分配专属角色权限并维护安全访问密钥
        </p>
      </div>

      <Dialog v-model:open="createDialogOpen">
        <DialogTrigger as-child>
          <Button class="bg-red-600 hover:bg-red-700 text-white font-medium shadow-xs cursor-pointer h-9 px-3.5 text-xs sm:text-sm">
            <UserPlus class="w-4 h-4 mr-1.5" />
            添加成员账号
          </Button>
        </DialogTrigger>
        <DialogContent class="max-w-[95svw] md:max-w-md">
          <DialogHeader>
            <DialogTitle>添加新团队成员</DialogTitle>
            <DialogDescription>
              设置成员登录账号、角色权限及专属口令。
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4 py-2">
            <div>
              <label class="text-sm font-medium mb-1 block">用户名 / 账号</label>
              <input
                v-model="createForm.username"
                type="text"
                placeholder="例如 ten_op、marketing"
                class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
              >
            </div>

            <div>
              <label class="text-sm font-medium mb-1 block">姓名 / 部门显示名</label>
              <input
                v-model="createForm.name"
                type="text"
                placeholder="例如：TEN 专属运营执行"
                class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
            </div>

            <div>
              <label class="text-sm font-medium mb-1 block">权限角色</label>
              <select
                v-model="createForm.role"
                class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="operator">
                  项目/运营执行 (支持管理短链与二级域名)
                </option>
                <option value="admin">
                  超级管理员 (拥有全部设置与用户权限)
                </option>
                <option value="viewer">
                  只读观察员 (仅可查看大盘与通道，禁止修改)
                </option>
              </select>
            </div>

            <div>
              <label class="text-sm font-medium mb-1 block">初始登录密码 / 口令</label>
              <input
                v-model="createForm.password"
                type="password"
                placeholder="至少 6 位密码"
                class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
              >
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
              @click="handleCreateUser"
            >
              <Loader
                v-if="creating"
                class="w-4 h-4 mr-1 animate-spin"
              />
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <!-- 加载中 -->
    <div
      v-if="loading"
      class="flex justify-center items-center py-20"
    >
      <Loader class="w-8 h-8 animate-spin text-red-600" />
    </div>

    <!-- 成员卡片列表 -->
    <div
      v-else-if="users.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <Card
        v-for="u in users"
        :key="u.username"
        class="border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      >
        <div class="p-5 space-y-4">
          <!-- 顶部姓名与状态 -->
          <div class="flex items-start justify-between">
            <div class="space-y-0.5">
              <h4 class="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Users class="w-4 h-4 text-red-600 shrink-0" />
                {{ u.name }}
              </h4>
              <p class="text-xs text-gray-400 font-mono">
                账号: {{ u.username }}
              </p>
            </div>
            <span
              v-if="u.status === 'active'"
              class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-green-700 bg-green-50 dark:bg-green-950/40 dark:text-green-400 rounded-full border border-green-200/60"
            >
              <CheckCircle2 class="w-3 h-3" />
              正常
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200/60"
            >
              <Ban class="w-3 h-3" />
              已禁用
            </span>
          </div>

          <!-- 角色徽章 -->
          <div class="flex items-center space-x-2">
            <span
              class="px-2.5 py-0.5 rounded-md text-xs font-bold border"
              :class="getRoleBadge(u.role)"
            >
              {{ getRoleLabel(u.role) }}
            </span>
          </div>

          <!-- 底部操作按钮 -->
          <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <div class="flex items-center gap-1 text-gray-400">
              <Calendar class="w-3.5 h-3.5" />
              <span>{{ shortDate(u.createdAt) }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <button
                class="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-0.5"
                title="修改成员权限或状态"
                @click="openEdit(u)"
              >
                <Edit3 class="w-3.5 h-3.5" />
                设置
              </button>
              <span class="text-gray-200 dark:text-gray-800">|</span>
              <button
                class="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium flex items-center gap-0.5"
                title="重置该员工登录密码"
                @click="openResetPassword(u)"
              >
                <KeyRound class="w-3.5 h-3.5" />
                重置密码
              </button>
              <template v-if="u.username !== 'admin'">
                <span class="text-gray-200 dark:text-gray-800">|</span>
                <button
                  class="text-red-600 hover:text-red-700 dark:text-red-400 font-medium flex items-center gap-0.5"
                  title="删除该账号"
                  @click="handleDeleteUser(u)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  删除
                </button>
              </template>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 重置密码弹窗 -->
    <Dialog v-model:open="resetPasswordDialogOpen">
      <DialogContent
        v-if="resetTargetUser"
        class="max-w-sm"
      >
        <DialogHeader>
          <DialogTitle>重置密码: {{ resetTargetUser.name }}</DialogTitle>
          <DialogDescription>
            为成员设置新的授权口令，保存后立即生效。
          </DialogDescription>
        </DialogHeader>

        <div class="py-3">
          <label class="text-sm font-medium mb-1 block">新密码</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="请输入不少于 6 位的新密码"
            class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
          >
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="resetPasswordDialogOpen = false"
          >
            取消
          </Button>
          <Button
            class="bg-red-600 hover:bg-red-700 text-white"
            :disabled="resetting"
            @click="handleResetPassword"
          >
            <Loader
              v-if="resetting"
              class="w-4 h-4 mr-1 animate-spin"
            />
            确认重置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 编辑成员弹窗 -->
    <Dialog v-model:open="editDialogOpen">
      <DialogContent class="max-w-sm">
        <DialogHeader>
          <DialogTitle>设置成员: {{ editForm.name }}</DialogTitle>
          <DialogDescription>
            修改成员部门显示名称、角色权限或账号启停状态。
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div>
            <label class="text-sm font-medium mb-1 block">姓名 / 显示名</label>
            <input
              v-model="editForm.name"
              type="text"
              class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
          </div>

          <div>
            <label class="text-sm font-medium mb-1 block">权限角色</label>
            <select
              v-model="editForm.role"
              :disabled="editForm.username === 'admin'"
              class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50"
            >
              <option value="operator">
                项目/运营执行
              </option>
              <option value="admin">
                超级管理员
              </option>
              <option value="viewer">
                只读观察员
              </option>
            </select>
          </div>

          <div>
            <label class="text-sm font-medium mb-1 block">账号状态</label>
            <select
              v-model="editForm.status"
              :disabled="editForm.username === 'admin'"
              class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50"
            >
              <option value="active">
                正常启用
              </option>
              <option value="disabled">
                已停用 (禁止登录)
              </option>
            </select>
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
            :disabled="updating"
            @click="handleUpdateUser"
          >
            <Loader
              v-if="updating"
              class="w-4 h-4 mr-1 animate-spin"
            />
            保存设置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
