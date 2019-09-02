// ==UserScript==
// @name     Instagram Request Canceler
// @version  1
// @include https://www.instagram.com/accounts/access_tool/current_follow_requests
// ==/UserScript==

// Prep
var mainList = null;
var list = null;
var head = null;
var btnCopy = null;

function startUp() {
	clearInterval(checkReady);
	
	list = document.getElementsByTagName("section")[1];
	head = mainList.singleNodeValue.children[0];
  
	// Find "view more" button to copy style and add more cancel request buttons when the list loads
	btnCopy = mainList.singleNodeValue.children[2];
	btnCopy.addEventListener("click", function(e){setTimeout(addUserButtons, 1500)});
  
	addUserButtons();
	addCancelAllOptions();
  
	var docMain = document.getElementsByTagName("main")[0];
	docMain.appendChild(addIFrame());
  
  var btnCancelAll = document.getElementById("btnCancelAll");
  btnCancelAll.addEventListener("click", cancelAllRequests);
  
	console.log("Main Window Ready");
}

// Kind of important everything is loaded. Check to make sure we have the main section loaded.
var checkReady = setInterval(function() {
	mainList = document.evaluate('/html/body/span/section/main/div/article/main', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if (typeof mainList.singleNodeValue !== 'null' ) {
		startUp();
		clearInterval(checkReady);
	}
}, 1000);


async function cancelAllRequests() {
	let autoLoad = document.getElementById("chkAuto");
	let autoRemove = document.getElementById("chkRemove");
	let viewMore = mainList.singleNodeValue.children[mainList.singleNodeValue.children.length - 1];
  
	for (let i = 0; i < list.children.length; i++) {
		await openIFrameToCancel(username = list.children[i].children[0].value);
		if (autoRemove.checked) {
			list.children[i].remove();
      i--;
		} else {
			list.children[i].style.setProperty("text-decoration", "line-through");
		};
  };
	
  if (autoLoad.checked) {
    viewMore.click();
    setTimeout(()=>{cancelAllRequests()}, 3000);
  }
    
}

async function cancelOneRequest() {
	let autoRemove = document.getElementById("chkRemove");
  
	await openIFrameToCancel(username = this.value);
	if (autoRemove.checked) {
		this.parentNode.remove();
	} else {
		this.parentNode.style.setProperty("text-decoration", "line-through");
    }
}

async function openIFrameToCancel(username) {
	let cancelFrame = document.getElementById("cancelFrame");
	let name = (typeof(username) == "object") ? username.target.value : username;
  
	console.log("canceling " + "https://www.instagram.com/" + name);
  
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
		if (buttons[i].innerText == "Unfollow") {buttons[i].click()};
	}
	
	return true;
}

function makeUserCancelButton(name) {
	let cancelBtn = document.createElement("button");
	cancelBtn.innerText = "Cancel Request";
	cancelBtn.className = btnCopy.className;
	cancelBtn.style.padding = "2px 9px";
	cancelBtn.value = name;
	cancelBtn.onclick = cancelOneRequest;
	return cancelBtn;
}

function addUserButtons() {
	for (let i = 0; i < list.children.length; i++) {
		if (list.children[i].children.length < 1) {
			list.children[i].style.flexDirection = "row";
			list.children[i].style.justifyContent = "space-between";
			list.children[i].appendChild(makeUserCancelButton(list.children[i].innerText));
		}
	}
}

function addIFrame() {
	let newFrame = document.createElement("iframe");
	newFrame.height = 300;
	newFrame.width = 1000;
	newFrame.style.margin = "auto";
	newFrame.id = "cancelFrame";
	return newFrame;
}

function addCancelAllOptions() {
	let cancelDiv = document.createElement("div");
	cancelDiv.style.flexDirection = "row";
	cancelDiv.style.marginBottom = "10px";
	cancelDiv.id = "options";
	
	let cancelBtn = document.createElement("button");
	cancelBtn.innerText = "Cancel All Requets";
	cancelBtn.className = btnCopy.className;
	cancelBtn.style.padding = "2px 9px";
	cancelBtn.onclick = cancelAllRequests;
  cancelBtn.type = "button";
  cancelBtn.id = "btnCancelAll";
	
	cancelDiv.appendChild(cancelBtn);

  let cancelOpts = document.createElement("input");
  cancelOpts.type = "checkbox";
  cancelOpts.name = "autolist";
  cancelOpts.id = "chkAuto";
  
  cancelDiv.appendChild(cancelOpts);
  
  cancelOpts = document.createElement("label");
  cancelOpts.for = "autolist";
  cancelOpts.style.paddingRight = "5px";
  
  let subOpts = document.createTextNode("Auto-load list");
  
  cancelOpts.appendChild(subOpts);
  cancelDiv.appendChild(cancelOpts);
  
  cancelOpts = document.createElement("input");
  cancelOpts.type = "checkbox";
  cancelOpts.name = "autoremove";
  cancelOpts.id = "chkRemove";
  
  cancelDiv.appendChild(cancelOpts);
  
  cancelOpts = document.createElement("label");
  cancelOpts.for = "autoremove";
  subOpts = document.createTextNode("Auto-remove names");
  
  cancelOpts.appendChild(subOpts);
  cancelDiv.appendChild(cancelOpts);
  
  
  head.insertAdjacentHTML("afterend", cancelDiv.outerHTML);
}