
export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { depositorWalletAddress, vaultName } = req.body;
      console.log('url ->',       `http://0.0.0.0:9090/api/v1/new_instruction_add_liquidity_vault?wallet_address=BakZMixrKdJgZn9dx1fe5GK1EbToVP7yyrBp4tYtjZJ&vault_name=RDM.STC.RAY-USDC&max_token_a_ui_amount=0.1&max_token_b_ui_amount=0.1`)
      const resp = await fetch(
      `http://0.0.0.0:9090/api/v1/new_instruction_add_liquidity_vault?wallet_address=BakZMixrKdJgZn9dx1fe5GK1EbToVP7yyrBp4tYtjZJ&vault_name=RDM.STC.RAY-USDC&max_token_a_ui_amount=0.1&max_token_b_ui_amount=0.1`,
      {
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