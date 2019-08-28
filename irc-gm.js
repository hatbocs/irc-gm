// ==UserScript==
// @name     Instagram Request Canceler
// @version  1
// @include https://www.instagram.com/accounts/access_tool/current_follow_requests
// ==/UserScript==

// Prep
var mainList = null;
var btnCopy = null;
var canDelete = false;

function startUp() {
	clearInterval(checkReady);
  console.log("Main Window Ready");
  
	btnCopy = mainList.singleNodeValue.children[2];
  btnCopy.addEventListener("click", function(e){setTimeout(addUserButtons, 1500)});
  
  addUserButtons();
  addCancelAllButton();
  
  var docMain = document.getElementsByTagName("main")[0];
  docMain.appendChild(addIFrame());
}

var checkReady = setInterval(function() {
  mainList = document.evaluate('/html/body/span/section/main/div/article/main', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  if (typeof mainList.singleNodeValue !== 'null' ) {
    startUp();
    clearInterval(checkReady);
  }
}, 1000);


async function cancelAllRequests() {
  let list = mainList.singleNodeValue.children[1];
  
  for (var i = 0; i < list.children.length; i++) {
    await openIFrameToCancel(username = list.children[i].children[0].value);
    list.children[i].style.setProperty("text-decoration", "line-through");
  }
}  

async function openIFrameToCancel(username) {
  let cancelFrame = document.getElementById("cancelFrame");
  let name = (typeof(username) == "object") ? username.target.value : username;
  
  //console.log("canceling " + "https://www.instagram.com/" + name);
  
  let promise = new Promise ((resolve, reject) => {
    cancelFrame.onload = () => resolve(document.getElementById("cancelFrame").contentWindow.document);
    cancelFrame.src = "https://www.instagram.com/" + name;
  });
  
  let theFrame = await promise;
  
  let buttons = theFrame.getElementsByTagName("button");
  
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].innerText == "Requested") {buttons[i].click();}
  }
  
  let unfollow = undefined;
  
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].innerText == "Unfollow") {unfollow = buttons[i];/*button[i].click()*/};
  }
  
  return true;
}

function makeUserCancelButton(name) {
  var cancelBtn = document.createElement("button");
  cancelBtn.innerText = "Cancel Request";
	cancelBtn.className = btnCopy.className;
  cancelBtn.style.padding = "2px 9px";
  cancelBtn.value = name;
  cancelBtn.onclick = openIFrameToCancel;
  return cancelBtn;
}

function addUserButtons() {
  var list = mainList.singleNodeValue.children[1];
  
  for (var i = 0; i < list.children.length; i++) {
    if (list.children[i].children.length < 1) {
      list.children[i].style.flexDirection = "row";
      list.children[i].style.justifyContent = "space-between";
      //list.children[i].style.backgroundColor = "#eee";
      list.children[i].appendChild(makeUserCancelButton(list.children[i].innerText));
    }
  }
}

function addCancelAllButton() {
  var head = mainList.singleNodeValue.children[0];
  
  var cancelBtn = document.createElement("button");
  cancelBtn.innerText = "Cancel All Requets";
  cancelBtn.className = btnCopy.className;
  cancelBtn.style.padding = "2px 9px";
  cancelBtn.onclick = cancelAllRequests;
  
  head.appendChild(cancelBtn);
}

function addIFrame() {
  var newFrame = document.createElement("iframe");
  newFrame.height = 300;
  newFrame.width = 1000;
  newFrame.style.margin = "auto";
  newFrame.id = "cancelFrame";
  return newFrame;
}