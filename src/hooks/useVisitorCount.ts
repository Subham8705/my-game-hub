import { useEffect, useState } from "react";
import countapi from "countapi-js";

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // ✅ use a custom namespace (your domain or app name) and key
    countapi.visits("subham-gamehub.vercel.app", "visits").then((result) => {
      console.log("Visitor count:", result.value);
      setCount(result.value);
    }).catch((error) => {
      console.error("Failed to fetch visitor count:", error);
    });
  }, []);

  return count;
}
