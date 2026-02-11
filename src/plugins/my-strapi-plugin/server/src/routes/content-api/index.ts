export default () => ({
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/',
      // name of the controller file & the method.
      handler: 'controller.index',
      config: {
        policies: [],
      },
    },
    {
        method: 'POST',
        path: '/create',
        handler: 'controller.create',
        config: {
            policies: [],
        },
    },
  ],
});
