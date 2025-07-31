export const getDisableStyle = (isDisabled) => ({
    pointerEvents: isDisabled ? "none" : "auto",
    opacity: isDisabled ? 0.5 : 1,
    // cursor: isDisabled ? "no-drop" : "auto",
  });