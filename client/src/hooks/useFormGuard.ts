import { useEffect, useCallback, useState } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Hook to warn users before navigating away from a form with unsaved changes.
 *
 * Usage:
 *   const { setDirty, confirmNavigation, cancelNavigation, showPrompt } = useFormGuard();
 *   // Call setDirty(true) when form is modified
 *   // Render a confirmation modal when showPrompt is true
 */
export function useFormGuard() {
  const [isDirty, setDirty] = useState(false);

  // Block in-app navigation via React Router
  const blocker = useBlocker(
    useCallback(() => isDirty, [isDirty])
  );

  const showPrompt = blocker.state === "blocked";

  const confirmNavigation = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.proceed?.();
    }
  }, [blocker]);

  const cancelNavigation = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.reset?.();
    }
  }, [blocker]);

  // Block browser-level navigation (tab close, hard refresh)
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return { isDirty, setDirty, showPrompt, confirmNavigation, cancelNavigation };
}
