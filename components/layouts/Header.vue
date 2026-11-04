<script setup>
import { Ellipsis, X } from 'lucide-vue-next'
import SwitchTheme from '../SwitchTheme.vue'

const showMenu = ref(false)
const { title } = useAppConfig()
</script>

<template>
  <section class="pb-4">
    <nav class="container relative z-50 h-20 select-none">
      <div
        class="container relative flex flex-wrap items-center justify-between h-20 px-0 mx-auto overflow-hidden font-medium border-b border-gray-200 dark:border-gray-800 md:overflow-visible"
      >
        <div class="flex items-center justify-start h-full pr-4">
          <a
            href="/"
            :title="title"
            class="flex items-center transition-opacity hover:opacity-85"
          >
            <img
              src="/showtime-logo.png"
              :alt="title"
              class="h-8 md:h-9 w-auto object-contain dark:hidden"
            >
            <img
              src="/showtime-logo-dark.png"
              :alt="title"
              class="h-8 md:h-9 w-auto object-contain hidden dark:block"
            >
          </a>
        </div>

        <div
          class="top-0 left-0 items-start w-full h-full p-4 text-sm bg-gray-900 bg-opacity-50 md:items-center md:w-auto md:absolute md:right-0 lg:text-base md:bg-transparent md:p-0 md:relative md:flex"
          :class="{ 'flex fixed': showMenu, 'hidden': !showMenu }"
          @touchmove.prevent
        >
          <div
            class="flex-col w-full h-auto overflow-hidden rounded-lg bg-background md:overflow-visible md:rounded-none md:relative md:flex md:flex-row md:items-center md:space-x-4"
          >
            <a
              href="/"
              :title="title"
              class="inline-flex items-center w-auto h-16 px-4 md:hidden transition-opacity hover:opacity-85"
            >
              <img
                src="/showtime-logo.png"
                :alt="title"
                class="h-7 w-auto object-contain dark:hidden"
              >
              <img
                src="/showtime-logo-dark.png"
                :alt="title"
                class="h-7 w-auto object-contain hidden dark:block"
              >
            </a>
            <div
              class="flex flex-col items-start justify-end w-full pt-4 md:items-center md:flex-row md:py-0 md:space-x-3"
            >
              <a
                class="w-full px-4 py-2 font-semibold text-gray-700 hover:text-red-600 dark:text-gray-200 dark:hover:text-red-400 cursor-pointer md:w-auto transition-colors"
                href="/dashboard"
                title="管理工作台"
              >管理工作台</a>
              <span class="mt-2 md:mt-0">
                <SwitchTheme />
              </span>
            </div>
          </div>
        </div>

        <div
          class="absolute right-0 flex flex-col items-center justify-center w-10 h-10 rounded-full cursor-pointer md:hidden hover:bg-muted"
          :class="{ 'right-2': showMenu }"
          @click="showMenu = !showMenu"
        >
          <Ellipsis
            v-show="!showMenu"
            class="w-6 h-6"
          />
          <X
            v-show="showMenu"
            class="w-6 h-6"
          />
        </div>
      </div>
    </nav>
  </section>
</template>
