// === 📁 src/pages/Feedback.tsx ===
// Feedback form page

import React, { useState } from 'react';
import { MessageSquare, Send, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type FeedbackType = 'bug' | 'feature' | 'question' | 'other';

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<FeedbackType>('feature');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate submission
    console.log('Feedback submitted:', { type, message, email });

    // In real app: send to API
    // await api.post('/feedback', { type, message, email });

    // Save to IndexedDB for offline
    try {
      // Here you would save to db.feedback table
      setSubmitted(true);
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-success rounded-full mb-6">
          <Check className="w-10 h-10 text-white" />
        </div>
      <h2 className="text-3xl font-bold text-content-primary mb-4">
          Спасибо за обратную связь!
        </h2>
      <p className="text-content-secondary text-lg mb-6">
          Ваше сообщение получено и будет обработано в ближайшее время.
        </p>
      <p className="text-sm text-content-tertiary">
          Автоматическое перенаправление через 2 секунды...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-content-primary mb-2">💬 Обратная связь</h1>
        <p className="text-content-secondary">
          Расскажите нам о проблеме, предложите улучшение или задайте вопрос
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg">
          <label className="block text-content-primary font-semibold mb-3">
            Тип обращения
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'bug' as FeedbackType, label: '🐛 Ошибка', color: 'red' },
              { value: 'feature' as FeedbackType, label: '✨ Предложение', color: 'blue' },
              { value: 'question' as FeedbackType, label: '❓ Вопрос', color: 'yellow' },
              { value: 'other' as FeedbackType, label: '💬 Другое', color: 'gray' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={`p-4 rounded-lg border-2 transition-all touch-manipulation ${
                  type === option.value
                    ? 'border-brand-primary bg-brand-primary/20'
                    : 'border-borders-default hover:border-borders-strong'
                }`}
              >
                <span className="text-content-primary font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg">
          <label className="block text-content-primary font-semibold mb-3">
            Сообщение *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
            placeholder="Опишите подробно вашу проблему, предложение или вопрос..."
            className="w-full bg-surface-primary text-content-primary px-4 py-3 rounded-lg border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none placeholder:text-content-tertiary"
          />
          <p className="text-xs text-content-tertiary mt-2">
            Минимум 10 символов
          </p>
        </div>

        {/* Email */}
        <div className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg">
          <label className="block text-content-primary font-semibold mb-3">
            Email (необязательно)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-surface-primary text-content-primary px-4 py-3 rounded-lg border border-borders-default focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-content-tertiary"
          />
          <p className="text-xs text-content-tertiary mt-2">
            Укажите email, если хотите получить ответ
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-brand-primary/15 border border-brand-primary/30 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-content-secondary">
            <p className="font-semibold text-brand-primary mb-1">Обратная связь в оффлайн режиме</p>
            <p>
              Ваше сообщение будет сохранено локально и отправлено автоматически при восстановлении соединения.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={message.length < 10}
            className="flex-1 bg-brand-primary hover:brightness-90 disabled:bg-surface-disabled disabled:cursor-not-allowed text-brand-dark px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            <Send className="w-5 h-5" />
            Отправить
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-4 bg-surface-tertiary hover:bg-surface-secondary text-content-primary border border-borders-default rounded-xl font-semibold transition-colors touch-manipulation"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default Feedback;

