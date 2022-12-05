import React, { Component } from "react";
import { Label, Image, Icon } from "semantic-ui-react";

const AddressPrivKey = ({addressAndPrivKey})=>{

    const address = addressAndPrivKey.address;
    const privKey = addressAndPrivKey.privKey;

    // return (
    //     <>
    //         <h3>Address : {smartTrim(address,8)}</h3>
    //         <h3>Priv Key : {smartTrim(privKey,8)}</h3>
    //     </>
    // );


    return(
        <>
            
            <Label as='a' color='red' image>
            {/* <Image avatar spaced='right' src='https://react.semantic-ui.com/images/avatar/small/elliot.jpg' /> */}
            <Icon name='home' size='small' />
            {smartTrim(address,8)}
            <Label.Detail>Wallet Address</Label.Detail> 
            </Label>
            <Label as='a' color='red' image>
            <Icon name='key' size='small' />
            {smartTrim(privKey,8)}
            <Label.Detail>Private key</Label.Detail> 
            </Label>
        
        </>
    );

    
};


export default AddressPrivKey;

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