import React, { Component } from "react";
import { render } from "react-dom";

import { Button } from "semantic-ui-react";

const SetRemovePassword = ()=>{
    const onClickSetPassword = ()=>{
        console.log('onClickSetPassword called');

        chrome.storage.sync.set({"password": "1234Hh$$$"}, function() {
            console.log("password set");
        });
    };

    const onClickRemovePassword = ()=>{
        console.log('onClickRemovePassword called');

        chrome.storage.sync.remove("password",()=>{
            console.log("password deleted");
        });
    };

    const onClickCheckPassword = ()=>{
        console.log('onClickCheckPassword called');

        chrome.storage.sync.get(["password"], function(result) {
            console.log("password : ",result["password"]);
        });
    };


    return (
        <>
            <Button onClick={onClickSetPassword}>SET PASSWORD</Button>

            <Button onClick={onClickRemovePassword}>REMOVE PASSWORD</Button>

            <Button onClick={onClickCheckPassword}>CHECK PASSWORD</Button>
        </>
    );
};


export default SetRemovePassword;