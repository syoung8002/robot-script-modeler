<script lang="ts">
    import { Component, Mixins } from "vue-property-decorator"
    import KeywordElement from '@/components/designer/modeling/elements/KeywordElement.vue'

    @Component({
        components: {
            KeywordElement,
        }
    })
    export default class CallMethod extends Mixins(KeywordElement) {
        mounted() {
        }
    }
</script>