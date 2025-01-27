# 🧑💻 Стандарты разработки

Этот документ описывает правила написания кода и организацию работы над проектом.

---

## 🛠 Технологии

- **Языки**: TypeScript 5+, SCSS
- **Фреймворки**: Next.js 14, React 18
- **Стили**: Tailwind CSS 3.3 + CSS-модули
- **Линтеры**: ESLint, Prettier, Stylelint

---

## 📜 Основные правила

### 1. Стиль кода

| Элемент               | Правило                          | Пример                     |
|-----------------------|----------------------------------|----------------------------|
| Отступы               | 2 пробела                       | `function test() {\n  ...}`|
| Кавычки               | Двойные                         | `import React from "react"`|
| Точка с запятой       | Обязательны                     | `const x = 5;`            |
| Макс. длина строки    | 100 символов                    | `// Перенос аргументов\n` |

### 2. Именование

```typescript
// Переменные/функции - camelCase
const userData = fetchUser();

// Компоненты - PascalCase
function UserProfile() {...}

// Интерфейсы - IПрефикс
interface IProject {...}

// Константы - UPPER_CASE
const API_ENDPOINT = "...";
```

---

## 🖥 Frontend-специфика

### 1. Компоненты

```tsx
// Файл: src/components/UserCard/UserCard.tsx
import styles from './UserCard.module.scss';

interface IUserCardProps {
  user: IUser;
}

export const UserCard: React.FC<IUserCardProps> = ({ user }) => (
  <div className={styles.wrapper}>
    <h3 className="text-lg font-semibold">{user.name}</h3>
  </div>
);
```

### 2. Стилизация

```scss
// Использовать CSS-модули для компонентов
.wrapper {
  padding: 1rem;
  @apply bg-white rounded-lg shadow-sm; // Tailwind
}
```

---

## 🌿 Git workflow

### 1. Ветки

```text
feature/название-фичи
fix/описание-бага
chore/название-задачи
```

### 2. Коммиты

```bash
git commit -m "feat(profile): add user bio section"
git commit -m "fix(auth): resolve login validation error"
```

**Типы коммитов**:

- `feat`: Новая функциональность
- `fix`: Исправление ошибок
- `refactor`: Изменения кода без новой функциональности
- `docs`: Обновление документации
- `chore`: Вспомогательные задачи

---

## 🧪 Тестирование

```typescript
// Файлы тестов: *.test.tsx рядом с компонентом
describe('UserProfile component', () => {
  it('renders user name correctly', () => {
    const { getByText } = render(<UserProfile name="Alice" />);
    expect(getByText('Alice')).toBeInTheDocument();
  });
});
```

**Требования**:

- Покрытие ключевых компонентов (>70%)
- Тесты на TypeScript
- Использование Testing Library

---

## 🔍 Code Quality

### 1. Линтеры

```json
// .eslintrc
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### 2. Пре-коммит хуки

```json
// package.json
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
},
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

---

## 💡 Советы по IDE

1. Установить [Prettier](https://prettier.io/) плагин
2. Включить автоформатирование при сохранении
3. Использовать [ESLint](https://eslint.org/) интеграцию

**[⬆ Наверх](#-стандарты-разработки)**

---

### 🚀 Рекомендации по использованию

1. Добавьте файл в корень репозитория:  

   ```bash
   touch CODESTYLE.md
   ```

2. Обновите `README.md` с ссылкой на гайдлайны:  

   ```markdown
   ## 🤝 Как помочь
   Перед началом работы ознакомьтесь с:
   - [CODESTYLE.md](CODESTYLE.md) - правила разработки
   - [CONTRIBUTING.md](CONTRIBUTING.md) - процесс внесения изменений
   ```

3. Интегрируйте проверки в CI/CD:  

   ```yml
   # .github/workflows/lint.yml
   jobs:
     lint:
       steps:
         - name: ESLint
           run: npm run lint
   ```
