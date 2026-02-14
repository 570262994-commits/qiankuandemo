# PWA 部署方案

## 目标
1. ✅ 分享给其他人也能正常邮箱登录
2. ✅ 可以像原生App一样添加到手机桌面（PWA方案）
3. ✅ 动态回调地址，本地和线上都能正常工作
4. ✅ iOS 沉浸式状态栏适配
5. ✅ iOS 安装引导组件
6. ✅ 多用户数据安全隔离

---

## 第一阶段：PWA 配置（本地开发）

### 1.1 创建 manifest.json
- 应用名称：欠款助手
- 主题色：#3b82f6
- 图标：192x192 和 512x512

### 1.2 创建 Service Worker
- 离线缓存支持

### 1.3 修改 index.html（沉浸式适配）
```html
<!-- PWA 基础标签 -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#3b82f6" />

<!-- iOS 沉浸式状态栏 -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="欠款助手" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

### 1.4 创建应用图标
- public/icons/icon-192.png
- public/icons/icon-512.png

---

## 第二阶段：动态回调逻辑（关键！）

### 2.1 修改 src/lib/supabase.ts
- 自动根据当前域名生成回调地址
- 使用 `window.location.origin` 动态获取

### 2.2 修改登录/注册组件
- `signInWithPassword` 和 `signUp` 不写死 `redirectTo`

### 2.3 修改密码重置逻辑
- 使用动态地址：`${window.location.origin}/reset-password`

---

## 第三阶段：iOS 安装引导组件

### 3.1 创建引导组件
- src/components/InstallPrompt.tsx

### 3.2 逻辑
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isStandalone = (window.navigator as any).standalone === true;
const shouldShowPrompt = isIOS && !isStandalone;
```

### 3.3 显示时机
- 首页首次加载时
- 显示文案："点击下方分享图标 → 添加到主屏幕，即可全屏使用"

---

## 第四阶段：数据安全检查（RLS 策略）

### 4.1 customers 表策略
```sql
CREATE POLICY "Users can only access their own customers" ON customers
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

### 4.2 transactions 表策略
```sql
CREATE POLICY "Users can only access their own transactions" ON transactions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

---

## 第五阶段：部署到 Vercel

```bash
npm i -g vercel
vercel
```

---

## 第六阶段：Supabase 配置

### 6.1 配置 Site URL
- Authentication → URL Configuration → Site URL
- 填入：https://你的域名.vercel.app

### 6.2 配置 Redirect URLs
- https://你的域名.vercel.app
- https://你的域名.vercel.app/reset-password
- http://localhost:5173（保留本地开发）

---

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `public/manifest.json` | 新建 | PWA 配置 |
| `public/sw.js` | 新建 | Service Worker |
| `public/icons/icon-192.png` | 新建 | 应用图标 |
| `public/icons/icon-512.png` | 新建 | 应用图标 |
| `index.html` | 修改 | PWA 标签 + iOS 沉浸式 |
| `src/main.tsx` | 修改 | 注册 Service Worker |
| `src/lib/supabase.ts` | 修改 | 动态回调逻辑 |
| `src/store/authStore.ts` | 修改 | 动态 redirectTo |
| `src/components/InstallPrompt.tsx` | 新建 | iOS 安装引导 |
| `src/pages/Dashboard.tsx` | 修改 | 集成引导组件 |
| `vite.config.ts` | 修改 | 构建配置 |

---

## 完成后效果

- 📱 **iOS 用户**：Safari 打开 → 点击分享 → 添加到主屏幕 → 全屏沉浸式使用
- 🤖 **Android 用户**：Chrome 打开 → 自动弹出安装提示 或 手动添加
- 🔐 **邮箱登录**：本地和线上都能正常回调验证
- 🔒 **数据安全**：每个用户只能看到自己的数据
