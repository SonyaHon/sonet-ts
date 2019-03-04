const {WebapiServer} = require('./dist-lib/webapi-server');
let server = new WebapiServer();
(async () => {
  await server.listen();
})();