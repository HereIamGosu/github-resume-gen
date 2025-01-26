// use-toast.ts
"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

// 1. Конфигурация и константы ============================================
const TOAST_CONFIG = {
  limit: 1,
  removeDelay: 1_000_000,
  maxSafeId: Number.MAX_SAFE_INTEGER,
} as const;

// 2. Типизация ==========================================================
type ToastActionType = "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastState = {
  toasts: ToasterToast[];
};

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

// 3. Вспомогательные функции ============================================
const generateToastId = (() => {
  let count = 0;
  return () => (count = (count + 1) % TOAST_CONFIG.maxSafeId).toString();
})();

// 4. Глобальное состояние ===============================================
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const stateListeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

// 5. Логика обработки состояний =========================================
const handleToastRemoval = (toastId: string) => {
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_CONFIG.removeDelay);

  toastTimeouts.set(toastId, timeout);
};

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_CONFIG.limit),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(t => 
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      action.toastId 
        ? handleToastRemoval(action.toastId)
        : state.toasts.forEach(t => handleToastRemoval(t.id));

      return {
        ...state,
        toasts: state.toasts.map(t => ({
          ...t,
          open: t.id === action.toastId ? false : t.open,
        })),
      };
    }

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: action.toastId 
          ? state.toasts.filter(t => t.id !== action.toastId)
          : [],
      };

    default:
      return state;
  }
};

// 6. Система диспетчеризации ============================================
const dispatch = (action: ToastAction) => {
  memoryState = toastReducer(memoryState, action);
  stateListeners.forEach(listener => listener(memoryState));
};

// 7. Публичный API ======================================================
export const toast = (props: Omit<ToasterToast, "id">) => {
  const id = generateToastId();

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => !open && dispatch({ type: "DISMISS_TOAST", toastId: id }),
    },
  });

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    update: (updatedProps: Partial<ToasterToast>) => 
      dispatch({ type: "UPDATE_TOAST", toast: { ...updatedProps, id } }),
  };
};

export const useToast = () => {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    stateListeners.push(setState);
    return () => {
      const index = stateListeners.indexOf(setState);
      if (index > -1) stateListeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
};