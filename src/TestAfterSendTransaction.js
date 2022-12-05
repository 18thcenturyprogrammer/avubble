
import React, { Component,useEffect,useState } from "react";
import { ethers ,BigNumber} from "ethers";

const TestAfterSendTransaction = ()=>{
    
    useEffect(()=>{
        console.log('1');
        doSendTransaction();
    },[]);




    return (
        <>
            <h1>TestAfterSendTransaction pages</h1>
            <h1>TestAfterSendTransaction pages</h1>
        </>
    );
};


export default TestAfterSendTransaction;

async function doSendTransaction(){

    console.log('2');

    const MUL_MAX_FEE_PER_GAS = 50;
    const MUL_MAX_PRIORITY_FEE_PER_GAS = 40;

    const privKey = 'ac955c2884b4138de7b095d867295f4bb40a78415bf7c0f52dbc4b97330b9568';
    const wallet_address = '0x40Cf69EEE51f7D08a5A5BEcA394F245BEc7e6Bee';

    // mumbai http
    const ALCHEMY_HTTP_URL = "https://polygon-mumbai.g.alchemy.com/v2/Uud_P7gk4UKBPIgcNN2nV3jsEbhn1R5Z";

    console.log('3');

    const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_HTTP_URL);

    const contractAddress = '0x6a08a04fa02D32E72c13e73F86C9da2D84E90F71';

    const abi = '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"TransferSingle","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"value","type":"string"},{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"URI","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"burnBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"exists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxQtyUserMint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mintBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mintByOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mintByUser","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"setMintFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"string","name":"_uri","type":"string"}],"name":"setOneUri","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newuri","type":"string"}],"name":"setURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"uris","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]';

    console.log('4');

    const contract = new ethers.Contract(contractAddress,abi,provider);

    const params ={
        account:wallet_address,
        id:0,
        amount:6
    };

    console.log('5');

    const wallet = new ethers.Wallet(privKey);

    console.log('6');

    const connectedWallet = wallet.connect(provider);

    const gasData = await provider.getFeeData();

    // 'replacement fee too low' error kept being raised, so i had to jack up the gas
    
    // // if i follow eip 1559, i can't override gasprice option
    // // maxFeePerGas must be higher than maxPriorityFeePerGas
    // const mulMaxFeePerGas = gasData.maxFeePerGas.mul(BigNumber.from(MUL_MAX_FEE_PER_GAS));
    // const mulMaxPriorityFeePerGas = gasData.maxPriorityFeePerGas.mul(BigNumber.from(MUL_MAX_PRIORITY_FEE_PER_GAS));

    // // normal gasLimit is 21000 , but not worked ,so i changed it to this
    // const options = {
    //     gasLimit:ethers.utils.hexlify(1000000),
    //     maxFeePerGas:mulMaxFeePerGas,
    //     maxPriorityFeePerGas:mulMaxPriorityFeePerGas,
    //     nonce: await provider.getTransactionCount(wallet_address)
    // };


    // if i follow eip 1559, i can't override gasprice option
    // maxFeePerGas must be higher than maxPriorityFeePerGas
    const mulMaxFeePerGas = gasData.maxFeePerGas.mul(BigNumber.from(2));
    const mulMaxPriorityFeePerGas = gasData.maxPriorityFeePerGas.mul(BigNumber.from(2));

    // normal gasLimit is 21000 , but not worked ,so i changed it to this
    const options = {
        gasLimit:ethers.utils.hexlify(10),
        maxFeePerGas:mulMaxFeePerGas,
        maxPriorityFeePerGas:mulMaxPriorityFeePerGas,
        nonce: await provider.getTransactionCount(wallet_address)
    };

    console.log('7');

    const result = await contract.connect(connectedWallet).mintByOwner(wallet_address,0,5, options);

    console.log("result : ",result);
    console.log("==========================");
    console.dir(result);

    const txReceipt = await result.wait();

    console.log("txReceipt : ",txReceipt);
    console.log("==========================");
    console.dir(txReceipt);
    

}