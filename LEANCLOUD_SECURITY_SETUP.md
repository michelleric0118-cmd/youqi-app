# LeanCloud安全配置指南

## 🔐 安全配置步骤

### 1. 创建环境变量文件
在项目根目录创建 `.env` 文件：

```bash
# 在 youqi-app 目录下创建 .env 文件
touch .env
```

### 2. 添加配置信息
在 `.env` 文件中添加以下内容（替换为你的实际信息）：

```
REACT_APP_LEANCLOUD_APP_ID=你的AppID
REACT_APP_LEANCLOUD_APP_KEY=你的AppKey
REACT_APP_LEANCLOUD_SERVER_URL=你的服务器地址
```

### 3. 安全注意事项
- ✅ `.env` 文件已添加到 `.gitignore`，不会被提交到Git
- ✅ 配置信息不会出现在代码中
- ✅ 环境变量只在本地生效

### 4. 测试连接
配置完成后，重启开发服务器：

```bash
npm start
```

然后访问 `http://localhost:3000/leancloud-test` 测试连接。

## 🚨 重要提醒
- 永远不要在代码中直接写入App ID和App Key
- 不要将 `.env` 文件提交到Git仓库
- 部署时需要单独配置环境变量

## 🔧 故障排除
如果连接失败，请检查：
1. `.env` 文件是否在正确位置
2. 配置信息是否正确
3. 网络连接是否正常 