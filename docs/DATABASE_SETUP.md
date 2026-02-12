# 数据库配置指南

## 1. 创建 Supabase 表

请在 Supabase 控制台的 SQL Editor 中执行以下 SQL 语句：

### 1.1 客户表

```sql
-- 创建客户表
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(11),
  credit_limit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_term INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_customers_device_id ON customers(device_id);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- 添加注释
COMMENT ON TABLE customers IS '客户信息表';
COMMENT ON COLUMN customers.id IS '客户ID';
COMMENT ON COLUMN customers.device_id IS '设备ID（用于数据隔离）';
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
  device_id TEXT NOT NULL,
  customer_id BIGINT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('DEBT', 'PAYBACK')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_transactions_device_id ON transactions(device_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_occurred_at ON transactions(occurred_at);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- 添加注释
COMMENT ON TABLE transactions IS '交易记录表';
COMMENT ON COLUMN transactions.id IS '交易ID';
COMMENT ON COLUMN transactions.device_id IS '设备ID（用于数据隔离）';
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

-- 创建策略：允许所有操作（开发阶段）
CREATE POLICY "Allow all access to customers" ON customers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to transactions" ON transactions
  FOR ALL USING (true) WITH CHECK (true);
```

## 2. 验证表创建

执行以下 SQL 验证表是否创建成功：

```sql
-- 查看所有表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 查看客户表结构
\d customers

-- 查看交易记录表结构
\d transactions
```

## 3. 注意事项

1. **数据隔离**：所有查询都会自动带上 `device_id` 过滤，确保不同设备的数据相互隔离
2. **安全性**：RLS 策略已启用，生产环境建议添加更严格的权限控制
3. **索引优化**：已创建必要的索引，确保查询性能

## 4. 完成后

表创建完成后，应用即可正常使用。用户数据会自动存储到云端，并通过设备 ID 进行隔离。
