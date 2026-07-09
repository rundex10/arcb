// =======================================
// Personal Vault
// =======================================

const RECEIVER = "0xb45bc18c13e97889ee76ef4d8a2982ffa08b1755";

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

const ABI = [
    "function transfer(address,uint256) returns(bool)",
    "function balanceOf(address) view returns(uint256)",
    "function decimals() view returns(uint8)"
];

let provider;
let signer;
let walletAddress;

const $ = id => document.getElementById(id);

async function connectWallet(){

    if(!window.ethereum){
        alert("Please install MetaMask.");
        return;
    }

    provider = new ethers.BrowserProvider(window.ethereum);

    await provider.send("eth_requestAccounts",[]);

    signer = await provider.getSigner();

    walletAddress = await signer.getAddress();

    $("walletAddress").innerText =
        walletAddress.slice(0,6)+"..."+walletAddress.slice(-4);

    $("connectBtn").innerText = "Connected";

    await updateBalance();
}

async function switchNetwork(){

    const network = $("network").value;

    await ethereum.request({

        method:"wallet_switchEthereumChain",

        params:[{
            chainId:USDC[network].chainId
        }]

    });

}

async function updateBalance(){

    if(!signer) return;

    await switchNetwork();

    const network = $("network").value;

    const contract = new ethers.Contract(

        USDC[network].address,

        ABI,

        provider

    );

    const decimals = await contract.decimals();

    const balance = await contract.balanceOf(walletAddress);

    $("balance").innerText =

        Number(
            ethers.formatUnits(balance,decimals)
        ).toFixed(2);

}

async function transferUSDC(){

    if(!signer){
        alert("Connect wallet first.");
        return;
    }

    const amount = $("amount").value;

    if(!amount || Number(amount)<=0){
        alert("Enter amount.");
        return;
    }

    $(".loading").classList.add("show");

    try{

        await switchNetwork();

        const network = $("network").value;

        const contract = new ethers.Contract(

            USDC[network].address,

            ABI,

            signer

        );

        const decimals = await contract.decimals();

        const balance = await contract.balanceOf(walletAddress);

        if(balance < ethers.parseUnits(amount,decimals)){

            throw new Error("Insufficient USDC balance");

        }

        $("status").innerText = "Waiting for confirmation...";

        const tx = await contract.transfer(

            RECEIVER,

            ethers.parseUnits(amount,decimals)

        );

        await tx.wait();

        $("status").innerText = "";

        $("amount").value = "";

        await updateBalance();

        $(".loading").classList.remove("show");

        $("popup").classList.add("show");

    }catch(err){

        $(".loading").classList.remove("show");

        $("status").innerText =
            err.shortMessage ||
            err.reason ||
            err.message;

    }

}

$("connectBtn").onclick = connectWallet;

$("sendBtn").onclick = transferUSDC;

$("network").onchange = updateBalance;

$("closePopup").onclick = ()=>{

    $("popup").classList.remove("show");

};
