//import todoContract from '../build/contracts/todo.json' assert { type: "json" };

//Ganacheのデフォルトのポート番号は7545
//const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
//関係無いと思うけど一応↓に変えとく
const web3  = new Web3(window.ethereum);

// check metamask
// https://docs.metamask.io/guide/getting-started.html#basic-considerations
if (typeof window.ethereum !== 'undefined') {
  console.log('MetaMask is installed!');
}

// 自分のアカウント情報を取得
const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
const account = accounts[0];
web3.eth.defaultAccount = account;
console.log(web3.eth.defaultAccount);

const contract = new web3.eth.Contract(ContractAbi, contractAddress);
const contract2 = new web3.eth.Contract(ContractAbi2, contractAddress2)

// 初期表示
displayTodo()

// 作成ボタン押下時の処理
$("#createTodoButton").click(function () {
  createTodo($("#createTodoInput").val());
});

// 削除ボタン押下時の処理
// DOM 生成後に作られたオブジェクトなので on を使う
$(document).on("click", ".deleteTodoButton", function () {
  const id=$(this).parent().attr('id');
  deleteTodo(id);
});

// 投票ボタン押下時の処理
$(document).on("click", ".voteButton", function () {
  //alert('ここは走ってます:1')
  const id=$(this).parent().attr('id');
  voteItem(id);
});

// 採用ボタン押下時の処理
$(document).on("click", ".adoptionButton", function () {
  // 紙吹雪
  party.confetti(this, {
      //lifetime: 5,
      count: party.variation.range(50, 100),
      //speed: party.variation.range(20, 40),
      //size: 100,
  });

  const id=$(this).parent().attr('id');
  adoptItem(id);
});

// // 採用ボタンクリック時の演出
// document.querySelector(".button").addEventListener("click", function (e) {
//   party.confetti(this, {
//       //lifetime: 5,
//       count: party.variation.range(50, 100),
//       //speed: party.variation.range(20, 40),
//       //size: 100,
//   });
// });

// チェックボックス押下時の処理
// DOM 生成後に作られたオブジェクトなので on を使う
$(document).on("change", "input[type=checkbox]", function(){
  const id=$(this).parent().attr('id');
  const is_opened=$(this).prop("checked") ? false : true
  updateTodo(id, is_opened);
});

// TODOの作成
function createTodo(msg) {
  createABI(msg).
  then(() => displayTodo().
    then($('#createTodoInput').val(""))
  );
}

// TODOの更新
function updateTodo(id, is_opened) {
  updateABI(id, is_opened);
}

// TODOの削除
function deleteTodo(id) {
  deleteABI(id).
  then(() => displayTodo());
}

// 投票時の処理
function voteItem(id) {
  //alert('ここは走ってます:2')
  voteABI(id).
  then(() => displayTodo());
}

// 採用時の処理
function adoptItem(id) {
  adoptABI(id).
  then(() => displayTodo());
}

// TODOの詳細の取得
async function describeTodo(id) {
  const todo = await describeABI(id)
  todo['id'] = id
  return todo
}

// TODOリストの表示
async function displayTodo() {

  const todoList=[]
  //
  // getABI で取得した TODO の一覧を使って
  // describeTodo で詳細情報を非同期で取得します
  // 取得した結果は todoList に格納します
  //
  // このとき describeTodo の呼び出し、todoList の格納が
  // それぞれ非同期で行われるため Promise.all を使って
  // どちらの挙動もきちんと終了してから画面の描画(_updateDisplay)を
  // 呼び出さないと値が正しく格納されないため 2 回利用しています。
  //
  getABI()
    .then((ids) =>  {
      Promise.all(
        ids.map(async function(id) {
          todoList.push(describeTodo(id))
        })
      ).then(
        Promise.all(todoList)
        .then(values => {
          _updateDisplay(values)
        })
      )
    }
  )
}

// TODOリストの表示更新
function _updateDisplay(todoList) {

  // 表示する HTML を生成
  let todoHTMLItems = ""
  for (const e of todoList) {
    const checkFlag = e.is_opened ? "" : "checked"

    // Solidity側のストレージに自分のTODOリストがあった場合、以下のHTMLを作成 (ボタンやチェックボックス、テキスト)
    todoHTMLItems = todoHTMLItems + '<li id="'+ e.id +'" class="list-group-item border-0 d-flex align-items-center ps-0">\
      <input class="adoptBtn adoptionButton btn btn-success mx-2" onmousedown="party.confetti(this)" type="button" value="採用!"/>\
      <input class="voteButton btn btn-secondary mx-2" type="button" value="投票"/>\
      <input class="form-check-input mx-2" type="checkbox" value="" aria-label="..." ' + checkFlag + ' />'
       + e.contents + " / 投票件数：" + e.voteCnt + '</li>'
  }

  // 画面の更新
  $('.list-group').replaceWith("<ul class='list-group rounded-0'>"+ todoHTMLItems +"</ul>")
}

// contract から TODO リストを取得
async function getABI() {
  return await contract.methods.getTODO2().call({from: web3.eth.defaultAccount})
}

// contract から特定の TODO を取得
async function describeABI(id) {
  return await contract.methods.todos(id).call({from: web3.eth.defaultAccount});
}

// contract から TODO を作成
async function createABI(contents) {
  await contract.methods.createTODO(contents).send({from: web3.eth.defaultAccount})
}

// contract で TODO を更新
async function updateABI(id, is_opened) {
  await contract.methods.updateTODO(id, is_opened).send({from: web3.eth.defaultAccount})
}

/* // contract で TODO を削除
async function deleteABI(id) {
  await contract.methods.deleteTODO(id).send({from: web3.eth.defaultAccount})
} */

// contract で Itemに投票
async function voteABI(id) {
  await contract.methods.voteTODO(id).send({from: web3.eth.defaultAccount})
  alert('投票が完了しました')
}

// contract で Itemを採用
async function adoptABI(id) {
  await contract.methods.adoptTODO(id).send({from: web3.eth.defaultAccount})
  alert('アイデアを採用し、アイデア投稿者にトークンが付与されました。')
    //ここに送金処置
   //const send = await contract2.methods.mint(10).send({from: account});//ウォレットに入金
    //const send = await contract2.methods.burn(10).send({from: account});//ウォレットの金削除
	   //const send = await contract2.methods.transfer("0x0a078FB411D78558aE65c5034b07efab2b0E69Fe",10).send({from: account});//ウォレットの金譲渡
}
