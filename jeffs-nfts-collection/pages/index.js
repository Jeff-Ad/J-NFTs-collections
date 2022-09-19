import Head from "next/head";
// import Image from "next/image";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { Contract, providers, utils } from "ethers";
import React from "react";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../constants";
export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = React.useState(false);

  // presaleStarted keeps track of whether the presale has started or not
  const [presaleStarted, setPresaleStarted] = React.useState(false);

  // presaleEnded keeps track of whether the presale ended
  const [presaleEnded, setPresaleEnded] = React.useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = React.useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = React.useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [numTokenIdsMinted, setNumTokenIdsMinted] = React.useState("0");
  //instantiating the web3modal
  // creating a reference to a web3 modal instance
  //function to connect to our wallet
  const web3ModalRef = React.useRef();

  // a helper function to make sure the owner sees the button
  // to start the txn
  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      // Get an instance of your NFT Contract
      /*
    to get the NFT contract we need two things
    contract address and 
    contract ABI
    */
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const owner = await nftContract.owner();
      const userAddress = await signer.getAddress();
      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getNumMintedTokens = async () => {
    try {
      const provider = await getProviderOrSigner();

      // Get an instance of your NFT Contract
      /*
      to get the NFT contract we need two things
      contract address and 
      contract ABI
      */
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const numTokenIds = await nftContract.tokenIds();
      setNumTokenIdsMinted(numTokenIds.toString());
    } catch (error) {
      console.error(error);
    }
  };
  const presaleMint = async () => {
    // setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      await txn.wait();
      window.alert("You successfully minted a CryptoDev");
    } catch (error) {
      console.error(error);
    }
    // setLoading(false);
  };
  const publicMint = async () => {
    // setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const txn = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      await txn.wait();
      window.alert("You successfully minted a CryptoDev");
    } catch (error) {
      console.error(error);
    }
    // setLoading(false);
  };
  /*
2 functions are needed ==> to start and to check if prsale have started 
*/

  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      // call the startPresale from the contract
      const txn = await nftContract.startPresale();
      setLoading(true);
      await txn.wait();
      setLoading(false);
      setPresaleStarted(true);
      await checkIfPresaleEnded();
    } catch (error) {
      console.error(error);
    }
  };
  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();

      // Get an instance of your NFT Contract
      /*
      to get the NFT contract we need two things
      contract address and 
      contract ABI
      */
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      ); // This will allow us talk to the blockchain

      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);

      return isPresaleStarted;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();

      // Get an instance of your NFT Contract
      /*
      to get the NFT contract we need two things
      contract address and 
      contract ABI
      */
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      // This will return a BigNumber because preSaleEnded is a unint256
      // This will return a timeStamp in seconds
      const presaleEndTime = await nftContract.presaleEnded();
      const currentTimeInSeconds = Date.now() / 1000;

      const hasPresaleEnded = presaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      );
      if (hasPresaleEnded) {
        setPresaleEnded(true);
      }
      setPresaleEnded(false);
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const connectWallet = async () => {
    // we need to connect to the provider
    // we need to connect to the users meta-mask
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    // we need to gain access to the provider/signer from Metamask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    //If the user is NOT connected to Rinkeby, tell them to switch to Rinkeby
    const { chainId } = await web3Provider.getNetwork();
    //any layer 2 ID has a chain ID --> has a unique ID that there are being specified with
    if (chainId !== 4) {
      window.alert("Please switch to the Rinkeby network");
      throw new Error("Incorrect network");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
    // Update "walletConnected" to be true
  };
  // initializing the instance when the website loads
  // using the useEffect hook
  const onPageLoad = async () => {
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleStarted();
    if (presaleStarted) {
      checkIfPresaleEnded();
    }
    await getNumMintedTokens();

    // Track in real time the number of minted NFTs
    setInterval(async () => {
      await getNumMintedTokens();
    }, 5 * 1000);

    // Track in real time the status of presale (started, ended, whatever)
    // Set an interval which gets called every 5 seconds to check presale has ended
    const presaleEndedInterval = setInterval(async function () {
      const _presaleStarted = await checkIfPresaleStarted();
      if (_presaleStarted) {
        const _presaleEnded = await checkIfPresaleEnded();
        if (_presaleEnded) {
          clearInterval(presaleEndedInterval);
        }
      }
    }, 5 * 1000);
  };
  React.useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      // check if presale has started or ended
      onPageLoad();
      // const _presaleStarted = checkIfPresaleStarted();
      // if (_presaleStarted) {
      //   checkIfPresaleEnded();
      // }
    }
  }, []);

  function renderBody() {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      );
    }
    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }
    if (isOwner && !presaleStarted) {
      // render a buttom to start the presale
      return (
        <button onClick={startPresale} className={styles.button}>
          Start Presale!
        </button>
      );
    }
    if (!presaleStarted) {
      // just say that presale hasnt started yet, come back later
      return (
        <span className={styles.description}>
          Presale has not started yet. Come back later!
        </span>
      );
    }
    if (presaleStarted && !presaleEnded) {
      // allow users to mint in presale
      // they need to be in whitelist for this to work
      return (
        <div>
          <span className={styles.description}>
            Presale has started! If your address is whitelisted, you can mint a
            CryptoDev!
          </span>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }
    if (presaleStarted && presaleEnded) {
      // allow users to take part in public sale
      return (
        <div>
          <span>Presale has Ended</span>
          <button className={styles.button} onClick={publicMint}>
            Public Mint 🚀
          </button>
          ;
        </div>
      );
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title> Crypto Devs NFT</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDevs NFT!</h1>
          <div>
            <div className={styles.description}>
              CryptoDevs NFT is an NFT collection for developers in Crypto.
            </div>
            <div className={styles.description}>
              {numTokenIdsMinted}/20 have been minted already!
            </div>
          </div>
          <div className={styles.description}>{renderBody()}</div>
        </div>
        <image className={styles.image} src="/0.svg" />
      </div>
      <footer className={styles.footer}>Made with &#10084; by Jeff Kole</footer>
    </div>
  );
}
