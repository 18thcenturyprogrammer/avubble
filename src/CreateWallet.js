import * as etherHdWallet from 'ethereum-hdwallet';
import * as bip39 from 'bip39';
import * as cryptico from 'cryptico';


import React, { Component , useState, useEffect} from "react";
import { render } from "react-dom";


import { Table,Button,Icon } from 'semantic-ui-react';

import toast, { Toaster } from 'react-hot-toast';



const CreateWallet = ()=>{

    const [mnemonicListAddressPrivKey,setMnemonicListAddressPrivKey] = useState({mnemonicList:[], address:"", privKey:""});

    useEffect(()=>{
        setMnemonicListAddressPrivKey(getMnemonicListAddressPrivKey());
    },[]);



    const regenerateMnemonic = ()=>{
        console.log("regenerateMnemonic");

        const mnemonicAddressPrivKey = getMnemonicListAddressPrivKey();

        setMnemonicListAddressPrivKey(mnemonicAddressPrivKey);
    };

    
    // const copyMnemonicToClipboard = ()=>{
    //     console.log("copyMnemonicToClipboard");
    // };

    // const copyAddressToClipboard = ()=>{
    //     console.log("copyAddressToClipboard");
    // };

    // const copyPrivKeyToClipboard = ()=>{
    //     console.log("copyPrivKeyToClipboard");
    // };

    const saveWallet = ()=>{
        console.log("saveWallet");

        chrome.storage.sync.set({"temp_privKey": mnemonicListAddressPrivKey.privKey}, function() {
            console.log('temp priv key saved');

            chrome.storage.sync.set({"temp_address": mnemonicListAddressPrivKey.address}, function() {
                console.log('temp address saved');

                window.location.href = '/popup.html?target=CreatePassword';
            });
        });

        
        
    };

    const copyToClipboard = (data)=>{
        console.log("copyToClipboard is called");
        navigator.clipboard.writeText(data);

        
        toast.success('Successfully copied!');
        
    };


    
    return (
        <>
            <div class="ui centered one column grid">
                <div class="row">
                    <div class="column"><h1>Create Wallet</h1></div>
                </div>
                <div class="sixteen column row">
                    <div class="one wide column"></div>
                    <div class="fourteen wide column">
                    <Toaster/>

                    <Table celled>
                        <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan='7' ><h1>Mnemonic phrases</h1></Table.HeaderCell>
                        </Table.Row>
                        </Table.Header>

                        <Table.Body>
                        <Table.Row>
                            {
                                mnemonicListAddressPrivKey.mnemonicList.map((value, index) => {
                                    if(index >=0 && index <=5){
                                        return <Table.Cell><h4 key={index}>{index+1}: {value}</h4></Table.Cell>
                                    }    
                                })
                            }
                            <Table.Cell>
                                <Button onClick={()=>{
                                    console.log("copy mnemonics button clicked");
                                    copyToClipboard(mnemonicListAddressPrivKey.mnemonicList.toString());}} size="medium" icon>
                                        <Icon name='clipboard' />
                                </Button>
                            </Table.Cell>   
                        </Table.Row>
                        <Table.Row>
                            {
                                mnemonicListAddressPrivKey.mnemonicList.map((value, index) => {
                                    if(index >=6 && index <=11){
                                        return <Table.Cell><h4 key={index}>{index+1}: {value}</h4></Table.Cell>
                                    }    
                                })
                            }
                            <Table.Cell>
                            </Table.Cell>        
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell colSpan='6'>
                                Wallet address : {mnemonicListAddressPrivKey.address}
                            </Table.Cell>
                            <Table.Cell>
                                <Button onClick={()=>{copyToClipboard(mnemonicListAddressPrivKey.address)}} size="medium" icon>
                                        <Icon name='clipboard' />
                                </Button>
                            </Table.Cell>   
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell colSpan='6'>
                                Private key : {mnemonicListAddressPrivKey.privKey} 
                            </Table.Cell>
                            <Table.Cell>
                                <Button onClick={()=>{copyToClipboard(mnemonicListAddressPrivKey.privKey)}} size="medium" icon>
                                        <Icon name='clipboard' />
                                </Button>
                            </Table.Cell>  
                        </Table.Row>
                        </Table.Body>

                        <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan='7'>
                                <Button primary onClick={regenerateMnemonic} size="medium" icon>
                                    Regenerate&nbsp;
                                    <Icon name='refresh' />
                                </Button>
                                <Button primary onClick={saveWallet} size="medium" class="ui primary button" icon>
                                    Save&nbsp;
                                    <Icon name='checkmark' />
                                </Button>
                            </Table.HeaderCell>

                        </Table.Row>
                        </Table.Footer>
                    </Table>
                    </div>
                    <div class="one wide column"></div>
                </div>
            </div>
        </>
    );

   

};


export default CreateWallet;

function getMnemonicListAddressPrivKey(){
    const data = {mnemonicList:[], address:"", privKey:""};

    const mnemonicStr = getMnemonic();

    data.mnemonicList = toMnemonicList(mnemonicStr);

    const addressPrivKey = getAddressAndPrivKey(mnemonicStr);

    console.log("addressPrivKey : ");
    console.dir(addressPrivKey);

    data.address = addressPrivKey.address;
    data.privKey = addressPrivKey.privKey;

    console.log("data : ");
    console.dir(data);

    return data;
}


function getMnemonic(){
    const mnemonic = bip39.generateMnemonic();

    console.log("mnemonic is ",mnemonic);

    return mnemonic;
}

function toMnemonicList(mnemonic){

    const mnemonicList = mnemonic.split(' ');

    console.log("mnemonicList.length is ",mnemonicList.length);

    return mnemonicList;
}

function getAddressAndPrivKey(mnemonic){
    const hdwallet = etherHdWallet.fromMnemonic(mnemonic)

    // bip 44 chain id ref) https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    // console.log(`0x${hdwallet.derive(`m/44'/966'/0'/0/0`).getAddress().toString('hex')}`);
    // console.log(hdwallet.derive(`m/44'/966'/0'/0/0`).getPublicKey().toString('hex')); 
    // console.log(hdwallet.derive(`m/44'/966'/0'/0/0`).getPublicKey(true).toString('hex')); 
    // console.log(hdwallet.derive(`m/44'/966'/0'/0/0`).getPrivateKey().toString('hex'));

    // const address = hdwallet.derive(`m/44'/966'/0'/0/0`).getAddress().toString('hex');
    // const privKey = hdwallet.derive(`m/44'/966'/0'/0/0`).getPrivateKey().toString('hex');

    console.log(`0x${hdwallet.derive(`m/44'/966'/0'/0/7301979`).getAddress().toString('hex')}`);
    console.log(hdwallet.derive(`m/44'/966'/0'/0/7301979`).getPublicKey().toString('hex')); 
    console.log(hdwallet.derive(`m/44'/966'/0'/0/7301979`).getPublicKey(true).toString('hex')); 
    console.log(hdwallet.derive(`m/44'/966'/0'/0/7301979`).getPrivateKey().toString('hex'));

    const address = hdwallet.derive(`m/44'/966'/0'/0/7301979`).getAddress().toString('hex');
    const privKey = hdwallet.derive(`m/44'/966'/0'/0/7301979`).getPrivateKey().toString('hex');

    return {address:address, privKey:privKey};
}