import { Duration, RemovalPolicy, Stack, StackProps, } from 'aws-cdk-lib';
import { BackupPlan, BackupPlanRule, BackupResource, BackupSelection, BackupVault } from 'aws-cdk-lib/aws-backup';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, ManagedPolicy, Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { awsGlobal, globalSettings, StageTag } from './0-backup-global-variables';


export class BackupVaultStack extends Stack {
    constructor (scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const AwsBackupRole = new Role(this, 'AwsBackupRole', {
            description: 'IAM Role for AWS Backup',
            maxSessionDuration: Duration.hours(4),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('AWSBackupFullAccess'),
            ],
            assumedBy: new ServicePrincipal('backup.amazonaws.com'),
        });

        AwsBackupRole.attachInlinePolicy(
            new Policy(this, 'AdminPolicyForBackup', {
                statements: [
                    new PolicyStatement({
                        actions: [ 'iam:PassRole' ],
                        resources: [ `arn:aws:iam::${awsGlobal.account}:role/*` ],
                        effect: Effect.ALLOW,
                        conditions: {
                            StringEquals: {
                                'iam:PassedToService': [ 'backup.amazonaws.com' ],
                            }
                        }
                    })
                ]
            })
        );

        const awsBackUpVault = new BackupVault(this, 'AwsBackUpVault', {
            removalPolicy: RemovalPolicy.DESTROY,
            backupVaultName: 'backup-vault',
            blockRecoveryPointDeletion: false,
        });

        const awsBackUpRecoveryVault = new BackupVault(this, 'AwsBackUpRecoveryVault', {
            removalPolicy: RemovalPolicy.DESTROY,
            backupVaultName: 'backup-recovery-vault',
            blockRecoveryPointDeletion: false,
        });

        const awsBackUpPlan = new BackupPlan(this, 'BackUpPlan', {
            backupPlanName: 'backup-plan',
            backupVault: awsBackUpVault,
            backupPlanRules: [
                new BackupPlanRule({
                    ruleName: 'backup-plan-rule',
                    scheduleExpression: Schedule.cron({
                        minute: '00',
                        hour: '02',
                        day: '*',
                        year: '*'
                    }),
                    backupVault: awsBackUpVault,
                    startWindow: Duration.hours(1),
                    completionWindow: Duration.hours(2),
                    copyActions: [ {
                        destinationBackupVault: awsBackUpRecoveryVault,
                        moveToColdStorageAfter: Duration.days(14),
                        deleteAfter: Duration.days(104),
                    } ],
                    deleteAfter: Duration.days(14),
                    recoveryPointTags: {
                        Stage: StageTag.PROD,
                        Application: `${globalSettings.application}`
                    }
                })
            ]
        });

        new BackupSelection(this, 'BackupSelection', {
            backupPlan: awsBackUpPlan,
            resources: [
                BackupResource.fromArn(`arn:aws:s3:::${globalSettings.bucketName}`)
            ],
            backupSelectionName: globalSettings.backupSelectionName,
            allowRestores: true,
        });
    }
}
