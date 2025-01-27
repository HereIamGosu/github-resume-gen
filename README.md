# 📄 GitHub Resume Generator  

**Автоматическое создание профессионального резюме на основе вашего GitHub-профиля**  

![Demo](demo-screenshot.png)  
*Позже добавлю пример сгенерированного резюме в формате PDF*

---

## 📖 Оглавление

- [🚀 Быстрый старт](#-быстрый-старт)
- [✨ Особенности](#-особенности)
- [🛠 Технологии](#-технологии)
- [🎯 Использование](#-использование)
- [🌍 Деплой](#-деплой)
- [🤝 Как помочь](#-как-помочь)
- [📜 Лицензия](#-лицензия)

---

## ✨ Особенности

- **🎯 Автоматизация** – Резюме генерируется за секунды  
- **📊 Анализ навыков** – Визуализация технологий из ваших репозиториев  
- **🎨 Гибкий дизайн** – 3 стиля оформления (Minimalist, Classic, Creative)  
- **📥 Экспорт** – Поддержка PDF/DOCX форматов  
- **🤖 AI-анализ** – Умное описание проектов через Codestral API  

---

## 🛠 Технологии  

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)  
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-blue?logo=tailwind-css)  
![OpenAI](https://img.shields.io/badge/OpenAI-API-purple?logo=openai)  
![GitHub API](https://img.shields.io/badge/GitHub-API-gray?logo=github)  

---

## 🚀 Быстрый старт

1. Клонируйте репозиторий:  

```bash
git clone https://github.com/hereiamgosu/github-resume-gen.git
```

2. Установите зависимости:  

```bash
npm install
```

3. Настройте переменные окружения (`.env.local`):  

```env
GITHUB_TOKEN=your_github_pat
CODESTRAL_API_KEY=your_ai_key
```

4. Запустите проект:  

```bash
npm run dev
```

---

## 🎯 Использование

### Генерация резюме

```bash
curl -X POST https://your-api-url/generate \
  -H "Content-Type: application/json" \
  -d '{"username": "your-github-username"}'
```

### Пример ответа

```json
{
  "skills": {
    "TypeScript": 85,
    "React": 78,
    "Node.js": 65
  },
  "projects": [
    {
      "name": "AI Chatbot",
      "description": "Чат-бот с NLP на базе GPT-4..."
    }
  ]
}
```

---

## 🌍 Деплой

### Vercel (Рекомендуется)  

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhereiamgosu%2Fgithub-resume-gen)  

### Docker  

```bash
docker build -t resume-generator .
docker run -p 3000:3000 -e ENV_VARS resume-generator
```

---

## 🤝 Как помочь

1. Форкните репозиторий  
2. Создайте ветку для фичи/багфикса:  

```bash
git checkout -b feature/amazing-feature
```

3. Следуйте [гайдлайнам кода](CODESTYLE.md)  
4. Откройте Pull Request с описанием изменений  

---

## 📜 Лицензия

Этот проект распространяется под лицензией [MIT](LICENSE).  
Copyright © 2025. Все права защищены.
