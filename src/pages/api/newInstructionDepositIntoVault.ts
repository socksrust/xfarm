
export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { depositorWalletAddress, vaultName, maxTokenA, maxTokenB } = req.body;
      const url = `http://0.0.0.0:9090/api/v1/all_instructions_add_liquidity_vault?wallet_address=${depositorWalletAddress}&vault_name=${vaultName}&max_token_a_ui_amount=${maxTokenA}&max_token_b_ui_amount=0`
      console.log('url ->', url)
      const resp = await fetch(
      url,
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