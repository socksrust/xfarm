import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Row,
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
          marginLeft: "auto",
          marginRight: "auto",
          flexWrap: "wrap",
          maxWidth: isMobile ? "100%" : "1190px",
        }}
      >
        {pools &&
          pools?.map((pool) => (
            <PoolCard
              {...pool}
              onClick={() => {
                setVaultName(pool.name);
              }}
            />
          ))}
      </Row>
      <Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={isModalVisible}
        onClose={() => setModalVisible(false)}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Deposit
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="RAY"
            type="number"
            value={1}
          />
          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="USDC"
            type="number"
            value={1}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button auto>Init user</Button>
          <Button auto>Deposit</Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}
