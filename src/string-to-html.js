
const toHTML = function(innerHTML){
	let tempContainer = document.createElement("div");
	tempContainer.innerHTML = innerHTML;
	return tempContainer.children[0];
}

module.exports = { toHTML };