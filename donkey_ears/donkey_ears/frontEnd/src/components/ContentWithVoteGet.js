import React, { Component, useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import { render } from "react-dom";
import { Table,Image,Message,Icon } from "semantic-ui-react";


import MsgComponent from "./MsgComponent";


const ContentWithVoteGet = ()=>{
    const {id} = useParams()

    const [warningMsg, setWarningMsg] = useState("");
    const [normalMsg, setNormalMsg] = useState("");
    const [contentWitVote, setContentWithVote] = useState({});

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

        const { userAddress } = Object.fromEntries(new URLSearchParams(location.search));

        console.log("userAddress", userAddress );;

        const response = await fetch(`/api/get_content_with_vote/${id}?userAddress=${userAddress}`,requestOptions);

        console.log("response : ", response);
        
        if(response.ok){
            const data = await response.json();

            console.log("data.data : ", data.data);
            


            setContentWithVote(data.data);
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
                                Address: {Object.keys(contentWitVote).length !== 0?smartTrim(contentWitVote.userObj.walletAddress,8):""}
                            </Table.Cell>
                            <Table.Cell>
                                Wallet created: {Object.keys(contentWitVote).length !== 0?changeDateTimeStr(contentWitVote.userObj.created):""}
                            </Table.Cell>
                            <Table.Cell>
                                Content Created :{Object.keys(contentWitVote).length !== 0?changeDateTimeStr(contentWitVote.created):""}
                            </Table.Cell>
                        </Table.Row>


                        <Table.Row>
                            <Table.Cell colSpan='3'>
                                {Object.keys(contentWitVote).length !== 0?contentWitVote.title:""}

                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell colSpan='3'>
                                {Object.keys(contentWitVote).length !== 0?contentWitVote.content:""}

                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell colSpan='3'>
                                {Object.keys(contentWitVote).length !== 0?<Image src={contentWitVote.img1_url} fluid />:""}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell >
                                <span id="upVoteSpan" data={Object.keys(contentWitVote).length !== 0?contentWitVote.id:0}>
                                <Icon name={Object.keys(contentWitVote).length !== 0 && contentWitVote.voteObj.voteVal=="up"?'thumbs up': 'thumbs up outline'}/> {Object.keys(contentWitVote).length !== 0?contentWitVote.upVote:0}
                                </span> 
                            </Table.Cell>
                            <Table.Cell>
                                <span id='downVoteSpan'data={Object.keys(contentWitVote).length !== 0?contentWitVote.id:0}>
                                <Icon name={Object.keys(contentWitVote).length !== 0 && contentWitVote.voteObj.voteVal=="down"?'thumbs down': 'thumbs down outline'}/> {Object.keys(contentWitVote).length !== 0?contentWitVote.downVote:0}
                                </span>
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


export default ContentWithVoteGet;

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