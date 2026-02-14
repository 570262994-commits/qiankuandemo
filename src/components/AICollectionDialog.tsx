import { useState } from 'react';
import { X, Sparkles, Copy, RefreshCw, Check, Wand2 } from 'lucide-react';
import type { CollectionStyle, CollectionData } from '../types';
import { generateCollectionText } from '../lib/aiCollection';

interface AICollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: Omit<CollectionData, 'style'>;
}

const STYLES: { value: CollectionStyle; label: string; desc: string }[] = [
  { value: 'polite', label: '礼貌温和', desc: '适合首次催款、关系好的客户' },
  { value: 'professional', label: '专业正式', desc: '适合B2B客户、商务往来' },
  { value: 'gentle', label: '委婉提醒', desc: '适合熟人、不好意思开口' },
  { value: 'humorous', label: '幽默轻松', desc: '适合老客户、年轻客户' },
];

export default function AICollectionDialog({ isOpen, onClose, data }: AICollectionDialogProps) {
  const [style, setStyle] = useState<CollectionStyle>('polite');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);

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
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold">AI 催款助手</h2>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {!showResult ? (
            <>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{data.customerName}</p>
                    <p className="text-sm text-gray-500">逾期 {data.overdueDays} 天</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-rose-600">¥{data.amount.toFixed(0)}</p>
                    <p className="text-xs text-gray-400">逾期金额</p>
                  </div>
                </div>
                {data.note && (
                  <div className="mt-2 pt-2 border-t border-purple-100">
                    <span className="text-xs text-gray-400">备注：</span>
                    <span className="text-sm text-gray-600">{data.note}</span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">选择催款风格</p>
                <div className="space-y-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        style === s.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            style === s.value ? 'border-purple-500' : 'border-gray-300'
                          }`}
                        >
                          {style === s.value && (
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.label}</p>
                          <p className="text-xs text-gray-500">{s.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      生成文案
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{text}</p>
              </div>

              <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-500">💡</span>
                <p className="text-sm text-blue-700">复制后可直接粘贴到微信发送</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  换一种风格
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
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
