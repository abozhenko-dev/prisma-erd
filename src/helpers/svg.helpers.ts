export const fixSVGZIndex = (element?: Element | null) => {
  if (!element) {
    return;
  }

  const svg = element.closest("svg");
  svg?.appendChild(element);
};
