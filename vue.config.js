module.exports = {
  transpileDependencies: ['vuetify'],
  devServer: {
    disableHostCheck: true,
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = 'Live Timing Broadcaster';
      args[0].favicon = './public/favicon.ico';
      return args;
    });
  },
};
