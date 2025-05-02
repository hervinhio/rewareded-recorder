module.exports = {
  //...
  devServer: {
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:8000',
      },
      {
        context: ['/auth'],
        target: 'http://localhost:8000',
      },
      {
        context: ['/sec'],
        target: 'http://localhost:8000',
      },
    ],
  },
};
