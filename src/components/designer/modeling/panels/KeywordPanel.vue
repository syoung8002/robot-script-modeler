<template>
    <div>
        <v-card flat>
            <v-card-text v-if="keywordType=='Call Method'">
                <p>Input Arguments</p>
            </v-card-text>
            <div v-if="keywordType == 'keyword'">
                Todo: Task 변경 관련 List 출력
            </div>
            <component 
                v-else
                :is="keywordType+'-panel'"
                :value="value"
            ></component>
        </v-card>
    </div>
</template>


<script lang="ts">
    import { Vue, Component, Prop, Mixins } from "vue-property-decorator";
    import Panel from "@/components/designer/modeling/panels/Panel.vue";
    import ElementList from "@/components/designer/modeling/ElementList.vue";

    @Component({
        components: {
            Panel,
            ElementList
        }
    })
    export default class Keyword extends Mixins(Panel) {
        mounted() {
            console.log(this.keywordType)
        }
    }
</script>