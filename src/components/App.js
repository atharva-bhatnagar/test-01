import "./App.css";
import Nav from "./Nav/Nav";
import TokenPart from "./Token/Token";
import SenderTable from "./Table";
import Transfer from "./Transfer/Transfer";
import ConnectWallet from "./ConnectWallet";
import Fee from "./Fee";
import Airdrop from "./Airdrop";
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { RPC_URL, SECRET_KEY } from "./config";
import detectEthereumProvider from "@metamask/detect-provider";
import RecipientTransfer from "./RecipientTransfer/RecipientTransfer";

// Load the sender's wallet from the private key
const provider = new ethers.BrowserProvider(window.ethereum);
const senderWallet = new ethers.Wallet(SECRET_KEY, provider);

function App() {
  // State variables
  const [isConnected, setIsConnected] = useState(false); // Connection state
  const [tokenAddress, setTokenAddress] = useState("0xD99509650ED59E41FD7201338f87D4990268b2a0"); // ERC-20 token contract address
  const [wallets, setWallets] = useState([]); // List of recipient addresses
  const [walletAddress, setWalletAddress] = useState("");
  const [quantity, setQuantity] = useState(0); // Tokens to send per wallet
  const [fee, setFee] = useState(0); // Gas fee per transaction (not actively used for Ethereum)
  const [loading, setLoading] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState(0); // Sender's token balance
  const [signer,setSigner]=useState(null)
  const [recipient,setRecipient]=useState("")
  const [transferTokenAddress, setTransferTokenAddress] = useState("0xD99509650ED59E41FD7201338f87D4990268b2a0");
  const [tranferBalanceAmount, setTransferBalanceAmount] = useState(0)
  const [transferQuantity,setTransferQuantity]=useState(0)
  // Fetch token balance of the sender's wallet
  useEffect(() => {
    if (tokenAddress) {
      getTokenBalance(true);
    }
  }, [tokenAddress]);
  useEffect(() => {
    if (transferTokenAddress) {
      getTokenBalance(false);
    }
  }, [transferTokenAddress]);

  const getTokenBalance = async (forAirdrop) => {
    try {
      const erc20ABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function name() view returns (string)"
      ];
      const tokenContract = new ethers.Contract(forAirdrop?tokenAddress:transferTokenAddress, erc20ABI, provider);
      const decimals = await tokenContract.decimals();
      const balance = await tokenContract.balanceOf(signer.address||0);
      console.log(balance,await tokenContract.name())
      if(forAirdrop){
        setBalanceAmount(Number(ethers.formatUnits(balance, decimals)));

      }else{
        setTransferBalanceAmount(Number(ethers.formatUnits(balance, decimals)));

      }
    } catch (error) {
      console.error("Error fetching token balance:", error);
      alert("Failed to fetch token balance. Check the token address and try again.");
    }
  };

  const handleConnect = async () => {
    if (isConnected) {
      const confirmDisconnect = window.confirm("Do you want to disconnect?");
      if (confirmDisconnect) {
        setIsConnected(false);
      }
    } else {
      let provider;
      console.log("window.ethereum: ",window.ethereum)
      if(window.ethereum==null){
        
        provider=ethers.getDefaultProvider()
        
      }else{
        provider=new ethers.BrowserProvider(window.ethereum)
        let signer=await provider.getSigner()
        setSigner(signer)
        setWalletAddress(signer.address)
        console.log(signer)
      }
 
      
      alert("Metamask wallet connected");
      setIsConnected(true);
    }
  };
  const isValidAddress=(address)=>{
    if (!/^(0x)?[0-9a-fA-F]{40}$/.test(address)) {
      return false;
    }
    const isvalid = ethers.isAddress(address); 
    return isvalid;
  }
  const handleTransfer = async()=>{
    if(!tokenAddress){
      alert('Please fill in all parameters correctly!')
      return
    }
    if(!isValidAddress(recipient)){
      alert('Invalid recipient address!')
      return
    }
    setLoading(true)
    try{
      const erc20ABI = [
        "function transfer(address to, uint256 value) public returns (bool)",
        "function decimals() view returns (uint8)",
      ];
      const tokenContract = new ethers.Contract(transferTokenAddress, erc20ABI, senderWallet);
      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits(transferQuantity.toString(), decimals);
      const tx = await tokenContract.transfer(recipient, amount);
      await tx.wait(); 
      console.log(`Successfully sent to ${recipient}`);
      alert('Transfer successful!')
      setLoading(false)
    }catch(err){
      console.error("Transfer failed:", err);
      alert("Transfer failed! Check the console for more details.");
      setLoading(false)
    }
  }

  // Airdrop logic
  const handleAirdrop = async () => {
    if (!tokenAddress || wallets.length === 0 || quantity <= 0) {
      alert("Please fill in all parameters correctly!");
      return;
    }

    setLoading(true);
    try {
      const erc20ABI = [
        "function transfer(address to, uint256 value) public returns (bool)",
        "function decimals() view returns (uint8)",
      ];
      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, senderWallet);
      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits(quantity.toString(), decimals);

      for (let i = 0; i < wallets.length; i++) {
        const recipient = wallets[i];
        console.log(`Transferring ${quantity} tokens to ${recipient}...`);
        const tx = await tokenContract.transfer(recipient, amount);
        await tx.wait(); // Wait for the transaction to confirm
        console.log(`Successfully sent to ${recipient}`);
      }
      alert("Airdrop completed successfully!");
    } catch (error) {
      console.error("Airdrop failed:", error);
      alert("Airdrop failed! Check the console for more details.");
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <Nav />
      
      <div style={{ opacity: loading ? 0.5 : 1 }}>
        {loading && (
          <div className="d-flex justify-content-center align-items-center custom-loading">
            <Spinner animation="border" variant="primary" role="status" />
          </div>
        )}
        <div className="connectWallet">
          
          <div className="connectWallet">
          <ConnectWallet
            handleConnect={handleConnect}
            isConnected={isConnected}
          />

        </div>
        
          {/* <button className="btn btn-danger" disabled>
            <h3>MetaMask (Coming Soon)</h3>
          </button> */}
        </div>
        {
          isConnected?
          <div style={{fontSize:'1.6em',margin:'1vh 0'}}>You are connected with wallet address : {walletAddress}</div>
          :
          <></>
        }
        <div className="event">
          <SenderTable wallets={wallets} setWallets={setWallets} isConnected = {isConnected}/>
        </div>
        <div className="main">
        <TokenPart
            tokenaddress={transferTokenAddress}
            setTokenAddress={setTransferTokenAddress}
            balanceAmount={tranferBalanceAmount}
          />
          <Transfer
            text={"Amount to transfer"}
            quantity={transferQuantity}
            setQuantity={setTransferQuantity}
            totalQuantity={transferQuantity}
            balanceAmount={tranferBalanceAmount}
          />
          <RecipientTransfer 
            recipient={recipient} 
            setRecipient={setRecipient} 
            isConnected={isConnected}
            handleTransfer={handleTransfer}
          />
        </div>
        <div className="main">
          <TokenPart
            tokenaddress={tokenAddress}
            setTokenAddress={setTokenAddress}
            balanceAmount={balanceAmount}
          />
          <Transfer
            text={"Quantity per wallet"}
            quantity={quantity}
            setQuantity={setQuantity}
            totalQuantity={wallets?.length ? wallets.length * quantity : 0}
            balanceAmount={balanceAmount}
          />
          <Fee
            fee={fee}
            setFee={setFee}
            totalFee={wallets?.length ? wallets.length * fee : 0}
          />
        </div>
        <div className="airdrop">
          <Airdrop
            isConnected={
              isConnected && wallets?.length
                ? wallets.length * quantity < balanceAmount
                : 0
            }
            handleAirdrop={handleAirdrop}
          />
          {/* <Airdrop handleAirdrop={handleAirdrop} isConnected={true} /> */}
        </div>
      </div>
    </div>
  );
}

export default App;