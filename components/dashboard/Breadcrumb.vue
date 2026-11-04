<script setup>
import { NuxtLink } from '#components'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})
const { title: siteTitle } = useAppConfig()
</script>

<template>
  <Breadcrumb class="flex justify-between items-center">
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">
          {{ siteTitle }}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink
          :as="NuxtLink"
          to="/dashboard/links"
        >
          工作台
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage class="font-medium text-gray-900 dark:text-gray-100">{{ props.title }}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>

    <DashboardLogout />
  </Breadcrumb>
</template>
