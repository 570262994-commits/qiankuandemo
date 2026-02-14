import { useState, useEffect } from 'react';
import { 
  Bot, 
  Shield, 
  Bell, 
  Smartphone, 
  Cloud, 
  Edit3, 
  ChevronRight,
  Copy,
  Check,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const features = [
    {
      icon: Bot,
      title: 'AI催款助手',
      description: '一键生成4种风格催款文案，复制即用',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: '信用额度预警',
      description: '进度条颜色联动，超额自动拦截',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Bell,
      title: '逾期智能提醒',
      description: '逾期客户优先展示，不遗漏任何应收款',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Smartphone,
      title: 'PWA 支持',
      description: '添加到主屏幕，像原生App一样使用',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Cloud,
      title: '云端同步',
      description: '多设备数据自动同步，换手机不丢数据',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Edit3,
      title: '极简记账',
      description: '3秒完成一笔记录，低门槛高效率',
      color: 'from-rose-500 to-pink-500',
    },
  ];

  const painPoints = [
    '客户欠款记不住，总是漏收',
    '熟人逾期不好意思开口催',
    '不知道怎么优雅地要账',
    '信用额度失控，坏账频发',
    '换手机数据全丢了',
  ];

  const testimonials = [
    {
      name: '王姐',
      role: '小超市老板',
      avatar: '🏪',
      content: '以前老忘记谁欠我钱，现在打开App一目了然，AI生成的催款话术特别好用，客户看了都主动还款！',
    },
    {
      name: '老李',
      role: '菜市场摊主',
      avatar: '🥬',
      content: '熟人欠款不好意思开口，用这个App生成的文案，既不伤感情，又能把钱要回来，太实用了！',
    },
    {
      name: '张总',
      role: '批发商',
      avatar: '📦',
      content: '客户多了记不住账期，现在逾期自动提醒，信用额度也能控制，坏账少了很多！',
    },
  ];

  const aiExample = {
    customer: '张老板',
    days: 14,
    amount: 2000,
    note: '车厘子、苹果等年货',
    styles: [
      {
        name: '礼貌温和',
        emoji: '🌸',
        text: '张老板您好，新年快到了，之前您在我这拿的年货（车厘子、苹果等）一共2000元，方便的时候帮忙安排一下哈~祝您新年快乐！',
      },
      {
        name: '专业正式',
        emoji: '💼',
        text: '尊敬的张先生，您好！根据我们的记录，您于2026年1月1日的采购订单（车厘子、苹果等）共计2000元，目前已逾期14天。烦请您安排付款，如有问题请随时联系。',
      },
    ],
  };

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
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">用户评价</a>
              <button
                onClick={onGetStarted}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                免费开始
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900">功能</a>
              <a href="#ai" className="block text-gray-600 hover:text-gray-900">AI催款</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-gray-900">用户评价</a>
              <button
                onClick={onGetStarted}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium"
              >
                免费开始
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-600 text-sm font-medium mb-6">
              <span className="animate-pulse">✨</span>
              AI 驱动的智能账本
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              客户欠款助手
              <span className="block bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                让催款不再尴尬
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              小微经营者的智能账本，一键生成催款文案，信用额度智能预警，让应收账款管理变得简单高效
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                免费开始使用
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-xl font-medium text-lg border border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                了解更多
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            {/* Hero Image / App Preview */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl rounded-full" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-sm mx-auto border border-gray-100">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">逾期总额</span>
                    <span className="text-2xl font-bold text-rose-500">¥2,000</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">张老板</p>
                        <p className="text-xs text-rose-500">已逾期 14 天</p>
                      </div>
                      <span className="text-lg font-bold">¥2,000</span>
                    </div>
                    <button className="mt-3 w-full py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                      <Bot className="w-4 h-4" />
                      AI 催款
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            你是否也有这些烦恼？
          </h2>
          
          <div className="grid gap-4">
            {painPoints.map((point, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-2xl">😰</span>
                <span className="text-gray-700">{point}</span>
              </div>
            ))}
          </div>
          
          <p className="text-center mt-8 text-gray-500">
            别担心，<span className="text-purple-600 font-medium">客户欠款助手</span> 帮你解决！
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              六大功能，解决你的所有烦恼
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              从记账到催款，从预警到同步，一站式解决应收账款管理难题
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Showcase Section */}
      <section id="ai" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-purple-600 text-sm font-medium mb-4">
              <Bot className="w-4 h-4" />
              AI 催款助手
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              让催款不再尴尬
            </h2>
            <p className="text-gray-600">
              AI 根据逾期信息自动生成催款文案，一键复制发送
            </p>
          </div>

          {/* AI Example Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <p className="font-bold text-gray-900">{aiExample.customer}</p>
                <p className="text-sm text-rose-500">已逾期 {aiExample.days} 天 · ¥{aiExample.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              {aiExample.styles.map((style, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{style.emoji}</span>
                    <span className="font-medium text-gray-700">{style.name}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 pr-12">
                    <p className="text-gray-600 text-sm leading-relaxed">{style.text}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(style.text)}
                    className="absolute top-10 right-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="复制文案"
                  >
                    {copiedText === style.text ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-center text-sm text-gray-500">
                ✨ 一键复制 → 粘贴到微信发送给客户
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              他们都在用
            </h2>
            <p className="text-gray-600">
              超过 1000+ 小微经营者的选择
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">"{item.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            数据安全有保障
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            采用 Supabase 云端存储，支持 RLS 行级安全策略，每个用户只能访问自己的数据，确保隐私安全
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              云端自动同步
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              多设备数据隔离
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              HTTPS 加密传输
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              开始管理你的应收账款
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              免费使用，无需下载安装，打开浏览器即可开始
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              立即免费开始
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">欠</span>
              </div>
              <span className="font-bold text-gray-900">客户欠款助手</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 客户欠款助手. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
