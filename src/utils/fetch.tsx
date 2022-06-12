export const apiUrl = process.env.NEXT_PUBLIC_SOLANA_API

interface Deposit {
  id: any
  totalLiquidity: any
}

export const updatePool = async ({ id, totalLiquidity }: Deposit) => {
  const resp = await fetch(`${apiUrl}/updatePool`, {
      body: JSON.stringify({
        id,
        totalLiquidity
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
  const parsedResponse = await resp.json();

  return parsedResponse;
}


export const get = async (url) => {
  const resp = await fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "GET"
    });
  const parsedResponse = await resp.json();

  return parsedResponse;
}

const { NEXT_PUBLIC_SOLANA_RPC_HOST } = process.env
export const rpcUrl = NEXT_PUBLIC_SOLANA_RPC_HOST
