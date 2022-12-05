
import React, { Component , useState, useEffect} from "react";


import { render } from "react-dom";
// // import {BrowserRouter as Router, Routes, Route, Link, Redirect} from "react-router-dom"
// import { MemoryRouter as Router,Route, Routes  } from 'react-router-dom';
// import { HashLink as Link } from 'react-router-hash-link';
import { Container } from 'semantic-ui-react'

import WalletDashboard from "./WalletDashboard";
import Login from "./Login";
import CreateWallet from "./CreateWallet";
import CreateWallet2 from "./CreateWallet2";
import Content from "./Content";
import CreatePassword from "./CreatePassword";

import UrlMetaComments from "./UrlMetaComments";
import RSAKeyTest from "./RSAKeyTest";

import CleanAllStorageKey from "./CleanAllStorageKey";
import SetRemovePassword from "./SetRemovePassword";


import TestAfterSendTransaction from "./TestAfterSendTransaction";


// import Test1 from "./Test1";
// import Test2 from "./Test2";


const App = ()=>{

    const [page, setPage] = useState("");

    useEffect(()=>{
        console.log("useeffect [] start");
                
        const { target } = Object.fromEntries(new URLSearchParams(location.search));

        if(target == undefined){
            console.log("query param target is undefined !!!!");

            chrome.storage.sync.get(["password","avubble_crypted"], (result) => {
                console.log(`chrome storage password :  + ${result['password']}`);
                console.log(`chrome storage avubble_crypted :  + ${result['avubble_crypted']}`);

                const password = result['password'];
                const avubble_crypted = result['avubble_crypted'];


                var tempPage ="UrlMetaComments";
        
                if((password == undefined || !password)){
                    // user has not logged
                    console.log('we need login component');

                    tempPage = "Login";
                }
                if((avubble_crypted == undefined || !avubble_crypted)){
                    // user has not made wallet before
                    console.log('we need create wallet component');

                    tempPage = "CreateWallet";
                }

                setPage(tempPage);

            });
            
        }else{

            switch (target){
                case "Content":
                    setPage("Content");
                    break;
                case "CreatePassword":
                    setPage("CreatePassword");
                    break;
                case "CleanAllStorageKey":
                    setPage("CleanAllStorageKey");
                    break;
                case "RSAKeyTest":
                    setPage("RSAKeyTest");
                    break;
                case "SetRemovePassword":
                    setPage("SetRemovePassword");
                    break;
                case "WalletDashboard":
                    console.log("target is WalletDashboard");
                    setPage("WalletDashboard");
                    break;
                case "TestAfterSendTransaction":
                    console.log("target is TestAfterSendTransaction");
                    setPage("TestAfterSendTransaction");
                    break;

            }
        }

        console.log("useeffect [] end");
    },[]);

    
    const getPageComponent = (page)=>{
        switch(page) {
            case "UrlMetaComments":
                console.log("UrlMetaComments in getPageComponent func");
                return <UrlMetaComments />;
                break;
            case "WalletDashboard":
                console.log("WalletDashboard in getPageComponent func");
                return <WalletDashboard />;
                break;
            case "Login":
              console.log("login in getPageComponent func");
              return <Login />;
              break;
            case "CreateWallet": 
              console.log("CreateWallet in getPageComponent func");
              return <CreateWallet />; 
              break;
            case "Content": 
              console.log("Content in getPageComponent func");
              return <Content />; 
              break;
            case "CreatePassword":
                console.log("CreatePassword in getPageComponent func");
                return <CreatePassword />
                break;
            case "CleanAllStorageKey":
                console.log("CleanAllStorageKey in getPageComponent func");
                return <CleanAllStorageKey />
                break;
            case "RSAKeyTest":
                console.log("RSAKeyTest in getPageComponent func");
                return <RSAKeyTest />
                break;
            case "SetRemovePassword":
                console.log("SetRemovePassword in getPageComponent func");
                return <SetRemovePassword />
                break;
            case "TestAfterSendTransaction":
                console.log("TestAfterSendTransaction in getPageComponent func");
                return <TestAfterSendTransaction />
                break;
            
            default: 
              console.log("default called");
              return null; break;
          }
    };
    

    return (
            <Container>
                
                {page? getPageComponent(page): null}
            
            </Container>
    );
        

        
    

    // render (){
    //     return (
    //         <Container>
    //             <Router>
    //                 <div>
    //                     <ul className="App-header">
    //                     <li>
    //                         <Link to="#login">Login</Link>
    //                     </li>
    //                     <li>
    //                         <Link to="/">Home1</Link>
    //                     </li>
    //                     <li>
    //                         <Link to="#about">
    //                             About Us
    //                         </Link>
    //                     </li>
    //                     <li>
    //                         <Link to="#create_wallet">
    //                             create wallet
    //                         </Link>
    //                     </li>
    //                     </ul>
    //                     <Routes>
    //                         <Route exact path = '/' element = {<WalletDashboard/>}></Route>
    //                         <Route exact path = '#login' element = {<Login/>}></Route>
    //                         <Route exact path = '#create_wallet' element = {<CreateWallet/>}></Route>
                            
    //                         <Route exact path='#about'
    //                             element={<Test2/>}>
    //                         </Route>
    //                         <Route exact path='#contact'
    //                             element={<Test1/>}>
    //                         </Route>
    //                     </Routes>
    //                 </div>
    //             </Router>
    //         </Container>
    //     );
// 
    // }



    // render (){
	// 	return (
    //         <Container>
    //             <Router>
    //                 <Routes>
    //                     {/* <Route exact path="/" element ={<Dashboard />} /> */}
    //                     <Route path="/" element ={<Test1 />} />
    //                     {/* <Route path="/test1" element ={<test1 />} /> */}
    //                 </Routes>
    //             </Router>
    //         </Container>
	// 	);

	// }


    // render (){
	// 	return (
    //         <Container>
    //             <Test1 />
    //         </Container>
	// 	);

	// }

    
}

export default App;

const appDiv = document.getElementById("app");
render (<App />, appDiv);





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// for study

// function Popup(){
//     return (
//         <>
//             <h1>hello jacob</h1>
//             <h1>My First Heading</h1>
//             <p>My first paragraph.</p>
//         </>

//     );
// }

// render(<Popup />,document.getElementById("react-target"))

// const reactTarget =  document.getElementById("react-target");

// reactTarget.render(<popup/>);