const dotenv_conf = require('dotenv').config();
const dotenv_expand = require('dotenv-expand');
const auth = require('basic-auth')

dotenv_expand.expand(dotenv_conf);

const admins = { together: { password: process.env.PROJECTOR_PASSWORD } }

module.exports = function (request, response, next) {
  var user = auth(request)
  if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
    response.set('WWW-Authenticate', 'Basic realm="example"')
    return response.status(401).send()
  }
  return next()
}