pragma solidity ^0.4.23;

import '../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 { 

    struct Star { 
        string name; 
        string starStory;
        string ra;
        string dec;
        string mag;
        string cen;
    }

    mapping(uint256 => Star) private tokenIdToStarInfoes; 
    mapping(uint256 => uint256) private starsForSales;
    bytes [] internal starCoordination;

    function createStar(string _name,string _story,string _ra,string _dec,string _mag,string _cen, uint256 _tokenId) public { 

        require(bytes(_name).length>0);
        require(bytes(_story).length>0 );
        require(bytes(_story).length<256);

        require(checkIfStarExist(_dec,_mag,_cen) == true);

        bytes memory co = abi.encodePacked(bytes(_dec),bytes(_mag),bytes(_cen));

        starCoordination.push(co);

        Star memory newStar = Star(_name,_story,_ra,_dec,_mag,_cen);

        tokenIdToStarInfoes[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSales[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSales[_tokenId] > 0);
        
        uint256 starCost = starsForSales[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }
    /**
     * @param  _dec string
     * @param  _mag string
     * @param  _cen string
     * @return Boolean
     */
    function checkIfStarExist(string _dec,string _mag,string _cen) public view returns (bool) {
        bytes memory co = abi.encodePacked(bytes(_dec),bytes(_mag),bytes(_cen));

        for(uint i=0;i<starCoordination.length;i++){
            bytes memory oco = starCoordination[i];
            if ( oco.length == co.length && keccak256(oco) == keccak256(co)){
                return false;
            }
        }
        return true;
    }

    /**
     * @param  _tokenId uint256
     * @return Star
     */
    function tokenIdToStarInfo(uint256 _tokenId ) public view returns(string,string,string,string,string,string){
         Star memory s = tokenIdToStarInfoes[_tokenId];
         s.ra = string(abi.encodePacked('ra_',bytes(s.ra)));
         s.dec = string(abi.encodePacked('dec_',bytes(s.dec)));
         s.mag = string(abi.encodePacked('mag_',bytes(s.mag)));
         s.cen = string(abi.encodePacked('cen_',bytes(s.cen)));

         return (s.name,s.starStory,s.ra,s.dec,s.mag,s.cen);
    }

    /**
     * 获取所有售卖的Star
     * @return uint256
     */
    function starsForSale(uint256 _tokenId) public view returns (uint256){
        return starsForSales[_tokenId];
    }
}