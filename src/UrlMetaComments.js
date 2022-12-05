
import * as etherHdWallet from 'ethereum-hdwallet';
import * as bip39 from 'bip39';
import * as cryptico from 'cryptico';


import React, { Component,useState, useEffect } from "react";
import { render } from "react-dom";
import { MemoryRouter as Router,Route, Routes, Navigate   } from 'react-router-dom';
import { Table,Button,Icon,Form, TextArea, Message,Item,List,Image,Comment,Header,Popup, Grid, Modal,Segment,Dimmer,Loader,Input } from 'semantic-ui-react';

// react toast library
// official doc ref) https://react-hot-toast.com/docs/toast
import toast, { Toaster } from 'react-hot-toast';
import InfiniteScroll from 'react-infinite-scroll-component';

import MenuComponent from './MenuComponent';

import AddressPrivKey from './AddressPrivKey';
import WalletBalances from './WalletBalances';

import { time_ago } from './JYUtils'; 
import { add } from 'lodash';

const UrlMetaComments = ()=>{
    const { ethers, BigNumber } = require("ethers");

    const [addressAndPrivKey, setAddressAndPrivKey] = useState({address:"",privKey:""});
    
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);

    const [avbbAmount, setAvbbAmount] = useState('');
    const [maticAmount, setMaticAmount] = useState('');

    const [sendTokenModalOpened , setSendTokenModalOpened] = useState(false);
    const [tokenWhichBeSent , setTokenWhichBeSent] = useState("");
    const [toAddress , setToAddress] = useState("");
    const [estimatedGas , setEstimatedGas] = useState(0);

    const [isProcess , setIsProcess] = useState(false);

    
    

    useEffect(()=>{
        // if user close window, we remove password from chrome storage
        chrome.windows.onRemoved.addListener(async (tabId, windowInfo)=>{
        
            await chrome.windows.getAll(async ws => {
                // console.log('ws.length : ',ws.length);
                if (ws.length == 0){ //last window
                    // await chrome.storage.sync.remove("password");  
                    await chrome.storage.local.remove(["password"]);  
                }      
            })
        });


        chrome.storage.sync.get(["avubble_crypted","address","password"], (result) => {
            // console.log(`chrome storage avubble_crypted :  + ${result['avubble_crypted']}`);
            // console.log(`chrome storage address :  + ${result['address']}`);
            // console.log(`chrome storage password :  + ${result['password']}`);


            var CipherText = result['avubble_crypted'];
            var password = result['password'];

            // The length of the RSA key, in bits.
            var Bits = 1024;

            var MattsRSAkey2 = cryptico.generateRSAKey(password, Bits);
        
            var DecryptionResult = cryptico.decrypt(CipherText, MattsRSAkey2);

            // console.log(`DecryptionResult : ${DecryptionResult}`);
            // console.dir(DecryptionResult);

            if(DecryptionResult.status != "failure"){

                setAddressAndPrivKey({address:result['address'],privKey:DecryptionResult.plaintext});
            }
        })

        fetchMoreData();



    },[]);

    // get current tab url
    // ref) https://stackoverflow.com/a/14251218
    async function getCurrentTabUrl () {
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })

        // console.log("tabs");
        // console.dir(tabs);

        return tabs[0].url
    }

    const instantMsg = (msg, type)=>{

        switch (type){
            case "normal":
                toast.success(msg);
            
                break;
            case "warning":
                toast.error(msg);
            
        }
    };

    const onChangeComment = (event) => {
        const value = event.target.value;
        setComment(value);
    };

    const onClickSaveBtn = () => {
        console.log("onClickSaveBtn");

        chrome.storage.sync.get(["signature_pub_key","avubble_crypted", "address"], async (result) => {
            // console.log(`chrome storage signature_pub_key :  + ${result['signature_pub_key']}`);
            // console.log(`chrome storage avubble_crypted :  + ${result['avubble_crypted']}`);
            // console.log(`chrome storage address :  + ${result['address']}`);

            const signaturePubKey = result['signature_pub_key'];
            const avubbleCrypted = result['avubble_crypted'];
            const address =  result['address'];


            if(signaturePubKey != undefined && 
                signaturePubKey != "" && 
                avubbleCrypted != undefined && 
                avubbleCrypted != ""  && 
                address != undefined && 
                address != ""){

                const url = await getCurrentTabUrl();

                // console.log("url :",url);
                // console.log("=====");
                // console.dir(url);

                const requestOptions = {
                    method: 'POST',
                    headers: { 
                        "Access-Control-Allow-Origin": "chrome-extension://nlamdelpgnmmnkmiolepklnffnfkhmpo/*",
                        'Accept': 'application/json, text/plain',
                        'Content-Type': 'application/json;charset=UTF-8',
                    },
                    body: JSON.stringify({ content:comment,urlAddress: url ,signaturePubKey:signaturePubKey,avubbleCrypted:avubbleCrypted, address:address}),
                    mode:'cors'
                };
        
                fetch("http://127.0.0.1:8000/api/create_metacomment/",requestOptions)
                .then((response)=>{
                    // console.log("response obj : ");
                    // console.dir(response);
        
                    if(response.ok){
                        return response.json();
                    }else{
                        instantMsg("Failed to save comment","warning");
                        throw Error("Failed communication with server for saving meta comments");
                    }
                }).then((data)=>{

                    // console.log("data",data)

                    // console.log("Success saved meta comment in server");

                    instantMsg("Successfully saved","normal");
                    setComment("");
                });

            }

        });

    };
    
    const onClickCancelBtn = ()=>{
        console.log("onClickSaveBtn");

        setComment("");
    };

    const onClickUpVoteBtn = (index, id, userId)=>{
        // console.log("onClickUpVoteBtn id is :", id);
        // console.log("onClickUpVoteBtn userId is :", userId);

        doVote(index, id, "up",userId)
    };




    const onClickDownVoteBtn = (index, id,userId)=>{
        // console.log("onClickDownVoteBtn id is :", id);
        // console.log("onClickDownVoteBtn userId is :", userId);

        doVote(index, id, "down",userId)
    };


    const doVote = async (index, id, voteVal,userId)=>{
        chrome.storage.sync.get(["signature_pub_key","avubble_crypted", "address"], async (result) => {
            // console.log(`chrome storage signature_pub_key :  + ${result['signature_pub_key']}`);
            // console.log(`chrome storage avubble_crypted :  + ${result['avubble_crypted']}`);
            // console.log(`chrome storage address :  + ${result['address']}`);

            const signaturePubKey = result['signature_pub_key'];
            const avubbleCrypted = result['avubble_crypted'];
            const address =  result['address'];


            if(signaturePubKey != undefined && 
                signaturePubKey != "" && 
                avubbleCrypted != undefined && 
                avubbleCrypted != ""  && 
                address != undefined && 
                address != ""){

                
                const requestOptions = {
                    method: 'POST',
                    headers: { 
                        "Access-Control-Allow-Origin": "chrome-extension://nlamdelpgnmmnkmiolepklnffnfkhmpo/*",
                        'Accept': 'application/json, text/plain',
                        'Content-Type': 'application/json;charset=UTF-8',
                    },
                    body: JSON.stringify({ metaComment:id,voteVal:voteVal,toWhom:userId,signaturePubKey:signaturePubKey,avubbleCrypted:avubbleCrypted, address:address}),
                    mode:'cors'
                };
        
                fetch("http://127.0.0.1:8000/api/do_vote_view/",requestOptions)
                .then((response)=>{
                    // console.log("response obj : ");
                    // console.dir(response);
        
                    if(response.ok){
                        return response.json();
                    }else{
                        instantMsg("Failed to save vote","warning")
                        throw Error("Failed communication with server for saving vote");
                    }
                }).then((data)=>{
        
                    // console.log("data",data)
                    // console.log("Success saved vote in server");

                    setComments((prevState)=>{
                        prevState[index].voteObj.voteVal = voteVal;

                        // object passed by reference, so if i want to refresh component
                        // i can't pass objected which has changed value. i have to pass new object which has changed value
                        // https://www.javascripttutorial.net/object/3-ways-to-copy-objects-in-javascript/
                        const updatedComments = JSON.parse(JSON.stringify(prevState));;

                        return updatedComments
                    })
        
                    instantMsg("Successfully voted","normal");
                });
            }
        });
    };




    const fetchMoreData = async () =>{
        console.log("fetchMoreData called");

        const url = await getCurrentTabUrl();

        
        chrome.storage.sync.get(["address"], async (result) => {
            const userAddress = result['address'] ? result['address']:""

            const requestOptions = {
                method: 'GET',
                headers: { 
                    "Access-Control-Allow-Origin": "chrome-extension://nlamdelpgnmmnkmiolepklnffnfkhmpo/*",
                    'Accept': 'application/json, text/plain',
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                mode:'cors'
            };
    
            // pass query params ref) https://stackoverflow.com/a/37230594
            fetch(`http://127.0.0.1:8000/api/get_metacomment_list_by_upVote_view/?urlAddress=${encodeURIComponent(url)}&userAddress=${userAddress}`,requestOptions)
            .then((response)=>{
                // console.log("response obj : ");
                // console.dir(response);
    
                if(response.ok){
                    return response.json();
                }else{
                    if(response.status == 404 ){
                        instantMsg("Not found","normal");
                    }else{
                        instantMsg("Failed to bring comments","warning");
                        throw Error("Failed communication with server for getting list of meta comments");
                    }
                }
            }).then((data)=>{
    
                // console.log("data.results",data.results)
                // console.log("===========")
                // console.dir(data.results);
    
                setComments(data.results);
    
                // console.log("Success getting comments from server");
    
                
            });
            
        });

    };

    
    const convertDatetimeStr = (createdStr)=>{
        return time_ago(createdStr)
    };
    
    const onChangeAvbbAmount = (event)=>{
        
        // console.log("onChangeAvbbAmount is called");

        const value = event.target.value;

        setAvbbAmount(value);
    
        // console.log("value is :",value);
            
    };

    const onChangeMaticAmount = (event)=>{
        
        // console.log("onChangeMaticAmount is called");

        const value = event.target.value;

        setMaticAmount(value);
        
        // console.log("value is :",value);
    };

    const getChromeStorageValues = async (key) => {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(["avubble_crypted", "password","address"], async (result) => {
                const avubbleCrypted = result['avubble_crypted'];
                const password =  result['password'];
                const address =  result['address'];

                if(avubbleCrypted != undefined && 
                    avubbleCrypted != "" && 
                    password != undefined && 
                    password != "" &&
                    address != undefined && 
                    address != ""){
                    
                    resolve({avubbleCrypted:avubbleCrypted,password:password,address:address});
                } else {
                    reject();
                
                }
          });
        });
      };

    const getEstimatedGas = async (chromeStorageValues,receiverAddress, tokenTicker,amountToBeSent)=>{
        return new Promise(async (resolve, reject) => {
            const avubbleCrypted = chromeStorageValues.avubbleCrypted;
            const password = chromeStorageValues.password;
            var address = chromeStorageValues.address;

            console.log("getEstimatedGas is called");
        
            console.log("2");

            // The length of the RSA key, in bits.
            var Bits = 1024; 
            
            var MattsRSAkey = cryptico.generateRSAKey(password, Bits);
            
            var DecryptionResult = cryptico.decrypt(avubbleCrypted, MattsRSAkey);
            // console.log("DecryptionResult :",DecryptionResult)
            // console.log("DecryptionResult.plaintext :",DecryptionResult.plaintext)

            const privKey = DecryptionResult.plaintext;
        

            try {

                console.log("3");
                

                address = "0x"+address

                var abi ;
                if(tokenTicker == "MATIC"){
                    abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"setParent","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes32","name":"data","type":"bytes32"},{"internalType":"uint256","name":"expiration","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"transferWithSig","outputs":[{"internalType":"address","name":"from","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"deposit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_childChain","type":"address"},{"internalType":"address","name":"_token","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"parent","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"parentOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"currentSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"hash","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"ecrecovery","outputs":[{"internalType":"address","name":"result","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"networkId","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"EIP712_TOKEN_TRANSFER_ORDER_SCHEMA_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"disabledHashes","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokenIdOrAmount","type":"uint256"},{"internalType":"bytes32","name":"data","type":"bytes32"},{"internalType":"uint256","name":"expiration","type":"uint256"}],"name":"getTokenTransferOrderHash","outputs":[{"internalType":"bytes32","name":"orderHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"CHAINID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"EIP712_DOMAIN_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"EIP712_DOMAIN_SCHEMA_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output2","type":"uint256"}],"name":"LogTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output2","type":"uint256"}],"name":"LogFeeTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];
                }else{
                    abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"TransferSingle","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"value","type":"string"},{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"URI","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"burnBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"exists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxQtyUserMint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mintBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mintByOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mintByUser","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"setMintFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"string","name":"_uri","type":"string"}],"name":"setOneUri","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newuri","type":"string"}],"name":"setURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"uris","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];
                }
                
                
                // maticContractAddress '0x0000000000000000000000000000000000001010';
                // avbbContractAddress "0x3e875D6994118Ad252bC4B5ee179557532Dd26Ae";

                var contractAddress;
                if(tokenTicker == "MATIC"){
                    contractAddress = '0x0000000000000000000000000000000000001010';

                }else{
                    contractAddress =  "0x3e875D6994118Ad252bC4B5ee179557532Dd26Ae";
                }
                
                console.log("contractAddress : ", contractAddress);

                const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/Uud_P7gk4UKBPIgcNN2nV3jsEbhn1R5Z");
                const tokenContract = new ethers.Contract(contractAddress,abi,provider);
                
                const wallet = new ethers.Wallet(privKey);

                const connectedWallet = wallet.connect(provider);

                console.log("4");
                
                const gasData = await provider.getFeeData();

                // 'replacement fee too low' error kept being raised, so i had to jack up the gas
        
                // if i follow eip 1559, i can't override gasprice option
                // maxFeePerGas must be higher than maxPriorityFeePerGas
                // 50 40
                const mulMaxFeePerGas = gasData.maxFeePerGas.mul(BigNumber.from(10));
                const mulMaxPriorityFeePerGas = gasData.maxPriorityFeePerGas.mul(BigNumber.from(10));
                
                var params;
                if(tokenTicker == "MATIC"){
                    params = {
                        transfer: 0,
                        to:toAddress,
                        value:amountToBeSent
                    };
                }else{
                    params = {
                        from: address,
                        to:toAddress,
                        id:0,
                        amount:amountToBeSent,
                        data: "0x"
                    };
                }
                


                var options;

                if(tokenTicker == "MATIC"){
                    // normal gasLimit is 21000 , but not worked ,so i changed it to this
                    options = {
                        value: 0,
                        gasLimit:ethers.utils.hexlify(100000),
                        maxFeePerGas:mulMaxFeePerGas,
                        maxPriorityFeePerGas:mulMaxPriorityFeePerGas,
                        nonce: await provider.getTransactionCount(address)
                    };
                }else{
                    options = {
                        value: 0,
                        gasLimit:ethers.utils.hexlify(100000),
                        maxFeePerGas:mulMaxFeePerGas,
                        maxPriorityFeePerGas:mulMaxPriorityFeePerGas,
                        nonce: await provider.getTransactionCount(address)
                    };
                }

                console.log("5");
                console.log("address :",address);
                console.log("receiverAddress :",receiverAddress);
                
                
                // send transaction with value
                // ref) https://vsupalov.com/ethers-call-payable-solidity-function/
                var foundEstimatedGas;

                if(tokenTicker == "MATIC"){
                    
                    foundEstimatedGas = await tokenContract.connect(connectedWallet).estimateGas.transfer("0x"+receiverAddress,amountToBeSent);

                }else{
                    foundEstimatedGas = await tokenContract.connect(connectedWallet).estimateGas.safeTransferFrom(address,"0x"+receiverAddress,0,amountToBeSent,"0x", options);
                } 

                console.log("foundEstimatedGas.toNumber() : ",foundEstimatedGas.toNumber());
                console.dir(foundEstimatedGas);

                // if(tokenWhichBeSent == "MATIC"){
                //     // normal gasLimit is 21000 , but not worked ,so i changed it to this
                //     foundEstimatedGas = await tokenContract.connect(connectedWallet).estimateGas.transfer(params, options);

                // }else{
                //     foundEstimatedGas = await tokenContract.connect(connectedWallet).estimateGas.safeTransferFrom(params, options);
                // } 
            
                console.log("6");

                // convert wei into eth in ethers js
                // ref) https://ethereum.stackexchange.com/a/111662
                setEstimatedGas(ethers.utils.formatEther(foundEstimatedGas.toNumber()));

                resolve();
            } catch (error) {
                
                console.dir(error);
                reject();
            }
        })
   
    };

    const backToDefaultSendToken = ()=>{
        setAvbbAmount("");
        setMaticAmount("");
        setTokenWhichBeSent("");
        setToAddress("");
        setEstimatedGas("");
    };

    const onClickSendToken = async (tokenTicker, toAddress)=>{
        console.log("onClickSendToken call token ticker :", tokenTicker);

        setToAddress(toAddress);
        setTokenWhichBeSent(tokenTicker);

        var chromeStrorageValues;
        try{
            setIsProcess(true);
            chromeStrorageValues = await getChromeStorageValues();

            var amountToBeSent;
            if(tokenTicker == "MATIC"){
                
                const tempMaticAmount = parseFloat(maticAmount);
                console.log("tempMaticAmount matic is :", tempMaticAmount);
                console.log("tempMaticAmount type is :", typeof(tempMaticAmount));

                if(tempMaticAmount){
                    try{
                        setMaticAmount(tempMaticAmount);
                        amountToBeSent =  ethers.utils.parseUnits(tempMaticAmount.toString(),"ether");
                        await getEstimatedGas(chromeStrorageValues,toAddress, tokenTicker,amountToBeSent);
                        setIsProcess(false);
                        setSendTokenModalOpened(true);
                    }catch(e){
                        console.log("e :",e);
                        console.dir(e);
                        setIsProcess(false);
                        instantMsg("Failed to send token.\nCheck what you entered or your balance", "warning");
                    }
                }else{
                    // user enter not float number
                    setIsProcess(false);
                    instantMsg("Please enter float number", "warning");
                }

                
                
            }else{
                
                const amountToBeSent = parseInt(avbbAmount);
                console.log("amountToBeSent avbb is :", amountToBeSent);
                console.log("amountToBeSent type is :", typeof(amountToBeSent));
                console.dir(amountToBeSent);

                if(amountToBeSent){
                    try{
                        setAvbbAmount(amountToBeSent);
                        await getEstimatedGas(chromeStrorageValues,toAddress, tokenTicker,amountToBeSent.toString());
                        setIsProcess(false);
                        setSendTokenModalOpened(true);
                    }catch(e){
                        console.log("e :",e);
                        console.dir(e);
                        setIsProcess(false);
                        instantMsg("Failed to send token.\nCheck what you entered or your balance", "warning");
                    }
                }else{
                    // user didn't enter integer

                    setIsProcess(false);
                    instantMsg("Please enter integer number", "warning");
                }

                
            }

            

        }catch(e){
            console.log("e :",e);
            console.dir(e);
            setIsProcess(false);
            instantMsg("Failed to send token.\nCheck balance you have enough balaces", "warning");
        }
    
        
        // await getEstimatedGas(toAddress, tokenTicker);
        // setSendTokenModalOpened(true);
        
    };

    const sendToken = () => {
        setIsProcess(true);
        chrome.storage.sync.get(["avubble_crypted", "password","address"], async (result) => {
            const avubbleCrypted = result['avubble_crypted'];
            const password =  result['password'];
            var address =  result['address'];
    
    
            if(avubbleCrypted != undefined && 
                avubbleCrypted != "" && 
                password != undefined && 
                password != "" &&
                address != undefined && 
                address != ""){
                    // The length of the RSA key, in bits.
                    var Bits = 1024; 
                    
                    var MattsRSAkey = cryptico.generateRSAKey(password, Bits);
                   
                    var DecryptionResult = cryptico.decrypt(avubbleCrypted, MattsRSAkey);
                    // console.log("DecryptionResult :",DecryptionResult)
                    // console.log("DecryptionResult.plaintext :",DecryptionResult.plaintext)
    
                    const privKey = DecryptionResult.plaintext;

                    try {
                        
                        address = "0x"+address
            
                        var abi ;
                        if(tokenWhichBeSent == "MATIC"){
                            abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"setParent","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes32","name":"data","type":"bytes32"},{"internalType":"uint256","name":"expiration","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"transferWithSig","outputs":[{"internalType":"address","name":"from","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"deposit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_childChain","type":"address"},{"internalType":"address","name":"_token","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"parent","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"parentOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"currentSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"hash","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"ecrecovery","outputs":[{"internalType":"address","name":"result","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"networkId","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"EIP712_TOKEN_TRANSFER_ORDER_SCHEMA_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"disabledHashes","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokenIdOrAmount","type":"uint256"},{"internalType":"bytes32","name":"data","type":"bytes32"},{"internalType":"uint256","name":"expiration","type":"uint256"}],"name":"getTokenTransferOrderHash","outputs":[{"internalType":"bytes32","name":"orderHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"CHAINID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"EIP712_DOMAIN_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"EIP712_DOMAIN_SCHEMA_HASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output2","type":"uint256"}],"name":"LogTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output2","type":"uint256"}],"name":"LogFeeTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];
                        }else{
                            abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"TransferSingle","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"value","type":"string"},{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"URI","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"burnBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"exists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxQtyUserMint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mintBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mintByOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mintByUser","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"setMintFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"string","name":"_uri","type":"string"}],"name":"setOneUri","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newuri","type":"string"}],"name":"setURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"uris","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];
                        }
                        
                        
                        // maticContractAddress '0x0000000000000000000000000000000000001010';
                        // avbbContractAddress "0x3e875D6994118Ad252bC4B5ee179557532Dd26Ae";
                        const contractAddress = tokenWhichBeSent == "MATIC"? '0x0000000000000000000000000000000000001010' : "0x3e875D6994118Ad252bC4B5ee179557532Dd26Ae";
            
                        const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/Uud_P7gk4UKBPIgcNN2nV3jsEbhn1R5Z");
                        const tokenContract = new ethers.Contract(contractAddress,abi,provider);
                       
                        const wallet = new ethers.Wallet(privKey);
            
                        const connectedWallet = wallet.connect(provider);
    
                        
                        const gasData = await provider.getFeeData();
            
                        // 'replacement fee too low' error kept being raised, so i had to jack up the gas
                
                        // if i follow eip 1559, i can't override gasprice option
                        // maxFeePerGas must be higher than maxPriorityFeePerGas
                        const mulMaxFeePerGas = gasData.maxFeePerGas.mul(BigNumber.from(50));
                        const mulMaxPriorityFeePerGas = gasData.maxPriorityFeePerGas.mul(BigNumber.from(40));
                        
                        var options;

                        if(tokenWhichBeSent == "MATIC"){
                            // normal gasLimit is 21000 , but not worked ,so i changed it to this
                            options = {
                                value: 0,
                                gasLimit:ethers.utils.hexlify(1000000),
                                maxFeePerGas:mulMaxFeePerGas,
                                maxPriorityFeePerGas:mulMaxPriorityFeePerGas,
                                nonce: await provider.getTransactionCount(address)
                            };
                        }else{
                            options = {
                                value: 0,
                                gasLimit:ethers.utils.hexlify(1000000),
                                maxFeePerGas:mulMaxFeePerGas,
                                maxPriorityFeePerGas:mulMaxPriorityFeePerGas,
                                nonce: await provider.getTransactionCount(address)
                            };
                        }

                        
                        
                        // send transaction with value
                        // ref) https://vsupalov.com/ethers-call-payable-solidity-function/
                        var result;

                        // if(tokenWhichBeSent == "MATIC"){
                        //     // normal gasLimit is 21000 , but not worked ,so i changed it to this
                        //     result = await tokenContract.connect(connectedWallet).transfer(maticAmount,"0x"+toAddress,"0x", options);;
                        // }else{
                        //     result = await tokenContract.connect(connectedWallet).safeTransferFrom(address,"0x"+toAddress,0,avbbAmount,"0x", options);
                        // } 

                        if(tokenWhichBeSent == "MATIC"){
                            const amountInWei = ethers.utils.parseUnits(maticAmount.toString(),"ether")

                            // actually matic is going into matic contract. not to wallet https://ethereum.stackexchange.com/a/94254
                            result = await tokenContract.connect(connectedWallet).transfer(toAddress,amountInWei, options);;
                        }else{
                            result = await tokenContract.connect(connectedWallet).safeTransferFrom(address,toAddress,0,avbbAmount,"0x", options);
                        } 
                        
                        const txReceipt = await result.wait();
    
                        console.log("txReceipt : ", txReceipt);
                        console.dir(txReceipt);
    
                        if(txReceipt.blockNumber){
                            setIsProcess(false);
                            instantMsg("Successfully transferred","normal");
    
                        }
    
                    } catch (error) {
                        
                        console.dir(error);
                        setIsProcess(false);
                        instantMsg("Failed minted","warning");
    
                    }

            }else{
                setIsProcess(false);
                return ""
            }
        })

        
    
    };

    return (
        <>
            <Segment>
                <Dimmer active={isProcess}>
                    <Loader size='huge'>Processing</Loader>
                </Dimmer>
            <div class="ui centered one column grid">
                <div class="row">
                    <div class="column"><MenuComponent selectedMenu='url_meta_comment'/></div>
                </div>
                
                <div class="column row">
                    <div class="column">

                    <Toaster/>

                    <Modal
                        onClose={() =>{
                            setEstimatedGas(0);
                            setSendTokenModalOpened(false)
                        }}
                        onOpen={() => {setSendTokenModalOpened(true)}}
                        open={sendTokenModalOpened}
                        >
                        <Modal.Header>Send {tokenWhichBeSent}</Modal.Header>
                        <Modal.Content image>
                            {tokenWhichBeSent =="MATIC"?<Image size='medium' src='/imgs/matic_token.jpg' wrapped />:<Image size='medium' src='/imgs/avbb_token.png' wrapped />}
                            
                            <Modal.Description>
                            <Header>Send {tokenWhichBeSent}</Header>
                            <p>
                                send {tokenWhichBeSent} to address: '{toAddress}'
                            </p>
                            <p>Estimated gas : {estimatedGas} Matic</p>
                            <p>Amount : {tokenWhichBeSent =="MATIC"? maticAmount: avbbAmount} {tokenWhichBeSent}</p>
                            </Modal.Description>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button secondary onClick={() => {
                                backToDefaultSendToken();
                                setSendTokenModalOpened(false);
                                }}>Cancel</Button>
                            <Button
                                content="Send"
                                labelPosition='right'
                                icon='checkmark'
                                onClick={() => {
                                    sendToken();
                                    backToDefaultSendToken();
                                    setSendTokenModalOpened(false);
                                }}
                                positive
                            />
                        </Modal.Actions>
                    </Modal>
                    
                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    <AddressPrivKey addressAndPrivKey={addressAndPrivKey} /><WalletBalances addressAndPrivKey={addressAndPrivKey}/>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                    </Table>

                
                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                <h1>Url Meta Comments</h1>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            
                            <Table.Row>
                                <Table.Cell>
                                <Form>
                                    <TextArea 
                                        placeholder='Your comment...' 
                                        style={{ minHeight: 100 }} 
                                        value={comment} 
                                        onChange={onChangeComment}
                                    />
                                </Form>
                                                                    
                                </Table.Cell>   
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <Button primary onClick={onClickSaveBtn}>Save</Button>
                                    <Button secondary onClick={onClickCancelBtn}>Cancel</Button>
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
                    {/* <div class="one wide column"></div> */}


                </div>
                <div class="column row">
                    <div class="column">

                    {/* infinite scroll ref) https://www.npmjs.com/package/react-infinite-scroll-component */}
                    <InfiniteScroll
                    dataLength={comments.length}
                    next={fetchMoreData}
                    hasMore={true}
                    hasChildren={true}
                    loader={<h4></h4>}
                    >

                        <Comment.Group>
                            <Header as='h3' dividing>
                            Comments
                            </Header>

                            {comments.map((i, index) => (
                                <>
                                    <Comment>
                                        <Comment.Content>
                                        <Popup on={['click']} trigger={<Comment.Author as='a'>{smartTrim(i.userObj.walletAddress,8)}</Comment.Author>} flowing hoverable>
                                            <Grid centered divided columns={2}>
                                            <Grid.Column textAlign='center'>
                                                <Header as='h4'>Send AVBB</Header>
                                                <p>
                                                <Input
                                                    autoComplete='off'
                                                    size= 'mini'
                                                    type='text'
                                                    placeholder='Enter amount...'
                                                    name="avbbAmount" 
                                                    value={avbbAmount}
                                                    onKeyPress={(event) => {
                                                        if (!/[0-9]/.test(event.key)) {
                                                          event.preventDefault();
                                                        }
                                                      }} 
                                                    onChange={onChangeAvbbAmount}/> <br/>AVBB<br/> 
                                                    to this address
                                                </p>
                                                <Button primary onClick={()=>{onClickSendToken("AVBB",i.userObj.walletAddress)}}>Send</Button>
                                            </Grid.Column>
                                            <Grid.Column textAlign='center'>
                                                <Header as='h4'>Send MATIC</Header>
                                                <p>
                                                <Input
                                                    autoComplete='off'
                                                    size= 'mini' 
                                                    type='text'
                                                    placeholder='Enter amount...'
                                                    name="maticAmount" 
                                                    value={maticAmount}
                                                    onKeyPress={(event) => {
                                                        if (!/[0-9\.]/.test(event.key)) {
                                                          event.preventDefault();
                                                        }
                                                      }} 
                                                    onChange={onChangeMaticAmount}/> <br/>Matic<br /> 
                                                    to this address
                                                </p>
                                                <Button primary onClick={()=>{onClickSendToken("MATIC",i.userObj.walletAddress)}}>Send</Button>
                                            </Grid.Column>
                                            </Grid>
                                        </Popup>











                                            













                                            <Comment.Metadata>
                                            <div>{i.userObj.created?convertDatetimeStr(i.userObj.created):""}</div>


                                            {/* <div>{i.userObj.created?()=>{
                                                

                                                const temp = new Date(i.userObj.created);
                                                console.log("i.userObj.created :",i.userObj.created);
                                                console.log("temp.toLocaleFormat('%d-%b-%Y') :",temp.toLocaleFormat('%d-%b-%Y'));

                                                return temp.toLocaleFormat('%d-%b-%Y');
                                            }:""}</div> */}
                                            </Comment.Metadata>
                                            <Comment.Text>{i.content}</Comment.Text>
                                            <Comment.Actions>
                                            <Comment.Action onClick={()=>{onClickUpVoteBtn(index,i.id,i.user)}}><Icon name={i.voteObj.voteVal=="up"?'thumbs up': 'thumbs up outline'}/> {i.upVote}</Comment.Action>
                                            <Comment.Action onClick={()=>{onClickDownVoteBtn(index,i.id,i.user)}}><Icon name={i.voteObj.voteVal=="down"?'thumbs down': 'thumbs down outline'}/> {i.downVote}</Comment.Action>
                                            
                                            </Comment.Actions>
                                        </Comment.Content>
                                    </Comment>
                                    <div class="ui divider"></div>
                                </>
                            ))}

                            
                        </Comment.Group>

                    </InfiniteScroll>

                    </div>
                </div>
            </div>
            </Segment>
        </>
    );
};


export default UrlMetaComments;


// ellipsis string ref) https://stackoverflow.com/a/831583
function smartTrim(string, maxLength) {
    if (!string) return string;
    if (maxLength < 1) return string;
    if (string.length <= maxLength) return string;
    if (maxLength == 1) return string.substring(0,1) + '...';

    var midpoint = Math.ceil(string.length / 2);
    var toremove = string.length - maxLength;
    var lstrip = Math.ceil(toremove/2);
    var rstrip = toremove - lstrip;
    return string.substring(0, midpoint-lstrip) + '...' 
    + string.substring(midpoint+rstrip);
} 