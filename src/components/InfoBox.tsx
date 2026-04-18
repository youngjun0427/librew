import React from "react";

type Props = {
  children: React.ReactNode;
};

export function InfoBox({ children }: Props) {
  return (
    <div className="mb-4 rounded-xl bg-blue-500/10 p-4 text-sm text-blue-400">
      <ul className="list-inside list-disc space-y-1">
        {React.Children.map(children, (child, index) => (
          <li key={index}>{child}</li>
        ))}
      </ul>
    </div>
  );
}
