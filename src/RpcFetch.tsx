export const apiUrl = process.env.NEXT_PUBLIC_SOLANA_API;

interface Deposit {
  ref: string;
}

export const getVaultByRef = async ({ ref }: Deposit) => {
  const resp = await fetch(
    `http://0.0.0.0:9090/api/v1/vault_by_ref?vault_ref=${ref}`,
    {
      /*body: JSON.stringify({
      id,
      totalLiquidity,
    }),*/
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    }
  );
  const parsedResponse = await resp.json();

  return parsedResponse;
};

export const getVaults = async () => {
  const resp = await fetch(`http://0.0.0.0:9090/api/v1/vaults`, {
    /*body: JSON.stringify({
      id,
      totalLiquidity,
    }),*/
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
  });
  const parsedResponse = await resp.json();

  return parsedResponse;
};

export const newInstructionDepositIntoVault = async ({
  depositorWalletAddress,
  vaultName,
  maxTokenA,
}) => {
  const resp = await fetch(`${apiUrl}/newInstructionDepositIntoVault`, {
    body: JSON.stringify({
      depositorWalletAddress,
      vaultName,
      maxTokenA,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const parsedResponse = await resp.json();

  return parsedResponse;
};

export const newInstructionInitUserVault = async ({
  depositorWalletAddress,
  vaultName,
}) => {
  const resp = await fetch(`${apiUrl}/newInstructionInitUserVault`, {
    body: JSON.stringify({
      depositorWalletAddress,
      vaultName,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const parsedResponse = await resp.json();

  return parsedResponse;
};
