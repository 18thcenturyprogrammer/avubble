// i was trying to use ethers for listening to event, but not my type


import * as etherHdWallet from 'ethereum-hdwallet';
import * as bip39 from 'bip39';
import * as cryptico from 'cryptico';


import React, { Component,useState, useEffect } from "react";
import { render } from "react-dom";
import { MemoryRouter as Router,Route, Routes, Navigate   } from 'react-router-dom';
import { Table,Button,Icon } from 'semantic-ui-react';
import { ethers,utils } from 'ethers';
import { add } from 'lodash';



// 14 11 5/8




const WalletDashboard = ()=>{
    console.log("WalletDashboard called");

    const [addressAndPrivKey, setAddressAndPrivKey] = useState({address:"",privKey:""});
    const [avubbleAmount , setAbubbleAmount] = useState("0");
    const [maticAmount , setMaticAmount] = useState("0");

    // mumbai
    const ALCHEMY_WEB_SOKET_URL = "wss://polygon-mumbai.g.alchemy.com/v2/Uud_P7gk4UKBPIgcNN2nV3jsEbhn1R5Z";

    // goerli
    // const ALCHEMY_WEB_SOKET_URL = "wss://eth-goerli.g.alchemy.com/v2/KXJ0iIhs-2tEIlO3kcon6D1o5mywOH37";
    
    // polygon
    // const ALCHEMY_WEB_SOKET_URL = "wss://polygon-mainnet.g.alchemy.com/v2/DFuDEgD0tnobEdjgNsitZ3wZDtksZ4Qf";
   

    var wsProvider = new ethers.providers.WebSocketProvider(ALCHEMY_WEB_SOKET_URL);

    // goerli matic contract
    // const maticContractAddress = '0xda5f92b81b7095b5763a09bd4a668dcfe6f3b133';

    // polygon matic contract
    // const maticContractAddress = '0x0000000000000000000000000000000000001010';

    // mumbai avubble contract
    const maticContractAddress = '0x0000000000000000000000000000000000001010';

    const avubbleContractAddress = '0x3e875D6994118Ad252bC4B5ee179557532Dd26Ae';

    // mumbai matic , goerli matic abi
    // const maticAbi = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"addMinter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounceMinter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"}],"name":"MinterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"}],"name":"MinterRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"}]';

    // polygon matic abi
    const maticAbi = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"setParent","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes32","name":"data","type":"bytes32"},{"internalType":"uint256","name":"expiration","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"transferWithSig","outputs":[{"internalType":"address","name":"from","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"deposit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_childChain","type":"address"},{"internalType":"address","name":"_token","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"parent","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"parentOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"currentSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"hash","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"ecrecovery","outputs":[{"internalType":"address","name":"result","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"networkId","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"EIP712_TOKEN_TRANSFER_ORDER_SCHEMA_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"disabledHashes","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokenIdOrAmount","type":"uint256"},{"internalType":"bytes32","name":"data","type":"bytes32"},{"internalType":"uint256","name":"expiration","type":"uint256"}],"name":"getTokenTransferOrderHash","outputs":[{"internalType":"bytes32","name":"orderHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"CHAINID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"EIP712_DOMAIN_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"EIP712_DOMAIN_SCHEMA_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output2","type":"uint256"}],"name":"LogTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output2","type":"uint256"}],"name":"LogFeeTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}]'
    
    // mumbai avubble abi 
    const avubbleAbi = '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"TransferSingle","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"value","type":"string"},{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"URI","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"burnBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"exists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxQtyUserMint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mintBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mintByOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mintByUser","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"setMintFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"string","name":"_uri","type":"string"}],"name":"setOneUri","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newuri","type":"string"}],"name":"setURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"uris","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]';


    let maticContract = new ethers.Contract(maticContractAddress, maticAbi, wsProvider);
    let avubbleContract = new ethers.Contract(avubbleContractAddress, avubbleAbi, wsProvider);

    // maticContract.on("Transfer", (from, to, amount, value, event) => {
    //     console.log(JSON.stringify(value));
    // });



    // event ehters js 
    // ref) https://ethereum.stackexchange.com/questions/91388/ethers-js-filters-events-only-new-events
    // ehters js docs ref) https://docs.ethers.io/v5/concepts/events/#events--logs-and-filtering
    // ref) https://ethereum.stackexchange.com/questions/136714/optimizing-backend-with-a-lot-of-ethers-js-event-listeners
    // ref) https://ethereum.stackexchange.com/questions/87643/how-to-listen-to-contract-events-using-ethers-js
    // filtering event ref) https://ethereum.stackexchange.com/questions/133844/how-to-filter-events-in-ether-js
    




    // maticContract.on("Transfer", (from, to, amount, event) => {
    //     console.log("to : ",to);
    //     console.log("amount : ",amount);
    //     console.log("from : ",from);
    // });

    // const eventResult = maticContract.filters.Transfer(null, null, null);

    // console.log("eventResult : ",eventResult);
    // console.dir(eventResult);

    



    const updateBalances = (address)=>{
        console.log("updateBalances is called ");
    
        try{
            maticContract.balanceOf(address).then((maticQty)=>{
                console.log("maticQty : ",maticQty);
                console.log("maticQty : ",maticQty.toString());
                setMaticAmount(utils.formatEther(maticQty));
            });
            
        }catch(error){
            // failed to bring matic amount
            console.log("failed to bring matic amount");
            console.log("error : ",error);
        }

        try{
            avubbleContract.balanceOf(address,0).then((avubbleQty)=>{
                console.log("avubbleQty : ",avubbleQty.toString());
                setAbubbleAmount(avubbleQty.toString());
            });   
        }catch(error){
            // failed to bring matic amount
            console.log("failed to bring matic amount");
            console.log("error : ",error);
        }
        
    };

    const startWatchEvents = (address)=>{
        var address = '0x'+address;
        console.log('address :',address);

        avubbleContract.on("TransferSingle", (operator, from, to,data) => {
            console.log("1 avubbleContract token transfered");
            console.log("1 operator : ",operator);
            console.log("1 from : ",from);
            console.log("1 to : ",to);
            console.log("1 data : ",data);
        

           if(from.toLowerCase() == address || to.toLowerCase() == address){
                console.log("2 avubbleContract token transfered");
                console.log("2 operator : ",operator);
                console.log("2 from : ",from);
                console.log("2 to : ",to);
                console.log("2 data : ",data);
                updateBalances(address);
           }
       });

       maticContract.on("LogTransfer", (token, from, to, data) => {
            
            if(from.toLowerCase() == address || to.toLowerCase() == address){

                console.log("matic token LogTransfer");
                console.log("token : ",token);
                console.log("from : ",from);
                console.log("to : ",to);
                console.log("data : ",data);
                updateBalances(address);
            }            
        });
   };

    

    useEffect(()=>{
        // if user close window, we remove password from chrome storage
        chrome.windows.onRemoved.addListener(async (tabId, windowInfo)=>{
            console.log('windows onRemoved');
            
            await chrome.windows.getAll(async ws => {
                console.log('ws.length : ',ws.length);
                if (ws.length == 0){ //last window
                    // await chrome.storage.sync.remove("password");  
                    await chrome.storage.local.remove(["password"]);  
                }      
            })
        });

        chrome.storage.sync.get(["avubble_crypted","address","password"], (result) => {
            console.log(`chrome storage avubble_crypted :  + ${result['avubble_crypted']}`);
            console.log(`chrome storage address :  + ${result['address']}`);
            console.log(`chrome storage password :  + ${result['password']}`);

            const avubble_crypted = result['avubble_crypted'];
            const address = result['address'];
            const password = result['password'];


            if(avubble_crypted != undefined && avubble_crypted != "" && address != undefined && address != "" && password != undefined && password != ""){
                var CipherText = avubble_crypted;
            

                // The length of the RSA key, in bits.
                var Bits = 1024;

                var MattsRSAkey2 = cryptico.generateRSAKey(password, Bits);
            
                var DecryptionResult = cryptico.decrypt(CipherText, MattsRSAkey2);

                console.log(`DecryptionResult : ${DecryptionResult}`);
                console.dir(DecryptionResult);

                if(DecryptionResult.status != "failure"){
                   
                    startWatchEvents(address);
                    updateBalances(address);

                    setAddressAndPrivKey({address:address,privKey:DecryptionResult.plaintext});
                }else{
                    // failed to decrypting private key
                    console.log("failed to decrypting private key");
                }

            }else{
                // failed to bring chrome extension storage values
                console.log("failed to bring chrome extension storage values");
            }



            
            
        })
    },[]);
    


    return (
        <>
            <div class="ui centered one column grid">
                <div class="row">
                    <div class="column"><h1>Wallet Dashboard</h1></div>
                </div>
                <div class="sixteen column row">
                    <div class="fourteen wide column">

                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    <h3>Address: {addressAndPrivKey.address}</h3>
                                    
                                    <h3>Priv Key: {addressAndPrivKey.privKey}</h3>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            
                            <Table.Row>
                                <Table.Cell>
                                    <h3>Avubble : {avubbleAmount}</h3>
                                    
                                </Table.Cell>   
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <h3>Matic : {maticAmount}</h3>
                                </Table.Cell>        
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                   
                                </Table.Cell>        
                            </Table.Row>
                            
                        </Table.Body>
            
                        <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell></Table.HeaderCell>

                        </Table.Row>
                        </Table.Footer>
                    </Table>
                    
                    </div>
                </div>
            </div>

        </>
    );
};

export default WalletDashboard;