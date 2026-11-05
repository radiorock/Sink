<script setup>
const route = useRoute()
const slugParam = computed(() => route.query.slug || '')

const link = ref({})
const id = computed(() => link.value.id)
const currentSlug = computed(() => link.value.slug || slugParam.value)

provide('id', id)
provide('slug', currentSlug)

async function getLink() {
  const data = await useAPI('/api/link/query', {
    query: {
      slug: slugParam.value,
    },
  })
  link.value = data || {}
}

function updateLink(newLink, type) {
  if (type === 'delete') {
    navigateTo('/dashboard/links', {
      replace: true,
    })
  }
  else if (newLink) {
    link.value = newLink
  }
}

onMounted(() => {
  getLink()
})
</script>

<template>
  <main class="space-y-6">
    <DashboardBreadcrumb title="短链详情" />
    <DashboardLinksLink
      v-if="link.id"
      :link="link"
      @update:link="updateLink"
    />
    <Dashboard
      v-if="link.id"
      :link="link"
    />
  </main>
</template>
