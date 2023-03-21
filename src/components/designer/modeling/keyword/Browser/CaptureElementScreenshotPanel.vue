<template>
    <div>
        작업 필요
    </div>
    
</template>

<script lang="ts">
    import { Component, Mixins } from "vue-property-decorator"
    import TaskPanel from '@/components/designer/modeling/panels/TaskPanel.vue'

    @Component({
        components: {
            TaskPanel,
        }
    })
    export default class CaptureElementScreenshotPanel extends Mixins(TaskPanel) {
    }
</script>