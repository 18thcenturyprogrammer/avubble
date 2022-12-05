$('span#upVoteSpan').click(function() {

    const id = $(this).attr('data');

    doVote(id, "up");

  });

  $('span#downVoteSpan').click(function() {

    // $(this) is refered to element which event happen on 
    const id = $(this).attr('data');

    doVote(id, "down");

  });

const changeThumbs = (upOrDown)=>{
    if(upOrDown == "up"){
        $('span#upVoteSpan i').attr('class',"thumbs up icon");
        $('span#downVoteSpan i').attr('class',"thumbs down outline icon");
        
    }else{
        $('span#upVoteSpan i').attr('class',"thumbs up outline icon");
        $('span#downVoteSpan i').attr('class',"thumbs down icon");
    }
};



const doVote = async (id, voteVal)=>{

    console.log("chrome.storage : ");
    console.dir(chrome.storage);

    chrome.storage.sync.get(["signature_pub_key","avubble_crypted", "address"], async (result) => {
        // console.log(`chrome storage signature_pub_key :  + ${result['signature_pub_key']}`);
        // console.log(`chrome storage avubble_crypted :  + ${result['avubble_crypted']}`);
        // console.log(`chrome storage address :  + ${result['address']}`);

        const signaturePubKey = result['signature_pub_key'];
        const avubbleCrypted = result['avubble_crypted'];
        const address =  result['address'];


        if(signaturePubKey != undefined && 
            signaturePubKey != "" && 
            avubbleCrypted != undefined && 
            avubbleCrypted != ""  && 
            address != undefined && 
            address != ""){

            
            const requestOptions = {
                method: 'POST',
                headers: { 
                    "Access-Control-Allow-Origin": "chrome-extension://nlamdelpgnmmnkmiolepklnffnfkhmpo/*",
                    'Accept': 'application/json, text/plain',
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                body: JSON.stringify({ content:id,voteVal:voteVal,signaturePubKey:signaturePubKey,avubbleCrypted:avubbleCrypted, address:address}),
                mode:'cors'
            };
    
            fetch("http://127.0.0.1:8000/api/do_vote_content/",requestOptions)
            .then((response)=>{
                console.log("response obj : ");
                console.dir(response);
    
                if(response.ok){
                    return response.json();
                }else{
                    alert("Failed to save vote");
                    // setWarningMsg("Failed to save vote");
                    throw Error("Failed communication with server for saving vote");
                }
            }).then((data)=>{
    
                console.log("data.data.voteVal",data.data.voteVal)
    
                console.log("Success saved vote in server");
    
                alert("Successfully voted");
                
                changeThumbs(data.data.voteVal);


            });
        }
    });
};