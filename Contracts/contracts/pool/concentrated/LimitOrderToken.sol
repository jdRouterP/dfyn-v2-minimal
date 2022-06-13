// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LimitOrderToken is ERC721, Ownable {
    uint256 public nftMinted;
    uint256 public nftBurned;

    constructor(string memory _tokenName, string memory _tokensymbol) ERC721(_tokenName, _tokensymbol) {}

    function mint(address recipient, uint256 id) external onlyOwner {
        _mint(recipient, id);
    }

    function burn(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
    }
}
