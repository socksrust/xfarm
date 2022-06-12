import React from "react";
import styled from "styled-components";
import { Row, Col, Spacer, Text, Progress } from "@nextui-org/react";
import { useRouter } from "next/router";

const CSWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  margin: 7px 7px 0px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 10px;
  opacity: 1;
  border-radius: 2rem;
  border: 1px solid black;
`;

function ComingSoonBadge() {
  return (
    <CSWrapper>
      <Text
        size={12}
        css={{
          color: "#000",
          fontWeight: "bold",
          lineHeight: 1,
          textAlign: "center",
          margin: 0,
        }}
      >
        Coming Soon
      </Text>
    </CSWrapper>
  );
}

const LogoImage = styled.img`
  width: 60px;
  height: 60px;

  border-radius: 50%;
  z-index: 3;
`;

const LogoImage2 = styled.img`
  width: 25px;
  border-radius: 50%;
  z-index: 2;
  background: #111728;
`;

interface Props {
  comingSoon?: boolean;
}

const Card = styled.div<Props>`
  padding: 20px;
  display: flex;
  height: fit-content;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background: white;
  box-shadow: ${(props) => props.theme.cardBoxShadow};
  border-radius: 0.3rem;
  cursor: pointer;

  ${(p) =>
    p.comingSoon
      ? `
      border: 5px solid ${p.theme.stroke};
      &:hover {
        background-color: ${p.theme.secondaryBackground};
        cursor: default;
      }
  `
      : `
  `}
`;

const OutWrapper = styled(Col)<Props>`
  ${(p) =>
    !p.comingSoon
      ? `
    border-radius: 0.3rem;
    border: 5px solid ${p.theme.stroke};
    &:hover {
      margin-top: 15px !important;
    }
  `
      : `
          opacity: 0.7;


  `}

  transition: all 0.1s ease-in;
`;

export default function PoolCard({
  id,
  name,
  aTokenImage,
  bTokenImage,
  comingSoon,
  totalLiquidity,
  apy,
  decimals,
  poolAddress,
  goalToStart,
  hasBorder,
  onClick,
}) {
  const router = useRouter();
  if (typeof window === "undefined") return <></>;
  const tokenName = name.split(".")[2];
  return (
    <OutWrapper
      style={{
        maxWidth: "340px",
        margin: 20,
        position: "relative",
      }}
      onClick={onClick}
      className={hasBorder ? "container demo animated" : ""}
      comingSoon={comingSoon}
    >
      {comingSoon && <ComingSoonBadge />}
      <Card comingSoon={comingSoon} className={hasBorder ? "dCard" : ""}>
        <Row align="flex-end" style={{ zIndex: 4, marginTop: 5 }}>
          <LogoImage src={aTokenImage} />
          <LogoImage
            src={bTokenImage}
            style={{ zIndex: 9, marginLeft: "-20px" }}
          />
          <Spacer x={0.8} />
          <Text size={32} css={{ color: "$outText", fontWeight: "bold" }}>
            {name}
          </Text>
        </Row>
        {!comingSoon && goalToStart && (
          <>
            <Spacer y={1.5} />
            <Text
              size={16}
              css={{
                fontFamily: "DM Sans",
                color: "$secondaryText",
                fontWeight: "bold",
              }}
            >
              GOAL TO START:{" "}
              {Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 0,
              }).format(goalToStart)}{" "}
              {name}
            </Text>
            <Row align="flex-end" style={{ marginTop: "10px", zIndex: 4 }}>
              <Progress
                value={(totalLiquidity / 10 ** decimals / goalToStart) * 100}
                size="sm"
                shadow
                color="success"
                status="success"
              />
            </Row>
          </>
        )}
        <Spacer y={1.5} />
        <Row>
          <Col>
            <Text
              size={16}
              css={{
                fontFamily: "DM Sans",
                color: "$secondaryText",
                fontWeight: "bold",
              }}
            >
              APY:
            </Text>
            <Text size={32} css={{ color: "$outText", fontWeight: "bold" }}>
              {apy}
            </Text>
          </Col>
          <Col>
            <Text
              size={16}
              css={{
                fontFamily: "DM Sans",
                color: "$secondaryText",
                fontWeight: "bold",
              }}
            >
              TVL({name}):
            </Text>
            <Text size={32} css={{ color: "$outText", fontWeight: "bold" }}>
              {Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 2,
              }).format(0)}
            </Text>
          </Col>
        </Row>
        <Spacer y={1.5} />
        <Row
          align="flex-end"
          justify="flex-end"
          style={{ marginTop: "5px", zIndex: 4, opacity: 0.6 }}
        >
          <LogoImage2
            src={
              "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png"
            }
          />
          <Spacer x={0.5} />
          <Text
            size={26}
            css={{ color: "$outText", fontWeight: "bold", lineHeight: 1 }}
          >
            Orca
          </Text>
        </Row>
      </Card>
    </OutWrapper>
  );
}
