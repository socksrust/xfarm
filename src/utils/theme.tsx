import { createTheme } from "@nextui-org/react";

// Define what main theme will look like
export const darkTheme = {
  primaryBackground: "#EDF2FB",
  secondaryBackground: "#000",
  primaryText: "#000",
  secondaryText: "#000",
  outText: "#000",
  cardBoxShadow: "",
  accent: "#74F8B7",
};

export const nextDarkTheme = createTheme({
  type: "dark",
  theme: {
    colors: {
      ...darkTheme,
    },
    space: {},
    fonts: {},
  },
});

// Define what main theme will look like
export const lightTheme = {
  primaryBackground: "#fff",
  secondaryBackground: "#fff",
  primaryText: "#111728",
  secondaryText: "#182030",
  outText: "#fff",

  cardBoxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 50px",
  accent: "#EE2276",
};

export const nextLightTheme = createTheme({
  type: "light",
  theme: {
    colors: {
      ...lightTheme,
    },
    space: {},
    fonts: {},
  },
});
