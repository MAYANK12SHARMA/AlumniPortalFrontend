"use client";

import React, { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillsInputProps {
  label: string;
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  maxSkills?: number;
  suggestions?: string[];
  className?: string;
  disabled?: boolean;
}

export function SkillsInput({
  label,
  value = [],
  onChange,
  placeholder = "Add a skill...",
  maxSkills = 20,
  suggestions = [],
  className,
  disabled = false,
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions based on input and exclude already selected skills
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  );

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (
      trimmedSkill &&
      !value.includes(trimmedSkill) &&
      value.length < maxSkills
    ) {
      onChange([...value, trimmedSkill]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeSkill(value[value.length - 1]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addSkill(suggestion);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-zinc-200">
        {label}
        {maxSkills && (
          <span className="text-zinc-400 font-normal">
            {" "}
            ({value.length}/{maxSkills})
          </span>
        )}
      </label>

      {/* Selected Skills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 backdrop-blur-sm min-h-[60px]">
          {value.map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="flex items-center gap-1 text-sm py-1.5 px-2.5 hover:bg-zinc-900/60 transition-colors"
            >
              {skill}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 hover:text-amber-300 text-zinc-400 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X size={14} />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Input Field */}
      {!disabled && value.length < maxSkills && (
        <div className="relative">
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              onBlur={() => {
                // Delay hiding suggestions to allow clicking
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSkill(inputValue)}
              disabled={!inputValue.trim()}
              className="shrink-0"
            >
              <Plus size={16} />
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-zinc-950 border border-zinc-800 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredSuggestions.slice(0, 10).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-sm text-zinc-200"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-zinc-500">
        {disabled
          ? "Skills are displayed in view mode"
          : "Type and press Enter or comma to add skills. Click suggestions to add them quickly."}
      </p>

      {/* Max Skills Warning */}
      {value.length >= maxSkills && (
        <p className="text-xs text-amber-400">
          Maximum number of skills reached ({maxSkills})
        </p>
      )}
    </div>
  );
}
