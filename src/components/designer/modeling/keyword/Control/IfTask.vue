<template>
</template>

<script lang="ts">
    import { Component, Mixins, Watch } from "vue-property-decorator"
    import ControlElement from '@/components/designer/modeling/elements/ControlElement.vue'

    @Component({
        components: {
            ControlElement,
        }
    })
    export default class IfTask extends Mixins(ControlElement) {
    }
</script>