import * as cryptico from 'cryptico';



import React, { Component,useState, useEffect } from "react";
import { render } from "react-dom";
import { MemoryRouter as Router,Route, Routes, Navigate   } from 'react-router-dom';
import { Table,Button,Icon,Form, TextArea, Message,Item,List,Image,Comment,Header,Modal,Segment,Dimmer,Loader } from 'semantic-ui-react';
import { Toaster ,toast } from 'react-hot-toast';
import InfiniteScroll from 'react-infinite-scroll-component';

import MenuComponent from './MenuComponent';
import AddressPrivKey from './AddressPrivKey';
import WalletBalances from './WalletBalances';

import { time_ago } from './JYUtils';



const Content = ()=>{
    
    const [addressAndPrivKey, setAddressAndPrivKey] = useState({address:"",privKey:""});
    
    const [websiteToggleBtnsStatus, setWebsiteToggleBtnsStatus] = useState([
        {name:'twitter',label:'Twitter', status:false},
        {name:'itssa',label:'It ssa', status:false}, 
        {name:'missy_coupon',label:'Missy coupon', status:false},
        {name:'ddanzi',label:'Ddanzi', status:false}

    ]);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image1, setImage1] = useState();
    const [contents, setContents] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);

    const [selectedContentId,setSelectedContentId] = useState(-1);

    const [isMintProcess, setIsMintProcess] = useState(false);

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


            var CipherText = result['avubble_crypted'];
            var password = result['password'];

            // The length of the RSA key, in bits.
            var Bits = 1024;

            var MattsRSAkey2 = cryptico.generateRSAKey(password, Bits);
        
            var DecryptionResult = cryptico.decrypt(CipherText, MattsRSAkey2);

            console.log(`DecryptionResult : ${DecryptionResult}`);
            console.dir(DecryptionResult);

            if(DecryptionResult.status != "failure"){

                setAddressAndPrivKey({address:result['address'],privKey:DecryptionResult.plaintext});
            }
        })

        fetchMoreData();

    },[]);


    const instantMsg = (msg, type)=>{

        switch (type){
            case "normal":
                toast.success(msg);
            
                break;
            case "warning":
                toast.error(msg);
        }
    };

    const onChangeTitle = (event)=>{
        const value = event.target.value;
        setTitle(value);
    };


    const onChangeContent = (event) => {
        const value = event.target.value;
        setContent(value);
    };

    const onImage1Change = (event) =>{
        console.log("onImage1Change called");

        const file = event.target.files[0];

        console.log("============= file =================");
        console.dir(file);

        if(file){
            if (isFileImage(file)){
                // image file

                if(isRightSizeImage(file)){
                    // rigth size

                    setImage1(file);
                }else{
                    instantMsg('File size should be smaller than 1 MB','warning');
                    setImage1(null);
                }
    
                
            }else{
                instantMsg('File is not image file','warning')
                setImage1(null);
            }
        }else{
            setImage1(null);
        }
    }



    const onClickSaveBtn = () => {
        console.log("onClickSaveBtn");

        if (!title || !content){
            instantMsg("Title and content fields have to be filled", "warning");
        }else{
            console.log("title and content are not empty");

            
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

                    const data = new FormData();
                    data.append("signaturePubKey",signaturePubKey);
                    data.append("avubbleCrypted",avubbleCrypted);
                    data.append("address",address);
                   
                    data.append("title", title);
                    data.append("content", content);
                    
                    console.log("typeOf image1",typeof(image1));
                    if(typeof(image1) != "undefined"){
                        
                        data.append("image1", image1);
                    }
                    
        
                    const requestOptions = {
                        method: 'POST',
                        headers: { 
                            "Access-Control-Allow-Origin": "chrome-extension://nlamdelpgnmmnkmiolepklnffnfkhmpo/*",
                            'Accept': 'application/json, text/plain'
                        },
                        body: data,
                        mode:'cors'
                    };
            
                    fetch("http://127.0.0.1:8000/api/create_content/",requestOptions)
                    .then((response)=>{
                        console.log("response obj : ");
                        console.dir(response);
            
                        if(response.ok){
                            return response.json();
                        }else{
                            instantMsg("Failed to save content","warning");
                        
                            throw Error("Failed communication with server for saving content");
                        }
                    }).then((data)=>{

                        console.log("data",data)

                        console.log("Success saved content in server");

                        instantMsg("Successfully saved","normal");
                        
                        setTitle("");
                        setContent("");
                        setImage1(null);
                    });

                }

            });
        }

    };
    
    const onClickCancelBtn = ()=>{
        console.log("onClickSaveBtn");
        
        setComment("");
    };




    const fetchMoreData = async () =>{
        console.log("fetchMoreData called");

        
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
            fetch(`http://127.0.0.1:8000/api/get_content_list_by_user_recent/?userAddress=${userAddress}`,requestOptions)
            .then((response)=>{
                console.log("response obj : ");
                console.dir(response);
    
                if(response.ok){
                    return response.json();
                }else{
                    if(response.status == 404 ){
                        instantMsg("Not found","normal");
                    }else{
                        instantMsg("Failed to bring contents","warning");
                        throw Error("Failed communication with server for getting list of contents");
                    }
                }
            }).then((data)=>{
    
                console.log("data.results",data.results)
    
                console.log("===========")
                console.dir(data.results);
    
                setContents(data.results);
    
                console.log("Success getting contents from server");
    
                
            });
            
        });

    };

    const onClickWebsiteToggleBtn = (index)=>{
        setWebsiteToggleBtnsStatus(prev => {
            prev[index].status= !prev[index].status;

            console.dir(prev);

            return JSON.parse(JSON.stringify(prev));;
        })

    };

    const getWebsiteToggleBtns  = ()=>{

                const btnGroup = [];

                for (const [index, btn] of Object.entries(websiteToggleBtnsStatus)) {
                    btnGroup.push(
                        <Button toggle active={btn.status} onClick={()=>{onClickWebsiteToggleBtn(index)}}>
                        {btn.label}
                        </Button>
                    )
                    
                }
                return btnGroup;
    };

    const onClickPostBtn = async (contentId,title, content, img1_url, walletAddress, isMinted)=>{

        var tempContent = content +"\nWallet: "+walletAddress

        if(isMinted){
            tempContent = tempContent +"\nNFT: "+ "https://testnets.opensea.io/assets/mumbai/0x3e875d6994118ad252bc4b5ee179557532dd26ae/"+contentId;
        }

        tempContent += "\nDo Vote: http://127.0.0.1:8000/content/get/"+contentId;

        navigator.clipboard.writeText(tempContent).then(async ()=>{
            
            const data = {title:title, content:tempContent, img1_url:img1_url};

            console.log("img1 url", img1_url);

            if(img1_url != ""){
            

                const elementsUrl = img1_url.split("/");
        
                const filename = elementsUrl[elementsUrl.length-1]; 
        
        
                await chrome.downloads.download(
                    {
                        filename:"avubble/"+filename,
                        url: img1_url
                    }
                );
            }

            for (let [index, websiteBtn] of Object.entries(websiteToggleBtnsStatus)){
                if (websiteBtn.status){
                    await chrome.runtime.sendMessage({actionType:"post",website:websiteBtn.name, data:data}, ()=>{});
                }
            }

        });      
    };

    const onClickMintNFT = (id)=>{
        console.log("onClickMintNFT called . id :",id);

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

                const data = new FormData();
                data.append("signaturePubKey",signaturePubKey);
                data.append("avubbleCrypted",avubbleCrypted);
                data.append("address",address);
                data.append("contentId", id);
                
    
                const requestOptions = {
                    method: 'POST',
                    headers: { 
                        "Access-Control-Allow-Origin": "chrome-extension://nlamdelpgnmmnkmiolepklnffnfkhmpo/*",
                        'Accept': 'application/json, text/plain'
                    },
                    body: data,
                    mode:'cors'
                };
        
                fetch("http://127.0.0.1:8000/api/create_nft/",requestOptions)
                .then((response)=>{
                    console.log("response obj : ");
                    console.dir(response);
        
                    if(response.ok){
                        return response.json();
                    }else{
                        instantMsg("Failed to mint NFT","warning");
                        setIsMintProcess(false);
                        
                        throw Error("Failed communication with server for minting NFT");
                    }
                }).then((data)=>{

                    console.log("data",data)

                    console.log("Success pre process for minting NFT");

                    if(data.status == "success" && data.msg == "nft preparation completed"){
                        setSelectedContentId(id)
                        setModalOpen(true)
                    }


                });

            }

        });

    };

    const mintNft = ()=>{
        setModalOpen(false);
        setIsMintProcess(true);

        chrome.storage.sync.get(["avubble_crypted", "password"], async (result) => {
            const avubbleCrypted = result['avubble_crypted'];
            const password =  result['password'];
    
    
            if(avubbleCrypted != undefined && 
                avubbleCrypted != "" && 
                password != undefined && 
                password != ""){
                    // The length of the RSA key, in bits.
                    var Bits = 1024; 
                    
                    var MattsRSAkey = cryptico.generateRSAKey(password, Bits);
                   
                    var DecryptionResult = cryptico.decrypt(avubbleCrypted, MattsRSAkey);
                    console.log("DecryptionResult :",DecryptionResult)
                    console.log("DecryptionResult.plaintext :",DecryptionResult.plaintext)
    
                    transactOnContract(DecryptionResult.plaintext);
            }else{
                return ""
            }
        })
    };







    const updateContentAsMinted = (id)=>{
        console.log("updateContentAsMinted called . id :",id);

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

                const data = new FormData();
                data.append("signaturePubKey",signaturePubKey);
                data.append("avubbleCrypted",avubbleCrypted);
                data.append("address",address);
                data.append("contentId", id);
                
    
                const requestOptions = {
                    method: 'PUT',
                    headers: { 
                        "Access-Control-Allow-Origin": "chrome-extension://nlamdelpgnmmnkmiolepklnffnfkhmpo/*",
                        'Accept': 'application/json, text/plain'
                    },
                    body: data,
                    mode:'cors'
                };
        
                fetch("http://127.0.0.1:8000/api/update_content_as_minted/",requestOptions)
                .then((response)=>{
                    console.log("response obj : ");
                    console.dir(response);
        
                    if(response.ok){
                        return response.json();
                    }else{
                        instantMsg("Failed to mint NFT","warning");
                        setIsMintProcess(false);
                        
                        throw Error("Failed communication with server for minting NFT");
                    }
                }).then((data)=>{

                    console.log("data",data)

                    console.log("Success pre process for minting NFT");

                    if(data.status == "success" && data.msg == "updated"){
                        
                        instantMsg("Successfully minted","normal");

                    }

                    setIsMintProcess(false);
                    setSelectedContentId(-1);

                });

            }

        });

    };















    
    const transactOnContract = (privKey) => {
        console.log("before mint nft selectedContentId : ",selectedContentId);
        console.log("before mint nft privKey : ",privKey);
        
        chrome.storage.sync.get(["address"], async (result) => {
            var address = result['address'];
            
            if(address != undefined && address != ""){


                try {
                    const { ethers, BigNumber } = require("ethers");

                    address = "0x"+address
        
                    const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"TransferSingle","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"value","type":"string"},{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"URI","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"burnBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"exists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxQtyUserMint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mintBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mintByOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mintByUser","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"setMintFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"string","name":"_uri","type":"string"}],"name":"setOneUri","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newuri","type":"string"}],"name":"setURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"uris","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];
                    const contractAddress = "0x3e875D6994118Ad252bC4B5ee179557532Dd26Ae";
        
                    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/Uud_P7gk4UKBPIgcNN2nV3jsEbhn1R5Z");
                    const avubbleNftContract = new ethers.Contract(contractAddress,abi,provider);
        

                    const params ={
                        account:address,
                        id:selectedContentId,
                        amount:1
                    };
                   
                    const wallet = new ethers.Wallet(privKey);
        
                    const connectedWallet = wallet.connect(provider);

                    
                    const gasData = await provider.getFeeData();
        
                    // 'replacement fee too low' error kept being raised, so i had to jack up the gas
            
                    // if i follow eip 1559, i can't override gasprice option
                    // maxFeePerGas must be higher than maxPriorityFeePerGas
                    const mulMaxFeePerGas = gasData.maxFeePerGas.mul(BigNumber.from(50));
                    const mulMaxPriorityFeePerGas = gasData.maxPriorityFeePerGas.mul(BigNumber.from(40));
                    

                    // normal gasLimit is 21000 , but not worked ,so i changed it to this
                    const options = {
                        value: ethers.utils.parseUnits(0.001.toString(), "ether"),
                        gasLimit:ethers.utils.hexlify(1000000),
                        maxFeePerGas:mulMaxFeePerGas,
                        maxPriorityFeePerGas:mulMaxPriorityFeePerGas,
                        nonce: await provider.getTransactionCount(address)
                    };
                    
                    // send transaction with value
                    // ref) https://vsupalov.com/ethers-call-payable-solidity-function/
                    const result = await avubbleNftContract.connect(connectedWallet).mintByUser(address,selectedContentId,1, options);
                    
                    
                    const txReceipt = await result.wait();

                    console.log("txReceipt : ", txReceipt);
                    console.dir(txReceipt);

                    if(txReceipt.blockNumber){
                        updateContentAsMinted(selectedContentId);
                    }

                } catch (error) {
                    
                    console.dir(error);

                    setIsMintProcess(false);

                    instantMsg("Failed minted","warning");

                    setSelectedContentId(-1);
                }
                
            }
        })
    
    };

    const getMintStatus = (isMinted, contentId)=>{
        
        if(isMinted){
            const hrefNft = 'https://testnets.opensea.io/assets/mumbai/0x3e875d6994118ad252bc4b5ee179557532dd26ae/'+contentId;
            return <a href={hrefNft}><Icon name='share square'/>This has been Minted.</a>
                
        }else{
            return <span>This has NOT been Minted.</span>
        }  
    };

    const convertDatetimeStr = (createdStr)=>{
        return time_ago(createdStr)
    };


    return (
        <>
            <Modal
                onClose={() => setModalOpen(false)}
                onOpen={() => setModalOpen(true)}
                open={modalOpen}
                
                >
                <Modal.Header>Mint NFT</Modal.Header>
                <Modal.Content image>
                    <Image size='medium' src='imgs/mint_nft.png' wrapped />
                    <Modal.Description>
                    {/* <Header>Default Profile Image</Header> */}
                    <h3>
                        Minting NFT will cost 0.001 Matic 
                    </h3>
                    <h3>Is it okay to pay fee ?</h3>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='black' onClick={() => setModalOpen(false)}>
                    No
                    </Button>
                    <Button
                    content="Yes, mint NFT"
                    labelPosition='right'
                    icon='checkmark'
                    onClick={async () => {
                        mintNft();
                    }}
                    positive
                    />
                </Modal.Actions>
            </Modal>


            
            
            <Segment>
                <Dimmer active={isMintProcess}>
                    <Loader size='huge'>Processing</Loader>
                </Dimmer>
            

                
            <div class="ui centered one column grid">
                <div class="row">
                    <div class="column"><MenuComponent selectedMenu="content"/></div>
                </div>

                <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    <AddressPrivKey addressAndPrivKey={addressAndPrivKey} /><WalletBalances addressAndPrivKey={addressAndPrivKey}/>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                </Table>

                <div class="column row">
                    <div class="column">


                    <Toaster/>

                    <Form>
                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                <h1>Content</h1>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            <Table.Row>
                                    <Table.Cell>
                                    
                                    <Form.Field>
                                        <input 
                                            id='titleInput' 
                                            placeholder='Your title here...'
                                            value={title} 
                                            onChange={onChangeTitle}    
                                        />
                                    </Form.Field>
                                    
                                                                        
                                    </Table.Cell>   
                            </Table.Row>
                            
                            <Table.Row>
                                <Table.Cell>
                                
                                    <TextArea 
                                        placeholder='Your content here...' 
                                        style={{ minHeight: 100 }} 
                                        value={content} 
                                        onChange={onChangeContent}
                                    />
                                
                                                                    
                                </Table.Cell>   
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <input id='image1' type="file" onChange={onImage1Change}/>
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
                    </Form>
                    
                    </div>


                </div>
                
                
                <div class="column row">
                    <div class="column">

                    {/* infinite scroll ref) https://www.npmjs.com/package/react-infinite-scroll-component */}
                    <InfiniteScroll
                    dataLength={contents.length}
                    next={fetchMoreData}
                    hasMore={true}
                    loader={<h4></h4>}
                    >

                        <Comment.Group>
                            <Header as='h3' dividing>
                            Contents
                            </Header>
                            

                            {contents.map((i, index) => (
                                <>
                                    <Comment>
                                        <Comment.Content>
                                            <Comment.Author as='a'>{smartTrim(i.userObj.walletAddress,8)}</Comment.Author>
                                            <Comment.Metadata>
                                            <div>{i.userObj.created?convertDatetimeStr(i.userObj.created):""}</div>
                                            </Comment.Metadata>
                                            <Comment.Text>{i.title}</Comment.Text>
                                            <Comment.Text>{i.content}</Comment.Text>
                                            <Image src={i.img1_url} size='large' />
                                            <Comment.Actions>
                                                <Comment.Action><Icon name={'thumbs up'}/> {i.upVote}</Comment.Action>
                                                <Comment.Action><Icon name={'thumbs down'}/> {i.downVote}</Comment.Action>
                                            </Comment.Actions>
                                            <Comment.Actions>
                                                <Comment.Action>
                                                    {websiteToggleBtnsStatus?getWebsiteToggleBtns():""}
                                                    <Button primary onClick={()=>{onClickPostBtn(i.id,i.title, i.content, i.img1_url, i.userObj.walletAddress, i.isMinted)}}>Post</Button>
                                                </Comment.Action>
                                            </Comment.Actions>
                                            
                                                {getMintStatus(i.isMinted, i.id)}
                                                
                                                    <Button primary onClick={()=>{
                                                        try{
                                                            onClickMintNFT(i.id)
                                                        }catch(error){
                                                            instantMsg("Failed to mint NFT","warning")
                                                        }
                                                        
                                                    }}>Mint NFT</Button>
                                           

                                            
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


export default Content;


// check file is image type or not
// ref) https://roufid.com/javascript-check-file-image/
function isFileImage(file) {
    const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
 
    return acceptedImageTypes.includes(file['type'])
}


function isRightSizeImage(file) {
                       
    return file.size <= 1024000
}


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