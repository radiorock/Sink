<script setup>
import QRCodeStyling from 'qr-code-styling'
import { Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps({
  data: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  filename: {
    type: String,
    default: 'ShowTime-QRCode',
  },
})
const options = {
  width: 256,
  height: 256,
  data: props.data,
  margin: 10,
  qrOptions: { typeNumber: '0', mode: 'Byte', errorCorrectionLevel: 'Q' },
  imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 2 },
  dotsOptions: { type: 'dots', color: '#000000', gradient: null },
  backgroundOptions: { color: '#ffffff', gradient: null },
  image: props.image,
  dotsOptionsHelper: {
    colorType: { single: true, gradient: false },
    gradient: {
      linear: true,
      radial: false,
      color1: '#6a1a4c',
      color2: '#6a1a4c',
      rotation: '0',
    },
  },
  cornersSquareOptions: { type: 'extra-rounded', color: '#000000' },
  cornersSquareOptionsHelper: {
    colorType: { single: true, gradient: false },
    gradient: {
      linear: true,
      radial: false,
      color1: '#000000',
      color2: '#000000',
      rotation: '0',
    },
  },
  cornersDotOptions: { type: 'dot', color: '#000000' },
  cornersDotOptionsHelper: {
    colorType: { single: true, gradient: false },
    gradient: {
      linear: true,
      radial: false,
      color1: '#000000',
      color2: '#000000',
      rotation: '0',
    },
  },
  backgroundOptionsHelper: {
    colorType: { single: true, gradient: false },
    gradient: {
      linear: true,
      radial: false,
      color1: '#ffffff',
      color2: '#ffffff',
      rotation: '0',
    },
  },
}

const qrCode = new QRCodeStyling(options)
const qrCodeEl = ref(null)

onMounted(() => {
  qrCode.append(qrCodeEl.value)
})

function downloadQR() {
  try {
    qrCode.download({
      name: props.filename || 'ShowTime-QRCode',
      extension: 'png',
    })
    toast.success('物料高清二维码已开始下载！')
  }
  catch (e) {
    toast.error('下载二维码失败', { description: e.message })
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div
      ref="qrCodeEl"
      :data-text="data"
      class="rounded-lg overflow-hidden bg-white p-1 border border-border/40"
    />
    <Button
      variant="secondary"
      size="sm"
      class="w-full text-xs font-medium h-8"
      @click="downloadQR"
    >
      <Download class="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
      下载高清物料二维码 (PNG)
    </Button>
  </div>
</template>
