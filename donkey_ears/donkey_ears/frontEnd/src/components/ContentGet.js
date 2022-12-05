import React, { Component, useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import { render } from "react-dom";
import { Table,Image,Message,Icon } from "semantic-ui-react";


import MsgComponent from "./MsgComponent";


const ContentGet = ()=>{
    const {id} = useParams()

    const [warningMsg, setWarningMsg] = useState("");
    const [normalMsg, setNormalMsg] = useState("");
    const [content, setContent] = useState({});

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


    

    
  
    
    useEffect(async ()=>{
        const requestOptions = {
            method: 'GET',
            headers: { 
                "Access-Control-Allow-Origin": "http://127.0.0.1:8000/*",
                'Accept': 'application/json, text/plain',
                'Content-Type': 'application/json;charset=UTF-8',
            },
            mode:'cors'
        };
    
        console.log("id in fetch : ", id);

        const response = await fetch(`http://127.0.0.1:8000/api/get_content/${id}`,requestOptions);

        console.log("response : ", response);
        
        if(response.ok){
            const data = await response.json();

            console.log("data.data : ", data.data);
            


            setContent(data.data);
        }else{
            instantMsg("Failed to bring content","warning");
            // setWarningMsg("Failed to bring comments");
            throw Error("Failed communication with server for getting content");
        }
        
    },[]);

    


    

    return (
        <>
            <div class="ui centered one column grid">
                
                <div class="sixteen column row">
                    <div class="one wide column"></div>
                    <div class="fourteen wide column">

                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell colSpan='7' ><h1>Content</h1></Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                        <Table.Row>
                            <Table.Cell>
                            <MsgComponent warningMsg={warningMsg} normalMsg ={normalMsg} />
                            </Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>
                                Address: {Object.keys(content).length !== 0?smartTrim(content.userObj.walletAddress,8):""}
                            </Table.Cell>
                            <Table.Cell>
                                Wallet created: {Object.keys(content).length !== 0?changeDateTimeStr(content.userObj.created):""}
                            </Table.Cell>
                            <Table.Cell>
                                Content Created :{Object.keys(content).length !== 0?changeDateTimeStr(content.created):""}
                            </Table.Cell>
                        </Table.Row>


                        <Table.Row>
                            <Table.Cell colSpan='3'>
                                {Object.keys(content).length !== 0?content.title:""}

                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell colSpan='3'>
                                {Object.keys(content).length !== 0?content.content:""}

                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell colSpan='3'>
                                {Object.keys(content).length !== 0?<Image src={content.img1_url} fluid />:""}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                <Icon name='thumbs up outline'/> {Object.keys(content).length !== 0?content.upVote:0}
                            </Table.Cell>
                            <Table.Cell>
                                <Icon name='thumbs down outline'/> {Object.keys(content).length !== 0?content.downVote:0}
                            </Table.Cell>
                        </Table.Row>
                        </Table.Body>

                       
                            

                        

                        <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan='7'>
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


export default ContentGet;

function changeDateTimeStr(dateTimeStr){
    const dateTime = new Date(dateTimeStr);

    return dateTime.toLocaleDateString("en-US");
}


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