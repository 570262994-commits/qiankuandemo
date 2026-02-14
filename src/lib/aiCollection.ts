import type { CollectionStyle, CollectionData } from '../types';

const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

const STYLE_NAMES: Record<CollectionStyle, string> = {
  polite: '礼貌温和',
  professional: '专业正式',
  gentle: '委婉提醒',
  humorous: '幽默轻松',
};

const SYSTEM_PROMPT = `你是一个专业的催款文案助手，帮助小微经营者生成微信催款文案。

要求：
1. 文案简洁，不超过150字
2. 语气要符合选择的风格
3. 适当使用1-2个表情符号
4. 要包含关键信息：金额、逾期天数
5. 结尾要有行动号召
6. 直接输出文案，不要有其他解释

风格说明：
- 礼貌温和：友善提醒，不给压力，适合首次催款
- 专业正式：商务规范，清晰明确，适合B2B客户
- 委婉提醒：间接表达，留有余地，适合熟人
- 幽默轻松：轻松调侃，不失礼貌，适合老客户`;

function buildUserPrompt(data: CollectionData): string {
  return `请生成一条催款文案：

客户姓名：${data.customerName}
逾期金额：${data.amount}元
逾期天数：${data.overdueDays}天
备注：${data.note || '无'}
风格：${STYLE_NAMES[data.style]}

请直接输出文案：`;
}

export async function generateCollectionText(data: CollectionData): Promise<string> {
  const apiKey = import.meta.env.VITE_GLM_API_KEY;
  
  if (!apiKey) {
    throw new Error('GLM API Key 未配置');
  }

  const response = await fetch(GLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(data) },
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'AI 服务请求失败');
  }

  const result = await response.json();
  return result.choices[0].message.content.trim();
}
