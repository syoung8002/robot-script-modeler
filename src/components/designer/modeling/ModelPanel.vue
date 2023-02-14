<template>
    <v-navigation-drawer
            absolute
            permanent
            right
    >
        <template v-slot:prepend>
            <v-list-item two-line>
                <v-list-item-avatar>
                    <v-icon>{{ elementInfo.icon }}</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                    <v-list-item-title>{{ elementInfo.type }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>

        <v-divider></v-divider>

        <v-card outlined>
            <v-card-text>
                <v-text-field
                        v-model="config.name"
                        label="Name"
                        autofocus
                ></v-text-field>
            </v-card-text>
        </v-card>
    </v-navigation-drawer>
</template>

<script>
    export default {
        name: 'ModelPanel',
        props: {
            value: Object,
        },
        data () {
            return {
            }
        },
        created() {
        },
        computed: {
            config: {
                get() {
                    return this.value
                },
                set(newVal) {
                    this.$emit(newVal, 'update');
                }
            },
            elementInfo() {
                const me = this
                if(me.value.type.includes('task')) {
                    return {
                        type: 'Rectangle',
                        icon: 'mdi-square'
                    }
                }
                if(me.value.type.includes('event')) {
                    return {
                        type: 'event',
                        icon: 'mdi-circle'
                    }
                }
                if(me.value.type.includes('gateway')) {
                    if(me.value.sides === 4) {
                        return {
                            type: 'Triangle',
                            icon: 'mdi-rhombus'
                        }
                    }
                }
            }
        },
    }
</script>