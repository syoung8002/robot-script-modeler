<template>
    <v-navigation-drawer
            absolute
            permanent
            right
    >
        <template v-slot:prepend>
            <v-list-item two-line>
                <v-list-item-avatar>
                    <v-icon>mdi-rectangle</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                    <v-list-item-title>Rectangle</v-list-item-title>
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
            }
        },
    }
</script>