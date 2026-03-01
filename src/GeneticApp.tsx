import React from "react";
import { GeneticPanel } from "./components/GeneticPanel";

export const GeneticApp: React.FC = () => {
  return (
    <div className="flex justify-center">
      <GeneticPanel />
    </div>
  );
};