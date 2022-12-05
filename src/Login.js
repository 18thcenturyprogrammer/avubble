import * as cryptico from 'cryptico';

import React, { Component,useState,useEffect } from "react";
import { Form,Button,Table,Input} from 'semantic-ui-react';
import PasswordValidator from "password-validator";

import MsgComponent from './MsgComponent';



const Login = ()=>{
    const [warningMsg, setWarningMsg] = useState("");
    const [normalMsg, setNormalMsg] = useState("");

    const [password, setPassword] = useState("");

    
    chrome.storage.sync.get(['password'], function(result) {
        console.dir(result);
        console.log('Value currently is ' + result["password"]);

        if(result["password"] != undefined){
            // user is logged in 

            window.location.href = '/popup.html';
        }
    });


    const instantMsg = (msg, type)=>{

        switch (type){
            case "normal":
                setNormalMsg(msg);
                break;
            case "warning":
                setWarningMsg(msg);
        }

        setTimeout(()=>{
            switch (type){
                case "normal":
                    setNormalMsg("");
                    break;
                case "warning":
                    setWarningMsg("");
            }
        }, 5000)
    };
    



    const onChangePassword = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setPassword(value);
    };

    const onSubmitForm = (event) => {
        console.log("onSubmitForm called");

        //validation passed and password confirmed, save the password

        // The passphrase used to repeatably generate this RSA key.
        var PassPhrase = password; 

        console.log('entered password :',password);
        
        // The length of the RSA key, in bits.
        var Bits = 1024; 
        
        var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
        var MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey); 

        console.log("MattsPublicKeyString : ");
        console.dir(MattsPublicKeyString);

        chrome.storage.sync.get(['avubble_crypted'], function(result) {
            console.dir(result);
            console.log('Value avubble_crypted is ' + result["avubble_crypted"]);
    
            if(result["avubble_crypted"] != undefined){ 
                
                var CipherText = result["avubble_crypted"];

                var MattsRSAkey2 = cryptico.generateRSAKey(PassPhrase, Bits);
            
                var DecryptionResult = cryptico.decrypt(CipherText, MattsRSAkey2);

                console.log(`DecryptionResult : ${DecryptionResult}`);
                console.dir(DecryptionResult);

                if(DecryptionResult.status == "success"){
                    console.log("login success");

                    chrome.storage.sync.set({"password": PassPhrase}, function() {
                        instantMsg("login success", "normal");
                        window.location.href = '/popup.html';
                    });
                }else{
                    console.log("login failure");
                    instantMsg("login failure", "warning");
                }

                
            }else{
                // there is no avubble crypted

                window.location.href = '/popup.html';
            }
        });

    };


    return (
        <>
            <div class="ui centered one column grid">
                <div class="row">
                    <div class="column"><h1>Enter password</h1></div>
                </div>
                <div class="column row">
                    <div class="column">


                    <MsgComponent warningMsg={warningMsg} normalMsg ={normalMsg} />

                    <Form onSubmit={onSubmitForm}>
                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell colSpan="2">
            
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                        
                            <Table.Row>
                                    <Table.Cell>
                                        <Form.Input 
                                            label='Enter Password' 
                                            type='password' 
                                            value={password} 
                                            onChange={onChangePassword}
                                        />                                    
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button primary type="submit">Login</Button>
                                    </Table.Cell>    
                            </Table.Row>
                            
                        </Table.Body>
            
                        <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan="2"></Table.HeaderCell>

                            </Table.Row>
                        </Table.Footer>
                    </Table>
                    </Form>
                    
                    </div>

                </div>
                
            </div>

        

        </>
    );
};

export default Login;

