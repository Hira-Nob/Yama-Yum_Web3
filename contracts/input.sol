//データのインプットコードと表示コード
pragma solidity ^0.4.25;
//参考
//https://www.techpit.jp/courses/16/curriculums/17/sections/153/parts/589
contract inputIdea {
	// ①コントラクトオーナーのアドレス
    address private owner; 
    uint private numUser;  // 登録件数
    
    // ②登録情報を保存するデータ構造体
    struct userInfo {
        string name;  // 名前
        string email; // Emailアドレス
        string myidea; // アイディア
    }
    mapping(uint => userInfo) private accounts;
    
    // ③コンストラクタ
    // コントラクトを公開した際に実行されます
    constructor() public {
        owner = msg.sender; // コントラクトを公開したアドレスをオーナーに指定する
        numUser = 0;        // 登録数の初期化
    }
    
    // ④アクセス制限の実装
    modifier onlyOwner {
	    // コントラクトを呼び出したアドレスがオーナーと一致するか確認する
	    // 一致しない場合は処理を止める
        require(msg.sender == owner); 
        _; // modifierの末尾に必要
    }
    
    // ⑤modifierを関数に付与する
    // ユーザー情報を登録する関数
    function setInfo(string _name, string _email,string _myidea) public onlyOwner {
        accounts[numUser].name = _name;
        accounts[numUser].email = _email;
         accounts[numUser].myidea = _myidea;
        numUser++;
    }
    
    // ユーザー情報を取得する関数
    function getInfo(uint _numUser) view public onlyOwner returns(string, string) {
        return (accounts[_numUser].name, accounts[_numUser].email, accounts[_numUser].myidea);
    }
}

