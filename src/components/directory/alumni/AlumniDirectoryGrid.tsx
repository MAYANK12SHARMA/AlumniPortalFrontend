"use client";
import React from "react";
import { AlumniCard } from "./AlumniCard";
import { motion } from "framer-motion";

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

export const AlumniDirectoryGrid = ({ profiles }: { profiles: any[] }) => {
  if (!profiles.length) {
    return (
      <div className="text-sm text-zinc-400 py-16 text-center border rounded-lg border-dashed border-zinc-700">
        No alumni profiles match the current filters.
      </div>
    );
  }
  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="show"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {profiles.map((p, i) => (
        <AlumniCard key={p.id} profile={p} index={i} />
      ))}
    </motion.div>
  );
};
