


export const get = async ({ accountAddress }) => {
  const url = `https://api.coingecko.com/api/v3/coins/solana/contract/${accountAddress}`
  console.log('url ->', url);
  const resp = await fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "GET"
    });
  const parsedResponse = await resp.json();
  console.log('parsedResponse', parsedResponse);
  return parsedResponse;
}
