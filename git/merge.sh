#!/bin/bash

CUR_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo $CUR_BRANCH

git add .;
git stash;

git checkout master;
git merge $CUR_BRANCH --no-ff;
git checkout $CUR_BRANCH;

git stash pop;
