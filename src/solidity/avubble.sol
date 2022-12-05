// SPDX-License-Identifier: MIT

//                                 /$$       /$$       /$$          
//                                | $$      | $$      | $$          
//   /$$$$$$  /$$    /$$ /$$   /$$| $$$$$$$ | $$$$$$$ | $$  /$$$$$$ 
//  |____  $$|  $$  /$$/| $$  | $$| $$__  $$| $$__  $$| $$ /$$__  $$
//   /$$$$$$$ \  $$/$$/ | $$  | $$| $$  \ $$| $$  \ $$| $$| $$$$$$$$
//  /$$__  $$  \  $$$/  | $$  | $$| $$  | $$| $$  | $$| $$| $$_____/
// |  $$$$$$$   \  $/   |  $$$$$$/| $$$$$$$/| $$$$$$$/| $$|  $$$$$$$
//  \_______/    \_/     \______/ |_______/ |_______/ |__/ \_______/
           

// SPDX-License-Identifier: MIT

//                                 /$$       /$$       /$$          
//                                | $$      | $$      | $$          
//   /$$$$$$  /$$    /$$ /$$   /$$| $$$$$$$ | $$$$$$$ | $$  /$$$$$$ 
//  |____  $$|  $$  /$$/| $$  | $$| $$__  $$| $$__  $$| $$ /$$__  $$
//   /$$$$$$$ \  $$/$$/ | $$  | $$| $$  \ $$| $$  \ $$| $$| $$$$$$$$
//  /$$__  $$  \  $$$/  | $$  | $$| $$  | $$| $$  | $$| $$| $$_____/
// |  $$$$$$$   \  $/   |  $$$$$$/| $$$$$$$/| $$$$$$$/| $$|  $$$$$$$
//  \_______/    \_/     \______/ |_______/ |_______/ |__/ \_______/
           

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @custom:security-contact 18thcenturyprogrammer@gmail.com
contract Avubble is ERC1155, Ownable, Pausable, ERC1155Burnable, ERC1155Supply {
    // uint256 public mintFee = 0.25 ether;
    uint256 public mintFee = 0.001 ether;
    uint256 public maxQtyUserMint = 10000;
    mapping(uint256 => string) public uris;

    constructor()
        ERC1155("")
    {}

    function setMintFee(uint256 newFee) public onlyOwner {
        mintFee = newFee;
    }

    function mintByOwner(address account, uint256 id, uint256 amount)
        public
        onlyOwner
    {
        _mint(account, id, amount, "");
    }

    function mintByUser(address account, uint256 id, uint256 amount)
        public 
        payable
    {
        require(totalSupply(id)+amount <= maxQtyUserMint,"User mint qty reached max limit");
        require(msg.value == mintFee * amount ,"Not correct fee");
        _mint(account, id, amount, "");
    }

    function uri(uint256 _id) public view override returns (string memory) {
        return uris[_id];
    }

    function setOneUri(uint256 _id, string calldata _uri)
        public
        onlyOwner
    {
        uris[_id] = _uri;
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        whenNotPaused
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}