// SPDX-License-Identifier: UNLISCENSED
pragma solidity ^0.8.4;
//https://kanta-blog.tokyo/solidity-make-toke////
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

//コインを発行するコード
contract BestIdeaToken is ERC20 {
  constructor(uint256 initialSupply) public ERC20 ("BestIdeaToken", "BIT"){
  _mint(msg.sender, initialSupply);
  //↓百万枚のコインを作るという数字指定をしたいときのコード
　//_mint(msg.sender, 1000000 * 10 ** decimals());
  }
}


//ここからトークンを配布するコード
//https://manablog.org/solidity-fauce////
interface ERC20 {
    
     /**
     * @dev は`account` が所有するトークンを返す。
     */
    function balanceOf(address account) external view returns (uint256);

     /**
     * @dev トークンの小数点以下の桁数を返します。
     */
    function decimals() external view returns (uint8);

    /**
     * @dev 呼び出し元のアカウントから `amount` トークンを転送する。
     * を `recipient` アカウントに送信します。

     * Emits a {Transfer} eventは、操作の状態を示す真偽値を返す。
     */
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
 
}

contract MBTFaucet {
    
    // Faucetの基礎となるトークン
    ERC20 token;
    
    // Faucetオーナーのアドレス
    address owner;
    
    // For rate limiting
    mapping(address=>uint256) nextRequestAt;
    
    // 要求されたときに送信するトークンの数
    uint256 faucetDripAmount = 1;
    
    // SOwnerと基礎となるトークンのアドレスを設定します。
    constructor (address _mbtAddress, address _ownerAddress) {
        token = ERC20(_mbtAddress);
        owner = _ownerAddress;
    }   
    
    // 発信者が所有者であるかどうかを確認する
    modifier onlyOwner{
        require(msg.sender == owner,"FaucetError: Caller not owner");
        _;
    }
    
    // トークンの金額を発信者に送信します
    function send() external {
        require(token.balanceOf(address(this)) > 1,"FaucetError: Empty");
        require(nextRequestAt[msg.sender] < block.timestamp, "FaucetError: Try again later");
        
        //アドレスからの次のリクエストは、5分後にしかできません
        nextRequestAt[msg.sender] = block.timestamp + (5 minutes); 
        
        token.transfer(msg.sender,faucetDripAmount * 10**token.decimals());
    }  
    
    // Updates the underlying token address(根源的なトークンアドレスを更新？
     function setTokenAddress(address _tokenAddr) external onlyOwner {
        token = ERC20(_tokenAddr);
    }    
    
    // Updates the drip rate（滴下速度を更新する？
     function setFaucetDripAmount(uint256 _amount) external onlyOwner {
        faucetDripAmount = _amount;
    }  
     
     
     // 所有者が契約からトークンを引き出すことを可能にする。
     function withdrawTokens(address _receiver, uint256 _amount) external onlyOwner {
        require(token.balanceOf(address(this)) >= _amount,"FaucetError: Insufficient funds");
        token.transfer(_receiver,_amount);
    }    
}
