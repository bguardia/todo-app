const nl2br = function(inputStr){
	return inputStr.replace(/\n/g, '<br/>');
}

module.exports = { nl2br };