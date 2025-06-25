import { useEffect, useState } from "react";
import { Counter } from "counterapi";

// Initialize the Counter client with your public workspace slug
const counterClient = new Counter({
  workspace: "gamehub", //workspace slug
  debug: false,
  timeout: 5000
});

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const alreadyCounted = sessionStorage.getItem("visitor-counted");

    const method = alreadyCounted ? "get" : "up";

    counterClient[method]("gamehub") // counter slug is also "gamehub"
      .then((res) => {
        setCount(res.value);
        if (!alreadyCounted) {
          sessionStorage.setItem("visitor-counted", "true");
        }
      })
      .catch((err) => {
        console.error("Visitor count fetch failed:", err.message);
        setCount(3); // fallback
      });
  }, []);

  return count;
}
