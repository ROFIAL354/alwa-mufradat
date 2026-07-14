import React from "react";

interface ArabicTextProps {
  text: string;
  isSentence?: boolean;
  className?: string;
}

/**
 * Common component for rendering Arabic text with appropriate fonts, RTL settings, and sizing.
 */
export const ArabicText: React.FC<ArabicTextProps> = ({ text, isSentence = false, className = "" }) => {
  const defaultClasses = isSentence
    ? "font-arabic-sentence text-arabic-sentence leading-[1.8]"
    : "font-arabic-word-lg text-arabic-word-lg leading-[1.5]";

  const hasAlign = className.includes("text-left") || className.includes("text-center") || className.includes("text-right");
  const alignClass = hasAlign ? "" : "text-right";

  return (
    <div
      dir="rtl"
      className={`${alignClass} select-all select-text font-bold ${defaultClasses} ${className}`}
    >
      {text}
    </div>
  );
};

export default ArabicText;
