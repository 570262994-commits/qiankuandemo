import { useState, useEffect } from 'react';
import { 
  Bot, 
  Shield, 
  Bell, 
  Smartphone, 
  Cloud, 
  Edit3, 
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
    '谁欠我钱？欠多少？想不起来',
    '熟人欠款，不好意思开口要',
    '要账太直接，怕伤感情',
    '客户赊账太多，收不回来',
    '换个手机，账本全没了',
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

  const aiExample = {
    customer: '张老板',
    days: 14,
    amount: 2000,
    styles: [
      {
        name: '温和版',
        emoji: '🌸',
        text: '张老板，之前拿的年货2000块，方便时转一下哈~',
      },
      {
        name: '正式版',
        emoji: '💼',
        text: '张总您好，您1月1日的采购款2000元已逾期14天，麻烦安排一下付款，谢谢！',
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
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              客户欠款助手
            </h1>
            <p className="text-xl sm:text-2xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-bold mb-6">
              催款不尴尬，要账有方法
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
              小本生意的记账神器<br />
              谁欠你钱、欠多久、欠多少<br />
              一目了然
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

            {/* App Preview */}
            <div className="mt-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl rounded-full" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-xs mx-auto border border-gray-100">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">有人欠款</span>
                    <span className="text-2xl font-bold text-rose-500">¥2,000</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">张老板</p>
                        <p className="text-xs text-rose-500">逾期14天</p>
                      </div>
                      <span className="text-lg font-bold">¥2,000</span>
                    </div>
                    <button className="mt-3 w-full py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                      <Bot className="w-4 h-4" />
                      AI帮我催款
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            这些烦恼，你有吗？
          </h2>
          
          <div className="grid gap-3">
            {painPoints.map((point, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm"
              >
                <span className="text-xl">😰</span>
                <span className="text-gray-700">{point}</span>
              </div>
            ))}
          </div>
          
          <p className="text-center mt-8 text-gray-500">
            别急，<span className="text-purple-600 font-medium">客户欠款助手</span> 帮你搞定！
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              6个功能，够用就好
            </h2>
            <p className="text-gray-500">不搞花里胡哨，专注解决你的问题</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Showcase Section */}
      <section id="ai" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              AI帮你催款
            </h2>
            <p className="text-gray-500">一键生成话术，复制粘贴就能用</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5 pb-5 border-b">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-xl">
                👤
              </div>
              <div>
                <p className="font-bold text-gray-900">{aiExample.customer}</p>
                <p className="text-sm text-rose-500">逾期{aiExample.days}天 · ¥{aiExample.amount}</p>
              </div>
            </div>

            <div className="space-y-4">
              {aiExample.styles.map((style, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{style.emoji}</span>
                    <span className="font-medium text-gray-700 text-sm">{style.name}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 pr-10">
                    <p className="text-gray-600 text-sm">{style.text}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(style.text)}
                    className="absolute top-9 right-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
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

            <p className="text-center text-sm text-gray-400 mt-5 pt-5 border-t">
              复制 → 发微信 → 坐等收款
            </p>
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
              <Check className="w-3 h-3 text-emerald-500" />
              自动同步
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              数据隔离
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
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
              别让欠款变成坏账
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
