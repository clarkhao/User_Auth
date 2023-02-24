/**
 * secret取自req.secret密语，sign取自req.sign,签名，data取自req.data是加密后的前端数据
 * 
 */
import crypto from 'crypto';
import config from 'config';

class Cryption {
    private secret: string;
    private sign: string;
    private data: string;
    private decryptedSecret: string;
    decrypted: string = '';
    private ending: string;
    private secretKey = crypto.createPrivateKey({
        key: Buffer.from(process.env.SECRET_KEY || '', 'base64'),
        format: "der",
        type: 'pkcs1',
    });
    private dataKey = crypto.createPrivateKey({
        key: Buffer.from(process.env.DATA_KEY || '', 'base64'),
        format: "der",
        type: 'pkcs1',
    });
    constructor(secret: string, sign:string, data:string) {
        this.secret = secret;
        this.sign = sign;
        this.data = data;
        this.decryptedSecret = '';
        this.ending = process.env[config.get('frontend.word')] || '';
    }
    private decryptData(encrypted:string, key:crypto.KeyObject) {
        const rsaPrivateKey = {
            key: key,
            //passphrase: '',
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        };
        const decryptedData = crypto.privateDecrypt(
            rsaPrivateKey,
            Buffer.from(encrypted, 'base64'),
        );
        return decryptedData.toString();
    }
    /**
     * 解密req.secret，并验证其是否是密语
     */
    public isSecret() {
        this.decryptedSecret = this.decryptData(this.secret,this.secretKey);
        return this.decryptedSecret.endsWith(this.ending);
    }
    /**
     * 解密req.data，并使用密语secret对其进行生成签名sign, 然后比对req.sign，验证签名
     */
    public isSignValidated() {
        const decrypted = this.decryptData(this.data, this.dataKey);
        this.decrypted = decrypted;
        const crypted = require("crypto")
                    .createHmac("md5", this.decryptedSecret)
                    .update(decrypted)
                    .digest("hex");
        return crypted === this.sign;
    }
}

export {Cryption}
