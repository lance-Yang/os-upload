const jwt = require('jsonwebtoken');

module.exports = ({ app }) => {
	// const {ctx} = this

	return async function verify(ctx, next) {
		if (!ctx.request.header.authorization) {
			ctx.body = {
				code: 401,
				message: '用户没有登录'
			};
			return;
		}
		const token = ctx.request.header.authorization.replace('Bearer', '');
		try {
			const res = await jwt.verify(token, app.config.jwt.secret);
			ctx.state.email = res.email;
			ctx.state.userid = res._id;
			await next();
		} catch (error) {
			console.log(error);
			if (error.name === 'TokenExpiredError') {
				ctx.body = {
					code: 403,
					message: '登录已过期'
				};
			} else {
				ctx.body = {
					code: 403,
					message: 'token验证失败'
				};
			}
		}
	};
};
