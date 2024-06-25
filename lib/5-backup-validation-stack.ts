import { aws_events_targets as targets, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Rule } from 'aws-cdk-lib/aws-events';
import { Code, Function, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { awsGlobal, globalSettings } from './0-backup-global-variables';


export class BackupValidationWorkflowStack extends Stack {
    constructor (scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const validationWorkflowFunction = new Function(this, 'ValidationWorkflowFunction', {
            functionName: 'ValidationWorkflowFunction',
            runtime: Runtime.PROVIDED_AL2023,
            timeout: Duration.seconds(10),
            tracing: Tracing.ACTIVE,
            handler: 'main.bootstrap',
            code: Code.fromAsset('/functions', {}),
            // handler: 'app.lambda_handler',
            // code: Code.fromAsset( './functions')),
        });


        const validationRule = new Rule(this, 'ValidationWorkflowRule', {
            description: 'EventBridge rule used for the backup validation workflow',
            ruleName: 'CFD-RESTORE-TESTING-VALIDATION-RULE',
            enabled: true,
            eventPattern: {
                version: [ '0' ],
                detailType: [ 'Restore Job State Change' ],
                source: [ 'aws.backup' ],
                account: [ awsGlobal.account ],
                region: [ awsGlobal.region ],
                resources: [ globalSettings.restoreTestingPlanArn ],
                detail: {
                    resourceType: [ '*' ],
                    resourceId: [ '*' ],
                    status: [ 'COMPLETED' ],
                },
            },
        });
        // Add the Lambda function as a target for the rule
        validationRule.addTarget(new targets.LambdaFunction(validationWorkflowFunction));
    }
}

module.exports = { BackupValidationWorkflowStack };
