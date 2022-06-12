import { newInstructionInitUserVault } from "src/RpcFetch"

export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { depositorWalletAddress, vaultName } = req.body;

      const resp = await fetch(
      `http://0.0.0.0:9090/api/v1/new_instruction_user_init_vault?wallet_address=${depositorWalletAddress}&vault_name=${vaultName}`,
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
    const data = await resp.json();

    res.status(200).json({ data })
  }
}