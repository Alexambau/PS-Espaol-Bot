/* Games generator */

/*****************************************
*				Hangman
******************************************/

exports.hangman = {
	word: {},
	wordStr: '',
	wordStrF: '',
	clue: '',
	saidKeys: {},
	failCount: 0,
	maxFail: false,
	ended: false,
	
	getStatus: function () {
		var str = '';
		var disabled = 0;
		var word = '';
		var saidKeys = Object.keys(this.saidKeys).sort().join(" ");
		
		for (var i = 0; i < this.word.length; i++) {
			if (this.word[i].space) {
				word += ' - ';
				continue;
			}
			if (this.word[i].enabled) {
				word += this.word[i].key;
			} else {
				disabled++;
				word += ' _ '
			}
		}
		
		if (!disabled) return {type: 'end', word: word};
		if (this.maxFail && this.failCount > this.maxFail) return {type: 'forceend', word: word};
		return {type: 'turn', word: word, saidKeys: saidKeys};
	},
	
	init: function (phrase) {
		//clear values
		this.ended = false;
		this.failCount = 0;
		this.maxFail = false;
		this.saidKeys = {};
		//init
		if (!phrase) return;
		var datas = phrase.split(" ");
		this.word = [];
		this.wordStr = phrase.toLowerCase().replace(/[^a-z0-9ñ]/g, '');
		this.wordStrF = '';
		var actWord;
		for (var i = 0; i < datas.length; i++) {
			actWord = datas[i].toLowerCase().replace(/[^a-z0-9ñ]/g, '');
			if (!actWord.length) continue;
			for (var j = 0; j < actWord.length; j++) {
				this.word.push(
					{key: actWord.charAt(j).toUpperCase(), enabled: false}
				);
				this.wordStrF += actWord.charAt(j).toUpperCase();
			}
			if (i !== (datas.length - 1)) {
				this.word.push({space: true});
				this.wordStrF += ' ';
			}
		}
		return this.getStatus();
	},
	
	guess: function (key) {
		key = key.toLowerCase().replace(/[^a-z0-9ñ]/g, '');
		if (!key.length || key.length > 1) return;
		if (this.saidKeys[key]) return;
		var keyCount = 0;
		this.saidKeys[key] = 1;
		key = key.toUpperCase();
		for (var i = 0; i < this.word.length; i++) {
			if (this.word[i].space) continue;
			if (!this.word[i].enabled && this.word[i].key === key) {
				this.word[i].enabled = true;
				keyCount++;
			}
		}
		if (!keyCount) {
			this.failCount++;
			return false;
		}
		return this.getStatus();
	},
	
	guessWord: function () {
		for (var i = 0; i < this.word.length; i++) {
			if (this.word[i].space) continue;
			if (!this.word[i].enabled) this.word[i].enabled = true;
		}
		return this.getStatus();
	}
};