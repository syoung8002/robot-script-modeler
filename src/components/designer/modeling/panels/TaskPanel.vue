<template>
    <div>
        <v-card flat>
            <v-card-text v-if="taskType=='Call Method'">
                <p>Input Arguments</p>
            </v-card-text>
            <component 
                v-if="taskType"
                :is="taskType+'-panel'"
                :value="value"
            ></component>
        </v-card>
    </div>
</template>


<script lang="ts">
    import { Vue, Component, Prop, Mixins } from "vue-property-decorator";
    import Panel from "@/components/designer/modeling/panels/Panel.vue";

    @Component({
        components: {
            Panel
        }
    })
    export default class TaskPanel extends Mixins(Panel) {
    }
</script>