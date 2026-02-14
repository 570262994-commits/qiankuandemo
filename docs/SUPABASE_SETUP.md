# Supabase 官方数据库配置指南

## 1. 创建 Supabase 表

请在 Supabase 控制台的 SQL Editor 中执行以下 SQL 语句：

### 1.1 客户表

```sql
-- 创建客户表
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(11),
  credit_limit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_term INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- 添加注释
COMMENT ON TABLE customers IS '客户信息表';
COMMENT ON COLUMN customers.id IS '客户ID';
COMMENT ON COLUMN customers.user_id IS '用户ID（关联auth.users）';
COMMENT ON COLUMN customers.name IS '客户姓名';
COMMENT ON COLUMN customers.phone IS '手机号';
COMMENT ON COLUMN customers.credit_limit IS '信用额度';
COMMENT ON COLUMN customers.payment_term IS '固定账期（天）';
COMMENT ON COLUMN customers.created_at IS '创建时间';
```

### 1.2 交易记录表

```sql
-- 创建交易记录表
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id BIGINT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('DEBT', 'PAYBACK')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_occurred_at ON transactions(occurred_at);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- 添加注释
COMMENT ON TABLE transactions IS '交易记录表';
COMMENT ON COLUMN transactions.id IS '交易ID';
COMMENT ON COLUMN transactions.user_id IS '用户ID（关联auth.users）';
COMMENT ON COLUMN transactions.customer_id IS '客户ID';
COMMENT ON COLUMN transactions.type IS '交易类型：DEBT-欠款，PAYBACK-还款';
COMMENT ON COLUMN transactions.amount IS '金额';
COMMENT ON COLUMN transactions.occurred_at IS '发生时间';
COMMENT ON COLUMN transactions.due_date IS '到期时间';
COMMENT ON COLUMN transactions.note IS '备注';
COMMENT ON COLUMN transactions.created_at IS '创建时间';
```

### 1.3 配置 Row Level Security (RLS)

```sql
-- 启用 RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的数据
CREATE POLICY "Users can only access their own customers" ON customers
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only access their own transactions" ON transactions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

## 2. 验证表创建

执行以下 SQL 验证表是否创建成功：

```sql
-- 查看所有表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 查看客户表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customers';

-- 查看交易记录表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions';

-- 查看 RLS 策略
SELECT * FROM pg_policies WHERE tablename IN ('customers', 'transactions');
```

## 3. 注意事项

1. **数据隔离**：使用 `user_id` 关联 `auth.users`，确保每个用户只能访问自己的数据
2. **安全性**：RLS 策略已启用，强制用户只能操作自己的数据
3. **外键约束**：`user_id` 字段关联 `auth.users(id)`，确保数据完整性
4. **索引优化**：已创建必要的索引，确保查询性能

## 4. 完成后

表创建完成后，应用即可正常使用。用户数据会自动存储到云端，并通过 `user_id` 进行隔离。

## 5. 配置回调地址

在 Supabase 控制台 → Authentication → URL Configuration 中配置：

- **Site URL**: `https://qiankuandemo.vercel.app`
- **Redirect URLs**: 
  - `https://qiankuandemo.vercel.app`
  - `https://qiankuandemo.vercel.app/reset-password`
