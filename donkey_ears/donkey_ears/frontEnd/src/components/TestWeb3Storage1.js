import React, { Component,useState, useEffect } from "react";
import { render } from "react-dom";
import { Web3Storage } from 'web3.storage'
import * as Name from 'w3name';

import { Button } from "semantic-ui-react";






const TestWeb3Storage1 = ()=>{

    const [cid, setCid] = useState("");

    
    const onClickSaveBtn = async ()=>{
        console.log("onClickSaveBtn called");
    
        const files = makeFileObjects();
        const cid = await storeFiles(files);

        console.log("cid : ");
        console.dir(cid);
    
        setCid(cid);
    };
    
    const onClickCreateNameBtn = async ()=>{
        console.log("onClickCreateNameBtn called");
         
        const name = await Name.create();
    
        // console.log('created new name: ', name.toString());

        console.log("name :");
        console.dir(name);
    
        // value is an IPFS path to the content we want to publish
        const value = '/ipfs/'+cid;
        // since we don't have a previous revision, we use Name.v0 to create the initial revision
        const revision = await Name.v0(name, value);
    
        console.log("revision :");
        console.dir(revision);
    
        const nameAfterPublish = await Name.publish(revision, name.key);
    
        console.log("nameAfterPublish :");
        console.dir(nameAfterPublish);
    
    };


    return (
        <>
            <h1>test web3 storage pages</h1>
            <h1>{cid}</h1>
            <Button primary onClick={onClickSaveBtn}>Save file web3</Button>
            <Button primary onClick={onClickCreateNameBtn}>Create name</Button>

        </>
    );
};


export default TestWeb3Storage1;

function getAccessToken () {
    // If you're just testing, you can paste in a token
    // and uncomment the following line:
    // return 'paste-your-token-here'
  
    // In a real app, it's better to read an access token from an
    // environement variable or other configuration that's kept outside of
    // your code base. For this to work, you need to set the
    // WEB3STORAGE_TOKEN environment variable before you run your code.
    return process.env.WEB3_STORAGE_TOKEN
}

function makeStorageClient () {
    return new Web3Storage({ token: getAccessToken() })
}

function makeFileObjects () {
    // You can create File objects from a Blob of binary data
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Blob
    // Here we're just storing a JSON object, but you can store images,
    // audio, or whatever you want!
    const obj = { hello: 'world' }
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
  
    const files = [
      new File(['contents-of-file-1'], 'plain-utf8.txt'),
      new File([blob], 'hello.json')
    ]
    return files
}

async function storeFiles (files) {
    const client = makeStorageClient()
    const cid = await client.put(files)
    console.log('stored files with cid:', cid)
    return cid
}

