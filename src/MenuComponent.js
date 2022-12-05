import React, { Component } from 'react'
import { Input, Menu, Segment } from 'semantic-ui-react'

export default class MenuComponent extends Component {
  state = { activeItem: this.props.selectedMenu }

  handleItemClick = (e, { name }) => {

    switch (name){
        case 'url_meta_comment':
            window.location.href = '/popup.html';
            break;
        case 'content':
            window.location.href = '/popup.html?target=Content';
            break;
        case 'logout':
            chrome.storage.sync.remove("password",()=>{
                console.log("password deleted");
                window.location.href = '/popup.html';
            });
          
          break;
    }
    this.setState({ activeItem: name })
}

  render() {
    const { activeItem } = this.state

    return (
      <div>
        <Menu pointing>
          <Menu.Item
            name='url_meta_comment'
            active={activeItem === 'url_meta_comment'}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name='content'
            active={activeItem === 'content'}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name='logout'
            active={activeItem === 'logout'}
            onClick={this.handleItemClick}
          />
          
        </Menu>
      </div>
    )
  }
}