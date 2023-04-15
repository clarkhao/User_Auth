import * as nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";
import CryptoJS from "crypto-js";

const randomString = (length: number) => {
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  const decoder = new TextDecoder();
  return decoder.decode(randomValues);
};
//TypedArray connect
const concatArray = (arr: Uint8Array, brr: Uint8Array) => {
  const length = arr.length + brr.length;
  const crr = new Uint8Array(length);
  crr.set(arr);
  crr.set(brr);
  return crr;
};
//TypedArray
const tarrToStr = (arr: Uint8Array, isBase64 = false) => {
  const decoder = new TextDecoder();
  if (!isBase64) return decoder.decode(arr);
  else return btoa(decoder.decode(arr));
};
//敏感数据
const hybrydEncryptWithSign = (data: unknown) => {
  // Sender's key pair
  const senderKeys = nacl.box.keyPair();
  // Generate a new random 32-byte secret key
  const symmetricKey = nacl.randomBytes(nacl.secretbox.keyLength);
  // Generate a new random 24-byte nonce
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  // Encrypt the data with the secret key and nonce using secretbox
  const messageStr = JSON.stringify(data);
  const messageUint8 = new TextEncoder().encode(messageStr);
  const encryptedData = nacl.secretbox(messageUint8, nonce, symmetricKey);
  // Encrypt the symmetric key with public key using box
  const publicKey = naclUtil.decodeBase64(
    process.env.NEXT_PUBLIC_SECRET_KEY as string
  );
  console.log(publicKey);
  // Encrypt the symmetric key with the recipient's public key
  const encryptedSymmetricKey = nacl.box(
    symmetricKey,
    nonce,
    publicKey,
    senderKeys.secretKey
  );
  // Sign the encrypted message and encrypted symmetric key using the sender's secret key
  const signature = nacl.sign.detached(
    concatArray(encryptedData, encryptedSymmetricKey),
    senderKeys.secretKey
  );
  // Convert the encrypted message, encrypted symmetric key, nonce, and signature to base64
  const base64EncryptedData = tarrToStr(encryptedData, true);
  const base64EncryptedSymmetricKey = tarrToStr(encryptedSymmetricKey, true);
  const base64Nonce = tarrToStr(nonce, true);
  const base64Signature = tarrToStr(signature, true);
  // Send the encrypted message, encrypted symmetric key, nonce, and signature to the server
  const readyData = {
    encryptedMessage: base64EncryptedData,
    encryptedSymmetricKey: base64EncryptedSymmetricKey,
    nonce: base64Nonce,
    signature: base64Signature,
  };
};
//

const hybridEncrypt = async (data: unknown) => {
  try {
    // 对称加密
    const key = CryptoJS.lib.WordArray.random(16);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv: iv,
    });
    const encryptedString = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    const keyString = key.toString(CryptoJS.enc.Base64);
    const ivString = iv.toString(CryptoJS.enc.Base64);
    //非对称加密
    const JSEncrypt = (await import('jsencrypt')).default
    const encryptor = new JSEncrypt();
    //env publickey saved in base64 string, first from base64 to string
    const savedKey = process.env.NEXT_PUBLIC_SECRET_KEY as string;
    const publicKey = window.atob(savedKey);
    encryptor.setPublicKey(publicKey);
    const encryptedKey = encryptor.encrypt(keyString.concat(`:${ivString}`));
    if (!encryptedKey) throw new Error("asymmetric encrypte failed");
    return encryptedString.concat(`:${encryptedKey}`);
  } catch (error) {
    throw error;
  }
};

export { randomString, hybridEncrypt };
