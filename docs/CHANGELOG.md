# 更新日志 (Changelog)

本文件记录项目的所有重要更改。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [v1.1.0] - 2026-02-14

### 新增功能

- ✨ PWA 支持
  - 添加 manifest.json 配置文件
  - 添加 Service Worker 离线缓存
  - 支持添加到手机主屏幕
  - 应用图标（SVG 格式）

- ✨ iOS 沉浸式状态栏
  - 添加 `apple-mobile-web-app-capable` 标签
  - 添加 `apple-mobile-web-app-status-bar-style` 标签
  - 添加 `viewport-fit=cover` 适配刘海屏

- ✨ iOS 安装引导组件
  - 自动检测 iOS 设备
  - 检测是否已添加到主屏幕
  - 引导用户通过 Safari 分享添加
  - 本地存储记住用户已关闭提示

- ✨ 动态回调地址
  - 使用 `window.location.origin` 动态获取当前域名
  - 本地开发和线上部署自动适配
  - 支持邮箱登录、注册、密码重置回调

### 部署

- 🚀 Vercel 部署
  - 配置 GitHub 自动部署
  - 配置环境变量
  - 线上地址：https://qiankuandemo.vercel.app

### 文档

- ✨ 添加部署方案文档 (`docs/DEPLOY_PLAN.md`)

### 文件变更

- 新增文件：
  - `public/manifest.json` - PWA 配置
  - `public/sw.js` - Service Worker
  - `public/icons/icon-192.svg` - 应用图标
  - `public/icons/icon-512.svg` - 应用图标
  - `src/components/InstallPrompt.tsx` - iOS 安装引导
  - `docs/DEPLOY_PLAN.md` - 部署方案

- 修改文件：
  - `index.html` - PWA 标签 + iOS 沉浸式
  - `src/main.tsx` - 注册 Service Worker
  - `src/lib/supabase.ts` - 动态回调地址
  - `src/store/authStore.ts` - 动态 redirectTo
  - `src/pages/Dashboard.tsx` - 集成安装引导
  - `src/index.css` - 添加 slide-up 动画

---

## [v1.0.0] - 2026-02-14

### 重大变更

- 🚀 认证系统重构：从设备ID切换为用户账号体系
  - 用户需注册登录才能使用完整功能
  - 数据通过 user_id 实现用户隔离
  - 支持跨设备数据同步

### 新增功能

- ✨ 用户认证模块
  - 用户注册（邮箱注册）
  - 用户登录（邮箱+密码）
  - 退出登录
  - 修改密码
  - 修改邮箱
  - 忘记密码（邮箱重置）

- ✨ 个人中心页面 (Profile)
  - 显示当前登录用户信息
  - 账户安全设置入口
  - 退出登录功能

- ✨ 登录检查机制
  - 未登录时点击"记一笔"弹出登录提示
  - 未登录时点击"新增客户"弹出登录提示
  - 登录后可正常使用所有功能

### 代码优化

- 🗑️ 删除 Dexie 本地数据库 (`src/db/db.ts`)
  - 不再依赖本地 IndexedDB
  - 纯云端数据存储

- 🗑️ 删除冗余文件
  - 删除 `src/lib/auth.ts`（冗余封装）
  - 删除 `src/pages/Settings.tsx`（备份码功能已移除）

- ♻️ 简化代码逻辑
  - 简化 `supabaseApi.ts`，移除 device_id 相关逻辑
  - 简化 `deviceId.ts`，移除未使用 清理 customerStore 和 transactionStore函数
  - 未使用方法

### 文档

- ✨ 添加需求规格说明书 (`docs/SPEC.md`)
- ✨ 添加技术架构文档 (`docs/ARCHITECTURE.md`)
- ✨ 添加测试报告 (`docs/TEST_REPORT.md`)

### Bug修复

- 🐛 修复数据库 RLS 策略配置
  - 添加 user_id 列
  - 配置基于 user_id 的行级安全策略

### 测试结果

- ✅ 所有核心功能测试通过 (14/14)
- 认证模块: 5/5 通过
- 客户管理: 2/2 通过
- 交易管理: 3/3 通过
- 数据统计: 4/4 通过

---

## [v0.2.1] - 2026-02-12

### UI优化

- 💄 优化 Dashboard 备注展开效果
  - 修复备注展开时金额数字位置跳动问题
  - 金额固定在卡片顶部，不再随备注展开而下移

- 💄 统一弹窗交互体验
  - 客户编辑弹窗改为从底部弹出（Drawer 样式）
  - 与首页记账弹窗保持一致的交互效果
  - 使用 `rounded-t-3xl` 顶部圆角设计

- 💄 优化客户列表交互
  - 整个客户卡片可点击进入编辑
  - 添加 `active:scale-95` 点击缩放效果
  - 与首页流水记录交互保持一致

### Bug修复

- 🐛 更新 Supabase anon key 为正确的 JWT 格式

---

## [v0.2.0] - 2026-02-12

### 重大变更

- 🚀 数据存储重构：从本地 IndexedDB 迁移到 Supabase 云端数据库
  - 实现无感云端存储，用户无需注册登录
  - 数据自动同步到云端，跨设备访问
  - 通过设备 ID 实现数据隔离

### 新增功能

- ✨ 静默设备 ID
  - 应用启动时自动生成设备 ID
  - 存储在 localStorage，持久化保存
  - 无需用户操作，完全无感

- ✨ 数据云端同步
  - 所有数据自动存储到 Supabase
  - 实时云端同步
  - 支持跨设备数据访问

- ✨ 备份码功能
  - 设置页面显示备份码（设备 ID）
  - 支持一键复制备份码
  - 新设备输入备份码即可同步数据
  - 极简的用户体验

- 📝 数据库配置文档
  - 创建详细的数据库表结构 SQL
  - 提供 RLS 配置指南
  - 完整的索引优化

### 技术改进

- 📦 依赖更新
  - 添加 @supabase/supabase-js 依赖
  - 移除对 IndexedDB 的直接依赖

- 🔧 架构优化
  - 数据访问层与业务逻辑分离
  - 统一的 API 接口设计
  - 类型安全的数据映射
  - 自动设备 ID 过滤

### 文件变更

- 新增文件：
  - `src/lib/deviceId.ts` - 设备 ID 管理
  - `src/lib/supabase.ts` - Supabase 客户端配置
  - `src/lib/supabaseApi.ts` - 数据访问层 API
  - `src/pages/Settings.tsx` - 设置页面（备份码功能）
  - `docs/DATABASE_SETUP.md` - 数据库配置指南
  - `.env` - 环境变量配置

- 修改文件：
  - `src/store/customerStore.ts` - 使用 Supabase API
  - `src/store/transactionStore.ts` - 使用 Supabase API
  - `src/App.tsx` - 添加设置页面
  - `.gitignore` - 添加环境变量文件忽略

### 用户体验

- **首次使用**：自动生成设备 ID，数据自动云端存储
- **更换设备**：输入备份码即可同步所有数据
- **日常使用**：完全无感，数据自动云端同步

---

## [v0.1.3] - 2026-02-12

### 新增功能

- ✨ 客户编辑功能
  - 点击客户名称可编辑客户信息
  - 支持修改客户姓名、手机号、信用额度、固定账期
  - 编辑时自动填充现有信息
  - 客户姓名唯一性校验（排除当前客户）

- ✨ 交易记录编辑功能
  - 点击交易记录可编辑交易信息
  - 支持修改交易类型（欠款/还款）、客户、金额、日期、备注
  - 编辑时自动填充现有信息
  - 区分短按（编辑）和长按（删除）操作

### UI优化

- 💄 优化备注显示效果
  - 长文本备注默认显示一行，超出部分用省略号表示
  - 点击备注区域可展开/收起查看完整内容
  - 添加展开/收起图标提示
  - hover 效果增强交互体验
  - 不影响点击卡片编辑交易的主要功能

### Bug修复

- 🐛 修复点击交易记录无法打开编辑对话框的问题
  - 添加 onClick 事件处理
  - 优化长按和点击事件冲突处理
  - 改进 isLongPress 状态管理

---

## [v0.1.2] - 2026-02-12

### UI优化

- 💄 优化弹框提示样式，提升移动端体验
  - 创建自定义 Modal 组件替代原生 alert/confirm
  - 支持多种类型：alert、confirm、success、error、warning
  - 添加优雅的动画效果（淡入、缩放、弹跳）
  - 移动端友好的圆角卡片设计
  - 不同类型使用不同颜色图标（成功-绿色、错误-红色、警告-琥珀色）
  - 按钮样式优化，支持主要/次要/危险三种风格
  - 点击背景层可关闭弹框
  - 弹框显示时禁止页面滚动

### 技术改进

- ✨ 创建 `CustomModal` 组件
  - 支持 5 种弹框类型
  - 可自定义标题、消息、按钮
  - 动画效果流畅自然
- ✨ 创建 `modalStore` 状态管理
  - 统一管理弹框状态
  - 提供便捷的 API：alert、confirm、success、error、warning
  - 与组件解耦，可在任何地方调用
- 🎨 添加 CSS 动画
  - fade-in：淡入动画
  - scale-in：缩放动画
  - bounce-in：弹跳动画

---

## [v0.1.1] - 2026-02-12

### Bug修复

- 🐛 修复 Tailwind CSS v4 配置问题
  - 更新 `index.css` 使用 Tailwind CSS v4 语法 (`@import "tailwindcss"`)
  - 添加 `@theme` 配置自定义颜色变量
  - 确保颜色样式正确应用
- 🐛 修复 FAB 按钮被底部导航栏遮挡的问题
  - 调整 FAB 按钮位置从 `bottom-6` 改为 `bottom-20`
  - 添加 `z-50` 确保按钮在最上层
  - 同时修复首页和客户页面的 FAB 按钮

### UI优化

- 💄 优化流水列表颜色区分
  - 欠款记录使用红色系（红色背景 + 左边框）
  - 还款记录使用绿色系（翡翠绿背景 + 左边框）
  - 添加类型标签徽章，更清晰区分
  - 金额字体加粗加大，更醒目

---

## [v0.1.0] - 2026-02-12

### 首个可用版本 (Phase 1)

### 新增功能

#### 客户管理
- ✅ 新增客户功能
  - 支持录入客户姓名（必填，1-20字符）
  - 支持录入手机号（选填，11位手机号格式校验）
  - 支持设置信用额度（默认0元）
  - 支持设置固定账期（默认30天）
  - 客户姓名唯一性校验，重复时提示"客户已存在"
- ✅ 客户列表展示
  - 显示客户姓名、手机号、信用额度、固定账期
  - 卡片式布局，清晰美观
- ✅ 客户搜索功能
  - 支持按客户姓名模糊搜索
  - 实时过滤显示匹配结果

#### 账务录入
- ✅ 欠款/还款类型切换
  - 分段控件设计，一键切换
  - 欠款显示红色，还款显示绿色
- ✅ 客户选择
  - 下拉选择框，支持搜索过滤
  - 未找到客户时可快速新建
- ✅ 金额输入
  - 居中大字体显示，输入体验友好
  - 自动聚焦，减少点击次数
- ✅ 日期选择
  - 支持选择历史日期
  - 默认为当天日期
- ✅ 备注输入
  - 选填项，最多100字符
  - 多行文本输入
- ✅ 自动计算到期日
  - 根据客户的固定账期自动计算
  - due_date = occurred_at + payment_term

#### 流水展示
- ✅ 最近流水列表
  - 按时间倒序排列
  - 显示客户姓名、日期、金额、类型
  - 欠款金额显示红色（-¥500.00）
  - 还款金额显示绿色（+¥200.00）
- ✅ 长按删除功能
  - 长按流水记录800ms触发删除确认
  - 确认后删除该条记录

#### 用户界面
- ✅ 首页（Dashboard）
  - 顶部栏：应用名称 + 搜索图标
  - 流水列表：展示所有交易记录
  - 空状态引导：提示用户开始记账
  - FAB按钮：右下角+号，快速记账
- ✅ 客户页面
  - 搜索框：快速查找客户
  - 客户列表：卡片式展示
  - 新增按钮：右上角+号
- ✅ 底部导航栏
  - 首页/客户两个Tab
  - 图标+文字标签
  - 当前页面高亮显示
- ✅ 录入弹窗（底部抽屉）
  - 从底部滑出，单手操作友好
  - 分段控件切换欠款/还款
  - 大字体金额输入框
  - 长条形提交按钮

### 技术实现

#### 技术栈
- **前端框架**: React 18.3.1 + TypeScript 5.6.2
- **构建工具**: Vite 8.0.0-beta.14
- **样式方案**: Tailwind CSS 4.0.0
- **数据存储**: IndexedDB (Dexie.js 4.0.11)
- **状态管理**: Zustand 5.0.3
- **图标库**: Lucide React 0.475.0
- **日期处理**: date-fns 4.1.0

#### 数据模型
- **Customer（客户）**
  - id: 自增主键
  - name: 客户姓名（唯一）
  - phone: 手机号
  - creditLimit: 信用额度
  - paymentTerm: 固定账期（天）
  - createdAt: 创建时间

- **Transaction（交易）**
  - id: 自增主键
  - customerId: 关联客户ID
  - type: 交易类型（DEBT/PAYBACK）
  - amount: 金额
  - occurredAt: 发生日期
  - dueDate: 到期日期
  - note: 备注
  - createdAt: 创建时间

#### 项目结构
```
src/
├── components/          # UI组件
│   ├── AddCustomerDialog.tsx    # 新增客户弹窗
│   └── TransactionDrawer.tsx    # 记账抽屉
├── pages/              # 页面组件
│   ├── Dashboard.tsx            # 首页
│   └── Customers.tsx            # 客户管理页
├── store/              # 状态管理
│   ├── customerStore.ts         # 客户状态
│   └── transactionStore.ts      # 交易状态
├── db/                 # 数据库层
│   └── db.ts                    # Dexie数据库配置
├── types/              # TypeScript类型
│   └── index.ts                 # 类型定义
├── lib/                # 工具函数
│   └── utils.ts                 # 通用工具
├── App.tsx             # 主应用组件
├── index.css           # 全局样式
└── main.tsx            # 应用入口
```

### 验收标准

- [x] 可以成功创建一个名为"张三"的客户
- [x] 可以为"张三"录入一笔 500 元的欠款，日期选在昨天
- [x] 可以为"张三"再录入一笔 200 元的还款
- [x] 可以在流水表清晰看到这两笔记录，互不干扰

### 已知限制

- 数据仅存储在本地浏览器 IndexedDB 中
- 清除浏览器数据会导致数据丢失
- 暂不支持数据导出/导入功能
- 暂不支持多设备同步

### 下一步计划 (Phase 2)

- [ ] 客户详情页
- [ ] 客户欠款余额实时计算
- [ ] 逾期提醒功能
- [ ] 数据导出功能（CSV/Excel）
- [ ] PWA 支持（离线使用）

---

## 版本说明

- **v0.x.x**: 早期开发版本，功能逐步完善
- **v1.x.x**: 正式发布版本，功能稳定可用
