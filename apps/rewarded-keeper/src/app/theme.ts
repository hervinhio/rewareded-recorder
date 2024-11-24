import { BrandVariants, createDarkTheme, createLightTheme, Theme } from "@fluentui/react-components";
import { GlobalState } from "./data";
import { Android } from "./theme.android";
import { Web } from "./theme.web";

export const determineThemeMode = (state?: GlobalState) => {
  return globalThis.android ? Android.determineThemeMode() : Web.determineThemeMode(state);
}

const rewarded: BrandVariants = { 
  10: "#020206",
  20: "#121629",
  30: "#172349",
  40: "#182F65",
  50: "#163A82",
  60: "#0D46A0",
  70: "#3053A8",
  80: "#4760B0",
  90: "#5B6EB8",
  100: "#6D7CBF",
  110: "#7F8AC7",
  120: "#9099CE",
  130: "#A1A7D6",
  140: "#B2B7DD",
  150: "#C2C6E5",
  160: "#D3D6EC"
};
  
export const lightTheme: Theme = {
    ...createLightTheme(rewarded), 
};

export const darkTheme: Theme = {
    ...createDarkTheme(rewarded), 
};

export let themeMode = determineThemeMode();


darkTheme.colorBrandForeground1 = rewarded[110];
darkTheme.colorBrandForeground2 = rewarded[120];
