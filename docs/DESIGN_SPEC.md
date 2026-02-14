# 交互视觉规范文档

> 本文档定义了欠款管理应用的交互与视觉设计规范，所有新增功能都应遵循此规范。

---

## 一、设计原则

### 1.1 核心价值观
- **简洁高效**：减少认知负担，快速完成任务
- **一致性**：相同功能使用相同的交互模式
- **可访问性**：确保所有用户都能轻松使用
- **移动优先**：以移动端体验为核心设计

### 1.2 设计理念
- **轻量化**：避免过度装饰，专注核心功能
- **情感化**：通过颜色传递信息状态（红色=欠款/警示，绿色=还款/成功）
- **即时反馈**：所有操作都有明确的视觉反馈

---

## 二、颜色系统

### 2.1 主色板

| 颜色名称 | 色值 | 用途 |
|---------|------|------|
| **蓝色（主色）** | `#2563eb` (blue-600) | 主按钮、链接、选中态 |
| **蓝色深** | `#1d4ed8` (blue-700) | 主按钮 hover 态 |
| **红色（欠款）** | `#dc2626` (red-600) | 欠款金额、逾期标识、删除 |
| **绿色（还款）** | `#059669` (emerald-600) | 还款金额、成功状态 |
| **紫色（AI）** | `purple-500` / `pink-500` 渐变 | AI 功能专属色 |

### 2.2 语义色板

| 状态 | 背景色 | 文字色 | 用途 |
|------|--------|--------|------|
| **成功** | `bg-emerald-50` | `text-emerald-600` | 成功提示、还款 |
| **警告** | `bg-amber-50` | `text-amber-600` | 警告提示 |
| **错误** | `bg-red-50` | `text-red-600` | 错误提示、欠款 |
| **信息** | `bg-blue-50` | `text-blue-600` | 信息提示 |
| **AI** | `bg-purple-50` | `text-purple-600` | AI 功能 |

### 2.3 中性色板

| 颜色名称 | 色值 | 用途 |
|---------|------|------|
| `gray-50` | `#f9fafb` | 页面背景 |
| `gray-100` | `#f3f4f6` | 卡片背景、分割线 |
| `gray-200` | `#e5e7eb` | 边框、禁用态 |
| `gray-400` | `#9ca3af` | 占位符文字 |
| `gray-500` | `#6b7280` | 次要文字 |
| `gray-600` | `#4b5563` | 辅助文字 |
| `gray-700` | `#374151` | 正文文字 |
| `gray-900` | `#111827` | 标题文字 |

---

## 三、字体规范

### 3.1 字体家族
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### 3.2 字号层级

| 层级 | 字号 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| **H1** | `text-lg` (18px) | `font-bold` | 1.5 | 弹框标题 |
| **H2** | `text-lg` (18px) | `font-semibold` | 1.5 | 卡片标题 |
| **H3** | `text-base` (16px) | `font-medium` | 1.5 | 小标题 |
| **正文** | `text-sm` (14px) | `font-normal` | 1.5 | 正文内容 |
| **辅助** | `text-xs` (12px) | `font-normal` | 1.5 | 辅助说明 |
| **金额** | `text-2xl` (24px) | `font-bold` | 1.2 | 金额显示 |

### 3.3 特殊字体

| 类型 | 样式 | 用途 |
|------|------|------|
| **金额数字** | `font-mono` | 金额显示，等宽对齐 |
| **强调文字** | `font-semibold` | 重要信息强调 |

---

## 四、间距系统

### 4.1 基础间距单位
使用 4px 为基础单位，Tailwind 类名对应关系：

| 类名 | 值 | 用途 |
|------|-----|------|
| `p-1` | 4px | 紧凑内边距 |
| `p-1.5` | 6px | 关闭按钮内边距 |
| `p-2` | 8px | 小内边距 |
| `p-3` | 12px | 中等内边距 |
| `p-4` | 16px | 标准内边距 |
| `p-5` | 20px | 弹框内容内边距 |

### 4.2 组件间距

| 场景 | 间距 |
|------|------|
| 表单项之间 | `space-y-3` (12px) |
| 按钮组之间 | `gap-3` (12px) |
| 卡片之间 | `space-y-3` (12px) |
| 弹框标题与内容 | `mb-5` (20px) |
| 标签与输入框 | `mb-1.5` (6px) |

---

## 五、圆角规范

### 5.1 圆角层级

| 类名 | 值 | 用途 |
|------|-----|------|
| `rounded-lg` | 8px | 按钮、输入框、小卡片 |
| `rounded-xl` | 12px | 标准卡片、列表项 |
| `rounded-2xl` | 16px | 大卡片、选择卡片 |
| `rounded-3xl` | 24px | 弹框顶部 |
| `rounded-full` | 50% | 头像、图标按钮、徽章 |

### 5.2 使用规则
- **按钮**：统一使用 `rounded-lg`
- **输入框**：统一使用 `rounded-lg`
- **卡片**：统一使用 `rounded-xl`
- **弹框**：顶部使用 `rounded-t-3xl`
- **选择卡片**：使用 `rounded-2xl`（更大的点击区域）

---

## 六、阴影规范

### 6.1 阴影层级

| 类名 | 用途 |
|------|------|
| `shadow-sm` | 卡片默认阴影 |
| `shadow-lg` | 浮动按钮阴影 |
| `shadow-2xl` | 弹框阴影 |

### 6.2 特殊阴影
- **选中卡片**：`shadow-[0_2px_12px_-2px_rgba(168,85,247,0.2)]`（紫色投影）
- **模态遮罩**：无阴影，使用 `bg-black/50`

---

## 七、按钮规范

### 7.1 按钮类型

| 类型 | 样式 | 用途 |
|------|------|------|
| **主按钮** | `bg-blue-600 text-white hover:bg-blue-700` | 主要操作 |
| **次按钮** | `bg-gray-100 text-gray-700 hover:bg-gray-200` | 次要操作、取消 |
| **危险按钮** | `bg-red-500 text-white hover:bg-red-600` | 删除、危险操作 |
| **AI 按钮** | `bg-gradient-to-r from-purple-500 to-pink-500 text-white` | AI 功能专属 |
| **Ghost 按钮** | `bg-purple-50 text-purple-600 border border-purple-200` | AI 功能入口 |

### 7.2 按钮尺寸

| 尺寸 | 内边距 | 字号 | 用途 |
|------|--------|------|------|
| **小** | `py-2 px-3` | `text-sm` | 筛选标签 |
| **标准** | `py-2.5` | `text-sm` | 弹框按钮（统一规范） |
| **大** | `py-3` | `text-base font-bold` | 特殊强调按钮 |

### 7.3 按钮状态

```css
/* 默认态 */
bg-blue-600 text-white

/* Hover 态 */
hover:bg-blue-700

/* Active 态 */
active:scale-[0.98]  /* 轻微缩放反馈 */

/* 禁用态 */
disabled:bg-gray-300 disabled:cursor-not-allowed
```

### 7.4 按钮圆角
- 所有按钮统一使用 `rounded-lg`

---

## 八、弹框规范

### 8.1 弹框结构

```jsx
<div className="fixed inset-0 z-50">
  {/* 遮罩层 */}
  <div className="absolute inset-0 bg-black/50" onClick={onClose} />
  
  {/* 内容层 */}
  <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
    <div className="p-5">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold">{title}</h2>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* 内容区 */}
      ...
    </div>
  </div>
</div>
```

### 8.2 弹框属性

| 属性 | 值 |
|------|-----|
| 最大高度 | `max-h-[85vh]` |
| 内边距 | `p-5` |
| 顶部圆角 | `rounded-t-3xl` |
| 阴影 | `shadow-2xl` |
| 标题字号 | `text-lg font-bold` |
| 关闭按钮 | `w-5 h-5`, `p-1.5` |

### 8.3 弹框类型

| 类型 | 用途 | 特点 |
|------|------|------|
| **表单弹框** | 新增/编辑数据 | 底部滑出，可滚动 |
| **确认弹框** | 确认操作 | 居中显示，带图标 |
| **AI 弹框** | AI 功能交互 | 保留 AI 特色样式 |

---

## 九、卡片规范

### 9.1 标准卡片

```jsx
<div className="bg-white rounded-xl p-4 shadow-sm">
  {/* 卡片内容 */}
</div>
```

### 9.2 可点击卡片

```jsx
<div className="bg-white rounded-xl shadow-sm overflow-hidden active:scale-[0.98] transition-transform cursor-pointer">
  {/* 卡片内容 */}
</div>
```

### 9.3 选择卡片（大卡片）

```jsx
<button className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
  selected 
    ? 'border-purple-500 bg-purple-50 shadow-[0_2px_12px_-2px_rgba(168,85,247,0.2)]'
    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
}`}>
  {/* 卡片内容 */}
</button>
```

---

## 十、表单规范

### 10.1 输入框

```jsx
<input
  type="text"
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
  placeholder="请输入..."
/>
```

### 10.2 标签

```jsx
<label className="block text-sm font-medium text-gray-700 mb-1.5">
  标签名称 <span className="text-red-500">*</span>
</label>
```

### 10.3 表单组

```jsx
<div className="space-y-3">
  <div>
    <label>...</label>
    <input>...</input>
  </div>
  <div>
    <label>...</label>
    <input>...</input>
  </div>
</div>
```

### 10.4 错误提示

```jsx
<div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
  错误信息
</div>
```

---

## 十一、动画规范

### 11.1 内置动画

| 动画类名 | 效果 | 用途 |
|---------|------|------|
| `animate-fade-in` | 淡入 | 遮罩层 |
| `animate-scale-in` | 缩放淡入 | 居中弹框 |
| `animate-bounce-in` | 弹跳进入 | 图标 |
| `animate-slide-up` | 从底部滑入 | 底部弹框 |
| `animate-toast-in` | Toast 进入 | 消息提示 |
| `animate-shimmer` | 流光效果 | AI 生成中 |

### 11.2 过渡动画

| 场景 | 过渡效果 |
|------|---------|
| 按钮点击 | `active:scale-[0.98] transition-transform` |
| 颜色变化 | `transition-colors` |
| 所有变化 | `transition-all duration-200` |

### 11.3 动画时长

| 类型 | 时长 |
|------|------|
| 快速 | `0.15s` |
| 标准 | `0.2s` |
| 慢速 | `0.3s` |
| 强调 | `0.5s` |

---

## 十二、图标规范

### 12.1 图标库
使用 **Lucide React** 图标库

### 12.2 图标尺寸

| 尺寸 | 类名 | 用途 |
|------|------|------|
| 小 | `w-4 h-4` | 按钮内图标、小标签 |
| 中 | `w-5 h-5` | 列表图标、输入框图标 |
| 大 | `w-6 h-6` | 关闭按钮、导航图标 |
| 特大 | `w-12 h-12` | 弹框图标 |

### 12.3 图标颜色

| 场景 | 颜色 |
|------|------|
| 默认 | `text-gray-400` |
| 交互 | `text-gray-600` |
| 强调 | 跟随主题色 |
| 成功 | `text-emerald-500` |
| 错误 | `text-red-500` |
| AI | `text-white`（渐变背景上） |

---

## 十三、AI 功能专属规范

### 13.1 AI 功能标识

| 元素 | 样式 |
|------|------|
| **图标背景** | `bg-gradient-to-br from-purple-500 to-pink-500 rounded-full` |
| **主按钮** | `bg-gradient-to-r from-purple-500 to-pink-500` |
| **入口按钮** | `bg-purple-50 text-purple-600 border border-purple-200`（Ghost） |
| **选中卡片** | `border-purple-500 bg-purple-50` + 紫色投影 |

### 13.2 AI 动效

```jsx
{/* Shimmer 流光效果 */}
{loading && (
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
)}
```

### 13.3 AI 风格选择卡片

```jsx
<button className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
  selected
    ? 'border-purple-500 bg-purple-50 shadow-[0_2px_12px_-2px_rgba(168,85,247,0.2)]'
    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
}`}>
  <div className="flex items-start gap-2.5">
    <span className="text-xl">{emoji}</span>
    <div className="flex-1">
      <p className="font-medium text-gray-900 text-sm">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    {selected && (
      <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
        <Check className="w-2.5 h-2.5 text-white" />
      </div>
    )}
  </div>
</button>
```

---

## 十八、备注展示规范

### 18.1 展示规则

| 场景 | 截断方式 | 展开阈值 |
|------|---------|---------|
| **字符截断** | `note.slice(0, 14) + (note.length > 14 ? '...' : '')` | 14 个字符 |

### 18.2 使用场景

- 收支明细交易列表
- 异常提醒 - 单笔逾期卡片
- 异常提醒 - 多笔逾期明细列表

### 18.3 代码示例

```jsx
// 备注展示组件
<div 
  className="mt-2 flex items-start gap-1.5 cursor-pointer"
  onClick={(e) => toggleNoteExpand(id, e)}
>
  <span className="text-gray-400 text-xs flex-shrink-0">备注:</span>
  <div className="flex-1 min-w-0 flex items-start gap-1">
    <p className="text-xs text-gray-500 leading-relaxed flex-1">
      {expandedNotes.has(id) 
        ? note
        : note.slice(0, 14) + (note.length > 14 ? '...' : '')
      }
    </p>
    {note.length > 14 && (
      <button className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
        {expandedNotes.has(id) ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>
    )}
  </div>
</div>
```

### 18.4 设计原则

- **统一性**：所有备注展示统一使用字符截断，不受容器宽度影响
- **可交互**：点击备注区域可展开/收起查看完整内容
- **视觉提示**：超过 14 字符时显示展开/收起图标
- **一致性**：与 DESIGN_SPEC.md 中"表单规范"的备注样式保持一致

---

## 十四、响应式规范

### 14.1 断点

| 断点 | 最小宽度 | 用途 |
|------|---------|------|
| 默认 | - | 移动端优先 |
| `sm` | 640px | 大屏手机 |
| `md` | 768px | 平板 |
| `lg` | 1024px | 桌面端 |

### 14.2 移动端适配

- 最小宽度：`320px`
- 触摸目标最小尺寸：`44px × 44px`
- 底部安全区域：`pb-safe`（iOS）

---

## 十五、无障碍规范

### 15.1 对比度
- 正文文字对比度 ≥ 4.5:1
- 大标题对比度 ≥ 3:1

### 15.2 焦点状态
```css
focus:outline-none focus:ring-2 focus:ring-blue-500
```

### 15.3 语义化
- 使用正确的 HTML 标签
- 为图标按钮添加 `aria-label`
- 表单关联 `label`

---

## 十六、组件清单

### 16.1 已有组件

| 组件名 | 文件 | 用途 |
|--------|------|------|
| TransactionDrawer | `TransactionDrawer.tsx` | 记一笔弹框 |
| AddCustomerDialog | `AddCustomerDialog.tsx` | 新增客户弹框 |
| AICollectionDialog | `AICollectionDialog.tsx` | AI 催款弹框 |
| CustomModal | `CustomModal.tsx` | 确认弹框 |
| InstallPrompt | `InstallPrompt.tsx` | PWA 安装提示 |

### 16.2 公共样式提取

建议提取以下公共样式类：

```css
/* 按钮 */
.btn-primary { @apply py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm; }
.btn-secondary { @apply py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm; }
.btn-ai { @apply py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-sm; }

/* 输入框 */
.input { @apply w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm; }

/* 卡片 */
.card { @apply bg-white rounded-xl p-4 shadow-sm; }
.card-clickable { @apply bg-white rounded-xl shadow-sm overflow-hidden active:scale-[0.98] transition-transform cursor-pointer; }

/* 标签 */
.label { @apply block text-sm font-medium text-gray-700 mb-1.5; }
```

---

## 十七、版本记录

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.2 | 2026-02-14 | 统一弹框视觉规范：max-h 85vh、p-5 内边距、text-lg 标题、py-2.5 按钮等 |
| v1.1 | 2026-02-14 | 新增 AI 功能专属规范、备注展示规范 |
| v1.0 | 2025-02-14 | 初始版本，整理现有组件规范 |

---

> **注意**：所有新增功能必须遵循本规范，如有特殊情况需要偏离规范，需在设计评审中说明理由。
