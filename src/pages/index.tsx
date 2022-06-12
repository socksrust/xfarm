import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Row,
  Col,
  Text,
  Button,
  Modal,
  Checkbox,
  Input,
  Spacer,
} from "@nextui-org/react";
import { initSdk } from "src/utils/quarry/initSdk";
import { useWallet } from "@solana/wallet-adapter-react";
import PoolCard from "src/components/PoolCard";
import { fetchVoltLiquidities } from "src/programUtils/helpers";
import { getVaults } from "src/RpcFetch";
import { calc } from "@chakra-ui/react";
import styled from "styled-components";
import { useRouter } from "next/router";

const BannerImage = styled.img``;

export async function getStaticProps() {
  let newVaults: any = [
    {
      name: "SOL-USDC",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      apy: "50%",
      comingSoon: true,
    },
    {
      name: "GST-USDC",
      aTokenImage: "https://www.orca.so/static/media/gst.3f56d90f.png",
      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      apy: "137%",
      comingSoon: true,
    },
    {
      name: "GMT-USDC",
      aTokenImage: "https://www.orca.so/static/media/gmt.770533cf.png",
      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      apy: "101%",
      comingSoon: true,
    },
    {
      name: "mSOL-USDT",
      aTokenImage: "https://www.orca.so/static/media/msol.9d7d818d.png",
      bTokenImage: "https://www.orca.so/static/media/usdt.43f688a0.svg",
      apy: "26%",
      comingSoon: true,
    },
    {
      name: "SOL-USDT",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",

      bTokenImage: "https://www.orca.so/static/media/usdt.43f688a0.svg",
      apy: "33%",
      comingSoon: true,
    },
    {
      name: "USDC-USDT",
      bTokenImage: "https://www.orca.so/static/media/usdt.43f688a0.svg",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      apy: "3%",
      comingSoon: true,
    },
    {
      name: "SHDW-USDC",
      aTokenImage: "https://www.orca.so/static/media/shdw.298c8fb2.png",
      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      apy: "18%",
      comingSoon: true,
    },
    {
      name: "ETH-USDC",
      aTokenImage: "https://www.orca.so/static/media/eth.7c199546.svg",
      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      apy: "11%",
      comingSoon: true,
    },
    {
      name: "SHDW-SOL",
      aTokenImage: "https://www.orca.so/static/media/shdw.298c8fb2.png",
      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      apy: "12%",
      comingSoon: true,
    },
    {
      name: "stSOL-USDC",
      aTokenImage: "https://www.orca.so/static/media/stSOL.9fd59818.png",
      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      apy: "44%",
      comingSoon: true,
    },
  ];

  return {
    props: {
      pools: JSON.parse(JSON.stringify(newVaults)),
    },
    revalidate: 60,
  };
}

export default function Pools({ pools }) {
  const { wallet: will, signTransaction } = useWallet();
  const wallet = will?.adapter;
  const router = useRouter();

  const [vaultName, setVaultName] = useState("RDM.STC.RAY-USDC");
  const [isModalVisible, setModalVisible] = useState(false);
  if (typeof window === "undefined") return <></>;
  const isMobile = window.innerWidth < 790;

  console.log("pools", pools);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      style={{
        width: "100vw",
        marginTop: "100px",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <Spacer y={2} />
      <Row
        justify="space-between"
        style={{
          width: "100%",
          maxWidth: 1190,
          marginLeft: "auto",
          marginRight: "auto",
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        <Col style={{ flex: 1 }}>
          <Text
            size={isMobile ? 60 : 93}
            css={{
              fontFamily: "DM Sans",
              color: "$primaryText",
              fontWeight: "bold",
            }}
          >
            xFARMERS
          </Text>
          <Text
            size={33}
            css={{
              fontFamily: "DM Sans",
              color: "$primaryText",
              fontWeight: "bold",
              marginTop: -25,
            }}
          >
            - A Defi&NFT <span style={{ color: "#07C577" }}>COMPANY</span>
          </Text>
          <Spacer y={1} />
          <Text
            size={16}
            css={{
              fontFamily: "DM Sans",
              color: "#C1CCC7",
              fontWeight: "bold",
            }}
          >
            A collection of 6,000 futuristics Farmers. Join the next generation
            DeFi force task to help us bridge the gap between defi and NFTs.
          </Text>
          <Spacer y={1} />
          <Button
            onClick={() => router.push("/vaults")}
            style={{
              height: 45,
              width: "200px",
              borderRadius: "2rem",
              backgroundColor: "#07C577",
            }}
          >
            Check vaults
          </Button>
        </Col>
        {isMobile ? null : <Spacer x={3} />}
        <Col style={{ flex: 0.8, display: isMobile ? "none" : "block" }}>
          <BannerImage src="/images/circle.png" />
        </Col>
      </Row>
      <Spacer y={8} />

      <Row
        justify="space-between"
        style={{
          width: "100%",
          maxWidth: 1190,
          marginLeft: "auto",
          marginRight: "auto",
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        <Col style={{ flex: 0.8, display: isMobile ? "none" : "block" }}>
          <BannerImage src="/images/pool.png" />
        </Col>
        {isMobile ? null : <Spacer x={3} />}

        <Col style={{ flex: 1 }}>
          <Text
            size={55}
            css={{
              fontFamily: "DM Sans",
              color: "$primaryText",
              fontWeight: "bold",
              lineHeight: 1.2,
              marginTop: 30,
            }}
          >
            YIELD FARMING <span style={{ color: "#07C577" }}>POOLS</span>
          </Text>
          <Spacer y={1} />
          <Text
            size={24}
            css={{
              fontFamily: "DM Sans",
              color: "$primaryText",
              fontWeight: "bold",
            }}
          >
            We will launch an yield farming application integrated into major
            Solana DEX players like: Orca, Raydium, Saber and Atrix. all in the
            same app.
          </Text>
        </Col>
      </Row>
      <Spacer y={8} />
      <Row
        justify="space-between"
        style={{
          width: "100%",
          maxWidth: 1190,
          marginLeft: "auto",
          marginRight: "auto",
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        <Col style={{ flex: 1 }}>
          <Text
            size={55}
            css={{
              fontFamily: "DM Sans",
              color: "$primaryText",
              fontWeight: "bold",
            }}
          >
            HOLDERS BENEFITS
          </Text>
          <Text
            size={30}
            css={{
              fontFamily: "DM Sans",
              color: "$primaryText",
              fontWeight: "bold",
              marginTop: 5,
            }}
          >
            1. Daily <span style={{ color: "#07C577" }}>xGrass</span> token
            airdrop <br />
            2. Exclusive <span style={{ color: "#07C577" }}>xGrass</span> farm
            pool private yield
            <br /> 3. 20% of profits used to buy back{" "}
            <span style={{ color: "#07C577" }}>xGrass</span>
          </Text>
        </Col>
        {isMobile ? null : <Spacer x={3} />}
        <Col style={{ flex: 0.5, display: isMobile ? "none" : "block" }}>
          <BannerImage src="/images/coin-logos.png" />
        </Col>
      </Row>
    </motion.div>
  );
}
