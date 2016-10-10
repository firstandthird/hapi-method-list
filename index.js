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
  options = defaultMethod(options, defaults);

  const getParamHtml = (params) => {
    return params.reduce((memo, param) => {
      memo += `<td>${param} </td>`;
      return memo;
    }, '');
  };

  const getMethodHtml = (methodName, method) => {
    return `<tr><td><b>${methodName} </b></td> ${ getParamHtml(getParams(method))} </tr>`;
  };

  const getMethodInfo = (methodName, method) => {
    return {
      name: methodName,
      params: getParams(method)
    };
  };

  const generateMethodTable = (serverMethods, asJSON) => {
    // return a JSON object:
    if (asJSON) {
      return traverse(serverMethods).reduce(function(acc, val) {
        if (this.isLeaf) {
          acc.push(getMethodInfo(this.path.length === 1 ? this.path[0] : this.path.join('.'), val));
        }
        return acc;
      }, []);
    }
    // return an HTML table:
    return traverse(serverMethods).reduce(function(acc, val) {
      if (this.isLeaf) {
        acc += getMethodHtml(this.path.length === 1 ? this.path[0] : this.path.join('.'), val);
      }
      return acc.replace('\n', '');
    }, '<table>') + '</table>';
  };

  server.route({
    path: options.route,
    config: {
      auth: options.auth
    },
    method: 'GET',
    handler: (request, reply) => {
      reply(generateMethodTable(request.server.methods, request.query.asJSON));
    }
  });
  next();
};
exports.register.attributes = {
  pkg: require('./package.json')
};
