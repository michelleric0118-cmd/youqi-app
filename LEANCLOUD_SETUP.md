# LeanCloud 设置指南

## 第一步：注册LeanCloud账号

1. 访问 LeanCloud 官网：https://www.leancloud.cn/
2. 点击"注册"创建账号
3. 登录后进入控制台

## 第二步：创建应用

1. 在控制台点击"创建应用"
2. 输入应用名称：`youqi-app`
3. 选择"开发版"（免费）
4. 选择"华东节点"（推荐）
5. 点击"创建"

## 第三步：获取配置信息

1. 在应用控制台，点击"设置" -> "应用Keys"
2. 复制以下信息：
   - **App ID**：你的应用ID
   - **App Key**：你的应用密钥
   - **服务器地址**：通常是 `https://你的应用ID.api.lncldglobal.com`

## 第四步：更新配置文件

打开 `src/leancloud/config.js` 文件，将以下信息替换为你的实际配置：

```javascript
const initLeanCloud = () => {
  AV.init({
    appId: "你的AppID", // 替换为你的App ID
    appKey: "你的AppKey", // 替换为你的App Key
    serverURL: "你的服务器地址" // 替换为你的服务器地址
  });
};
```

## 第五步：测试连接

1. 启动应用：`npm start`
2. 访问：`http://localhost:3000/leancloud-test`
3. 检查连接状态是否为"✅ 连接成功"

## 第六步：创建数据表

1. 在LeanCloud控制台，点击"数据存储"
2. 系统会自动创建 `Item` 表（当应用首次添加数据时）
3. 表结构会自动根据你的数据生成

## 常见问题

### 连接失败
- 检查App ID和App Key是否正确
- 确认服务器地址格式正确
- 检查网络连接

### 数据同步问题
- 确保应用有网络权限
- 检查LeanCloud控制台的数据存储设置

## 免费额度

LeanCloud开发版提供：
- 数据存储：3GB
- API调用：30万次/天
- 文件存储：1GB
- 完全免费，足够个人使用

## 下一步

配置完成后，你的应用就可以：
1. 在国内稳定访问
2. 数据云端同步
3. 多设备数据共享
4. 无需VPN即可使用 