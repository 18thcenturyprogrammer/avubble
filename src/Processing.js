import React, { Component } from "react";
import { render } from "react-dom";
import { Segment,Image,Dimmer,Loader } from "semantic-ui-react";

const Processing = ({isOn})=>{

    console.log("isOn value is : ",isOn);

    return (
        <>
            {/* {()=>{
                if(isOn){
                    return 
                        <Segment>
                            <Dimmer active>
                                <Loader size='big'>Processing</Loader>
                            </Dimmer>

                            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                        </Segment>
                }
            }} */}

            {isOn? 
                <Segment>
                    <Dimmer active>
                        <Loader size='big'>Processing</Loader>
                    </Dimmer>

                    <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                    <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                    <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                </Segment>
                :""
            }
            
        </>
    );
};


export default Processing;