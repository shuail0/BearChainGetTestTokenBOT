
const axios = require('axios');
const randomUseragent = require('random-useragent');
const { HttpsProxyAgent } = require('https-proxy-agent');
// const { sendRequest } = require('../../../base/requestHelper.js');
const { createTask, getTaskResult } = require('./yesCaptCha/yescaptcha.js');
const { sleep } = require('./utils.js');

class BearToken {
    constructor(address, clientKey, proxy) {
        this.name = 'bearToken';
        this.address = address;
        this.clientKey = clientKey
        this.agent = new HttpsProxyAgent(proxy);
        this.websiteKey = '0x4AAAAAAARdAuciFArKhVwt';
        this.websiteUrl = 'https://artio.faucet.berachain.com/';
        this.headers = {
            'authority': 'artio-80085-faucet-api-cf.berachain.com',
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'no-cache',
            'content-type': 'text/plain;charset=UTF-8',
            'origin': 'https://artio.faucet.berachain.com/',
            'pragma': 'no-cache',
            'referer': 'https://artio.faucet.berachain.com/',
            'user-agent': randomUseragent.getRandom(),
        }
    }

    async recaptcha() {
        const { taskId } = await createTask(this.clientKey, this.websiteUrl, this.websiteKey, 'TurnstileTaskProxylessM1');
        let result = await getTaskResult(taskId);
        // 如果result为空，等待0.3分钟后再次请求
        if (!result) {
            await sleep(0.1);
            result = await getTaskResult(this.clientKey, taskId);
        }
        // 如果再次为空，抛出错误
        if (!result) {
            throw new Error(`人机验证失败`);
        }

        const { token } = result.solution;
        return token;
    }

    async dripToken() {
        const gRecaptchaResponse = await this.recaptcha();
        this.headers['authorization'] = `Bearer ${gRecaptchaResponse}`;
        const url = `https://artio-80085-faucet-api-cf.berachain.com/api/claim?address=${this.address}`;
        const data = { address: this.address };
        const config = {
            headers: this.headers,
            httpsAgent: this.agent,
            httpAgent: this.agent
        };

        const res = await axios.post(url, data, config);
        return res;
    }


}

module.exports = BearToken;
