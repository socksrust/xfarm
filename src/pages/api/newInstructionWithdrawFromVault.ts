
export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { depositorWalletAddress, vaultName, maxToken } = req.body;
      const url = `https://farm-rpc.herokuapp.com/api/v1/all_instructions_remove_liquidity_vault?wallet_address=${depositorWalletAddress}&vault_name=${vaultName}&ui_amount=${maxToken}`
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