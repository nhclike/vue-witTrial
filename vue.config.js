const webpack = require('webpack');
const path = require('path');
const projectName = '/protal/'; // 配置应用的基路径
function resolve(dir) {
    return path.join(__dirname, dir);
}

module.exports = {
    // publicPath: projectName, // 配置应用的基路径
    // 解决ie报错问题
    transpileDependencies: ['ant-design-vue'],
    // 配置postcss
    css: {
        loaderOptions: {
            less: {
                // 统一定制ant-design-vue的样式
                lessOptions: {
                    modifyVars: {
                        'primary-color': '#3874FF',
                        'btn-height-base': '40px',
                        'font-size-base': '24px'
                    },
                    javascriptEnabled: true
                }
            },
            postcss: {
                plugins: [
                    require('postcss-px2rem')({
                        remUnit: 100
                    })
                ]
            }
        }
    },
    pluginOptions: {
        'style-resources-loader': {
            preProcessor: 'less',
            patterns: [
                // 这个是加上自己的路径,不能使用(如下:alias)中配置的别名路径
                path.resolve(__dirname, './src/assets/style/variables.less')
            ]
        }
    },

    // eslint-loader 是否在保存的时候检查
    lintOnSave: false,

    // 生产环境是否生成 sourceMap 文件，一般情况不建议打开
    productionSourceMap: false,

    configureWebpack: (config) => {
        // 配置文件路径
        Object.assign(config, {
            resolve: {
                extensions: ['.js', '.vue', '.json', '.css', '.scss', '.less'],
                alias: {
                    vue$: 'vue/dist/vue.esm.js',
                    '@': resolve('src'),
                    '@@': resolve('src/views'),
                    style: resolve('src/assets/style')
                }
            }
        });
        let pluginsWebpack = [
            // 使用ProvidePlugin加载的模块，需要在eslintrc.js的globals里设置
            new webpack.ProvidePlugin({
                axios: 'axios'
            }),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                'window.$': 'jquery'
            })
        ];
        if (process.env.NODE_ENV === 'production') {
            // 为生产环境修改配置...
            // 使用DefinePlugin暴露的全局变量，需要在eslintrc.js的globals里设置
            pluginsWebpack.push(
                new webpack.DefinePlugin({
                    __PROJECTPATH__: JSON.stringify(''),
                    __API__: JSON.stringify('api'),
                    __PROJECTNAME__: JSON.stringify(projectName) // 配置应用的基路径
                })
            );
        } else {
            // 为开发环境修改配置...
            pluginsWebpack.push(
                new webpack.DefinePlugin({
                    __PROJECTPATH__: JSON.stringify(''),
                    __SHJ__: JSON.stringify('/shj'),
                    __API__: JSON.stringify('/api'),
                    __PROJECTNAME__: JSON.stringify(projectName) // 配置应用的基路径
                })
            );
        }
        config.plugins = [...config.plugins, ...pluginsWebpack];
    },
    // 改变webpack
    chainWebpack: (config) => {
        config.entry('main').add('babel-polyfill');
        config.module
            .rule('swf')
            .test(/\.swf$/)
            .use('url-loader')
            .loader('url-loader')
            .options({
                limit: 10000
            }); // 配置videojs
    },

    devServer: {
        open: true,
        host: '0.0.0.0', // target host
        port: 8000,
        disableHostCheck: true,
        // 设置代理
        proxy: {
            '/api': {
                //  target: 'http://172.19.82.86:9139', // 246
                // target: 'http://172.19.82.114:8080', // 高天禹
                target: 'http://172.19.82.152:8080', // 钱兴隆
                //target: 'http://172.19.82.176:8080', // 钱兴隆

                pathRewrite: {
                    '^/api': ''
                }
            },
            '/shj': {
                target: 'http://172.19.82.195:8081',
                // target: 'http://10.5.151.183:999/mockjsdata', // 域名
                ws: true, // 是否启用websockets
                // 开启代理：在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，
                // 这样服务端和服务端进行数据的交互就不会有跨域问题
                changOrigin: true,
                pathRewrite: {
                    '^/shj': ''
                }
            }
        }
    }
};
