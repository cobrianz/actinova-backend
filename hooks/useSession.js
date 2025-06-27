import { useEffect, useState } from "react";

export function useSession(onLogout) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId;

    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(data.user);
        resetIdleTimer();
      } catch {
        setUser(null);
        onLogout?.();
      } finally {
        setLoading(false);
      }
    };

    const resetIdleTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert("You have been inactive for 15 minutes. Logging out.");
        onLogout?.();
      }, 15 * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => document.addEventListener(event, resetIdleTimer));

    fetchSession();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) =>
        document.removeEventListener(event, resetIdleTimer)
      );
    };
  }, []);

  return { user, loading };
}
