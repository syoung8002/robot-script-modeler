<template>
    <div>
        <v-card flat>
            <v-card-text v-if="type=='Call Method'">
                <p>Input Arguments</p>
            </v-card-text>
        </v-card>
    </div>
</template>


<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator"

    @Component
    export default class TaskPanel extends Vue {
        @Prop() public type!: String
        @Prop() public value!: any
    }
</script>