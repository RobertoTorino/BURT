import { CfnDeletionPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { CfnFramework } from 'aws-cdk-lib/aws-backup';
import { Construct } from 'constructs';
import { globalSettings, StageTag } from './0-backup-global-variables';


export class BackupFrameworkStack extends Stack {
    constructor (scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const awsBackupFrameWork = new CfnFramework(this, 'AwsBackupVaultFramework', {
            frameworkDescription: 'BackupVault Framework',
            frameworkName: globalSettings.frameworkName,
            frameworkControls: [
                {
                    controlName: 'BACKUP_PLAN_MIN_FREQUENCY_AND_MIN_RETENTION_CHECK',
                    controlInputParameters: [
                        {
                            parameterValue: '35',
                            parameterName: 'requiredRetentionDays'
                        },
                        {
                            parameterValue: '1',
                            parameterName: 'requiredFrequencyValue'
                        },
                        {
                            parameterValue: 'days',
                            parameterName: 'requiredFrequencyUnit'
                        }
                    ]
                },
                {
                    controlName: 'BACKUP_RESOURCES_PROTECTED_BY_BACKUP_PLAN'

                },
                {
                    controlName: 'BACKUP_RESOURCES_PROTECTED_BY_CROSS_ACCOUNT'
                },
                {
                    controlName: 'BACKUP_RECOVERY_POINT_MINIMUM_RETENTION_CHECK',
                    controlInputParameters: [
                        {
                            parameterValue: '35',
                            parameterName: 'requiredRetentionDays'
                        }
                    ]
                },
                {
                    controlName: 'BACKUP_RESOURCES_PROTECTED_BY_CROSS_REGION'
                },
                {
                    controlName: 'BACKUP_LAST_RECOVERY_POINT_CREATED',
                    controlInputParameters: [
                        {
                            parameterValue: '7',
                            parameterName: 'recoveryPointAgeValue'
                        },
                        {
                            parameterValue: 'days',
                            parameterName: 'recoveryPointAgeUnit'
                        }
                    ]
                },
                {
                    controlName: 'RESTORE_TIME_FOR_RESOURCES_MEET_TARGET',
                    controlInputParameters: [
                        {
                            parameterValue: '60',
                            parameterName: 'maxRestoreTime'
                        }
                    ]
                },
                {
                    controlName: 'BACKUP_RESOURCES_PROTECTED_BY_BACKUP_VAULT_LOCK'
                },
                {
                    controlName: 'BACKUP_RECOVERY_POINT_MANUAL_DELETION_DISABLED'
                },
                {
                    controlName: 'BACKUP_RECOVERY_POINT_ENCRYPTED'
                }
            ],
            frameworkTags: [ { key: 'Stage', value: StageTag.PROD }, {
                key: 'Application',
                value: `${globalSettings.application}`
            } ]
        });
        awsBackupFrameWork.cfnOptions.deletionPolicy = CfnDeletionPolicy.DELETE;
    }
}
