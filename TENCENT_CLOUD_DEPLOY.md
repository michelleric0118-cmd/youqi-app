# 腾讯云COS部署指南

## 🎯 部署架构

```
React前端 → 腾讯云COS静态托管 → LeanCloud后端
```

## 第一步：注册腾讯云账号

1. 访问：https://cloud.tencent.com/
2. 注册账号并完成实名认证
3. 开通对象存储COS服务

## 第二步：创建COS存储桶

1. 登录腾讯云控制台
2. 进入"对象存储COS"
3. 点击"创建存储桶"
4. 配置：
   - **名称**：`youqi-app-你的ID`
   - **地域**：选择"上海"（推荐）
   - **访问权限**：选择"公有读私有写"
   - **版本控制**：关闭
   - **静态网站**：开启

## 第三步：获取API密钥

1. 在腾讯云控制台，点击右上角头像
2. 选择"访问管理" → "API密钥管理"
3. 点击"新建密钥"
4. 复制SecretId和SecretKey

## 第四步：配置环境变量

在项目根目录创建 `.env` 文件：

```bash
COS_SECRET_ID=你的SecretId
COS_SECRET_KEY=你的SecretKey
COS_BUCKET=你的存储桶名称
COS_REGION=ap-shanghai
```

## 第五步：部署应用

```bash
# 构建应用
npm run build

# 部署到腾讯云COS
npm run deploy:cos
```

## 第六步：配置静态网站

1. 在COS控制台，选择你的存储桶
2. 点击"基础配置" → "静态网站"
3. 开启静态网站功能
4. 设置：
   - **索引文档**：`index.html`
   - **错误文档**：`index.html`（SPA路由支持）

## 第七步：配置CDN加速（可选）

1. 在COS控制台，选择你的存储桶
2. 点击"域名管理" → "自定义域名"
3. 添加你的域名
4. 配置CDN加速

## 访问地址

部署完成后，你的应用可以通过以下地址访问：

```
https://你的存储桶名称.cos.ap-shanghai.myqcloud.com
```

## 优势

✅ **国内访问速度快**
✅ **免费额度充足**（50GB存储，10GB流量/月）
✅ **支持HTTPS**
✅ **CDN加速**
✅ **自定义域名支持**

## 成本估算

- **存储费用**：免费额度50GB，足够使用
- **流量费用**：免费额度10GB/月
- **请求费用**：免费额度100万次/月
- **总成本**：基本免费

## 与LeanCloud配合

1. **前端**：部署在腾讯云COS
2. **后端**：使用LeanCloud云引擎
3. **数据库**：使用LeanCloud数据存储
4. **文件存储**：使用LeanCloud文件存储

## 自动化部署

可以配置GitHub Actions实现自动部署：

```yaml
name: Deploy to Tencent Cloud COS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run build
      - run: npm run deploy:cos
        env:
          COS_SECRET_ID: ${{ secrets.COS_SECRET_ID }}
          COS_SECRET_KEY: ${{ secrets.COS_SECRET_KEY }}
          COS_BUCKET: ${{ secrets.COS_BUCKET }}
          COS_REGION: ${{ secrets.COS_REGION }}
```

## 故障排除

### 部署失败
- 检查API密钥是否正确
- 确认存储桶名称和地域
- 检查网络连接

### 访问失败
- 确认静态网站功能已开启
- 检查存储桶权限设置
- 验证文件是否上传成功

### 性能优化
- 开启CDN加速
- 压缩静态资源
- 使用浏览器缓存 