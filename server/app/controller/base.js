const { Controller } = require('egg');

class BaseController extends Controller {
  success(data) {
    this.ctx.body = {
      code: 200,
      data,
    };
  }
  message(message) {
    this.ctx.body = {
      code: 200,
      message,
    };
  }
  error(message, code = 500, errors = {}) {
    this.ctx.body = {
      code,
      message,
      errors,
    };
  }
}

module.exports = BaseController;
