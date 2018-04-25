#!/bin/bash

# colours
source util-echo_colours.sh
# DEFAULT, BLACK, DARK_GRAY, RED, LIGHT_RED, GREEN, LIGHT_GREEN, BROWN, YELLOW,
# BLUE, LIGHT_BLUE, PURPLE, LIGHT_PURPLE, CYAN, LIGHT_CYAN, LIGHT_GRAY, WHITE

printf "${LIGHT_GREEN} * heroku-deploy ${GREEN} > ${YELLOW} checkout branch heroku-deploy${DEFAULT}\n"
git checkout -b heroku-deploy

# printf "${LIGHT_GREEN} * heroku-deploy ${GREEN} > ${YELLOW} stop ignoring built application with .gitignore${DEFAULT}\n"
# gulp dont-gitignore-build

# printf "${LIGHT_GREEN} * heroku-deploy ${GREEN} > ${YELLOW} build application${DEFAULT}\n"
# gulp build

# printf "${LIGHT_GREEN} * heroku-deploy ${GREEN} > ${YELLOW} add all built application files${DEFAULT}\n"
# git add --all

# printf "${LIGHT_GREEN} * heroku-deploy ${GREEN} > ${YELLOW} commit${DEFAULT}\n"
# git commit -m "(build) heroku build"

printf "${LIGHT_GREEN} * heroku-deploy ${GREEN} > ${YELLOW} push to heroku${DEFAULT}\n"
git push heroku master --force

printf "${LIGHT_GREEN} * heroku-deploy ${GREEN} > ${YELLOW} checkout master${DEFAULT}\n"
git checkout master

printf "${LIGHT_GREEN} * heroku-deploy ${GREEN} > ${YELLOW} delete branch heroku-deploy with build commit${DEFAULT}\n"
git branch -D heroku-deploy
