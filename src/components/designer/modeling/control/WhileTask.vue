<script lang="ts">
    import { Component, Mixins } from "vue-property-decorator"
    import ControlElement from '@/components/designer/modeling/elements/ControlElement.vue'

    @Component({
        components: {
            ControlElement,
        }
    })
    export default class WhileTask extends Mixins(ControlElement) {
        mounted() {
        }
    }
</script>