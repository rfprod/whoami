const os = require('os'),
	exec = require('child_process').execSync;

exports.static = function () {
	return [
		{
			name: 'Node.js Version',
			value: process.version.replace('v', '')
		},{
			name: 'NPM Version',
			value: exec('npm --version').toString().replace(os.EOL, '')
		},{
			name: 'OS Type',
			value: os.type()
		},{
			name: 'OS Platform',
			value: os.platform()
		},{
			name: 'OS Architecture',
			value: os.arch()
		},{
			name: 'OS Release',
			value: os.release()
		},{
			name: 'CPU Cores',
			value: os.cpus().length
		}
	];
};

exports.dynamic = function () {
	return [
		{
			name: 'Free Memory',
			value: `${Math.round(os.freemem() / 1048576)}MB`
		},{
			name: 'Uptime',
			value: `${os.uptime()}s`
		}
	];
};
