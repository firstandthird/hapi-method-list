'use strict';
const traverse = require('traverse');
const defaultMethod = require('lodash.defaults');
const getParams = require('get-parameter-names');

const defaults = {
  route: '/api/listMethods',
  verbose: false,
  auth: undefined
};

exports.register = (server, options, next) => {
  options = defaultMethod(defaults, options);

  const getMethodInfo = (methodName, method) => {
    return {
      name: methodName,
      params: getParams(method)
    };
  };

  const generateMethodTable = (serverMethods) => {
    return traverse(serverMethods).reduce(function(acc, val) {
      if (this.isLeaf) {
        const pathString = this.path.length === 1 ? this.path[0] : this.path.join('.');
        acc.push(getMethodInfo(pathString, val));
      }
      return acc;
    }, []);
  };

  server.route({
    path: options.route,
    config: {
      auth: options.auth
    },
    method: 'GET',
    handler: (request, reply) => {
      reply(generateMethodTable(request.server.methods));
    }
  });
  next();
};
exports.register.attributes = {
  pkg: require('./package.json')
};
