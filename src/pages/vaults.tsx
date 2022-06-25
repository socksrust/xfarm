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
  Switch,
  Loading,
  Progress,
  Dropdown,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { initSdk } from "src/utils/quarry/initSdk";
import { useConnectedWallet, useSolana } from "@saberhq/use-solana";
import PoolCard from "src/components/PoolCard";
import { connection, fetchVoltLiquidities } from "src/programUtils/helpers";
import {
  getVaults,
  newInstructionInitUserVault,
  newInstructionDepositIntoVault,
  newInstructionWithdrawFromVault,
} from "src/RpcFetch";
import { calc } from "@chakra-ui/react";
import {
  TransactionInstruction,
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import Slider from "rc-slider";

const Logo = styled.img`
  width: 40px;
  border-radius: 50%;
`;

export async function getStaticProps() {
  let newVaults: any = [
    {
      name: "SOL-USDC",
      vaultName: "RDM.STC.SOL-USDC-V5",
      cTokenMint: "7GXC6tpUwdbHRd8hhyreKBQsJ5zqvx2JueYydQdxEp3N",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      aTokenDecimals: 9,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      bTokenDecimals: 6,
      apy: 39,
      comingSoon: false,
    },
    {
      name: "RAY-SOL",
      vaultName: "RDM.STC.RAY-SOL-V3",
      cTokenMint: "E3TujPKgiCDyj3XEKtZxKvdyveqU1Z6WhNQufBcT55YP",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
      aTokenDecimals: 6,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      bTokenDecimals: 9,
      apy: 33,
      comingSoon: false,
    },
    {
      name: "RAY-USDC",
      vaultName: "RDM.STC.RAY-USDC-V3",
      cTokenMint: "C7mzEPhnzGCHorjESopDD5BKoHoQuojneVE2SQi24mU1",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
      aTokenDecimals: 6,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      bTokenDecimals: 6,
      apy: 46,
      comingSoon: false,
    },
    {
      name: "RAY-USDT",
      vaultName: "RDM.STC.RAY-USDT-V3",
      cTokenMint: "6qS4xQKwArKPG9xZq7o4G7HsjfpHcLroS8n4oHD6DiqL",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
      aTokenDecimals: 6,

      bTokenImage: "https://www.orca.so/static/media/usdt.43f688a0.svg",
      bTokenDecimals: 6,
      apy: 39,
      comingSoon: false,
    },
    {
      name: "SOL-USDT",
      vaultName: "RDM.STC.SOL-USDT-V5",
      cTokenMint: "7iP3Ex3cmneFtwEyQHgTvr6pZns2wNpdJuTWXqy5zD45",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      aTokenDecimals: 9,

      bTokenImage: "https://www.orca.so/static/media/usdt.43f688a0.svg",
      bTokenDecimals: 6,
      apy: 35,
      comingSoon: false,
    },
    {
      name: "GENE-USDC",
      vaultName: "RDM.STC.GENE-USDC-V5",
      cTokenMint: "5D3R5qn8mwviL36HYBefGwTgkcS865jomn53Aye12D3x",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz/logo.png",
      aTokenDecimals: 9,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      bTokenDecimals: 6,
      apy: 165,
      comingSoon: false,
    },
    {
      name: "RAY-SRM",
      vaultName: "RDM.STC.RAY-SRM-V5",
      cTokenMint: "AecqaerzqzbKwMJjJ6CtrrH6e2RKrkE8HmjQyjHFJM6v",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
      aTokenDecimals: 6,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png",
      bTokenDecimals: 6,
      apy: 16,
      comingSoon: false,
    },
    {
      name: "GENE-RAY",
      vaultName: "RDM.STC.GENE-RAY-V5",
      cTokenMint: "6PWqZ2rxYK4AW5sWCCAHMGJiEGeqEazcjv3AUFoAF4p8",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz/logo.png",
      aTokenDecimals: 9,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
      bTokenDecimals: 6,
      apy: 164,
      comingSoon: false,
    },
    {
      name: "ATLAS-USDC",
      vaultName: "RDM.STC.ATLAS-USDC-V5",
      cTokenMint: "DbiUMveHwhk4AFkxVDAqrkvXRxNMSsULnr2XSkJy6LLc",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx/logo.png",
      aTokenDecimals: 8,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      bTokenDecimals: 6,
      apy: 8,
      comingSoon: false,
    },
    {
      name: "ETH-SOL",
      vaultName: "RDM.STC.ETH-SOL-V5",
      cTokenMint: "82awMfhgLiVNnsauiU3fybxmJZcHTHSLb7rUBbjviCZc",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png",
      aTokenDecimals: 8,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      bTokenDecimals: 9,
      apy: 26,
      comingSoon: false,
    },
    {
      name: "SUSHI-USDC",
      vaultName: "RDM.STC.SUSHI-USDC-V5",
      cTokenMint: "2Gse4mgsT1nkMFa9ws3wGX82s1kMcFdQMEHDCqKVcPRP",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ChVzxWRmrTeSgwd3Ui3UumcN8KX7VK3WaD4KGeSKpypj/logo.png",
      aTokenDecimals: 8,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      bTokenDecimals: 6,
      apy: 34,
      comingSoon: false,
    },
    {
      name: "DFL-USDC",
      vaultName: "RDM.STC.DFL-USDC-V5",
      cTokenMint: "PxrkELa9TAgunbn8zxakHmwEjfWWdv8nXgxqmRAsFLu",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DFL1zNkaGPWm1BqAVqRjCZvHmwTFrEaJtbzJWgseoNJh/logo.png",
      aTokenDecimals: 9,
      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      bTokenDecimals: 6,
      apy: 16,
      comingSoon: false,
    },

    {
      name: "ETH-USDC",
      vaultName: "RDM.STC.ETH-USDC-V5",
      cTokenMint: "836L8EsGTgAU4JLoGNTbAy9qcPpkfJoyq2u2T6KRZnQh",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png",
      aTokenDecimals: 8,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      bTokenDecimals: 6,
      apy: 32,
      comingSoon: false,
    },
    {
      name: "stSOL-USDC",
      vaultName: "RDM.STC.STSOL-USDC-V5",
      cTokenMint: "39HMrpuentqSNUWbcpiDzbzf7WvBwjmbPePvPbdZ21sy",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png",
      aTokenDecimals: 9,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
      bTokenDecimals: 6,
      apy: 51,
      comingSoon: false,
    },
    {
      name: "POLIS-RAY",
      vaultName: "RDM.STC.POLIS-RAY-V5",
      cTokenMint: "65Qh3z2n1Ma6E1vyKauVDinm1fus9q3zxPaUgTy5SpaF",
      aTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk/logo.png",
      aTokenDecimals: 8,

      bTokenImage:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
      bTokenDecimals: 6,
      apy: 19,
      comingSoon: false,
    },
  ];
  const prices = {
    DFL: 0,
    SUSHI: 0,
    stSOL: 0,
    ETH: 0,
    POLIS: 0,
    SOL: 0,
    RAY: 0,
    GENE: 0,
    SRM: 0,
    ATLAS: 0,
    USDC: 1,
    USDT: 1,
  };

  for (let key of Object.keys(prices)) {
    const priceData = (
      await (
        await fetch(`https://price.jup.ag/v1/price?id=${key}&vsToken=${"USDC"}`)
      ).json()
    )?.data?.price;
    prices[key] = priceData;
  }

  let i = 0;
  for (let vault of newVaults) {
    if (vault.comingSoon || !vault.cTokenMint) {
      break;
    }
    const data = await (
      await fetch(
        `https://farm-rpc.herokuapp.com/api/v1/vault_info?vault_name=${vault.vaultName}`
      )
    ).json();
    const tokenASymbol = vault?.name.split("-")[0];
    const tokenBSymbol = vault?.name.split("-")[1];

    const aTokenBalance = data.tokens_a_added - data.tokens_a_removed;
    const bTokenBalance = data.tokens_b_added - data.tokens_b_removed;

    const tvl =
      (aTokenBalance / 10 ** vault.aTokenDecimals) * prices[tokenASymbol] +
      (bTokenBalance / 10 ** vault.bTokenDecimals) * prices[tokenBSymbol];

    const totalLiquidity = Number(
      (await connection.getTokenSupply(new PublicKey(vault.cTokenMint)))?.value
        ?.amount || 0
    );
    const aTokenBalancePerCToken = aTokenBalance / totalLiquidity;
    const bTokenBalancePerCToken = bTokenBalance / totalLiquidity;

    const priceData = (
      await (
        await fetch(
          `https://price.jup.ag/v1/price?id=${tokenASymbol}&vsToken=${tokenBSymbol}`
        )
      ).json()
    ).data;

    newVaults[i] = {
      ...vault,
      tvl,
      aTokenBalancePerCToken,
      bTokenBalancePerCToken,
      price: priceData.price,
    };
    i++;
  }

  return {
    props: {
      pools: JSON.parse(JSON.stringify(newVaults)),
    },
    revalidate: 60,
  };
}

export default function Vaults({ pools: pls }) {
  const wallet = useConnectedWallet();
  const [isDepositLoading, setDepositLoading] = React.useState(false);
  const [sliderValue, setSliderValue] = useState(100);
  const [pools, setPools] = useState(pls);
  const [tokenA, setTokenA] = useState();
  const [tokenB, setTokenB] = useState();
  const [isDeposit, setIsDeposit] = useState(true);
  const [vault, setVault] = useState<any>();
  const [balance, setBalance] = useState<number>(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentTransaction, setCurrentTransaction] = useState(1);
  const [operationError, setOperationError] = useState("");
  const [sortBy, setSortBy] = useState("Sort by");
  const [searchText, setSearchText] = useState("");
  const [showStaked, setShowStaked] = useState(false);

  if (typeof window === "undefined") return <></>;
  const isMobile = window.innerWidth < 790;

  useEffect(() => {
    const filterPoolsByStaked = async (pools) => {
      const walletTokens = await connection.getParsedTokenAccountsByOwner(
        wallet?.publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );

      let filteredPools: any = [];
      for (const pool of pools) {
        const poolTokenAccount = walletTokens.value.find(
          (wt) => wt.account.data.parsed.info.mint === pool.cTokenMint
        );
        if (poolTokenAccount) {
          filteredPools = [...filteredPools, pool];
        }
      }
      setPools(filteredPools);
    };

    const filterPoolsByTokenName = (pools) => {
      let filteredPools: any = [];
      for (const pool of pools) {
        if (pool.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
          filteredPools = [...filteredPools, pool];
        }
      }
      return filteredPools;
    };

    const sortPoolsByTvl = (pools) => {
      const sortedPools = [...pools];

      return sortedPools.sort(function (a, b) {
        return parseFloat(b.tvl) - parseFloat(a.tvl);
      });
    };

    const sortPoolsByApy = (pools) => {
      const sortedPools = [...pools];
      return sortedPools.sort(function (a, b) {
        return parseFloat(b.apy) - parseFloat(a.apy);
      });
    };

    let finalFilteredPools = pls;

    if (searchText) {
      finalFilteredPools = filterPoolsByTokenName(finalFilteredPools);
    }
    if (sortBy === "TVL") {
      finalFilteredPools = sortPoolsByTvl(finalFilteredPools);
    }
    if (sortBy === "APY") {
      finalFilteredPools = sortPoolsByApy(finalFilteredPools);
    }
    if (showStaked) {
      filterPoolsByStaked(finalFilteredPools);
    } else {
      setPools(finalFilteredPools);
    }
  }, [searchText, sortBy, showStaked]);
  console.log("showStaked", showStaked);
  useEffect(() => {
    const fetchUserCTokenBalance = async () => {
      try {
        const walletTokens = await connection.getParsedTokenAccountsByOwner(
          wallet?.publicKey,
          {
            programId: TOKEN_PROGRAM_ID,
          }
        );

        const poolTokenAccount = walletTokens.value.find(
          (wt) => wt.account.data.parsed.info.mint === vault.cTokenMint
        );

        const balance = Number(
          (await connection.getTokenAccountBalance(poolTokenAccount?.pubkey!))
            ?.value?.amount || 0
        );
        console.log("balance", balance);

        setBalance(balance);
      } catch (e) {
        setBalance(0);
      }
    };

    if (wallet?.publicKey && vault) {
      fetchUserCTokenBalance();
    }
  }, [wallet?.publicKey, vault]);

  const deposit = async () => {
    if (
      !wallet?.publicKey ||
      !wallet?.signTransaction ||
      !wallet?.signAllTransactions ||
      !vault
    ) {
      return;
    }

    setModalVisible(false);
    setInfoModalVisible(true);
    setDepositLoading(true);

    const json_data = (
      await newInstructionDepositIntoVault({
        depositorWalletAddress: wallet?.publicKey?.toString(),
        vaultName: vault?.vaultName,
        maxTokenA: tokenA,
      })
    ).data;
    setTotalTransactions(json_data.length);

    const instructions: TransactionInstruction[] = [];
    for (let data of json_data) {
      let transaction = new Transaction({
        recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
        feePayer: wallet.publicKey,
      });
      const accounts: any = [];

      data.accounts.forEach(function (item, index) {
        let acc = {
          isSigner: item.is_signer ? true : false,
          isWritable: item.is_writable ? true : false,
          pubkey: new PublicKey(item.pubkey),
        };
        accounts.push(acc);
      });
      const instruction = new TransactionInstruction({
        programId: new PublicKey(data.program_id),
        data: data.data,
        keys: accounts,
      });
      instructions.push(instruction);
    }

    const tx_size = 1;

    const transactions: Transaction[] = [];
    for (let i = 0; i < instructions.length; i += tx_size) {
      const chunk = instructions.slice(i, i + tx_size);
      const transaction = new Transaction().add(...chunk);

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      transactions.push(transaction);
    }
    const signedTXs = await wallet?.signAllTransactions(transactions);

    for (const [index, signedTX] of signedTXs.entries()) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const buf = signedTX.serialize();
        setCurrentTransaction(index + 1);

        const id = await connection.sendRawTransaction(buf, {
          skipPreflight: true,
        });
        console.log("Confirming tx...");
        await connection.confirmTransaction(id, "processed");
        console.log("confirmed");
        console.log("");
        console.log("");
        console.log("=====================");
      } catch (e) {
        setDepositLoading(false);
        setOperationError("deposit");
        return;
      }
    }
    toast.success("Deposit successful!");
    setOperationError("");
    setCurrentTransaction(0);
    setInfoModalVisible(false);
    setDepositLoading(false);
  };

  const withdraw = async () => {
    if (
      !wallet?.publicKey ||
      !wallet?.signTransaction ||
      !wallet?.signAllTransactions ||
      !vault
    ) {
      return;
    }

    setModalVisible(false);
    setInfoModalVisible(true);
    setDepositLoading(true);

    const json_data = (
      await newInstructionWithdrawFromVault({
        depositorWalletAddress: wallet?.publicKey?.toString(),
        vaultName: vault?.vaultName,
        maxToken: ((sliderValue / 100) * balance) / 10 ** 9,
      })
    ).data;
    setTotalTransactions(json_data.length);
    console.log("json_data", json_data);

    const instructions: TransactionInstruction[] = [];
    for (let data of json_data) {
      let transaction = new Transaction({
        recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
        feePayer: wallet.publicKey,
      });
      const accounts: any = [];

      data.accounts.forEach(function (item, index) {
        let acc = {
          isSigner: item.is_signer ? true : false,
          isWritable: item.is_writable ? true : false,
          pubkey: new PublicKey(item.pubkey),
        };
        accounts.push(acc);
      });
      const instruction = new TransactionInstruction({
        programId: new PublicKey(data.program_id),
        data: data.data,
        keys: accounts,
      });
      instructions.push(instruction);
    }

    const tx_size = 1;

    const transactions: Transaction[] = [];
    for (let i = 0; i < instructions.length; i += tx_size) {
      const chunk = instructions.slice(i, i + tx_size);
      const transaction = new Transaction().add(...chunk);

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      transactions.push(transaction);
    }
    const signedTXs = await wallet?.signAllTransactions(transactions);

    for (const [index, signedTX] of signedTXs.entries()) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const buf = signedTX.serialize();
        setCurrentTransaction(index + 1);

        const id = await connection.sendRawTransaction(buf, {
          skipPreflight: true,
        });
        await connection.confirmTransaction(id, "processed");
      } catch (e) {
        setDepositLoading(false);
        setOperationError("withdraw");
        return;
      }
    }
    toast.success("Withdraw successful!");
    setOperationError("");
    setCurrentTransaction(0);
    setInfoModalVisible(false);
    setDepositLoading(false);
  };

  console.log("up balance ->", balance);

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
        justify="flex-end"
        align="center"
        style={{
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          flexWrap: "wrap",
          maxWidth: isMobile ? "100%" : "1150px",
          backgroundColor: "rgba(255,255,255,0.8)",
          borderRadius: "0.5rem",
          padding: 10,
        }}
      >
        <Text
          size={16}
          b
          color="$primaryBackground"
          margin={0}
          style={{ margin: 0 }}
        >
          Show staked
        </Text>
        <Spacer x={0.4} />
        <Switch
          checked={showStaked}
          onChange={(e) => wallet && setShowStaked(!showStaked)}
          size="lg"
          disabled={!wallet}
        />

        <Spacer x={1} />
        <Dropdown>
          <Dropdown.Button style={{ backgroundColor: "#15181A" }}>
            {sortBy}
          </Dropdown.Button>
          <Dropdown.Menu
            variant="light"
            aria-label="Actions"
            onAction={setSortBy}
          >
            <Dropdown.Item key="TVL">TVL</Dropdown.Item>
            <Dropdown.Item key="APY">APY</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Spacer x={1} />

        <Input
          placeholder="Search by token name..."
          type="search"
          width="200px"
          clearable
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Row>
      <Spacer y={1} />
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
              balance={balance}
              onClick={() => {
                setModalVisible(true);
                setVault(pool);
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
          <Row justify="center">
            <Button.Group color="gradient" size="lg">
              <Button ghost={!isDeposit} onClick={() => setIsDeposit(true)}>
                Deposit
              </Button>
              <Button ghost={isDeposit} onClick={() => setIsDeposit(false)}>
                Withdraw
              </Button>
            </Button.Group>
          </Row>
        </Modal.Header>
        {isDeposit ? (
          <Modal.Body>
            <Spacer y={0.5} />
            <Row align="center">
              <Input
                clearable
                bordered
                fullWidth
                color="primary"
                size="xl"
                placeholder={vault?.name.split("-")[0]}
                type="number"
                value={tokenA?.toFixed(2) || 0}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  const priceNum = Number(vault.price);
                  setTokenA(value);
                  setTokenB(priceNum * value);
                }}
              />
              <Spacer x={0.5} />
              <Logo src={vault?.aTokenImage} />
            </Row>
            <Spacer y={0.3} />
            <Row align="center">
              <Input
                clearable
                bordered
                fullWidth
                color="primary"
                size="xl"
                placeholder={vault?.name.split("-")[1]}
                type="number"
                value={tokenB}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setTokenB(value);
                  setTokenA(value / vault.price);
                }}
              />
              <Spacer x={0.5} />
              <Logo src={vault?.bTokenImage} />
            </Row>
            <Spacer y={0.5} />
          </Modal.Body>
        ) : (
          <Modal.Body>
            <Text size={16} b>
              You will receive:
            </Text>
            <Spacer y={0.1} />
            <Row align="center">
              <Input
                clearable
                bordered
                fullWidth
                color="primary"
                size="xl"
                placeholder={vault?.name.split("-")[0]}
                type="number"
                disabled
                value={(
                  ((sliderValue / 100) *
                    balance *
                    vault?.aTokenBalancePerCToken) /
                  10 ** vault.aTokenDecimals
                ).toFixed(4)}
              />
              <Spacer x={0.5} />
              <Logo src={vault?.aTokenImage} />
            </Row>
            <Row align="center">
              <Input
                clearable
                bordered
                fullWidth
                color="primary"
                size="xl"
                placeholder={vault?.name.split("-")[1]}
                type="number"
                disabled
                value={(
                  ((sliderValue / 100) *
                    balance *
                    vault?.bTokenBalancePerCToken) /
                  10 ** vault?.bTokenDecimals
                ).toFixed(4)}
              />
              <Spacer x={0.5} />
              <Logo src={vault?.bTokenImage} />
            </Row>

            <Spacer y={0.5} />
            <Text size={16} b>
              Pick withdraw percentage:
            </Text>
            <Spacer y={0.1} />
            <Slider value={sliderValue} onChange={setSliderValue} />
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button
            auto
            onClick={isDeposit ? deposit : withdraw}
            style={{
              height: 45,
              width: "100%",
              borderRadius: "2rem",
            }}
          >
            {isDepositLoading ? (
              <Loading type="points-opacity" color="currentColor" size="sm" />
            ) : (
              <Text size={16} css={{ color: "#fff", fontWeight: "700" }}>
                {isDeposit ? `Deposit` : `Withdraw ${sliderValue}%`}
              </Text>
            )}
          </Button>
          <Spacer y={0.5} />
        </Modal.Footer>
      </Modal>
      <Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={isInfoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      >
        <Modal.Body>
          <Text size={16} b>
            Sending transactions {currentTransaction}/{totalTransactions}
          </Text>
          <Progress
            value={(currentTransaction / totalTransactions) * 100}
            color="success"
          />
        </Modal.Body>
        <Modal.Footer>
          {operationError && (
            <Row justify="flex-start">
              <Text size={16} b color="error">
                Transaction fail, retry:
              </Text>
            </Row>
          )}
          <Button
            auto
            onClick={operationError === "deposit" ? deposit : withdraw}
            disabled={
              operationError !== "deposit" && operationError !== "withdraw"
            }
            style={{
              height: 45,
              width: "100%",
              borderRadius: "2rem",
            }}
          >
            {isDepositLoading ? (
              <Loading type="points-opacity" color="currentColor" size="sm" />
            ) : (
              <Text size={16} css={{ color: "#fff", fontWeight: "700" }}>
                {operationError === "deposit"
                  ? `Finish deposit`
                  : `Finish withdraw`}
              </Text>
            )}
          </Button>
          <Spacer y={0.5} />
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}
