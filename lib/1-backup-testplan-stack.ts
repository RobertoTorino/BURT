import { CfnDeletionPolicy, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { CfnRestoreTestingPlan } from 'aws-cdk-lib/aws-backup';
import {
    AccountRootPrincipal, ArnPrincipal, Effect, ManagedPolicy, Policy, PolicyStatement, Role, ServicePrincipal
} from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { awsGlobal, globalSettings, StageTag } from './0-backup-global-variables';


export class BackupTestPlanStack extends Stack {
    constructor (scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const restoreTestingPlan = new CfnRestoreTestingPlan(this, 'BackupRestoreTestingPlan', {
            restoreTestingPlanName: `${globalSettings.restoreTestingPlanName}`,
            recoveryPointSelection: {
                algorithm: 'RANDOM_WITHIN_WINDOW',
                includeVaults: [ '*' ],
                recoveryPointTypes: [ 'SNAPSHOT', 'CONTINUOUS' ],
                excludeVaults: [
                    `arn:aws:backup:eu-west-1:${awsGlobal.account}:backup-vault:Default`
                ],
                selectionWindowDays: 14,
            },
            // Every day at 10:00:00 (UTC+02.00).
            scheduleExpression: 'cron(0 8 ? * 1-7 *)',
            startWindowHours: 8,
            tags: [ {
                key: 'Stage',
                value: StageTag.PROD
            }, {
                key: 'Application',
                value: `${globalSettings.application}`
            } ]
        });
        restoreTestingPlan.cfnOptions.deletionPolicy = CfnDeletionPolicy.DELETE;

        const restoreTestingBucket = new Bucket(this, globalSettings.bucketId, {
            bucketName: globalSettings.bucketName,
            objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            versioned: true,
            lifecycleRules: [ {
                expiration: Duration.days(30)
            }
            ]
        });
        restoreTestingBucket.grantReadWrite(new AccountRootPrincipal());
        restoreTestingBucket.addToResourcePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [ new ArnPrincipal(( `arn:aws:iam::${awsGlobal.account}:role/aws-service-role/reports.backup.amazonaws.com/AWSServiceRoleForBackupReports` )) ],
            actions: [
                's3:PutObject'
            ],
            resources: [
                `arn:aws:s3:::${globalSettings.bucketName}/*`,
                `arn:aws:s3:::${globalSettings.bucketName}`
            ],
            conditions: {
                StringEquals: {
                    's3:x-amz-acl': 'bucket-owner-full-control'
                }
            }
        }));

        const restoreTestingRole = new Role(this, 'RestoreTestingRole', {
            description: 'IAM role for AWS Backup restore testing',
            maxSessionDuration: Duration.hours(4),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('AWSBackupFullAccess'),
                ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'),
                ManagedPolicy.fromAwsManagedPolicyName('AmazonRDSFullAccess'),
            ],
            assumedBy: new ServicePrincipal('backup.amazonaws.com'),
        });

        restoreTestingRole.attachInlinePolicy(
            new Policy(this, 'AdminPolicyForRestoreTesting', {
                statements: [
                    new PolicyStatement({
                        actions: [ 'iam:PassRole' ],
                        resources: [ `arn:aws:iam::${awsGlobal.account}:role/*` ],
                        effect: Effect.ALLOW,
                        conditions: {
                            StringEquals: {
                                'iam:PassedToService': [ 'backup.amazonaws.com' ]
                            }
                        }
                    })
                ]
            })
        );
    }
}
