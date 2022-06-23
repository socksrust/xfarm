import React from "react";
import { useRouter } from "next/router";
import { Flex } from "@chakra-ui/layout";
import styled from "styled-components";
import { Link, Text, Row, Spacer, Switch } from "@nextui-org/react";
import { ConnectWallet } from "./button/connectWallet";
import useDarkMode from "use-dark-mode";
import { SunIcon } from "../utils/icons/SunIcon";
import { MoonIcon } from "../utils/icons/MoonIcon";

const Logo = styled.img`
  height: 70px;
`;

const Header = () => {
  const { push } = useRouter();
  const darkMode = useDarkMode(false);
  if (typeof window === undefined) {
    return <div></div>;
  }

  const { pathname } = window?.location;
  const color1 = pathname === "/swap" ? "$primaryText" : "$secondaryText";
  const color3 = pathname === "/" ? "$primaryText" : "$secondaryText";
  const color4 = pathname === "/partners" ? "$primaryText" : "$secondaryText";
  const isMobile = window.innerWidth < 600;

  return (
    <Flex
      p={isMobile ? "5px" : "20px"}
      alignItems="center"
      justifyContent="center"
      direction="row"
      style={{
        zIndex: 900,
        top: 0,
        left: 0,
        right: 0,
        transition: "0.1s",
        position: "absolute",
        borderBottomColor: "$secondaryText",
      }}
    >
      <Flex
        direction={isMobile ? "column" : "row"}
        justifyContent="space-between"
        w="100%"
        alignItems="center"
        style={{ zIndex: 9 }}
      >
        <Row
          justify={isMobile ? "flex-end" : "flex-start"}
          align="center"
          style={isMobile ? { paddingTop: 20, paddingBottom: 20 } : {}}
        >
          <Link href="/">
            <Spacer x={1.5} />

            <Logo src="https://convertri.imgix.net/bbe1dbed-a533-11ec-9d37-069352721395/ac8f90e4fa4b49c08a70526d875a59a81a208099/Laraib%20-%20Symmetrical.png?auto=compress,format&dpr=2&fit=scale&w=138&h=107" />
          </Link>
        </Row>

        <ConnectWallet />
      </Flex>
    </Flex>
  );
};

export default Header;
