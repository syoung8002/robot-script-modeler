<template>
    <div>
        <v-card flat>
            <!-- <v-card-text v-if="keywordType=='Call Method'">
                <p>Input Arguments</p>
            </v-card-text> -->
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
    import Panel from "@/components/designer/modeling/panels/CommonPanel.vue";
    import ElementList from "@/components/designer/modeling/ElementList.vue";

    @Component({
        components: {
            Panel,
            ElementList
        }
    })
    export default class Keyword extends Mixins(Panel) {
        mounted() {
        }

        get keywordType() {
            return this.kebabCase(this.value.name)
        }

        kebabCase(str: string) {
            const result = str
                .replace(/([a-z])([A-Z])/g, "$1-$2")
                .replace(/[\s_]+/g, '-')
                .toLowerCase();
            return result
        }
    }
</script>