'use strict';

const svgCaptcha = require('svg-captcha');
const fse = require('fs-extra');
const path = require('path');

const BaseController = require('./base');

class UtilsController extends BaseController {
	// 验证码
	async captcha() {
		const captchaObj = svgCaptcha.create({
			size: 4,
			fontSize: 50,
			width: 100,
			height: 40
		});
		this.ctx.session.captcha = captchaObj.text;
		this.ctx.response.type = 'image/svg+xml';

		this.ctx.body = captchaObj.data;
	}

	// 邮箱验证码
	async sendcode() {
		const email = this.ctx.query.email;
		const code = Math.random().toString().slice(2, 8);
		// 将code存放在session中
		this.ctx.session.emailcode = code;

		const subject = 'QQ邮箱验证码';
		const text = '';
		const html = `<h2>小丰社区</h2><a href="https://ailance.top"><span>验证码:</span><span>${code}</span></a>`;

		const hasSend = await this.service.tool.sendMail(email, subject, text, html);
		if (hasSend) {
			this.message('发送成功');
		} else {
			this.error('发送失败');
		}
	}

	async checkfile() {
		const { ext, hash } = this.ctx.request.body;
		const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`);

		let uploaded = false;
		let uploadedList = [];
		if (fse.existsSync(filePath)) {
			// 文件存在
			uploaded = true;
		} else {
			uploadedList = await this.getUploadedList(path.resolve(this.config.UPLOAD_DIR, hash));
		}
		this.success({
			uploaded,
			uploadedList
		});
	}

	async getUploadedList(dirPath) {
		return fse.existsSync(dirPath) ? (await fse.readdir(dirPath)).filter(name => name[0] !== '.') : [];
	}

	// 简单上传实现01
	// async uploadfile() {
	// 	const { ctx } = this;
	// 	// const filename = ctx.request.body.filename;
	// 	const file = ctx.request.files[0];
	// 	// console.log(ctx.request.body, '地址....');
	// 	fse.move(file.filepath, this.config.UPLOAD_DIR + `/${file.filename}`);
	// 	console.log(file, 'requers');
	// }

	// 简单上传实现01
	async uploadfile() {
		const { ctx } = this;
		// const filename = ctx.request.body.filename;
		const file = ctx.request.files[0];
		const { hash, name } = ctx.request.body;

		const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash);
		// const filePath = path.resolve()

		if (!fse.existsSync(chunkPath)) {
			await fse.mkdir(chunkPath);
		}

		// console.log(ctx.request.body, '地址....');
		await fse.move(file.filepath, `${chunkPath}/${name}`);
		this.message(' 切片上传成功 ');

		// console.log(file, 'requers');
	}

	async mergefile() {
		const { ext, size, hash } = this.ctx.request.body;
		const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`);
		await this.ctx.service.tool.mergeFile(filePath, hash, size);
		this.success({
			url: `/public/${hash}.${ext}`
		});
	}
}

module.exports = UtilsController;
