import nodemailer from 'nodemailer';
//Mail is important for Type importing here. Don't delete this row.
import Mail from "nodemailer/lib/mailer";
const config = require('config');

type MailResponse = {
    accepted: Array<string>,
    rejected: Array<unknown>,
    envelopeTime: number,
    messageTime: number,
    messageSize: number,
    response: string,
    envelope: {from: string, to: string},
    messageId: string
}

class Mailer {
    private mailer: nodemailer.Transporter;
    constructor() {
        this.mailer = nodemailer.createTransport({
            service: 'qq',
            port: 465, // SMTP 端口
            secure: true, 
            auth: {
                user: process.env[config.get("mailer.auth_user")],
                pass: process.env[config.get("mailer.auth_pwd")], //qq邮箱给予的授权码
            }
          });
    }
    /**
     * 发送邮件
     * @param to 接受邮件地址
     * @param subject 主题，标题
     * @param content 内容
     * @returns Promise object
     */
    sendMail(to:string, subject:string, content:string): Promise<MailResponse> {
        return this.mailer.sendMail({
            from: `"Clark" <${process.env[config.get("mailer.auth_user")]}>`,
            to: to,
            subject: subject,
            text: '无需回复',
            html: content
        })
    }
}

export {Mailer};
export type {MailResponse};