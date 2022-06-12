import { useContext } from "react";

import { ThemeContext } from "styled-components";
import { StackProps } from "@chakra-ui/react";

import Header from "./header";
import Footer from "./footer";
import styled from "@emotion/styled";

const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  margin-top: -80px;
  margin-left: -80px;
  z-index: 0;
  width: 200px;
  filter: blur(150px);
`;

const BackgroundWrapper = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(12, 26, 17, 0.7);
  backdrop-filter: blur(250px);
  z-index: 2;
`;

const OutWrapper = styled.div`
  min-height: 100vh;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 100%;
  padding: 0px;
  z-index: 999;
  @media only screen and (max-width: 800px) {
    width: 100vw;
    padding: 0px;
  }
`;

export const Layout = ({ children, style, ...props }: StackProps) => {
  const theme = useContext(ThemeContext);
  if (typeof window === "undefined") return null;

  return (
    <OutWrapper
      style={{
        ...style,
        backgroundColor: theme.primaryBackground,
      }}
    >
      <Header />
      <BackgroundImage src="/images/ellipse.png" />

      <Wrapper {...props}>{children}</Wrapper>
    </OutWrapper>
  );
};
