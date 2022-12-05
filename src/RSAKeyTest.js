import rsa from 'js-crypto-rsa';

import React, { Component } from "react";
import { render } from "react-dom";

const RSAKeyTest = ()=>{
    rsa.generateKey(2048).then( (key) => {
        // now you get the JWK public and private keys
        const publicKey = key.publicKey;
        const privateKey = key.privateKey;

        console.log("public key :");
        console.dir(publicKey);
        console.log("privateKey key :");
        console.dir(privateKey)

        rsa.sign(
            Buffer.from("msg"),
            privateKey,
            'SHA-256',
            { // optional
              name: 'RSA-PSS', // default. 'RSASSA-PKCS1-v1_5' is also available.
              saltLength: 64
            }
        ).then( (signature) => {
            // now you get the signature in Uint8Array

            console.log("signature is : ", signature);

            return rsa.verify(
                Buffer.from("msgs"),
                signature,
                publicKey,
                'SHA-256',
                  { // optional
                    name: 'RSA-PSS', // default. 'RSASSA-PKCS1-v1_5' is also available.
                    saltLength: 64 // default is the same as hash length
                  }
            );
        }).then( (valid) => {
            // now you get the result of verification in boolean

            console.log("valid is : ", valid);
        });

    });



    return (
        <>
            <h1>RSAKeyTest pages</h1>
            <h1>RSAKeyTest pages</h1>
        </>
    );
};


export default RSAKeyTest;