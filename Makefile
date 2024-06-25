# Execute a sequence of actions
all: build security iac test-go iac-report
# manual executions: make diagram, make deploy, make validate, make license, make clean.

## Build the templates
build:
	cdk synth
## Check the code base with security tools
security:
	snyk test --severity-threshold=high --fail-on=all --all-sub-projects
## Validate your IaC and report the findings
iac:
	snyk iac test cdk.out --severity-threshold=high || true
## Run the integration test for the Go lambda
test-go:
	@echo "Running custom shell script to test Go..."
	@bash ./functions/test_go_lambda.sh
## Publish html test report for IaC compliance findings
iac-report:
	@bash ./test/iac-compliance-report.sh
## Create simple IaC diagram
diagram:
	npm i cdk-dia && cdk synth -q && npx cdk-dia && rm -rf diagram.dot && mv -f diagram.png ./images/diagram_small.png && npm r cdk-dia
## Deploy the app to your nonprod AWS account manually
deploy:
	npx cdk deploy
## Compare and validate the new stacks with the current state in your AWS account
compare:
	npx cdk diff
## Cleanup the whole environment and remove all temporary files
clean:
	rm -rvf cdk.out coverage test-results diagram test/__snapshots__ test/*.html test/.dccache functions/bootstrap functions/bootstrap.zip && git clean -df
