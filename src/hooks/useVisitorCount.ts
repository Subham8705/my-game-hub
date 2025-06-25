import { useEffect, useState } from "react";
import { Counter } from "counterapi";

const counterClient = new Counter({
  workspace: "gamehub",
  debug: false,
  timeout: 5000,
});

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const alreadyCounted = sessionStorage.getItem("visitor-counted");
    const method = alreadyCounted ? "get" : "up";

    counterClient[method]("gamehub")
      .then((res) => {
        setCount(res.value); // value must be a number
        if (!alreadyCounted) {
          sessionStorage.setItem("visitor-counted", "true");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch counter:", err);
        setCount(0); // fallback to 0, not null
      });
  }, []);

  return count;
}
