import React from "react";
import AppNav from "@/components/nashubs/AppNav";
import SingleStageExperience from "@/components/nashubs/SingleStageExperience";

export default function Home() {
  return (
    <div className="h-[100dvh] bg-surface text-ink font-body antialiased overflow-hidden">
      <AppNav />
      <SingleStageExperience />
    </div>
  );
}
