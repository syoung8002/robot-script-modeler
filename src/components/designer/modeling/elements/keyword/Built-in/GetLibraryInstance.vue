<script lang="ts">
    import { Component, Mixins } from "vue-property-decorator"
    import KeywordElement from '../KeywordElement.vue'

    @Component({
        components: {
            KeywordElement,
        }
    })
    export default class GetLibraryInstance extends Mixins(KeywordElement) {
        mounted() {
            this.value.property.returnVal = [{
                value: 'instance'
            }]
        }
    }
</script>