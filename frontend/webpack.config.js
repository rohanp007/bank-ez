module.exports = {
    devServer: {
      setupMiddlewares: (middlewares, devServer) => {
        // Place custom middleware logic here if needed
        return middlewares;
      },
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
  };