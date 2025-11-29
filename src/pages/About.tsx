// === 📁 src/pages/About.tsx ===
// About page with app information

import React from 'react';
import { Info, Mail, Globe, Github, Heart } from 'lucide-react';
import { appMetadata } from '@/modules/menu/MenuData';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-primary rounded-full mb-4">
          <Info className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-content-primary mb-2">
          {appMetadata.name}
        </h1>
        <p className="text-content-secondary text-lg">
          PWA-приложение для управления складскими операциями
        </p>
      </div>

      {/* Version Info */}
      <div className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-content-primary mb-4">Информация о версии</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-content-secondary text-sm">Версия</p>
            <p className="text-content-primary text-lg font-semibold">{appMetadata.version}</p>
          </div>
          <div>
            <p className="text-content-secondary text-sm">Сборка</p>
            <p className="text-content-primary text-lg font-semibold">{appMetadata.build}</p>
          </div>
          <div>
            <p className="text-content-secondary text-sm">Разработчик</p>
            <p className="text-content-primary text-lg font-semibold">{appMetadata.vendor}</p>
          </div>
          <div>
            <p className="text-content-secondary text-sm">Тип</p>
            <p className="text-content-primary text-lg font-semibold">PWA</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-content-primary mb-4">Возможности</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            '📦 Приёмка товаров',
            '🏷️ Размещение по ячейкам',
            '🚚 Комплектация заказов',
            '📄 Отгрузка товаров',
            '♻️ Возврат и списание',
            '📊 Инвентаризация',
            '🔄 Offline-First режим',
            '📱 PWA установка',
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-primary rounded-full" />
              <span className="text-content-primary">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technologies */}
      <div className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-content-primary mb-4">Технологии</h2>
        <div className="flex flex-wrap gap-2">
          {['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'IndexedDB', 'Dexie.js', 'Framer Motion', 'React Router'].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-sm font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-surface-secondary border border-borders-default rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-content-primary mb-4">Контакты</h2>
        <div className="space-y-3">
          <a
            href="mailto:support@cleverence.com"
            className="flex items-center gap-3 text-content-primary hover:text-brand-primary transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>support@cleverence.com</span>
          </a>
          <a
            href="https://cleverence.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-content-primary hover:text-brand-primary transition-colors"
          >
            <Globe className="w-5 h-5" />
            <span>cleverence.com</span>
          </a>
          <a
            href="https://github.com/cleverence"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-content-primary hover:text-brand-primary transition-colors"
          >
            <Github className="w-5 h-5" />
            <span>github.com/cleverence</span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-content-tertiary">
        <p className="flex items-center justify-center gap-2">
          Сделано с <Heart className="w-4 h-4 text-red-500 fill-current" /> командой {appMetadata.vendor}
        </p>
        <p className="text-sm mt-2">© 2025 {appMetadata.vendor}. Все права защищены.</p>
      </div>
    </div>
  );
};

export default About;

