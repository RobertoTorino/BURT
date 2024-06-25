#!/bin/bash

# test your iac with snyk (optional debug mode = -d)
now=$(date +"%d-%m-%Y-%T")

cd cdk.out || exit
snyk iac test --json | snyk-to-html -d > "../test/${now}"-snyk-code.html && open "../test/${now}"-snyk-code.html
