# WhoAmI microservice

![build](https://travis-ci.org/rfprod/whoami.svg?branch=master)

## Overview

WhoAmI service registers and logs request headers:

* [`x-forwarded-for`](https://en.wikipedia.org/wiki/X-Forwarded-For)
* [`accept-language`](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Accept-Language)
* [`user-agent`](https://en.wikipedia.org/wiki/User_agent)

While logging it associates accept-language and user-agent headers with x-forwarded-for, i.e. x-forwarded-for is a unique record key.

Additionally, if client has javascript enabled, the application collects (but does not log in any way) and presents to user available data about user's PC via objects:

* [`navigator`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator)
* [`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window)

# Start

### Requirements

In order to use WhoAmI microservice you must have the following installed:

- [`Node.js`](https://nodejs.org/)
- [`NPM`](https://nodejs.org/)
- [`MongoDB`](http://www.mongodb.org/)
- [`Git`](https://git-scm.com/)
- [`Heroku CLI`](https://devcenter.heroku.com/articles/heroku-cli)

### Installation & Startup

to install WhoAmI microservice execute the below command in the terminal window while in your projects folder:

```
$ git clone git@github.com:rfprod/whoami.git
```

this will install WhoAmI microservice components into the `whoami` directory in your projects folder

### Local Deployment

create a file named `.env` in the root directory with the following contents

```
MONGODB_URI=mongodb://localhost:27017/whoami
PORT=8080
```

to use NodeJS cluster set additional variable

```
CLUSTER=true
```

#### Local Deployment: START

to start the app (MongoDB, Node and establish MongoDB connection, Gulp watchers), execute in the terminal while in the project folder (dependencies installation check will be performed before)

```
npm start
```

now open your browser and type in the address bar

```
http://localhost:8080/
```

WhoAmI microservice is up and running.

### Heroku Deployment

create a project

```
heroku create
```

check `./Procfile` which should have the following contents

```
web: npm run heroku-start
```

add mongolab addon

```
heroku addons:add mongolab
```

get mongodb url and copy result

```
heroku config:get MONGODB_URI
```

set environment variables

```
heroku config:set PORT=8080
```

edit local `.env` file manually, set Heroku mongo uri instead of local one
```
MONGODB_URI=value-got-previously-from-heroku
```

build application and push to heroku

```
gulp build
git push heroku master
```

or use a single command

```
npm run heroku-deploy
```

open on heroku

```
heroku open
```

#### Heroku deployment: START

to start the app (MongoDB, Node and establish MongoDB connection, Gulp watchers), execute in the terminal while in the project folder (dependencies installation check will be performed before)

```
heroku local
```

now open your browser and type in the address bar

```
http://localhost:8080/
```

### Testing

to test the server execute the following command in the terminal window while in your project's folder when the server is running:

```
$ npm run server-test
```

to test the client execute the following command in the terminal window while in your project's folder (buggy in single run mode):

```
$ npm run client-test
```

to lint the code execute the following command in the terminal window while in your project's folder:

```
$ npm run lint
```

## Heroku Documentation

* [`Heroku Devcenter: Gerring started with nodejs`](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
* [`Heroku Elements: Addons: Mongolab`](https://elements.heroku.com/addons/mongolab)

## License

* [`WhoAmI microservice`](LICENSE)
