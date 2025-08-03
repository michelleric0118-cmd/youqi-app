const COS = require('cos-nodejs-sdk-v5');
require('dotenv').config();

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

async function testBucket() {
  console.log('🔍 测试存储桶连接...');
  console.log('存储桶名称:', process.env.COS_BUCKET);
  console.log('地域:', process.env.COS_REGION);
  
  try {
    const result = await cos.headBucket({
      Bucket: process.env.COS_BUCKET,
      Region: process.env.COS_REGION,
    });
    console.log('✅ 存储桶连接成功！');
    console.log('存储桶信息:', result);
  } catch (error) {
    console.error('❌ 存储桶连接失败:', error.message);
    console.log('请检查：');
    console.log('1. 存储桶名称是否正确');
    console.log('2. 地域是否正确');
    console.log('3. 存储桶是否已创建');
    console.log('4. API密钥是否有权限');
  }
}

testBucket(); 