# 本地-生产环境同步规范

> 本规范定义了本地开发环境与生产环境之间的代码同步流程，确保开发过程安全、高效。

---

## 一、代码同步规范

### 1.1 Git 忽略配置

**文件**：`.gitignore`

```gitignore
# Environment variables - 敏感环境变量，禁止提交
.env
.env.local
.env.*.local
```

**规则**：
- ✅ 所有 `.env` 相关文件已被 Git 忽略
- ✅ 敏感信息（API Key、数据库连接等）不会泄露到 GitHub
- ✅ 本地和生产环境使用各自的环境变量

### 1.2 环境变量管理

| 环境 | 文件 | 说明 |
|------|------|------|
| 本地开发 | `.env` | 本地 Supabase 配置 |
| 生产环境 | Vercel 环境变量 | 在 Vercel Dashboard 配置 |

**本地 `.env` 示例**：
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_GLM_API_KEY=xxx
```

---

## 二、动态重定向规范

### 2.1 URL 配置原则

**核心原则**：所有涉及 URL 跳转的地方，必须使用 `window.location.origin` 动态获取当前域名。

### 2.2 实现方式

**文件**：`src/lib/supabase.ts`

```typescript
// ✅ 正确：动态获取当前域名
const getRedirectUrl = () => {
  return window.location.origin;
};

// ❌ 错误：硬编码域名
// const getRedirectUrl = () => 'http://localhost:5173';
// const getRedirectUrl = () => 'https://qiankuandemo.vercel.app';
```

### 2.3 禁止事项

| 禁止行为 | 原因 |
|---------|------|
| 硬编码 `localhost:5173` | 本地端口可能变化 |
| 硬编码 `vercel.app` 域名 | 生产域名可能变更 |
| 在代码中写死完整 URL | 无法适配不同环境 |

---

## 三、Vercel 自动化部署规范

### 3.1 部署配置

| 配置项 | 设置 |
|--------|------|
| GitHub 集成 | 已连接 |
| 监听分支 | `main` |
| 自动部署 | 推送后自动触发 |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |

### 3.2 部署流程

```
本地开发 → git push → GitHub 接收 → Vercel 自动构建 → 生产环境更新
```

### 3.3 环境变量配置

在 Vercel Dashboard → Settings → Environment Variables 中配置：

| 变量名 | 说明 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `VITE_GLM_API_KEY` | 智谱 AI API 密钥 |

---

## 四、数据隔离规范

### 4.1 RLS（行级安全）策略

**启用 RLS**：
```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

**创建策略**：
```sql
-- 客户表：用户只能访问自己的数据
CREATE POLICY "Users can only access their own customers" ON customers
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 交易表：用户只能访问自己的数据
CREATE POLICY "Users can only access their own transactions" ON transactions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

### 4.2 数据隔离效果

| 场景 | 效果 |
|------|------|
| 本地开发测试数据 | 仅本地开发者可见 |
| 生产环境用户数据 | 仅对应用户可见 |
| 多用户同时使用 | 数据完全隔离 |

### 4.3 安全保障

- ✅ 所有 API 请求自动附加 `user_id` 过滤
- ✅ 数据库层面强制 RLS 策略
- ✅ 本地测试不会影响生产数据

---

## 五、日常开发流程

### 5.1 标准流程

```bash
# 1. 本地开发
npm run dev

# 2. 测试通过后提交
git add .
git commit -m "feat: 新功能描述"
git push

# 3. Vercel 自动部署（无需手动操作）
# 4. 访问生产环境验证
```

### 5.2 注意事项

1. **提交前检查**：
   - 确认 `.env` 文件未被修改
   - 确认没有硬编码的 URL
   - 确认没有敏感信息

2. **部署后验证**：
   - 访问生产环境 URL
   - 验证核心功能正常
   - 检查控制台无报错

---

## 六、检查清单

### 6.1 新项目初始化

- [ ] 配置 `.gitignore` 忽略 `.env` 文件
- [ ] 使用 `window.location.origin` 动态获取 URL
- [ ] 连接 Vercel 并配置自动部署
- [ ] 启用 Supabase RLS 策略

### 6.2 每次提交前

- [ ] 检查 `.env` 文件不在暂存区
- [ ] 检查无硬编码域名
- [ ] 本地测试通过

### 6.3 部署后

- [ ] 生产环境功能验证
- [ ] 检查环境变量生效
- [ ] 监控错误日志

---

## 七、常见问题

### Q1: 本地环境变量如何管理？

A: 在项目根目录创建 `.env` 文件，Vercel CLI 会自动读取。该文件已被 Git 忽略，不会提交。

### Q2: 如何确认 RLS 已启用？

A: 在 Supabase Dashboard → Authentication → Policies 中查看，应显示 "Row Level Security is enabled"。

### Q3: Vercel 部署失败怎么办？

A: 检查 Vercel Dashboard 的构建日志，通常是环境变量未配置或构建命令错误。

---

## 八、版本记录

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | 2026-02-14 | 初始版本，建立同步规范 |

---

> **重要**：所有开发人员必须遵循本规范，确保本地开发与生产环境的同步安全可靠。
