import * as cryptico from 'cryptico';



import React, { Component,useState, useEffect } from "react";
import { render } from "react-dom";
import { Table,Button,Icon,Form, Input,Message,List } from 'semantic-ui-react';
import PasswordValidator from "password-validator";

const CreatePassword = ()=>{

    console.log("create password component");

    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [msg, setMsg] = useState([]);

    const instantMsg = (msg)=>{

        setMsg(msg);

        setTimeout(()=>{
            setMsg([]);
        }, 5000)
    };


    const onChangePassword1 = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setPassword1(value);
    };

    const onChangePassword2 = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setPassword2(value);
    };

    const onSubmitForm = (event) => {
        console.log("onSubmitForm called");

        const passwordValidator = new PasswordValidator();

        passwordValidator
        .is().min(8)                                    // Minimum length 8
        .is().max(100)                                  // Maximum length 100
        .has().uppercase()                              // Must have uppercase letters
        .has().lowercase()                              // Must have lowercase letters
        .has().digits(1)                                // Must have at least 2 digits
        .has().not().spaces()                           // Should not have spaces
        .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

        // Validate against a password string
        console.log("VALIDATIONS PASSWORD");
        console.log(passwordValidator.validate(password1,{ list: true }));

        const validationFailedReasons = passwordValidator.validate(password1,{ list: true });

        if(validationFailedReasons.length == 0 && password1 == password2){
            //validation passed and password confirmed, save the password

            // The passphrase used to repeatably generate this RSA key.
            var PassPhrase = password1; 
            
            // The length of the RSA key, in bits.
            var Bits = 1024; 
            
            var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
            var MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey); 


            chrome.storage.sync.get(["temp_privKey","temp_address"], (result) => {
                console.log(`chrome storage temp_privKey :  + ${result['temp_privKey']}`);
                console.log(`chrome storage temp_address :  + ${result['temp_address']}`);
                console.dir(result);
                
                const tempPrivKey = result['temp_privKey'];
                const tempAddress = result['temp_address'];

                if(tempPrivKey != undefined && tempPrivKey != "" && tempAddress != undefined && tempAddress != ""){
        
                    var encryptedPrivKey = cryptico.encrypt(tempPrivKey, MattsPublicKeyString);
        
                    console.log(`encryptedPrivKey : ${encryptedPrivKey}`);
                    console.log(`encryptedPrivKey.cipher : ${encryptedPrivKey.cipher}`);
                    console.log(`encryptedPrivKey.status : ${encryptedPrivKey.status}`);

                    chrome.storage.sync.clear(function(){
                        console.log("clear all storage data");


                        const requestOptions = {
                            method: 'POST',
                            headers: { 
                                "Access-Control-Allow-Origin": "chrome-extension://nlamdelpgnmmnkmiolepklnffnfkhmpo/*",
                                'Accept': 'application/json, text/plain',
                                'Content-Type': 'application/json;charset=UTF-8',
                            },
                            body: JSON.stringify({walletAddress:tempAddress,cryptedPrivKey:encryptedPrivKey.cipher}),
                            mode:'cors'
                        };
                
                        fetch("http://127.0.0.1:8000/api/create_user/",requestOptions)
                        .then((response)=>{
                            console.log("response obj : ");
                            console.dir(response);
                
                            if(response.ok){
                                return response.json();
                            }else{
                                throw Error("Failed communication with server for saving user");
                            }
                        }).then((data)=>{
                            console.log("Success saved meta comment in server");

                            console.log("data :",data);
                            console.dir(data);
                            console.log("data.data.signaturePubKey :",data.data.signaturePubKey);

                            chrome.storage.sync.set({"signature_pub_key": data.data.signaturePubKey}, function() {

                                chrome.storage.sync.set({"avubble_crypted": encryptedPrivKey.cipher}, function() {
                                    console.log('avubble_crypted saved in chrome storage');
            
                                    chrome.storage.sync.set({"address": tempAddress}, function() {
                                        console.log('address saved in chrome storage');
        
                                        chrome.storage.sync.set({"password": password1}, function() {
                                            console.log('marked as logged in chrome storage');
        
                                            window.location.href = '/popup.html';
                    
                                        });  
                                    });
                                });
                            });
                        });
                    });
                }
            });

        }else if(validationFailedReasons.length > 0){
            const temp = [];

            for (let i = 0; i < validationFailedReasons.length; i++) {
                switch (validationFailedReasons[i]){
                    case "min":
                        temp.push("Min lenth is 8");
                        break;
                    case "uppercase":
                        temp.push("add upper case letter");
                        break;
                    case "lowercase":
                        temp.push("add lower case letter");
                        break;
                    case "digits":
                        temp.push("add digit letter");
                        break;
                    case "spaces":
                        temp.push("space not allowed");
                        break;
                    
                }
            } 

            console.dir(temp);

            instantMsg(temp);
    
        }else if(password1 != password2){
            instantMsg(["two passwords not matched"]);
        }
    };


    






    return (
        <>
            <div class="ui centered one column grid">
                <div class="row">
                    <div class="column"><h1>Create Password</h1></div>
                </div>
                <div class="sixteen column row">
                    <div class="one wide column"></div>
                    <div class="fourteen wide column">

                    {msg.length >0? 
                        <>
                        <Message warning>
                            <Message.Header>Check your password</Message.Header>
                            {msg.map((value, index) => {
                                    return <p>{value}</p>
                            })}
                        </Message>
                        </>
                        :""
                    }

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
                                    <Input 
                                        icon='lock'
                                        iconPosition='left'
                                        placeholder='Password 1'
                                        type="password" 
                                        name="password1" 
                                        value={password1} 
                                        onChange={onChangePassword1}
                                    />
                                    
                                </Table.Cell>
                                <Table.Cell rowSpan ="2">
                                    <List bulleted>
                                        <List.Item>Minmum lenth 8</List.Item>
                                        <List.Item>At least 1 Uppercase</List.Item>
                                        <List.Item>At least 1 Lowercase</List.Item>
                                        <List.Item>At least 2 Numbers</List.Item>
                                    </List>
                                </Table.Cell>   
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <Input 
                                        icon='lock'
                                        iconPosition='left'
                                        placeholder='Password 2'
                                        type="password" 
                                        name="password2" 
                                        value={password2} 
                                        onChange={onChangePassword2}
                                    />
                                </Table.Cell>        
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell colSpan="2">
                                    <Button primary type="submit" >Submit</Button>
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
                    <div class="one wide column"></div>
                </div>
            </div>
        </>
    );
};


export default CreatePassword;