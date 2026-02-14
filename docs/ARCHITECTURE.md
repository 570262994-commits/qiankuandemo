# 技术架构文档

## 1. 技术栈概览

### 1.1 前端技术

| 技术 | 版本 | 用途 |
|-----|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 8.x | 构建工具 |
| TailwindCSS | 3.x | 样式框架 |
| Zustand | 4.x | 状态管理 |
| Lucide React | 图标库 | 图标组件 |
| date-fns | 日期处理 | 日期格式化 |

### 1.2 后端技术

| 技术 | 版本 | 用途 |
|-----|------|------|
| Supabase | 云服务 | 身份认证、数据库、RLS |
| PostgreSQL | 15+ | 关系型数据库 |

---

## 2. 项目结构

```
qiankuandemo/
├── docs/                    # 文档目录
│   ├── PRD.md              # 需求规格说明书
│   ├── ARCHITECTURE.md     # 技术架构文档
│   └── TEST_REPORT.md      # 测试报告
├── src/
│   ├── components/         # React 组件
│   │   ├── AddCustomerDialog.tsx    # 新增/编辑客户弹窗
│   │   ├── ChangeEmail.tsx          # 修改邮箱弹窗
│   │   ├── ChangePassword.tsx       # 修改密码弹窗
│   │   ├── CustomModal.tsx          # 自定义确认弹窗
│   │   ├── Toast.tsx                # 轻提示组件
│   │   └── TransactionDrawer.tsx    # 记一笔弹窗
│   ├── lib/                # 工具函数
│   │   ├── supabase.ts              # Supabase 客户端
│   │   ├── supabaseApi.ts           # API 接口封装
│   │   ├── deviceId.ts              # 设备ID生成
│   │   └── utils.ts                 # 通用工具函数
│   ├── pages/               # 页面组件
│   │   ├── Dashboard.tsx            # 首页（数据统计、交易列表）
│   │   ├── Customers.tsx            # 客户列表页
│   │   ├── Profile.tsx             # 个人中心页
│   │   ├── Login.tsx               # 登录组件
│   │   ├── Register.tsx            # 注册组件
│   │   └── ForgotPassword.tsx      # 忘记密码组件
│   ├── store/               # Zustand 状态管理
│   │   ├── authStore.ts            # 认证状态
│   │   ├── customerStore.ts        # 客户数据
│   │   ├── transactionStore.ts     # 交易数据
│   │   ├── modalStore.ts           # 弹窗状态
│   │   ├── toastStore.ts           # 轻提示状态
│   │   └── viewModeStore.ts       # 视图模式状态
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.tsx              # 根组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 3. 状态管理架构

### 3.1 Zustand Store 设计

```
┌─────────────────────────────────────────────────────────────┐
│                      Application State                       │
├─────────────────────────────────────────────────────────────┤
│  authStore          │ 用户认证状态                          │
│  - user: User       │   - 当前登录用户                      │
│  - session: Session │   - 会话信息                          │
│  - signIn()         │   - 登录方法                         │
│  - signUp()         │   - 注册方法                         │
│  - signOut()        │   - 登出方法                         │
├─────────────────────────────────────────────────────────────┤
│  customerStore      │ 客户数据状态                          │
│  - customers: []    │   - 客户列表                          │
│  - fetchCustomers() │   - 获取客户列表                       │
│  - addCustomer()   │   - 添加客户                          │
│  - updateCustomer() │   - 更新客户                          │
├─────────────────────────────────────────────────────────────┤
│  transactionStore   │ 交易数据状态                          │
│  - transactions: []│   - 交易列表                          │
│  - fetchTransactions()│ - 获取交易列表                     │
│  - addTransaction()│   - 添加交易                          │
│  - updateTransaction()│ - 更新交易                        │
│  - deleteTransaction()│ - 删除交易                         │
├─────────────────────────────────────────────────────────────┤
│  toastStore        │ 轻提示状态                            │
│  - toasts: []      │   - 提示列表                          │
│  - success()       │   - 成功提示                           │
│  - error()         │   - 错误提示                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 数据流架构

### 4.1 页面组件调用链

```
用户操作
   ↓
Page (pages/Dashboard.tsx)
   ↓
Store (zustand/useTransactionStore)
   ↓
API (lib/supabaseApi.ts)
   ↓
Supabase Client
   ↓
PostgreSQL Database
```

### 4.2 数据同步流程

```
┌──────────┐    ┌───────────┐    ┌─────────────┐    ┌────────────┐
│  React   │───▶│  Zustand  │───▶│ Supabase    │───▶│ PostgreSQL │
│  组件    │    │   Store   │    │   Client    │    │  Database  │
└──────────┘    └───────────┘    └─────────────┘    └────────────┘
     ▲                                                      │
     │                                                      │
     └──────────────────────────────────────────────────────┘
                     useEffect / 订阅更新
```

---

## 5. 安全架构

### 5.1 数据隔离 (RLS)

```sql
-- 客户表 RLS 策略
CREATE POLICY "Users can access their own customers" ON customers
  FOR ALL USING (auth.uid() = user_id);

-- 交易表 RLS 策略
CREATE POLICY "Users can access their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);
```

### 5.2 认证流程

```
用户注册 ──▶ Supabase Auth ──▶ JWT Token ──▶ LocalStorage
                   │
用户登录 ─────────┘
```

---

## 6. 组件架构

### 6.1 组件层次结构

```
App (根组件)
├── Dashboard (首页)
│   ├── TransactionDrawer (记一笔弹窗)
│   ├── Toast (轻提示)
│   └── CustomModal (确认弹窗)
├── Customers (客户页)
│   ├── AddCustomerDialog (新增客户弹窗)
│   ├── Toast
│   └── CustomModal
├── Profile (个人中心)
│   ├── ChangePassword (修改密码弹窗)
│   ├── ChangeEmail (修改邮箱弹窗)
│   ├── Login (登录弹窗)
│   ├── Register (注册弹窗)
│   ├── ForgotPassword (忘记密码弹窗)
│   └── Toast
└── Navigation (底部导航)
```

### 6.2 Props 接口设计

```typescript
// 弹窗组件通用接口
interface DialogProps {
  isOpen: boolean;           // 是否显示
  onClose: () => void;        // 关闭回调
  onSubmit?: () => void;     // 提交成功回调
}

// 编辑类弹窗额外接口
interface EditDialogProps extends DialogProps {
  id?: number;                // 编辑时传入
}

// 表单数据接口
interface Customer {
  id?: number;
  name: string;
  phone?: string;
  creditLimit: number;
  paymentTerm: number;
  createdAt?: Date;
}
```

---

## 7. 环境配置

### 7.1 环境变量

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### 7.2 Supabase 配置

- **URL**: `https://spb-xxx.supabase.co`
- **Auth**: 邮箱认证
- **Database**: PostgreSQL 15
- **RLS**: 启用

---

## 8. 构建与部署

### 8.1 构建命令

```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

### 8.2 构建产物

```
dist/
├── index.html
└── assets/
    ├── index-xxx.css    # 样式文件
    └── index-xxx.js    # JavaScript 文件
```

---

## 9. 修改历史

| 版本 | 日期 | 修改内容 |
|-----|------|---------|
| v1.0.0 | 2026-02-14 | 初始版本 |
