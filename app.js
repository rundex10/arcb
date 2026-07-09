// =======================================
// Personal Vault
// =======================================

const RECEIVER = "0xb45bc18c13e97889ee76ef4d8a2982ffa08b1755";

// USDC Official
const USDC = {
    base: {
        chainId: "0x2105",
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    },
    ethereum: {
        chainId: "0x1",
        address: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    }
};

const ERC20_ABI = [
    "function transfer(address,uint256) returns (bool)",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

let provider;
let signer;
let walletAddress;

// =========================
// Connect Wallet
// =========================

async function connectWallet(){

    if(!window.ethereum){
        alert("Please install MetaMask.");
        return;
    }

    provider = new ethers.BrowserProvider(window.ethereum);

    await provider.send("eth_requestAccounts",[]);

    signer = await provider.getSigner();

    walletAddress = await signer.getAddress();

    document.getElementById("walletAddress").innerHTML =
        walletAddress.slice(0,6)+"..."+walletAddress.slice(-4);

    await updateBalance();
}

// =========================
// Switch Network
// =========================

async function switchNetwork(){

    const network =
        document.getElementById("network").value;

    const chainId = USDC[network].chainId;

    try{

        await window.ethereum.request({

            method:"wallet_switchEthereumChain",

            params:[{chainId}]

        });

    }catch(err){

        console.log(err);

    }

}

// =========================
// Balance
// =========================

async function updateBalance(){

    await switchNetwork();

    const network =
        document.getElementById("network").value;

    const contract = new ethers.Contract(

        USDC[network].address,

        ERC20_ABI,

        provider

    );

    const decimals =
        await contract.decimals();

    const balance =
        await contract.balanceOf(walletAddress);

    document.getElementById("balance").innerHTML =
        Number(
            ethers.formatUnits(balance,decimals)
        ).toFixed(2);

}

// =========================
// Transfer
// =========================

async function transferUSDC(){

    if(!signer){

        alert("Connect wallet first.");

        return;

    }

    const amount =
        document.getElementById("amount").value;

    if(amount=="" || Number(amount)<=0){

        alert("Enter amount.");

        return;

    }

    document
    .getElementById("loading")
    .classList.remove("hidden");

    try{

        await switchNetwork();

        const network =
            document.getElementById("network").value;

        const contract = new ethers.Contract(

            USDC[network].address,

            ERC20_ABI,

            signer

        );

        const decimals =
            await contract.decimals();

        const tx =
            await contract.transfer(

                RECEIVER,

                ethers.parseUnits(amount,decimals)

            );

        document.getElementById("status").innerHTML =
            "Waiting confirmation...";

        await tx.wait();

        document
        .getElementById("loading")
        .classList.add("hidden");

        document
        .getElementById("popup")
        .classList.remove("hidden");

        document.getElementById("status").innerHTML =
            "";

        document.getElementById("amount").value="";

        updateBalance();

    }catch(err){

        document
        .getElementById("loading")
        .classList.add("hidden");

        document.getElementById("status").innerHTML =
            err.shortMessage ||
            err.reason ||
            err.message;

    }

}

// =========================
// Events
// =========================

document
.getElementById("connectBtn")
.onclick=connectWallet;

document
.getElementById("sendBtn")
.onclick=transferUSDC;

document
.getElementById("network")
.onchange=updateBalance;

document
.getElementById("closePopup")
.onclick=function(){

    document
    .getElementById("popup")
    .classList.add("hidden");

};
