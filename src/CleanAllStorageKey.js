import React, { Component, useEffect } from "react";
import { render } from "react-dom";

import { Button } from "semantic-ui-react";




const CleanAllStorageKey = ()=>{


    useEffect(()=>{
        chrome.storage.sync.clear();
    },[]);

    const moveToMain = ()=>{
        console.log("moveToMain");

        window.location.href = '/popup.html';
        
    };

    return (
        <>
            <h1>Clean all storage keys</h1>
            <Button onClick={moveToMain} >move to main</Button>
        </>
    );
};


export default CleanAllStorageKey;