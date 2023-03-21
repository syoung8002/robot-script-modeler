<script lang="ts">
    import { Component, Mixins } from "vue-property-decorator"
    import TaskElement from '@/components/designer/modeling/elements/TaskElement.vue'

    @Component({
        components: {
            TaskElement,
        }
    })
    export default class OpenAvailableBrowser extends Mixins(TaskElement) {
        mounted() {
        }
    }
</script>