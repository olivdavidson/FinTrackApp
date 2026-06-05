import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import {
    StyleSheet,
    Text,
    View
} from "react-native";
import { colors, spacing } from "../../theme";

type Toast = {
  id: string;
  text: string;
  type?: "success" | "error" | "info";
  duration?: number;
};

const ToastContext = createContext<{
  showToast: (text: string, type?: Toast["type"], duration?: number) => void;
} | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (text: string, type: Toast["type"] = "info", duration = 3000) => {
      const id = Math.random().toString(36).slice(2, 9);
      const t: Toast = { id, text, type, duration };
      setToasts((s) => [...s, t]);
      setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== id));
      }, duration + 100);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={styles.container}>
        {toasts.map((t) => (
          <ToastItem key={t.id} text={t.text} type={t.type} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ text: string; type?: Toast["type"] }> = ({
  text,
  type = "info",
}) => {
  const bg =
    type === "success"
      ? colors.accentBg
      : type === "error"
        ? "#ffdddd"
        : colors.card;
  const color =
    type === "success"
      ? colors.accent
      : type === "error"
        ? "#a00"
        : colors.text;
  return (
    <View style={[styles.toast, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 32,
    alignItems: "center",
  },
  toast: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
    marginTop: 8,
    minWidth: "60%",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  text: { fontSize: 13 },
});

export default ToastProvider;
