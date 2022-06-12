import React, { useEffect, useContext } from "react";
import styled from "styled-components";
import { Row, Col, Spacer, Text, Button, Loading } from "@nextui-org/react";
import { motion } from "framer-motion";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
} from "@solana/web3.js";
import { connection } from "src/programUtils/helpers";
import { notify } from "../../stores/utils/notifications";
import { WalletContext } from "@solana/wallet-adapter-react";
import BN from "bn.js";
import {
  fetchVoltLiquidities,
  updateDB,
  getProgram,
} from "src/programUtils/helpers";
import {
  getCurrentUser,
  getTokenMint,
  getTotalLiquidity,
} from "src/programUtils/usdcVaultHelpers";
import * as poolInstructions from "src/programUtils/pool/instructions";
import { Vault } from "src/programUtils/vault/classes";
import * as spl from "@solana/spl-token";
import { getVaultByRef } from "../../RpcFetch";

const LogoImage = styled.img`
  width: 80px;
  border-radius: 50%;
  z-index: 3;
`;

const SmallLogoImage = styled.img`
  width: 40px;
  border-radius: 50%;
  z-index: 3;
`;

const Input = styled.input`
  width: 300px;
  background-color: transparent;
  text-align: right;
  font-size: 30px;
  color: ${(p) => (p.disabled ? p.theme.secondaryText : p.theme.primaryText)};
  font-weight: 600;
  border-radius: 4px;
`;

const Card = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: ${(props) => props.theme.secondaryBackground};
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
  border-radius: 0.5rem;
  box-shadow: ${(props) => props.theme.cardBoxShadow};
`;

export async function getStaticPaths() {
  const pools = ["7CGU96gaoNes3ZCNptD3BNtC7mhkQXD7TEcP1RJe3Rgc"];
  let params;
  pools.map((p) => {
    params = {
      ...params,
      id: p,
    };
  });

  return {
    paths: [{ params }],
    fallback: true,
  };
}

export async function getStaticProps({ params: { id } }) {
  let pool = await getVaultByRef({ ref: id });

  return {
    props: {
      poolInfo: JSON.parse(JSON.stringify(pool)),
    },
    revalidate: 60,
  };
}

export default function PoolPage({ poolInfo }) {
  const [isDeposit, setIsDeposit] = React.useState(true);
  const [isDepositLoading, setDepositLoading] = React.useState(false);
  const [yourLiquidity, setYourLiquidity] = React.useState(0);
  const [totalLiquidity, setTotalLiquidity] = React.useState(
    poolInfo?.totalLiquidity
  );
  const [apy, setApy] = React.useState();
  const [hasCTokenAccount, setHasCTokenAccount] = React.useState(true);

  const [baseDepositAmmount, setBaseDepositAmmount] = React.useState(0);

  const { wallet: will, sendTransaction } = useContext(WalletContext);
  const wallet = will?.adapter;
  console.log("poolInfo", poolInfo);
  if (typeof window === "undefined") return <></>;

  const isMobile = window.innerWidth < 1140;

  const fetchData = async () => {
    /*const apy = await getApy({
      adapter: wallet,
    });
    setApy(apy);*/

    const { yourLiquidity, totalLiquidity } = await fetchVoltLiquidities({
      wallet: will?.adapter,
      cMint: poolInfo?.cMint,
    });
    setYourLiquidity(yourLiquidity);
    setTotalLiquidity(totalLiquidity);
  };

  useEffect(() => {
    setDepositLoading(true);
    poolInfo && will?.adapter?.publicKey && fetchData();
    setDepositLoading(false);
  }, [poolInfo, will?.adapter?.publicKey]);

  const deposit = async () => {
    setDepositLoading(true);

    try {
      const program = await getProgram({ adapter: will?.adapter });

      const user = await getCurrentUser({
        mint: poolInfo?.mint,
        publicKey: wallet?.publicKey,
        cMint: poolInfo?.cMint,
      });

      let vaultOwner = {
        publicKey: new PublicKey(poolInfo?.owner),
        vault: undefined,
      };
      const mint = getTokenMint({
        program,
        decimals: poolInfo?.decimals,
        mint: poolInfo?.mint,
      });

      const initializerAmount = baseDepositAmmount * 10 ** poolInfo?.decimals;

      //@ts-ignore
      const usdcVault = new Vault(mint, vaultOwner);
      //@ts-ignore
      user.vault = usdcVault;

      await usdcVault.initialize();

      const associatedTokenAccount = await spl.Token.getAssociatedTokenAddress(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        spl.NATIVE_MINT,
        wallet?.publicKey!
      );

      const associatedCTokenAccount = await spl.Token.getAssociatedTokenAddress(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        new PublicKey(poolInfo?.cMint),
        wallet?.publicKey!
      );

      const depositPool = poolInstructions.depositPoolInstr(program, user, {
        pool: new PublicKey(poolInfo.poolAddress),
        ctokenMint: new PublicKey(poolInfo.cMint),
        depositAmount: new BN(initializerAmount),
        depositorTokenAccount: user.mintTokenAccount || associatedTokenAccount,
        depositorCTokenAccount:
          user.ctokenMintTokenAccount || associatedCTokenAccount,
        vaultInfo: new PublicKey(poolInfo?.vaultInfo),
      });

      const transaction = new Transaction();

      if (!user.ctokenMintTokenAccount) {
        transaction.add(
          spl.Token.createAssociatedTokenAccountInstruction(
            spl.ASSOCIATED_TOKEN_PROGRAM_ID,
            spl.TOKEN_PROGRAM_ID,
            new PublicKey(poolInfo?.cMint),
            associatedCTokenAccount,
            wallet?.publicKey!,
            wallet?.publicKey!
          )
        );
      }

      if (poolInfo.mint === spl.NATIVE_MINT.toString()) {
        transaction.add(
          spl.Token.createAssociatedTokenAccountInstruction(
            spl.ASSOCIATED_TOKEN_PROGRAM_ID,
            spl.TOKEN_PROGRAM_ID,
            spl.NATIVE_MINT,
            associatedTokenAccount,
            wallet?.publicKey!,
            wallet?.publicKey!
          ),
          SystemProgram.transfer({
            fromPubkey: wallet?.publicKey!,
            toPubkey: associatedTokenAccount,
            lamports: initializerAmount,
          }),
          spl.Token.createSyncNativeInstruction(
            spl.TOKEN_PROGRAM_ID,
            associatedTokenAccount
          )
        );
      }

      transaction.add(depositPool);

      if (poolInfo.mint === spl.NATIVE_MINT.toString()) {
        transaction.add(
          spl.Token.createCloseAccountInstruction(
            spl.TOKEN_PROGRAM_ID,
            associatedTokenAccount,
            wallet?.publicKey!,
            wallet?.publicKey!,
            []
          )
        );
      }

      transaction.feePayer = wallet?.publicKey || undefined;
      transaction.recentBlockhash = await (
        await connection.getLatestBlockhash()
      ).blockhash;

      const txid = await sendTransaction(transaction, connection);

      notify({
        type: "confirm",
        title: "Confirming deposit transaction",
        txid,
      });
      await connection.confirmTransaction(txid, "finalized");
      setYourLiquidity(yourLiquidity + initializerAmount);
      setTotalLiquidity(totalLiquidity + initializerAmount);

      await updateDB({ id: poolInfo?.id, poolAddress: poolInfo?.poolAddress });

      notify({
        type: "success",
        title: "Success",
        description: "Successfull deposit transaction",
        txid,
      });
      setDepositLoading(false);
    } catch (e) {
      console.log(e);
      setDepositLoading(false);
      notify({
        type: "error",
        title: "Error",
        description: e.message,
      });
    }
  };

  const withdraw = async () => {
    try {
      setDepositLoading(true);

      const program = await getProgram({ adapter: will?.adapter });

      const user = await getCurrentUser({
        mint: poolInfo?.mint,
        publicKey: wallet?.publicKey,
        cMint: poolInfo?.cMint,
      });
      let vaultOwner = {
        publicKey: new PublicKey(poolInfo?.owner),
        vault: undefined,
      };
      const mint = getTokenMint({
        program,
        decimals: poolInfo?.decimals,
        mint: poolInfo?.mint,
      });

      const initializerAmount = baseDepositAmmount * 10 ** poolInfo?.decimals;

      //@ts-ignore
      const usdcVault = new Vault(mint, vaultOwner);
      //@ts-ignore
      user.vault = usdcVault;

      await usdcVault.initialize();

      const associatedTokenAccount = await spl.Token.getAssociatedTokenAddress(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        spl.NATIVE_MINT,
        wallet?.publicKey!
      );

      const withdrawPool = poolInstructions.withdrawPoolInstr(program, user, {
        pool: new PublicKey(poolInfo.poolAddress),
        ctokenMint: new PublicKey(poolInfo.cMint),
        withdrawAmount: new BN(initializerAmount),
        withdrawerTokenAccount: user.mintTokenAccount || associatedTokenAccount,
        withdrawerCTokenAccount: user.ctokenMintTokenAccount,
        vaultInfo: new PublicKey(poolInfo?.vaultInfo),
      });

      const transaction = new Transaction();

      if (poolInfo.mint === spl.NATIVE_MINT.toString()) {
        transaction.add(
          spl.Token.createAssociatedTokenAccountInstruction(
            spl.ASSOCIATED_TOKEN_PROGRAM_ID,
            spl.TOKEN_PROGRAM_ID,
            spl.NATIVE_MINT,
            associatedTokenAccount,
            wallet?.publicKey!,
            wallet?.publicKey!
          ),
          SystemProgram.transfer({
            fromPubkey: wallet?.publicKey!,
            toPubkey: associatedTokenAccount,
            lamports: initializerAmount,
          }),
          spl.Token.createSyncNativeInstruction(
            spl.TOKEN_PROGRAM_ID,
            associatedTokenAccount
          )
        );
      }

      transaction.add(withdrawPool);

      if (poolInfo.mint === spl.NATIVE_MINT.toString()) {
        transaction.add(
          spl.Token.createCloseAccountInstruction(
            spl.TOKEN_PROGRAM_ID,
            associatedTokenAccount,
            wallet?.publicKey!,
            wallet?.publicKey!,
            []
          )
        );
      }

      transaction.feePayer = wallet?.publicKey || undefined;
      transaction.recentBlockhash = await (
        await connection.getLatestBlockhash()
      ).blockhash;

      const txid = await sendTransaction(transaction, connection);

      notify({
        type: "confirm",
        title: "Confirming withdraw transaction",
        txid,
      });
      await connection.confirmTransaction(txid, "finalized");
      setYourLiquidity(yourLiquidity - initializerAmount);
      setTotalLiquidity(totalLiquidity - initializerAmount);

      notify({
        type: "success",
        title: "Success",
        description: "Successfull withdrawl transaction",
        txid,
      });
      setDepositLoading(false);
    } catch (e) {
      console.log(e);
      setDepositLoading(false);
      notify({
        type: "error",
        title: "Error",
        description: e.message,
      });
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      style={{
        width: "calc(100%)",
        marginTop: isMobile ? "60px" : "40px",
        padding: isMobile ? 35 : 80,
      }}
    >
      <Col>
        <Row justify="space-between">
          <Col>
            <Spacer y={2} />
            <Row style={{ flexDirection: isMobile ? "column" : "row" }}>
              <Card style={{ flex: 1.5 }}>
                <Row align="center" style={{ marginTop: "0px", zIndex: 4 }}>
                  <LogoImage
                    src={
                      poolInfo?.logo ||
                      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAMFBMVEXp7vG6vsG3u77s8fTCxsnn7O/f5OfFyczP09bM0dO8wMPk6ezY3eDd4uXR1tnJzdBvAX/cAAACVElEQVR4nO3b23KDIBRA0ShGU0n0//+2KmO94gWZ8Zxmr7fmwWEHJsJUHw8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwO1MHHdn+L3rIoK6eshsNJ8kTaJI07fERPOO1Nc1vgQm2oiBTWJ+d8+CqV1heplLzMRNonED+4mg7L6p591FC+133/xCRNCtd3nL9BlxWP++MOaXFdEXFjZ7r8D9l45C8y6aG0cWtP/SUGhs2d8dA/ZfGgrzYX+TVqcTNRRO9l+fS5eSYzQs85psUcuzk6igcLoHPz2J8gvzWaH/JLS+95RfOD8o1p5CU5R7l5LkfKEp0mQ1UX7hsVXqDpRrifILD/3S9CfmlUQFhQfuFu0STTyJ8gsP3PH7GVxN1FC4t2sbBy4TNRTu7LyHJbqaqKFw+/Q0ncFloo7CjRPwMnCWqKXQZ75El4nKC9dmcJaou9AXOE5UXbi+RGeJygrz8Uf+GewSn9uXuplnWDZJ7d8f24F/s6iq0LYf9olbS3Q8i5oKrRu4S9ybwaQ/aCkqtP3I28QDgeoK7TBya/aXqL5COx67PTCD2grtdOwH+pQV2r0a7YVBgZoKwwIVFQYG6ikMDVRTGByopjD8ATcKb0UhhRTe77sKs2DV7FKSjId18TUEBYVyLhUThWfILHTDqmI85/2RWWjcE/bhP6OD7maT3h20MHsA47JC3PsW0wcwLhv9t0OOPOIkCn21y2bXXwlyylxiYMPk1SuCSmpfK8bNQvIrpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwNX4BCbAju9/X67UAAAAASUVORK5CYII="
                    }
                  />
                  <Spacer x={1} />
                  <Text
                    size={55}
                    css={{
                      color: "$primaryText",
                      fontWeight: "bold",
                      marginTop: "0px",
                    }}
                  >
                    {poolInfo?.name}
                  </Text>
                </Row>
                <Spacer y={2.4} />
                <Row
                  justify="flex-start"
                  style={
                    isMobile
                      ? {
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          alignItems: "flex-start",
                        }
                      : { flexWrap: "wrap" }
                  }
                >
                  {isMobile ? <Spacer y={1} /> : null}

                  <Col
                    style={{
                      flexWrap: "wrap",
                      width: "fit-content",
                      color: "$primaryText",
                    }}
                  >
                    <Text
                      size={16}
                      css={{
                        fontFamily: "DM Sans",
                        color: "$secondaryText",
                        fontWeight: "bold",
                      }}
                    >
                      TOTAL LIQUIDITY({poolInfo?.name}):
                    </Text>
                    <Text
                      size={40}
                      css={{ color: "$primaryText", fontWeight: "bold" }}
                    >
                      {Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 2,
                      }).format(totalLiquidity / 10 ** poolInfo?.decimals)}
                    </Text>
                  </Col>
                  {isMobile ? <Spacer y={1} /> : <Spacer x={2} />}

                  <Col
                    style={{
                      flexWrap: "wrap",
                      width: "fit-content",
                      color: "$primaryText",
                    }}
                  >
                    <Text
                      size={17}
                      css={{
                        fontFamily: "DM Sans",
                        color: "$secondaryText",
                        fontWeight: "bold",
                      }}
                    >
                      YOUR LIQUIDITY({poolInfo?.name}):
                    </Text>
                    <Text
                      size={40}
                      css={{ color: "$primaryText", fontWeight: "bold" }}
                    >
                      {Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 2,
                      }).format(yourLiquidity / 10 ** poolInfo?.decimals)}
                    </Text>
                  </Col>
                  {isMobile ? <Spacer y={1} /> : <Spacer x={2} />}
                  <Col
                    style={{
                      flexWrap: "wrap",
                      width: "fit-content",
                      color: "$primaryText",
                    }}
                  >
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
                    <Text
                      size={40}
                      css={{ color: "$primaryText", fontWeight: "bold" }}
                    >
                      {poolInfo?.apy}%
                    </Text>
                  </Col>
                </Row>
                <Spacer y={2} />
              </Card>
              <Spacer x={2} />
              <Card style={{ flex: 1 }}>
                <Col>
                  <Row align="center">
                    <Text
                      size={isDeposit ? 40 : 23}
                      css={{
                        color: isDeposit ? "$primaryText" : "$secondaryText",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                      onClick={() => setIsDeposit(true)}
                    >
                      Deposit
                    </Text>
                    <Spacer x={1} />

                    <Text
                      size={isDeposit ? 23 : 40}
                      css={{
                        color: isDeposit ? "$secondaryText" : "$primaryText",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                      onClick={() => setIsDeposit(false)}
                    >
                      Withdraw
                    </Text>
                  </Row>
                  <Spacer y={2} />

                  <Row
                    align="center"
                    justify="flex-end"
                    style={{
                      border: "1px solid #6A6A6A",
                      padding: 14,
                      borderRadius: "0.25rem",
                    }}
                  >
                    <Input
                      placeholder={0}
                      type="number"
                      border
                      onChange={(e) =>
                        setBaseDepositAmmount(Number(e.target.value))
                      }
                      value={baseDepositAmmount}
                      disabled={!hasCTokenAccount}
                    />
                    <Spacer x={1} />

                    <SmallLogoImage
                      src={
                        poolInfo?.logo ||
                        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAMFBMVEXp7vG6vsG3u77s8fTCxsnn7O/f5OfFyczP09bM0dO8wMPk6ezY3eDd4uXR1tnJzdBvAX/cAAACVElEQVR4nO3b23KDIBRA0ShGU0n0//+2KmO94gWZ8Zxmr7fmwWEHJsJUHw8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwO1MHHdn+L3rIoK6eshsNJ8kTaJI07fERPOO1Nc1vgQm2oiBTWJ+d8+CqV1heplLzMRNonED+4mg7L6p591FC+133/xCRNCtd3nL9BlxWP++MOaXFdEXFjZ7r8D9l45C8y6aG0cWtP/SUGhs2d8dA/ZfGgrzYX+TVqcTNRRO9l+fS5eSYzQs85psUcuzk6igcLoHPz2J8gvzWaH/JLS+95RfOD8o1p5CU5R7l5LkfKEp0mQ1UX7hsVXqDpRrifILD/3S9CfmlUQFhQfuFu0STTyJ8gsP3PH7GVxN1FC4t2sbBy4TNRTu7LyHJbqaqKFw+/Q0ncFloo7CjRPwMnCWqKXQZ75El4nKC9dmcJaou9AXOE5UXbi+RGeJygrz8Uf+GewSn9uXuplnWDZJ7d8f24F/s6iq0LYf9olbS3Q8i5oKrRu4S9ybwaQ/aCkqtP3I28QDgeoK7TBya/aXqL5COx67PTCD2grtdOwH+pQV2r0a7YVBgZoKwwIVFQYG6ikMDVRTGByopjD8ATcKb0UhhRTe77sKs2DV7FKSjId18TUEBYVyLhUThWfILHTDqmI85/2RWWjcE/bhP6OD7maT3h20MHsA47JC3PsW0wcwLhv9t0OOPOIkCn21y2bXXwlyylxiYMPk1SuCSmpfK8bNQvIrpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwNX4BCbAju9/X67UAAAAASUVORK5CYII="
                      }
                    />
                    <Spacer x={0.8} />

                    <Text
                      size={30}
                      css={{
                        color: "$primaryText",
                        fontWeight: "300",
                        marginTop: "0px",
                      }}
                    >
                      {poolInfo?.name}
                    </Text>
                  </Row>
                  <Spacer y={2} />
                  <Button
                    style={{
                      height: 65,
                      width: "100%",
                      borderRadius: "0.25rem",
                      backgroundColor: "#EE2276",
                    }}
                    onClick={isDeposit ? deposit : withdraw}
                    disabled={!hasCTokenAccount}
                  >
                    {isDepositLoading ? (
                      <Loading
                        type="points-opacity"
                        color="currentColor"
                        size="sm"
                      />
                    ) : (
                      <Text
                        size={16}
                        css={{ color: "#fff", fontWeight: "700" }}
                      >
                        {isDeposit ? "Deposit" : "Withdraw"}
                      </Text>
                    )}
                  </Button>
                </Col>
              </Card>
            </Row>
          </Col>
        </Row>
        <Row justify="space-between">
          <Col style={{ flex: 1.5, padding: 20 }}>
            <Text
              size={36}
              css={{
                color: "$primaryText",
                fontWeight: "600",
              }}
            >
              Vault Strategy
            </Text>
            <Text
              size={16}
              css={{
                color: "$secondaryText",
                fontWeight: "600",
              }}
            >
              Auto vaults allows you to invest single assets and auto-compounds
              concentrated liquidity pools from Orca.so using our market
              analysis algorithm to pursuit the best yields during market
              cycles.
            </Text>
            <Spacer y={1} />
            <Text
              size={36}
              css={{
                color: "$primaryText",
                fontWeight: "600",
              }}
            >
              Risks
            </Text>
            <Text
              size={16}
              css={{
                color: "$secondaryText",
                fontWeight: "600",
              }}
            >
              This vault may incur in impermanent or permanent loss due to
              whirlpools ranges.
            </Text>
            <Spacer y={1} />
            <Text
              size={36}
              css={{
                color: "$primaryText",
                fontWeight: "600",
              }}
            >
              Fees
            </Text>
            <Text
              size={16}
              css={{
                color: "$secondaryText",
                fontWeight: "600",
              }}
            >
              The vault only takes 3% of the harvest interest. No fees is
              applicable when depositing or withdrawing.
            </Text>
          </Col>
          <Spacer x={2} />

          <Col style={{ flex: 1 }}></Col>
        </Row>
      </Col>
    </motion.div>
  );
}
