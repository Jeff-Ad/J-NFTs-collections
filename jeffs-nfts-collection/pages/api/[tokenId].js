// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// Base URI + TokenID
// Base URI = https://example.com/
// Token ID = 1
// tokenURI(1) => https://example.com/

// export default function handler(req, res) {
//   const tokenId = req.query.tokenId;

//   const name = `Crypto Devs #${tokenId}`;
//   const description = "CryptoDevs is an NFT Collection for Web3 Developers";
//   const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${+(
//     tokenId - 1
//   )}.svg`;
//   return res.json({
//     name: name,
//     description: description,
//     image: image,
//   });
// }
