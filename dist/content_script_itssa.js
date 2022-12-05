chrome.runtime.onMessage.addListener(async (message,sender, sendResponse)=>{
    console.log("in content message.actionType : ",message.actionType);
    console.log("in content message.website : ",message.website);
    console.log("in content message.data : ", message.data);

    if(message.website == "itssa"){
        switch(message.actionType){
            case "post":
                document.getElementById("post-title").setAttribute('value', message.data.title);

                document.querySelector("input[name='content']").setAttribute("value", message.data.content);

                // document.querySelector("iframe").contentWindow.document.querySelector("body p").textContent = message.data.content;
                break;
        }

    }

    
});

console.log("content script is running");