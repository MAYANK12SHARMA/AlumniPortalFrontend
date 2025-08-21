"use client";
import React from "react";
import { SkillsInput } from "@/components/ui/skills-input";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}
export function TagInput({ value, onChange }: TagInputProps) {
  return (
    <SkillsInput
      label="Tags"
      value={value}
      onChange={(v) => onChange(v.map((t) => t.toLowerCase()))}
      placeholder="Add tag..."
      maxSkills={10}
      suggestions={[
        "tech",
        "career",
        "hackathon",
        "webinar",
        "networking",
        "workshop",
      ]}
    />
  );
}
