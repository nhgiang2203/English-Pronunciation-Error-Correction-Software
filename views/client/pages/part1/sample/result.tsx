import ReactDOM from "react-dom/client";
import React, { useEffect, useState } from "react";

type ScoreProps = {
  targetId: string;
};

const ScoreDisplay = ({ targetId }: ScoreProps) => {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const listener = (e: CustomEvent) => {
      if (e.detail.targetId === targetId) {
        setScore(e.detail.score);
      }
    };

    window.addEventListener("scoreUpdate", listener as EventListener);

    return () => {
      window.removeEventListener("scoreUpdate", listener as EventListener);
    };
  }, [targetId]);

  if (score === null) return null;

  return <span>Điểm phát âm: {score}</span>;
};

export function mountScoreDisplay(targetId: string) {
  const container = document.getElementById(targetId);
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<ScoreDisplay targetId={targetId} />);
  }
}
