import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, abi } from "./constants";

import "./App.css";

function App() {
  const [fundAmount, setFundAmount] = useState("");

  const [contractBalance, setContractBalance] = useState("0.0");

  useEffect(() => {
    getBalance();
  }, [fundAmount]);

  function isMetaMaskInstalled() {
    const bool = Boolean(window.ethereum && window.ethereum.isMetaMask);
    if (bool) {
      return <p>Great, you have MetaMask!</p>;
    } else {
      return <p>You will need to install MetaMask to use this contract</p>;
    }
  }

  async function connect() {
    if (Boolean(window.ethereum && window.ethereum.isMetaMask)) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      console.log("connected");
    } else {
      alert("Please install MetaMask to use this contract");
    }
  }

  // Change this to use state and "Show current contract balance"
  async function getBalance() {
    if (Boolean(window.ethereum && window.ethereum.isMetaMask)) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(contractAddress);
      setContractBalance(ethers.utils.formatEther(balance));
      console.log(ethers.utils.formatEther(balance));
    } else {
      alert("Please install MetaMask to use this contract");
    }
  }

  async function fund(ethAmount) {
    if (fundAmount === "") {
      alert("Please type a number in the input field to fund the contract");
      return;
    }
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const transactionResponse = await contract.fund({
          value: ethers.utils.parseEther(ethAmount),
        });
        await listenForTransactionMine(transactionResponse, provider);
        console.log("Done!");
        setFundAmount("");
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function withdraw() {
    if (Boolean(window.ethereum && window.ethereum.isMetaMask)) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const transactionResponse = await contract.withdraw();
        await listenForTransactionMine(transactionResponse, provider);
        console.log("Wtihdrawn!");
        setContractBalance("0.0");
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Please install MetaMask to use this contract");
    }
  }

  function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Complete with ${transactionReceipt.confirmations} confirmations`
        );
        resolve();
      });
    });
  }

  function handleChange(event) {
    const { value } = event.target;
    value.toString();
    setFundAmount(value);
  }

  return (
    <div className="App">
      <h1>Fund Me Contract!</h1>
      {isMetaMaskInstalled()}
      <button onClick={connect}>Connect</button>
      <button onClick={() => fund(fundAmount)}>Fund</button>
      <input
        type="number"
        placeholder="0.1"
        className="fund-input"
        value={fundAmount}
        onChange={handleChange}
      />
      <button onClick={withdraw}>Withdraw</button>
      {/* <button onClick={getBalance}>Update Contract Balance Display</button> */}
      <p>Current Contract Balance: {contractBalance}</p>
    </div>
  );
}

export default App;
