'use strict';

const gulp = require('gulp'),
	runSequence = require('run-sequence'),
	util = require('gulp-util'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	del = require('del'),
	eslint = require('gulp-eslint'),
	plumber = require('gulp-plumber'),
	uglify = require('gulp-uglify'),
	mocha = require('gulp-mocha'),
	karmaServer = require('karma').Server,
	sass = require('gulp-sass'),
	babel = require('gulp-babel'),
	sourcemaps = require('gulp-sourcemaps'),
	cssnano = require('gulp-cssnano'),
	autoprefixer = require('gulp-autoprefixer'),
	fs = require('fs'),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec;
let node, mongo,
	protractor;

function killProcessByName(name){
	exec('pgrep ' + name, (error, stdout, stderr) => {
		if (error) console.log('killProcessByName, error:', error);
		if (stderr) console.log('stderr:', stderr);
		if (stdout) {
			//console.log('killing running processes:', stdout);
			const runningProcessesIDs = stdout.match(/\d+/);
			runningProcessesIDs.forEach((id) => {
				exec('kill -9 ' + id, (error, stdout, stderr) => {
					if (error) throw error;
					if (stderr) console.log('stdout:', stdout);
					if (stdout) console.log('stderr:', stderr);
				});
			});
		}
	});
}

function setEnvCluster(value, done) {
	if (typeof value === 'boolean') {
		fs.readFile('./.env', (err, data) => {
			let env;
			if (err) {
				env = '';
			} else {
				env = data.toString();
			}
			if (env.indexOf('CLUSTER=') !== -1) {
				env = env.replace(/CLUSTER=.*\n/, `CLUSTER=${value}\n`);
			} else {
				env += `CLUSTER=${value}\n`;
			}
			fs.writeFile('./.env', env, (err) => {
				if (err) throw err;
				console.log(`# > ENV > .env file edited: CLUSTER=${value}`);
				if (done) done();
			});
		});
	} else {
		throw new TypeError('first argument must be boolean');
	}
}

gulp.task('dont-use-cluster', (done) => {
	setEnvCluster(false, done);
});

gulp.task('use-cluster', (done) => {
	setEnvCluster(true, done);
});

function dontGitignoreBuild(gitignore, done) {
	fs.writeFile('./.gitignore', gitignore, (err) => {
		if (err) throw err;
		console.log('# > ENV > .gitignore file was updated');
		done();
	});
}

gulp.task('dont-gitignore-build', (done) => {
	fs.readFile('./.gitignore', (err, data) => {
		let gitignore = '';
		if (err) {
			console.log('./.gitignore does not exist');
			dontGitignoreBuild(gitignore, done);
		} else {
			gitignore = data.toString()
				.replace(/public\/js\/\*\.\*\n/, '')
				.replace(/!public\/js\/\.gitkeep/, '')
				.replace(/public\/css\/\*\.css\n/, '')
				.replace(/!public\/css\/\.gitkeep/, '')
				.replace(/public\/fonts\/\*\.\*\n/, '')
				.replace(/!public\/fonts\/\*\.gitkeep/, '');
			console.log('./.gitignore exists, updated gitignore', gitignore);
			dontGitignoreBuild(gitignore, done);
		}
	});
});

gulp.task('database', (done) => {
	if (mongo) mongo.kill();
	mongo = spawn('npm', ['run','mongo-start'], {stdio: 'inherit'});
	mongo.on('close', (code) => {
		if (code === 8) {
			gulp.log('Error detected, waiting for changes...');
		}
	});
	done();
});

gulp.task('server', (done) => {
	if (node) node.kill();
	const waiter = setInterval(() => {
		if (node.connected) {
			console.log(' < NODE CONNECTED >');
			clearInterval(waiter);
			done();
		} else {
			console.log(' > node.connected:', node.connected);
		}
	}, 1000);
	node = spawn('node', ['server.js'], {stdio: [0, 1, 2, 'ipc']});
	node.on('close', (code) => {
		if (code === 8) {
			gulp.log('Error detected, waiting for changes...');
		}
	});
});

gulp.task('server-test', () => {
	return gulp.src(['./test/server/*.js'], { read: false })
		.pipe(mocha({ reporter: 'spec' }))
		.on('error', util.log);
});

gulp.task('client-unit-test', (done) => {
	const server = new karmaServer({
		configFile: require('path').resolve('test/karma.conf.js'),
		singleRun: true
	});

	server.on('browser_error', (browser, err) => {
		console.log('=====\nKarma > Run Failed\n=====\n', err);
		throw err;
	});

	server.on('run_complete', (browsers, results) => {
		if (results.failed) {
			console.log('=====\nKarma > Tests Failed\n=====\n', results);
		} else {
			console.log('=====\nKarma > Complete With No Failures\n=====\n', results);
		}
		done();
	});

	server.start();
});

gulp.task('client-e2e-test', () => {
	if (protractor) protractor.kill();
	protractor = spawn('npm', ['run', 'protractor'], {stdio: 'inherit'});
});

gulp.task('clean-build', () => {
	return del(['./public/css/*.css', './public/js/*.js', './public/fonts/*.otf', './public/fonts/*.eot', './public/fonts/*.svg', './public/fonts/*.ttf', './public/fonts/*.woff', './public/fonts/*.woff2']);
});

gulp.task('pack-app-js', () => {
	return gulp.src('./public/app/*.js')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(concat('packed-app.js'))
		.pipe(uglify())
		.pipe(plumber.stop())
		.pipe(rename('packed-app.min.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./public/js'));
});

gulp.task('pack-app-css', () => {
	return gulp.src('./public/app/scss/*.scss')
		.pipe(plumber())
		.pipe(concat('packed-app.css'))
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(cssnano())
		.pipe(plumber.stop())
		.pipe(rename('packed-app.min.css'))
		.pipe(gulp.dest('./public/css'));
});

gulp.task('pack-vendor-js', () => {
	return gulp.src([
		/*
		*	add third party js files here
		*/
		'./node_modules/jquery/dist/jquery.js',

		'./node_modules/angular-loader/angular-loader.js',
		'./node_modules/angular/angular.js',
		'./node_modules/angular-sanitize/angular-sanitize.js',
		'./node_modules/angular-aria/angular-aria.js',
		'./node_modules/angular-messages/angular-messages.js',
		'./node_modules/angular-animate/angular-animate.js',
		'./node_modules/angular-material/angular-material.js',
		'./node_modules/angular-resource/angular-resource.js',
		'./node_modules/angular-route/angular-route.js',
		'./node_modules/angular-spinner/dist/angular-spinner.js',
		'./node_modules/angular-mocks/angular-mocks.js',
		'./node_modules/angular-websocket/dist/angular-websocket.js',
		'./node_modules/chart.js/dist/Chart.bundle.js',
		'./node_modules/angular-chart.js/dist/angular-chart.js'
	])
		.pipe(plumber())
		.pipe(concat('vendor-pack.js'))
		.pipe(uglify())
		.pipe(plumber.stop())
		.pipe(rename('vendor-pack.min.js'))
		.pipe(gulp.dest('./public/js'));
});

gulp.task('pack-vendor-css', () => {
	return gulp.src([
		/*
		*	add third party css files here
		*/
		'./node_modules/font-awesome/css/font-awesome.css',
		
		'./node_modules/angular-material/angular-material.css',
		'./node_modules/angular-material/layouts/angular-material.layouts.css',
		'./node_modules/angular-material/layouts/angular-material.layout-attributes.css'
	])
		.pipe(plumber())
		.pipe(concat('vendor-pack.css'))
		.pipe(cssnano())
		.pipe(plumber.stop())
		.pipe(rename('vendor-pack.min.css'))
		.pipe(gulp.dest('./public/css'));
});

gulp.task('move-vendor-fonts', () => {
	return gulp.src([
		/*
		*	add third party fonts here
		*/
		'./node_modules/font-awesome/fonts/*.*'
	])
		.pipe(gulp.dest('./public/fonts'));
});

gulp.task('lint', () => {
	return gulp.src(['./app/**', './public/**/*.js', './*.js']) // uses ignore list from .eslintignore
		.pipe(eslint('./.eslintrc.json'))
		.pipe(eslint.format());
});

gulp.task('watch-and-lint', () => {
	gulp.watch(['./app/**', './public/**/*.js', './*.js', './.eslintignore', './.eslintrc.json'], ['lint']); // watch files to be linted or eslint config files and lint on change
});

gulp.task('watch', () => {
	gulp.watch(['./server.js', './app/config/*.js', './app/routes/*.js', './app/utils/*.js'], ['server']); // watch server and database changes and restart server
	gulp.watch(['./app/models/*.js'], ['database', 'server']); // watch database changes and restart database
	gulp.watch('./public/app/*.js', ['pack-app-js']); // watch app js changes, pack js, minify and put in respective folder
	gulp.watch('./public/app/scss/*.scss', ['pack-app-css']); // watch app css changes, pack css, minify and put in respective folder
	gulp.watch(['./public/app/*.js','./test/client/unit/*.js','./test/karma.conf.js'], ['client-unit-test']); //watch unit test changes and run tests
	gulp.watch(['./test/client/e2e/**', './test/protractor.conf.js'], ['client-e2e-test']); // watch client e2e test or protractor config changes and run tests
	gulp.watch(['./app/**', './public/**/*.js', './*.js', './.eslintignore', './.eslintrc.json'], ['lint']); // watch files to be linted or eslint config files and lint on change
	gulp.watch(['./test/server/test.js'], ['server-test']); // watch server changes and run tests
});

gulp.task('build', (done) => {
	runSequence('clean-build', 'lint', 'pack-app-js', 'pack-app-css', 'pack-vendor-js', 'pack-vendor-css', 'move-vendor-fonts', done);
});

gulp.task('heroku-build', (done) => {
	runSequence('pack-app-js', 'pack-app-css', 'pack-vendor-js', 'pack-vendor-css', 'move-vendor-fonts', done);
});

gulp.task('run-tests', (done) => {
	runSequence('server-test', 'client-unit-test', 'client-e2e-test', done);
});

gulp.task('default', (done) => {
	runSequence('build', 'database', 'server', 'watch', done);
});

process.on('exit', () => {
	if (node) node.kill();
	if (mongo) mongo.kill();
	if (protractor) protractor.kill();
});

process.on('SIGINT', () => {
	killProcessByName('gulp');
});
