chrome.storage.sync.get(["password", "address"], (result) => {
    if(result['password'] != undefined && result['address'] != undefined){
        // user is logged in 

        console.log("user is logged in");
        const pathElements = window.location.pathname.split('/');

        console.dir(pathElements);

        const contentId = pathElements[3];

        window.location.href = `/content_with_vote/get/${contentId}?userAddress=${result['address']}`;

        // window.location.href = `/api/get_content_with_vote_view/${contentId}?userAddress=${result['address']}`;
    }else{
        // user is NOT logged in

        console.log("user is NOT logged in");
    }
});