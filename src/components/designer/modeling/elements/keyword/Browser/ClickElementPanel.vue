<template>
    <div>
        <v-card flat>
            <v-card-title class="subtitle-1">
                Input Arguments
            </v-card-title>

            <v-card-text>
                <locator-field
                        :value.sync="value.property.locator"
                ></locator-field>

                <variables-field
                        :label="'Modifier'"
                        :hint="'Click with modifier key'"
                        :value.sync="value.property.modifier"
                ></variables-field>
            </v-card-text>
        </v-card>
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
    export default class ClickElementPanel extends Mixins(KeywordPanel) {
    }
</script>