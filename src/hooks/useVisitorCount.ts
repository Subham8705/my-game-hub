import { useEffect, useState } from "react";
import { Counter } from "counterapi";

// Create a Counter client using your workspace slug
const counterClient = new Counter({
  workspace: "gamehub", // Replace this with your actual workspace slug
  debug: false,                 // Optional: set to true if you want console logs
  timeout: 5000                 // Optional: timeout in ms
  // accessToken: "your-token", // Optional: if your workspace requires authentication
});

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Increment the counter named "visits"
    counterClient.up("visits")
      .then((res) => {
        setCount(res.value); // res.value is the current count
      })
      .catch((err) => {
        console.error("Error fetching/updating visitor count:", err.message);
        setCount(3); // fallback if request fails
      });
  }, []);

  return count;
}
