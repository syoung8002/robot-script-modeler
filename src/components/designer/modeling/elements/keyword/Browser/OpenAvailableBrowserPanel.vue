<template>
    <div>
        <v-card flat>
            <v-card-title class="subtitle-1">
                Input Arguments
            </v-card-title>
            
            <v-card-text>
                <v-text-field
                        v-model="value.property.url"
                        label="URL"
                        hint="Open directly to the given URL"
                        persistent-hint
                        outlined
                        dense
                ></v-text-field>
                <v-switch
                        v-model="value.property.headless"
                        label="Headless"
                        hint="Do not open a visible window"
                        persistent-hint
                        class="py-0 mb-6"
                ></v-switch>
                <v-switch
                        v-model="value.property.maximized"
                        label="Maximized"
                        hint="Maximized the browser window"
                        persistent-hint
                        class="py-0 mb-6"
                ></v-switch>
            </v-card-text>
        </v-card>

        <return-values-field
                :value.sync="value.property.returnVal"
        ></return-values-field>
    </div>
</template>

<script lang="ts">
    import { Component, Mixins } from "vue-property-decorator"
    import KeywordPanel from '../../panels/KeywordPanel.vue'

    @Component({
        components: {
            KeywordPanel,
        }
    })
    export default class OpenAvailableBrowserPanel extends Mixins(KeywordPanel) {
    }
</script>