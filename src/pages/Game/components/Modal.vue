<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="visible" class="modal-backdrop" @click.self="emit('close')">
                <div class="modal-card" role="dialog" aria-modal="true">
                    <button class="modal-close" type="button" @click="emit('close')" aria-label="关闭">×</button>
                    <slot />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts" setup>
defineProps<{
    visible: boolean
}>()

const emit = defineEmits<{
    close: []
}>()
</script>

<style lang="less" scoped>
@import './Modal.less';
</style>
