<script setup>
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Plus, Shuffle, Sparkles } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { DependencyType } from '@/components/ui/auto-form/interface'
import { LinkSchema, nanoid } from '@/schemas/link'

const props = defineProps({
  link: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:link'])

const link = ref(props.link)
const dialogOpen = ref(false)

const isEdit = !!props.link.id

const EditLinkSchema = LinkSchema.pick({
  url: true,
  slug: true,
}).extend({
  optional: LinkSchema.omit({
    id: true,
    url: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
    title: true,
    description: true,
    image: true,
    tags: true,
  }).extend({
    expiration: z.coerce.date().describe('到期截止时间 (可选)').optional(),
    fallbackUrl: z.string().trim().url('请输入有效的兜底网址').max(2048).describe('到期兜底跳转 (Fallback URL)').optional(),
    wechatUrl: z.string().trim().url('请输入有效的微信专享网址').max(2048).describe('微信专享落地页 (URL)').optional(),
    wechatShield: z.boolean().default(false).describe('开启微信防封引导 (提示在浏览器打开)').optional(),
    tagsInput: z.string().trim().describe('项目与渠道标签 (逗号分隔，如：TEN巡演, 票务早鸟)').optional(),
    comment: z.string().trim().max(2048).describe('备注说明 (可选)').optional(),
  }).optional(),
})

const fieldConfig = {
  url: {
    inputProps: {
      placeholder: '请输入目标跳转网址 (如 https://...)',
    },
  },
  slug: {
    disabled: isEdit,
    inputProps: {
      placeholder: '留空自动随机生成或指定自定义后缀',
    },
  },
  optional: {
    comment: {
      component: 'textarea',
      inputProps: {
        placeholder: '可选：填写短链用途或备注说明',
      },
    },
    fallbackUrl: {
      inputProps: {
        placeholder: '活动截止后自动跳转的兜底网址 (可选)',
      },
    },
    wechatUrl: {
      inputProps: {
        placeholder: '微信内打开时专享的落地网址 (可选)',
      },
    },
    tagsInput: {
      inputProps: {
        placeholder: '例如：TEN巡演, 票务早鸟, Instagram',
      },
    },
  },
}

const dependencies = [
  {
    sourceField: 'slug',
    type: DependencyType.DISABLES,
    targetField: 'slug',
    when: () => isEdit,
  },
]

const form = useForm({
  validationSchema: toTypedSchema(EditLinkSchema),
  initialValues: {
    slug: link.value.slug,
    url: link.value.url,
    optional: {
      comment: link.value.comment,
      fallbackUrl: link.value.fallbackUrl,
      wechatUrl: link.value.wechatUrl,
      wechatShield: !!link.value.wechatShield,
      tagsInput: Array.isArray(link.value.tags) ? link.value.tags.join(', ') : '',
    },
  },
  validateOnMount: isEdit,
  keepValuesOnUnmount: isEdit,
})

function randomSlug() {
  form.setFieldValue('slug', nanoid()())
}

function appendUTM(source) {
  const current = form.values.url || ''
  if (!current) {
    toast.error('请先输入目标链接 (URL)')
    return
  }
  const sep = current.includes('?') ? '&' : '?'
  form.setFieldValue('url', `${current.replace(/([?&])utm_source=[^&]*/, '')}${sep}utm_source=${source}`)
  toast.success(`已为目标链接追加 [${source}] 渠道标记`)
}

const aiSlugPending = ref(false)
async function aiSlug() {
  if (!form.values.url)
    return

  aiSlugPending.value = true
  try {
    const { slug } = await useAPI('/api/link/ai', {
      query: {
        url: form.values.url,
      },
    })
    form.setFieldValue('slug', slug)
  }
  catch (error) {
    console.log(error)
  }
  aiSlugPending.value = false
}

onMounted(() => {
  if (link.value.expiration) {
    form.setFieldValue('optional.expiration', unix2date(link.value.expiration))
  }
})

async function onSubmit(formData) {
  const optionalData = formData.optional || {}

  // 处理标签
  let tags = []
  if (optionalData.tagsInput) {
    tags = optionalData.tagsInput
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(Boolean)
  }

  const payload = {
    url: formData.url,
    slug: formData.slug,
    comment: optionalData.comment,
    fallbackUrl: optionalData.fallbackUrl,
    wechatUrl: optionalData.wechatUrl,
    wechatShield: optionalData.wechatShield,
    tags,
    expiration: optionalData.expiration ? date2unix(optionalData.expiration, 'end') : undefined,
  }

  try {
    const { link: newLink } = await useAPI(isEdit ? '/api/link/edit' : '/api/link/create', {
      method: isEdit ? 'PUT' : 'POST',
      body: payload,
    })
    dialogOpen.value = false
    emit('update:link', newLink, isEdit ? 'edit' : 'create')
    toast.success(isEdit ? '短链更新成功！' : '短链创建成功！')
  }
  catch (e) {
    toast.error('操作失败', { description: e.data?.statusText || e.message })
  }
}

const { previewMode } = useRuntimeConfig().public
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogTrigger as-child>
      <slot>
        <Button
          variant="outline"
          class="flex items-center gap-1.5"
          @click="randomSlug"
        >
          <Plus class="w-4 h-4" />
          <span>新建短链</span>
        </Button>
      </slot>
    </DialogTrigger>
    <DialogContent class="max-w-[95svw] max-h-[95svh] md:max-w-xl grid-rows-[auto_minmax(0,1fr)_auto]">
      <DialogHeader>
        <DialogTitle>{{ link.id ? '编辑短链通道' : '新建单条短链' }}</DialogTitle>
        <DialogDescription class="text-xs text-gray-500">
          支持配置目标网址、微信专享路径、到期自动拦截与项目业务标签。
        </DialogDescription>
      </DialogHeader>

      <p
        v-if="previewMode"
        class="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg"
      >
        提示：预览模式下短链最长有效期为 24 小时。
      </p>

      <div
        v-if="!isEdit"
        class="flex flex-wrap items-center gap-1.5 px-2 py-1 text-xs text-gray-500"
      >
        <span>常用渠道:</span>
        <button
          type="button"
          class="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          @click="appendUTM('wechat')"
        >
          + 微信
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          @click="appendUTM('weibo')"
        >
          + 微博
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          @click="appendUTM('xiaohongshu')"
        >
          + 小红书
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          @click="appendUTM('instagram')"
        >
          + Instagram
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          @click="appendUTM('tiktok')"
        >
          + TikTok
        </button>
      </div>

      <AutoForm
        class="px-2 space-y-2 overflow-y-auto"
        :schema="EditLinkSchema"
        :form="form"
        :field-config="fieldConfig"
        :dependencies="dependencies"
        @submit="onSubmit"
      >
        <template #slug="slotProps">
          <div
            v-if="!isEdit"
            class="relative"
          >
            <div class="absolute right-0 flex space-x-3 top-1">
              <Shuffle
                class="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-700"
                title="随机生成短链"
                @click="randomSlug"
              />
              <Sparkles
                class="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700"
                title="AI 智能生成"
                :class="{ 'animate-bounce': aiSlugPending }"
                @click="aiSlug"
              />
            </div>
            <AutoFormField
              v-bind="slotProps"
            />
          </div>
        </template>
        <DialogFooter class="pt-2">
          <DialogClose as-child>
            <Button
              type="button"
              variant="secondary"
              class="mt-2 sm:mt-0"
            >
              取消
            </Button>
          </DialogClose>
          <Button type="submit" class="bg-red-600 hover:bg-red-700 text-white">
            保存短链
          </Button>
        </DialogFooter>
      </AutoForm>
    </DialogContent>
  </Dialog>
</template>
