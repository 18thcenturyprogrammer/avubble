import * as etherHdWallet from 'ethereum-hdwallet';
import * as bip39 from 'bip39';
import * as cryptico from 'cryptico';


import React, { Component } from "react";
import { render } from "react-dom";





const Test1 = ()=>{

    const mnemonic = bip39.generateMnemonic();

    console.log("mnemonic is ",mnemonic);

    const hdwallet = etherHdWallet.fromMnemonic(mnemonic)

    // bip 44 chain id ref) https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    console.log(`0x${hdwallet.derive(`m/44'/996'/0'/0/0`).getAddress().toString('hex')}`);
    console.log(hdwallet.derive(`m/44'/996'/0'/0/0`).getPublicKey().toString('hex')); 
    console.log(hdwallet.derive(`m/44'/996'/0'/0/0`).getPublicKey(true).toString('hex')); 
    console.log(hdwallet.derive(`m/44'/996'/0'/0/0`).getPrivateKey().toString('hex'));

    // The passphrase used to repeatably generate this RSA key.
    var PassPhrase = "user passwords"; 
    
    // The length of the RSA key, in bits.
    var Bits = 1024; 
    
    var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
    var MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey); 

    var PlainText = "private key";
 
    var EncryptionResult = cryptico.encrypt(PlainText, MattsPublicKeyString);

    console.log(`MattsPublicKeyString : ${MattsPublicKeyString}`);
    console.log(`EncryptionResult.cipher : ${EncryptionResult.cipher}`);
    console.log(`EncryptionResult.status : ${EncryptionResult.status}`);



    var CipherText = EncryptionResult.cipher;

    var PassPhrase2 = "user wrong password"; 

    var MattsRSAkey2 = cryptico.generateRSAKey(PassPhrase2, Bits);
 
    var DecryptionResult = cryptico.decrypt(CipherText, MattsRSAkey2);

    console.log(`DecryptionResult : ${DecryptionResult}`);
    console.dir(DecryptionResult);


    // var PassPhrase = "There Ain't No Such Thing As A Free Lunch."; 
 
    // var SamsRSAkey = cryptico.generateRSAKey(PassPhrase, 1024);
    
    // var PlainText = "Matt, I need you to help me with my Starcraft strategy.";
    
    // var EncryptionResult = cryptico.encrypt(PlainText, MattsPublicKeyString, SamsRSAkey);

    // var PublicKeyID = cryptico.publicKeyID(EncryptionResult.publickey);




    return (
        <>
            <h1>test1 pages</h1>
            <h1>test1 pages</h1>
        </>
    );
};


export default Test1;