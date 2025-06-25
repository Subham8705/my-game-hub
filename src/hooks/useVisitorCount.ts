import { useEffect, useState } from "react";
import { Counter } from "counterapi";

const counterClient = new Counter({
  workspace: "gamehub",
  accessToken: "ut_Towy1zXqSmKRIkGf8WcZk6tpvciXXyWjAVpo6Dim", // For dev only
  debug: true,
});

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const alreadyCounted = sessionStorage.getItem("visitor-counted");
    const method = alreadyCounted ? "get" : "up";

    counterClient[method]("gamehubs")
      .then((res) => {
        const value = res?.data?.up_count; // ✅ Correct path
        if (typeof value === "number") {
          setCount(value);
        } else {
          console.warn("⚠ Unexpected counter format:", res);
          setCount(0);
        }

        if (!alreadyCounted) {
          sessionStorage.setItem("visitor-counted", "true");
        }
      })
      .catch((err) => {
        console.error("❌ Visitor count error:", err);
        setCount(0);
      });
  }, []);

  return count;
}
