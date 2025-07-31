const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');

// 腾讯云COS配置
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

const BUCKET = process.env.COS_BUCKET || 'youqi-app-1234567890';
const REGION = process.env.COS_REGION || 'ap-shanghai';

// 上传文件到COS
async function uploadFile(localPath, cosPath) {
  try {
    const result = await cos.putObject({
      Bucket: BUCKET,
      Region: REGION,
      Key: cosPath,
      Body: fs.createReadStream(localPath),
      ContentType: getContentType(localPath),
    });
    console.log(`✅ 上传成功: ${cosPath}`);
    return result;
  } catch (error) {
    console.error(`❌ 上传失败: ${cosPath}`, error);
    throw error;
  }
}

// 获取文件Content-Type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

// 递归上传目录
async function uploadDirectory(localDir, cosDir = '') {
  const files = fs.readdirSync(localDir);
  
  for (const file of files) {
    const localPath = path.join(localDir, file);
    const cosPath = cosDir ? `${cosDir}/${file}` : file;
    
    if (fs.statSync(localPath).isDirectory()) {
      await uploadDirectory(localPath, cosPath);
    } else {
      await uploadFile(localPath, cosPath);
    }
  }
}

// 主函数
async function deploy() {
  console.log('🚀 开始部署到腾讯云COS...');
  
  // 检查环境变量
  if (!process.env.COS_SECRET_ID || !process.env.COS_SECRET_KEY) {
    console.error('❌ 请设置环境变量: COS_SECRET_ID, COS_SECRET_KEY');
    console.log('💡 创建 .env 文件并添加:');
    console.log('COS_SECRET_ID=你的SecretId');
    console.log('COS_SECRET_KEY=你的SecretKey');
    console.log('COS_BUCKET=你的存储桶名称');
    console.log('COS_REGION=ap-shanghai');
    process.exit(1);
  }
  
  const buildDir = path.join(__dirname, '../build');
  
  if (!fs.existsSync(buildDir)) {
    console.error('❌ build目录不存在，请先运行 npm run build');
    process.exit(1);
  }
  
  try {
    await uploadDirectory(buildDir);
    console.log('🎉 部署完成！');
    console.log(`🌐 访问地址: https://${BUCKET}.cos.${REGION}.myqcloud.com`);
  } catch (error) {
    console.error('❌ 部署失败:', error);
    process.exit(1);
  }
}

deploy(); 