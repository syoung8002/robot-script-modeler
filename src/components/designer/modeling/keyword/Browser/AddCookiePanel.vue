<template>
    <div class="align-start flex-column mb-6">
        <div class="ma-2 pa-2 ">
            <v-text-field
                label="Name"
                v-model="value.name"
                outlined
                hint="Name of cookie"
                persistent-hint
            ></v-text-field>
        </div>
        <div class="ma-2 pa-2">
            <v-text-field
                label="Value"
                v-model="value.value"
                outlined
                hint="Value for cookie"
                persistent-hint
            ></v-text-field>
        </div>
        
        <div class="ma-2 pa-2">
            <v-text-field
                label="Path"
                v-model="value.path"
                outlined
                hint="URL Path restriction"
                persistent-hint
            ></v-text-field>
        </div>
       
        <div class="ma-2 pa-2">
            <v-text-field
                label="Domain"
                v-model="value.domain"
                outlined
                hint="Domain restriction"
                persistent-hint
            ></v-text-field>
        </div>
        <div style="padding-left: 8px; margin-left: 8px; margin-top: -15px; margin-bottom: 15px;">
            <v-switch
                v-model="value.secure"
                label="Secure"
                color="success"
                hint="Only send over HTTPS"
                persistent-hint
            ></v-switch>
        </div>
        <div class="ma-2 pa-2">
            <v-text-field
                label="URL"
                v-model="value.expiry"
                outlined
                hint="Expiration timestamp"
                persistent-hint
            ></v-text-field>
        </div>
    </div>
    
</template>

<script lang="ts">
    import { Component, Mixins } from "vue-property-decorator"
    import TaskPanel from '@/components/designer/modeling/panels/TaskPanel.vue'

    @Component({
        components: {
            TaskPanel,
        }
    })
    export default class AddCookiePanel extends Mixins(TaskPanel) {
    }
</script>