const md5 = require('md5');
const jwt = require('jsonwebtoken');
const BaseController = require('./base');

const createRule = {
	email: { type: 'email' },
	nickname: { type: 'string' },
	password: { type: 'string' },
	captcha: { type: 'string' }
};

const HashSalt = ':nickYang@1221com';

class UserController extends BaseController {
	async login() {
		const { ctx, app } = this;
		const { email, password, captcha, emailcode } = ctx.request.body;

		if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
			return this.error('验证码错误!');
		}

		if (emailcode !== ctx.session.emailcode) {
			return this.error('邮箱验证码错误!');
		}

		const user = await ctx.model.User.findOne({
			email,
			password: md5(password + HashSalt)
		});

		if (!user) {
			return this.error('用户名或密码错误!');
		}
		const token = jwt.sign(
			{
				_id: user._id,
				email
			},
			app.config.jwt.secret,
			{
				expiresIn: '1h'
			}
		);
		this.success({ token, email, nickname: user.nickname });
	}

	// 注册
	async register() {
		const { ctx } = this;
		try {
			// 校验参数
			ctx.validate(createRule);
		} catch (e) {
			return this.error('参数校验失败', 400, e);
		}
		const { email, nickname, password, captcha } = ctx.request.body;
		if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
			return this.error('验证码错误!');
		}
		if (await this.checkEmail(email)) {
			this.error('邮箱重复!');
		} else {
			const res = await ctx.model.User.create({
				email,
				nickname,
				password: md5(password + HashSalt)
			});
			if (res._id) {
				this.message('注册成功!');
			}
		}
	}

	async checkEmail(email) {
		const user = this.ctx.model.User.findOne({ email });
		return user;
	}

	async verify() {}

	async info() {
		const { email } = this.ctx.state;
		const user = await this.checkEmail(email);
		console.log(user, 'user....');
		this.success(user);
	}
}

module.exports = UserController;
