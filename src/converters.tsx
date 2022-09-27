import React from "react";

/**
 * JSX converter
 */
export function jsxConverter(translation: string, placeholders: any) {
  const expression = `(${Object.keys(placeholders)
    .map((key) => (key.startsWith(":") ? key : ":" + key))
    .join("|")})`;

  const regex = new RegExp(expression, "g");

  return translation
    .split(regex)
    .filter((item) => item !== undefined)
    .map((part) => {
      if (part.startsWith(":")) {
        part = part.substring(1);
      }

      return (
        <React.Fragment key={part}>
          ${placeholders[part] || part}
        </React.Fragment>
      );
    });
}
