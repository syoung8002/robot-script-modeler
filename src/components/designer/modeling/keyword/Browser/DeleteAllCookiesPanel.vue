<template>
    <div>
        작업 필요
    </div>
    
</template>

<script lang="ts">
    import { Component, Mixins } from "vue-property-decorator"
    import KeywordPanel from '@/components/designer/modeling/panels/KeywordPanel.vue'

    @Component({
        components: {
            KeywordPanel,
        }
    })
    export default class DeleteAllCookiesPanel extends Mixins(KeywordPanel) {
    }
</script>