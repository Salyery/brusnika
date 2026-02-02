<template>
  <component :is="iconComponent" :size="size" :color="color" />
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import * as LucideIcons from 'lucide-vue-next';

interface Props {
  name: string;
  size?: number | string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  color: undefined,
});

const iconComponent = computed<Component | null>(() => {
  const Icon = (LucideIcons as any)[props.name];
  return Icon || null;
});
</script>