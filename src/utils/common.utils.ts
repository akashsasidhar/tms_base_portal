export const generateUsername = (first?: string, last?: string) => {
    if (!first && !last) return "";
  
    const base = [first, last]
      .filter(Boolean)
      .join(".")
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "");
  
    return base;
  };
