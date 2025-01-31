"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Константы конфигурации формы
const FORM_CONFIG = {
  input: {
    placeholder: "GitHub username",
    ariaLabel: "Enter GitHub username",
    testId: "username-input",
  },
  button: {
    text: "Generate Resume",
    ariaLabel: "Generate resume from GitHub data",
    testId: "submit-button",
  },
  validation: {
    minLength: 1,
    maxLength: 39,
    pattern: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
  },
} as const;

export function GithubForm() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Валидация имени пользователя
  const validateUsername = useCallback((value: string): string | null => {
    const trimmed = value.trim();

    if (!trimmed) return "Username is required";
    if (trimmed.length > FORM_CONFIG.validation.maxLength) {
      return `Username must be less than ${FORM_CONFIG.validation.maxLength} characters`;
    }
    if (!FORM_CONFIG.validation.pattern.test(trimmed)) {
      return "Invalid GitHub username format";
    }
    return null;
  }, []);

  // Обработчик изменения ввода
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setUsername(value);

      if (error) {
        setError(validateUsername(value));
      }
    },
    [error, validateUsername]
  );

  // Обработчик отправки формы
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const validationError = validateUsername(username);

      if (!validationError) {
        router.push(`/results?username=${encodeURIComponent(username.trim())}`);
      }
      setError(validationError);
    },
    [username, router, validateUsername]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md"
      role="form"
      aria-label="GitHub username form"
    >
      <div className="flex flex-col space-y-4">
        <Input
          type="text"
          placeholder={FORM_CONFIG.input.placeholder}
          value={username}
          onChange={handleInputChange}
          aria-label={FORM_CONFIG.input.ariaLabel}
          data-testid={FORM_CONFIG.input.testId}
          className="bg-background"
          maxLength={FORM_CONFIG.validation.maxLength}
        />

        {error && (
          <p
            role="alert"
            className="text-sm text-destructive"
            data-testid="error-message"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          aria-label={FORM_CONFIG.button.ariaLabel}
          data-testid={FORM_CONFIG.button.testId}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {FORM_CONFIG.button.text}
        </Button>
      </div>
    </form>
  );
}
