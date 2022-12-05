// import * as etherHdWallet from 'ethereum-hdwallet';
// import * as bip39 from 'bip39';
// import * as cryptico from 'cryptico';


import React, { useState, useEffect} from "react";
import { render } from "react-dom";
// import { useNavigate } from 'react-router-dom';


import { Table,Button,Icon } from 'semantic-ui-react';







const CreateWallet2 = ()=>{
    console.log("in CreateWallet2");

    const [mnemonicListAddressPrivKey,setMnemonicListAddressPrivKey] = useState();

    // const [mnemonicListAddressPrivKey,setMnemonicListAddressPrivKey] = useState();


    // useEffect(()=>{
    //     setMnemonicListAddressPrivKey(getMnemonicListAddressPrivKey());
    // },[]);



    const regenerateMnemonic = ()=>{
        console.log("regenerateMnemonic");

    };

    
    const copyMnemonicToClipboard = ()=>{
        console.log("copyMnemonicToClipboard");
    };

    const copyAddressToClipboard = ()=>{
        console.log("copyAddressToClipboard");
    };

    const copyPrivKeyToClipboard = ()=>{
        console.log("copyPrivKeyToClipboard");
    };

    const saveWallet = ()=>{
        console.log("saveWallet");
    };




    return(
        <>

            <div class="ui centered one column grid">
                <div class="row">
                    <div class="column"><h1>Create Wallet</h1></div>
                </div>
                <div class="sixteen column row">
                    <div class="one wide column"></div>
                    <div class="fourteen wide column">

                    <Table celled>
                        <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan='7' ><h1>Mnemonic phrases</h1></Table.HeaderCell>
                        </Table.Row>
                        </Table.Header>

                        <Table.Body>
                        <Table.Row>
                            
                            <Table.Cell>
                                <Button onClick={copyMnemonicToClipboard} size="medium" icon>
                                        <Icon name='clipboard' />
                                </Button>
                            </Table.Cell>   
                        </Table.Row>
                        <Table.Row>
                            
                            <Table.Cell>
                            </Table.Cell>        
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell colSpan='6'>
                                
                            </Table.Cell>
                            <Table.Cell>
                                <Button onClick={copyAddressToClipboard} size="medium" icon>
                                        <Icon name='clipboard' />
                                </Button>
                            </Table.Cell>   
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell colSpan='6'>
                                
                            </Table.Cell>
                            <Table.Cell>
                                <Button onClick={copyPrivKeyToClipboard} size="medium" icon>
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


export default CreateWallet2;

function getMnemonicListAddressPrivKey(){

    console.log("in getMnemonicListAddressPrivKey");

    const data = {mnemonicList:[], address:"", privKey:""};

    // const mnemonicStr = getMnemonic();

    // data.mnemonicList = toMnemonicList(mnemonicStr);

    // const addressPrivKey = getAddressAndPrivKey(mnemonicStr);

    // console.log("addressPrivKey : ");
    // console.dir(addressPrivKey);

    // data.address = addressPrivKey.address;
    // data.privKey = addressPrivKey.privKey;

    // console.log("data : ");
    // console.dir(data);

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
    console.log(`0x${hdwallet.derive(`m/44'/996'/0'/0/0`).getAddress().toString('hex')}`);
    console.log(hdwallet.derive(`m/44'/996'/0'/0/0`).getPublicKey().toString('hex')); 
    console.log(hdwallet.derive(`m/44'/996'/0'/0/0`).getPublicKey(true).toString('hex')); 
    console.log(hdwallet.derive(`m/44'/996'/0'/0/0`).getPrivateKey().toString('hex'));

    const address = hdwallet.derive(`m/44'/996'/0'/0/0`).getAddress().toString('hex');
    const privKey = hdwallet.derive(`m/44'/996'/0'/0/0`).getPrivateKey().toString('hex');

    return {address:address, privKey:privKey};
}