const MAX_CMD_FLOOD = 30;
const FLOOD_INTERVAL = 45 * 1000;

exports.monitor = {
	cmdusage: {},
	cmdtimes: {},
	lockedlist: {},
	connection: false,
	logsroom: 'salastaff',
	
	log: function(data, type) {
		var text = '';
		if (!type) type = 'r';
		switch (type) {
			case 'r':
				text += '[__Monitor de recursos__] ';
				break;
			case 'c':
				text += '[__0Tol__] ';
				break;
			case 'i':
				text += '[__Info__] ';
				break;
		}
		text += data;
		if (!config.ignorelogs) {
			send(this.connection, this.logsroom + "|" + text);
		}
	},
	
	countcmd: function(user) {
		user = toId(user);
		var now = Date.now();
		if (!this.cmdtimes[user]) {
			this.cmdusage[user] = 1;
			this.cmdtimes[user] = now;
			return;
		}
		var duration = now - this.cmdtimes[user];
		if (user in this.cmdusage && duration < FLOOD_INTERVAL) {
			this.cmdusage[user]++;
			if (this.cmdusage[user] < MAX_CMD_FLOOD && this.cmdusage[user] % 10 === 0 && duration < 12 * 1000) {
				this.log('Usuario ' + user + ' ha utilizado ' + this.cmdusage[user] + ' comandos en los últimos ' + duration.duration().replace("second", "segundo"));
			} else if (this.cmdusage[user] < MAX_CMD_FLOOD && this.cmdusage[user] % 20 === 0 && duration < 24 * 1000) {
				this.log('Usuario ' + user + ' ha utilizado ' + this.cmdusage[user] + ' comandos en los últimos ' + duration.duration().replace("second", "segundo"));
			} else if (this.cmdusage[user] >= MAX_CMD_FLOOD) {
				this.lock(user);
				this.log('Usuario ' + user + ' fue ignorado por flood de comandos (' + this.cmdusage[user] + ' comandos en los últimos ' + duration.duration().replace("second", "segundo") + ')');
				return true;
			}
		} else {
			this.cmdusage[user] = 1;
			this.cmdtimes[user] = now;
		}
	},
	
	lock: function(user) {
		user = toId(user);
		this.lockedlist[user] = 1;
	},
	
	unlock: function(user) {
		user = toId(user);
		if (this.lockedlist[user]) delete this.lockedlist[user];
	},
	
	isLocked: function(user) {
		return this.lockedlist[toId(user)];
	}
};