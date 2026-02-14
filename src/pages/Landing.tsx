import { useState, useEffect } from 'react';
import { 
  Bot, 
  Shield, 
  Bell, 
  Smartphone, 
  Cloud, 
  Edit3, 
  Copy,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'gentle' | 'formal'>('gentle');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Bot,
      title: 'AI帮催款',
      description: '一键生成催款话术，复制粘贴就能用',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: '额度预警',
      description: '谁快超额度了，一眼就知道',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Bell,
      title: '逾期提醒',
      description: '谁欠多久了，自动提醒你',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Smartphone,
      title: '手机桌面',
      description: '添加到桌面，像App一样用',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Cloud,
      title: '换机不丢',
      description: '数据云端存，换手机也不丢',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Edit3,
      title: '秒记账',
      description: '3秒记一笔，简单好用',
      color: 'from-rose-500 to-pink-500',
    },
  ];

  const painPoints = [
    { emoji: '💸', illustration: '😔💰', text: '"回头给"是多少生意的终点？', highlight: true },
    { emoji: '😰', illustration: '🤦‍♀️💸', text: '"不好意思问"让多少利润变坏账？', highlight: true },
    { emoji: '🤔', illustration: '🧐📝', text: '谁欠我钱？欠多少？想不起来', highlight: false },
    { emoji: '😬', illustration: '😅💬', text: '熟人欠款，开口要钱太尴尬', highlight: false },
    { emoji: '📱', illustration: '😱📱', text: '换个手机，账本全没了', highlight: false },
  ];

  const testimonials = [
    {
      name: '王姐',
      role: '小超市',
      avatar: '🏪',
      content: '以前总忘谁欠钱，现在打开就知道。AI生成的催款话术特别好用！',
    },
    {
      name: '老李',
      role: '菜摊老板',
      avatar: '🥬',
      content: '熟人欠钱不好意思要，用这个生成的话术，不伤感情还能要回来！',
    },
    {
      name: '张总',
      role: '批发商',
      avatar: '📦',
      content: '客户多了记不住，现在逾期自动提醒，坏账少多了！',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">欠</span>
              </div>
              <span className="font-bold text-gray-900">客户欠款助手</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">功能</a>
              <a href="#ai" className="text-gray-600 hover:text-gray-900 transition-colors">AI催款</a>
              <a href="#users" className="text-gray-600 hover:text-gray-900 transition-colors">用户说</a>
              <button
                onClick={onGetStarted}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                免费用
              </button>
            </div>

            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900">功能</a>
              <a href="#ai" className="block text-gray-600 hover:text-gray-900">AI催款</a>
              <a href="#users" className="block text-gray-600 hover:text-gray-900">用户说</a>
              <button
                onClick={onGetStarted}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium"
              >
                免费用
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent whitespace-nowrap">
              别让欠款拖垮你的生意
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              AI 催款助手 + 信用预警，用技术守住你的辛苦钱
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                免费用起来
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 交互演示区域 */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* 左侧：AI 选择界面 */}
            <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">AI 催款助手</span>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">张老板</p>
                    <p className="text-xs text-rose-500">逾期14天 · ¥3,000</p>
                  </div>
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-lg">👤</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3">选择催款风格</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setSelectedStyle('gentle')}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedStyle === 'gentle' 
                      ? 'bg-purple-100 border-2 border-purple-400' 
                      : 'bg-gray-50 border border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <span className="text-lg">🌸</span>
                  <p className={`text-xs font-medium mt-1 ${selectedStyle === 'gentle' ? 'text-purple-700' : 'text-gray-500'}`}>温和版</p>
                </button>
                <button 
                  onClick={() => setSelectedStyle('formal')}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedStyle === 'formal' 
                      ? 'bg-purple-100 border-2 border-purple-400' 
                      : 'bg-gray-50 border border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <span className="text-lg">💼</span>
                  <p className={`text-xs font-medium mt-1 ${selectedStyle === 'formal' ? 'text-purple-700' : 'text-gray-500'}`}>正式版</p>
                </button>
              </div>
            </div>

            {/* 右侧：微信对话模拟 */}
            <div className="bg-[#EDEDED] rounded-2xl shadow-xl p-4">
              <div className="bg-[#EDEDED] space-y-3">
                {selectedStyle === 'gentle' ? (
                  <>
                    <div className="flex justify-end">
                      <div className="bg-[#95EC69] rounded-lg px-3 py-2 max-w-[80%]">
                        <p className="text-sm text-gray-800">张老板，之前拿的年货3000块，方便时转一下哈~</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg px-3 py-2 max-w-[80%]">
                        <p className="text-sm text-gray-800">好的，这就转给你！</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[#95EC69] rounded-lg px-3 py-2 max-w-[80%]">
                        <p className="text-sm text-gray-800">🙏 谢谢张老板！</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-end">
                      <div className="bg-[#95EC69] rounded-lg px-3 py-2 max-w-[80%]">
                        <p className="text-sm text-gray-800">张总您好，您1月1日的采购款3000元已逾期14天，麻烦安排一下付款，谢谢！</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg px-3 py-2 max-w-[80%]">
                        <p className="text-sm text-gray-800">收到，今天安排财务转账</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[#95EC69] rounded-lg px-3 py-2 max-w-[80%]">
                        <p className="text-sm text-gray-800">好的，感谢张总支持！</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-300">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-full px-4 py-2">
                    <p className="text-xs text-gray-400">一键复制，粘贴发送...</p>
                  </div>
                  <button className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Copy className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              看看长什么样
            </h2>
            <p className="text-gray-500 text-sm">简洁好用，一看就会</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {/* 首页截图 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-white text-xs font-medium">
                首页 · 异常提醒
              </div>
              <div className="p-3 bg-slate-50">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                    <p className="text-xs text-gray-400">总待收</p>
                    <p className="text-sm font-bold text-gray-900">¥5,800</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                    <p className="text-xs text-gray-400">总欠款</p>
                    <p className="text-sm font-bold text-rose-500">¥8,000</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                    <p className="text-xs text-gray-400">总还款</p>
                    <p className="text-sm font-bold text-emerald-500">¥2,200</p>
                  </div>
                </div>
                {/* Alert Card */}
                <div className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-rose-400">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-sm">张老板</span>
                    <span className="text-rose-500 font-bold text-sm">¥3,000</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-rose-500 mb-2">
                    <span>⚠️</span>
                    <span>逾期14天</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">备注: 年货采购</p>
                </div>
              </div>
            </div>

            {/* 客户档案截图 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white text-xs font-medium">
                客户档案
              </div>
              <div className="p-3 bg-slate-50 space-y-2">
                {/* Customer Card 1 */}
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">张</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">张老板</p>
                      <p className="text-xs text-gray-400">欠款 ¥3,000</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">额度 75% · 账期30天</p>
                </div>
                {/* Customer Card 2 */}
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold">李</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">李姐</p>
                      <p className="text-xs text-gray-400">欠款 ¥2,800</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">额度 50% · 账期15天</p>
                </div>
              </div>
            </div>

            {/* AI催款截图 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 text-white text-xs font-medium">
                AI催款助手
              </div>
              <div className="p-3 bg-slate-50">
                <div className="bg-white rounded-xl p-3 shadow-sm mb-2">
                  <p className="text-xs text-gray-400 mb-1">选择风格</p>
                  <div className="flex gap-1">
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs">温和</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">正式</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">幽默</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    "张老板，之前拿的年货3000块，方便时转一下哈~祝生意兴隆！"
                  </p>
                </div>
                <button className="w-full mt-2 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                  <Copy className="w-3 h-3" />
                  复制文案
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            这些烦恼，你有吗？
          </h2>
          
          <div className="grid gap-3">
            {painPoints.map((point, index) => (
              <div 
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  point.highlight 
                    ? 'bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 shadow-sm' 
                    : 'bg-white shadow-sm'
                }`}
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  {point.illustration}
                </div>
                <span className={`text-gray-700 ${point.highlight ? 'font-medium' : ''}`}>{point.text}</span>
              </div>
            ))}
          </div>
          
          <p className="text-center mt-8 text-gray-500">
            别急，<span className="text-purple-600 font-medium">客户欠款助手</span> 帮你搞定！
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              6个功能，够用就好
            </h2>
            <p className="text-gray-500 text-sm">不搞花里胡哨，专注解决你的问题</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-3 sm:p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-2`}>
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-0.5">{feature.title}</h3>
                <p className="text-gray-500 text-xs">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="users" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              他们都在用
            </h2>
            <p className="text-gray-500">小本生意人的共同选择</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {testimonials.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-5 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">"{item.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            数据安全
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            云端加密存储，你的账本只有你能看
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="text-emerald-500">✓</span>
              自动同步
            </div>
            <div className="flex items-center gap-1">
              <span className="text-emerald-500">✓</span>
              数据隔离
            </div>
            <div className="flex items-center gap-1">
              <span className="text-emerald-500">✓</span>
              加密传输
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              别让欠款拖垮你的生意
            </h2>
            <p className="text-white/80 mb-6 text-sm">
              免费用，不用下载，打开就能记账
            </p>
            <button
              onClick={onGetStarted}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              立即开始
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">欠</span>
            </div>
            <span className="font-medium text-gray-700 text-sm">客户欠款助手</span>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 客户欠款助手
          </p>
        </div>
      </footer>
    </div>
  );
}
