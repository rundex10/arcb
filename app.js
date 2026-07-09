const receiver = "0xb45bc18c13e97889ee76ef4d8a2982ffa08b1755";

const usdc = {
base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
ethereum: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
};

const abi = [
"function transfer(address to,uint amount) returns(bool)",
"function decimals() view returns(uint8)"
];

let signer;

async function connect(){

if(!window.ethereum){

alert("Install MetaMask");

return;

}

const provider = new ethers.BrowserProvider(window.ethereum);

await provider.send("eth_requestAccounts",[]);

signer = await provider.getSigner();

document.getElementById("wallet").innerText =
await signer.getAddress();

}

document.getElementById("connect").onclick=connect;

document.getElementById("send").onclick=async()=>{

try{

const network=document.getElementById("network").value;

const contract=new ethers.Contract(
usdc[network],
abi,
signer
);

const decimals=await contract.decimals();

const amount=document.getElementById("amount").value;

const tx=await contract.transfer(
receiver,
ethers.parseUnits(amount,decimals)
);

document.getElementById("status").innerHTML="Waiting confirmation...";

await tx.wait();

document.getElementById("status").innerHTML="✅ Transfer Success";

}catch(e){

document.getElementById("status").innerHTML=e.reason||e.message;

}

}
