import React from "react";

export function useLocalStorageState(initialValue, key) {
  const [state, setState] = React.useState(() => {
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
    return initialValue;
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);

  return [state, setState];
}
