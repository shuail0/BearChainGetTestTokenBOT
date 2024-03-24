const BearToken = require('./bearToken');
const { sleep, convertCSVToObjectSync } = require('./utils');


;(async () => {

    const clientKey = ''; // 你的yescaptcha clientKey
    const proxy = ''; // 代理
    const filePath = ''; // csv文件路径

    const addresses = convertCSVToObjectSync(filePath);
    for (const address of addresses) {
        const MAX_RETRY = 5;
        const i = 0;
        while (i < MAX_RETRY) {
            try {
                console.log(`领取地址: ${address.address}`);
                const bearToken = new BearToken(address.address, clientKey, proxy);
                const res = await bearToken.dripToken();
                console.log('领取成功✅ ', res.data.msg);
                break;
            } catch (error) {
                console.log('领取失败❌', error, '休息6秒后重试...');
                await sleep(0.1);
                i++;
                if (i === MAX_RETRY) {
                    console.error('领取失败❌', error, '重试次数已达上限');
                    break;
                }
            }
        }
    }
})();