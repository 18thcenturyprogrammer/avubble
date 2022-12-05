const postMissyCoupon = () =>{
    console.log("postMissyCoupon called");
}

function sleep(ms){
    console.log("creatPost 3");
    return new Promise(resolve => setTimeout(resolve, ms));
}

// const test1 = () =>{
//     console.log("creatPost 3");
// };


const creatPost2 = (webSite, data) => {};

const creatPost = async (data) => {
    console.log("creatPost 1");
    console.log("data : ", data);
    console.dir(data);

    
    switch (data.website){    

        // i was thinking use below but i decided to use share button which is easier way
        case "twitter":
            break;

        case "missy_coupon":
            console.log("missy coupon set title, content. in addition content saved in clipboard");

            document.querySelector("input.mcw-full-input").setAttribute('value', data.data.title);

            document.getElementById("mypostimageeditor").textContent=data.data.content;

            let spaceDiv = document.createElement("div");
            let spaceBr = document.createElement("br");
            spaceDiv.appendChild(spaceBr);
            document.getElementById("mypostimageeditor").appendChild(spaceDiv);

            let image1 = document.createElement("img");

            image1.setAttribute('class', 'mimage prime');
            image1.setAttribute('src', data.data.img1_url);
            image1.setAttribute('width', '526');

            image1.setAttribute('data-owidth', '526');

            image1.setAttribute('contenteditable', 'true');

            image1.setAttribute('data-ref', data.data.img1_url);

            image1.setAttribute('style', 'width: 526px;');

            document.getElementById("mypostimageeditor").appendChild(image1)

            break;
        
        //  this use ckeditor which use iframe,so i had cross origin problem. i couldn't do any more
        case "itssa":
            console.log("itssa set title, content saved in clipboard");

            // document.getElementById("post-title").setAttribute('value', data.data.title);
            document.querySelector("input#post-title").setAttribute('value', data.data.title);

            break;
        
        //  this use ckeditor which use iframe,so i had cross origin problem. i couldn't do any more
        case "ddanzi":
            console.log("ddanzi set title, content saved in clipboard");

            document.querySelector("input[name='title']").setAttribute('value', data.data.title);

            break;

    }
    
}


chrome.runtime.onMessage.addListener(async (message,sender, sendResponse)=>{
    console.log("message.actionType : ",message.actionType);
    console.log("message.website : ",message.website)
        
    switch (message.website){
        case "twitter":
            switch(message.actionType){
                case "post":
                    const msg = message.data.content;

                    const queryStrMsg = encodeURIComponent(msg);

                    const tab = await createTab("https://twitter.com/intent/tweet?text="
                    +queryStrMsg);

                    break;
            }
            break;
        case "missy_coupon":
            switch(message.actionType){
                case "post":
                    const tab1 = await createTab("https://www.missycoupons.com/zero/write.php?id=general");

                    chrome.scripting.executeScript({args: [message],target:{tabId:tab1.id}, func:creatPost});
                 
                    break;
            }
            break;
        case "itssa":
            switch(message.actionType){
                case "post":
                    const tab2 = await createTab("https://itssa.co.kr/politics/write");

                    chrome.scripting.executeScript({args: [message],target:{tabId:tab2.id}, func:creatPost});
                    // chrome.tabs.sendMessage(tab2.id, message);
                    
                    break;
            }
            break;
        case "ddanzi":
            switch(message.actionType){
                case "post":
                    // const tab3 = await createTab("https://www.ddanzi.com/index.php?mid=free&act=dispBoardWrite");

                    const tab3 = await createTab("https://www.ddanzi.com/index.php?mid=discussion&act=dispBoardWrite");

                    chrome.scripting.executeScript({args: [message],target:{tabId:tab3.id}, func:creatPost});
                
                    break;
            }
            break;
        

            
    } 

});



function sleep(ms){
    return new Promise(resolve=> setTimeout(resolve,ms));
}


// ref) https://stackoverflow.com/a/44864966
function createTab (url) {
    return new Promise(resolve => {
        chrome.tabs.create({url}, async tab => {
            console.log("tab id is", tab.id);

            chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                if (info.status === 'complete' && tabId === tab.id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve(tab);
                }
            });
        });
    });
}



////////////////////////////////////////////////////////////////////////////////////////////
// for study

// const draftEditorElement = document.querySelector("div.DraftEditor-root");

// spaceDiv.appendChild(spaceBr);
// document.getElementById("mypostimageeditor").appendChild(spaceDiv);

// let image1 = document.createElement("img");

// image1.setAttribute('class', 'mimage prime');

// span1Element.removeChild(brElement);

// document.getElementById("mypostimageeditor").textContent=data.data.content;