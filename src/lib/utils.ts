type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | Record<string, boolean>
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const push = (val: ClassValue) => {
    if (!val) return;
    if (typeof val === "string" || typeof val === "number") {
      classes.push(String(val));
      return;
    }
    if (Array.isArray(val)) {
      val.forEach(push);
      return;
    }
    if (typeof val === "object") {
      for (const key in val as Record<string, boolean>) {
        if ((val as Record<string, boolean>)[key]) classes.push(key);
      }
    }
  };

  inputs.forEach(push);
  return classes.join(" ");
}
