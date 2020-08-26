import util from 'util';
import process from 'process';
import restify from 'restify-clients';

const client = restify.createJsonClient({
  url: 'http://localhost:' + process.env.PORT,
  version: '*'
});

client.basicAuth('them', 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF');

client.get('/find/'+process.argv[2], (err, req, res, obj) => {
  if (err) console.error(err.stack);
  else console.log('Found ' + util.inspect(obj));
});
