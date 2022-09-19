// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC721/extensions/ER721Enumerable.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "./IWhitelist.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    /**
     * @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`.
     */
    string _baseTokenURI;

    // whitelist contract instance
    IWhitelist whitelist;

    // _price is the price of one Crypto Dev NFT
    uint256 public _price = 0.01 ether;

    // _pause is used to pause the contract in case of an emergency
    bool public _paused;

    // max number of the CryptoDevs
    uint256 public maxTokenIds = 20;

    // total umber of tokenIds minted
    uint256 public tokenIds;

    // boolean to keep track of the whether presale started or not
    bool public presaleStarted;

    // timestamp for when presale would end
    uint256 public presaleEnded;

    modifier onlyWhenNotPaused() {
        require(!_paused, "Contract currently paused");
        _;
    }

    /**
     * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
     * name in our case is `Crypto Devs` and symbol is `CD`.
     * Constructor for Crypto Devs takes in the baseURI to set _baseTokenURI for the collection.
     * It also initializes an instance of whitelist interface.
     */
    constructor(string memory baseURI, address whitelistContract)
        ERC721("Crypto Devs", "CD")
    {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    /*
        startPresale starts a presale for the whitelisted addresses
    */
    function startPresale() public onlyOwner {
        presaleStarted = true;
        // set presaleEnded time as current timeStamp + 5 mins
        // Solidity has cool syntax for timestamp (seconds, minuites, hours, days, years)
        // whatever the current timestamp of my block is add 5 minutes to it so after then the presale will end
        presaleEnded = block.timestamp + 5 minutes;
    }

    function presaleMint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp < presaleEnded,
            "Presale ended and no longer running"
        );
        // require(
        //     whitelist.whitelistedAddresses(msg.sender),
        //     "You are not in Whitelist"
        // );
        require(
            whitelist.whitelistedAddresses(msg.sender),
            "You are not whitelisted"
        );
        require(
            tokenIds < maxTokenIds,
            "Exceeded the limit (Crypto Devs supply)"
        );
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp >= presaleEnded,
            "Presale has not ended yet"
        );
        require(tokenIds < maxTokenIds, "Exceeded the limit");
        require(msg.value >= _price, "Ether sent is not correct");

        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    // In solidity if you want your contract to  be able to recieve the ether
    // called recieve and fallback

    //Recieve is called when your msg.data is empty --> which means that you're sending ether only no data attached

    // Fallback ---> If you're including data...
    // included to be able to recieve Ether
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // To prevent someone from exploiting your contract
    function setPused(bool val) public onlyOwner {
        _paused = val;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send ether");
    }

    receive() external payable {}

    fallback() external payable {}
}
