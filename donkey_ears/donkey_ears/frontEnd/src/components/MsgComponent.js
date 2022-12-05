import React, { Component,useState, useEffect } from "react";
import { render } from "react-dom";
import { Table,Button,Icon,Form, TextArea, Message,Item,List,Image,Comment,Header } from 'semantic-ui-react';

const MsgComponent = ({normalMsg, warningMsg})=>{

    return (
        <>
            {warningMsg? 
                    <Message warning>
                        <Message.Header>Oops !!!</Message.Header>
                        <p>{warningMsg}</p>
                </Message>:""}
            


            {normalMsg? 
                <Message info>
                        <Message.Header>Excellent !!!</Message.Header>
                        <p>{normalMsg}</p>
                </Message>:""}
        </>
    );
};


export default MsgComponent;