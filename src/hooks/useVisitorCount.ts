import { useEffect, useState } from "react";
import { Counter } from "counterapi";

// ✅ Create the Counter client
const counterClient = new Counter({
  workspace: "gamehub",                    // your workspace slug
  accessToken: "ut_Towy1zXqSmKRIkGf8WcZk6tpvciXXyWjAVpo6Dim", // optional, for dev
  debug: false,
  timeout: 5000,
});

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const alreadyCounted = sessionStorage.getItem("visitor-counted");
    const method = alreadyCounted ? "get" : "up";

    counterClient[method]("visito") // ✅ use your new counter slug here
      .then((res) => {
        const value = res?.data?.up_count;
        if (typeof value === "number") {
          setCount(value);
        } else {
          console.warn("⚠ Unexpected response:", res);
          setCount(0);
        }

        if (!alreadyCounted) {
          sessionStorage.setItem("visitor-counted", "true");
        }
      })
      .catch((err) => {
        console.error("❌ Visitor count error:", err.message);
        setCount(0); // fallback if failed
      });
  }, []);

  return count;
}
