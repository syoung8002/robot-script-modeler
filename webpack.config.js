
module.exports = {
    module: {
        rules: [
            {
                test: /\.sass$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'cssimportant-loader',
                    {
                        loader: require.resolve("sass-loader"),
                        options: {
                            additionalData: "@import './src/assets/scss/variables.scss'"
                        },
                    }
                ],
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader', 'cssimportant-loader' ],
            }
        ]
    },
}
