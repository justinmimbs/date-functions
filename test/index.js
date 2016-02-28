const req = require.context('../lib/', true, /\.spec\.js$/);
req.keys().forEach(req);
 