import { useState } from 'react';
import { X, Sparkles, Copy, RefreshCw, Check, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import type { CollectionStyle, CollectionData } from '../types';
import { generateCollectionText } from '../lib/aiCollection';
import { format } from 'date-fns';

interface AICollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: Omit<CollectionData, 'style'>;
}

const STYLES: { value: CollectionStyle; label: string; desc: string; icon: string }[] = [
  { value: 'polite', label: '礼貌温和', desc: '适合首次催款、关系好的客户', icon: '🌸' },
  { value: 'professional', label: '专业正式', desc: '适合B2B客户、商务往来', icon: '💼' },
  { value: 'gentle', label: '委婉提醒', desc: '适合熟人、不好意思开口', icon: '💭' },
  { value: 'humorous', label: '幽默轻松', desc: '适合老客户、年轻客户', icon: '😄' },
];

export default function AICollectionDialog({ isOpen, onClose, data }: AICollectionDialogProps) {
  const [style, setStyle] = useState<CollectionStyle>('polite');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [expandedItems, setExpandedItems] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateCollectionText({ ...data, style });
      setText(result);
      setShowResult(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败，请重试');
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    setShowResult(false);
    setText('');
    setError('');
  };

  const handleClose = () => {
    setShowResult(false);
    setText('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold">AI 催款助手</h2>
            </div>
            <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!showResult ? (
            <>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3.5 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{data.customerName}</p>
                    <p className="text-xs text-gray-500">共 {data.overdueItems.length} 笔逾期，最长 {data.overdueDays} 天</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-rose-600">¥{data.amount.toFixed(0)}</p>
                    <p className="text-xs text-gray-400">逾期总额</p>
                  </div>
                </div>
                {data.overdueItems.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-purple-100">
                    <button
                      onClick={() => setExpandedItems(!expandedItems)}
                      className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <span>查看逾期明细</span>
                      <div className="flex items-center gap-1">
                        <span>{expandedItems ? '收起' : '展开'}</span>
                        {expandedItems ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </button>
                    {expandedItems && (
                      <div className="mt-2 space-y-2">
                        {data.overdueItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">{format(item.occurredAt, 'MM-dd')}</span>
                              <span className="text-rose-600">逾期{item.overdueDays}天</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">¥{item.amount.toFixed(0)}</span>
                              {item.note && <span className="text-gray-400 truncate max-w-[80px]">{item.note}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {data.overdueItems.length === 1 && data.overdueItems[0]?.note && (
                  <div className="mt-2 pt-2 border-t border-purple-100">
                    <span className="text-xs text-gray-400">备注：</span>
                    <span className="text-xs text-gray-600">{data.overdueItems[0].note}</span>
                  </div>
                )}
              </div>

              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2.5">选择催款风格</p>
                <div className="space-y-2.5">
                  {STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                        style === s.value
                          ? 'border-purple-500 bg-purple-50 shadow-[0_2px_12px_-2px_rgba(168,85,247,0.2)]'
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl mt-0.5">{s.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm mb-0.5">{s.label}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                        </div>
                        {style === s.value && (
                          <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-3 p-2.5 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden text-sm"
                >
                  {loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  )}
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      生成文案
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-3.5 mb-3">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">{text}</p>
              </div>

              <div className="flex items-center gap-2 mb-4 p-2.5 bg-blue-50 rounded-lg">
                <span className="text-blue-500 text-sm">💡</span>
                <p className="text-xs text-blue-700">复制后可直接粘贴到微信发送</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  换一种风格
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制文案
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
