# Firebase设置指南

## 1. 创建Firebase项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"创建项目"
3. 输入项目名称：`youqi-app`（或你喜欢的名称）
4. 选择是否启用Google Analytics（可选）
5. 点击"创建项目"

## 2. 启用Firestore数据库

1. 在Firebase控制台中，点击左侧菜单的"Firestore Database"
2. 点击"创建数据库"
3. 选择"以测试模式开始"（开发阶段）
4. 选择数据库位置（建议选择离你最近的区域）
5. 点击"完成"

## 3. 获取项目配置

1. 在Firebase控制台中，点击项目设置（齿轮图标）
2. 在"常规"选项卡中，滚动到底部
3. 找到"你的应用"部分，点击"Web"图标（</>）
4. 输入应用昵称：`youqi-web`
5. 点击"注册应用"
6. 复制配置对象，它看起来像这样：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## 4. 更新应用配置

1. 打开 `src/firebase/config.js`
2. 将上面的配置对象替换到 `firebaseConfig` 变量中
3. 保存文件

## 5. 测试连接

1. 启动应用：`npm start`
2. 访问：`http://localhost:3000/firebase-test`
3. 检查连接状态
4. 如果连接成功，可以测试添加和获取数据

## 6. 安全规则设置（可选）

在Firebase控制台的Firestore Database中，点击"规则"选项卡，可以设置数据访问权限：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // 开发阶段允许所有访问
    }
  }
}
```

**注意：** 生产环境应该设置更严格的规则。

## 7. 故障排除

### 连接失败
- 检查配置信息是否正确
- 确保Firestore已启用
- 检查网络连接

### 权限错误
- 确保Firestore规则允许读写操作
- 检查项目设置中的API密钥

### 数据不显示
- 检查Firestore控制台是否有数据
- 查看浏览器控制台的错误信息

## 8. 下一步

连接成功后，我们可以：
1. 将应用从localStorage迁移到Firebase
2. 实现实时数据同步
3. 添加用户认证
4. 实现多设备同步

---

**重要提醒：** 在生产环境中，请确保：
- 设置适当的安全规则
- 启用用户认证
- 监控使用量和成本
- 定期备份数据 