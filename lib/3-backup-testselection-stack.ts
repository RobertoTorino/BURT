import { Stack, StackProps } from 'aws-cdk-lib';
import { CfnReportPlan, CfnRestoreTestingSelection } from 'aws-cdk-lib/aws-backup';
import { Construct } from 'constructs';
import {
    globalSettings, reportsFrameworkArns, StageTag, testSelectionAvailabilityZones, testSelectionDdbSubnetGroupName,
    testSelectionRoleArn, testSelectionSecurityGroupIds, testSelectionSubnetId, uniqueEc2Arn, uniqueRdsArn
} from './0-backup-global-variables';


export class BackupTestSelectionStack extends Stack {
    constructor (scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // example EC2
        new CfnRestoreTestingSelection(this, 'RestoreTestingSelection-Ec2', {
            // protectedResourceArns: [ globalSettings.protectedEc2Resources ],
            protectedResourceArns: [ uniqueEc2Arn ],
            iamRoleArn: testSelectionRoleArn,
            protectedResourceType: 'EC2',
            restoreTestingPlanName: globalSettings.restoreTestingPlanName,
            restoreTestingSelectionName: 'Backup_Restore_Testing_SelectionEc2',
            validationWindowHours: 1,
            restoreMetadataOverrides: {
                subnetId: testSelectionSubnetId
            }
        });

        // example RDS
        new CfnRestoreTestingSelection(this, 'RestoreTestingSelection-Rds', {
            // protectedResourceArns: [ globalSettings.protectedRdsResources ],
            protectedResourceArns: [ uniqueRdsArn ],
            iamRoleArn: testSelectionRoleArn,
            protectedResourceType: 'RDS',
            restoreTestingPlanName: globalSettings.restoreTestingPlanName,
            restoreTestingSelectionName: 'Backup_Restore_Testing_SelectionRds',
            validationWindowHours: 1,
            restoreMetadataOverrides: {
                dbSubnetGroupName: testSelectionDdbSubnetGroupName,
                availabilityZones: testSelectionAvailabilityZones,
                vpcSecurityGroupIds: testSelectionSecurityGroupIds
            }
        });

        // example S3
        new CfnRestoreTestingSelection(this, 'RestoreTestingSelection-S3', {
            protectedResourceArns: [ globalSettings.protectedS3Resources ],
            iamRoleArn: testSelectionRoleArn,
            protectedResourceType: 'S3',
            restoreTestingPlanName: globalSettings.restoreTestingPlanName,
            restoreTestingSelectionName: 'Backup_Restore_Testing_SelectionS3',
            validationWindowHours: 1,
        });

        new CfnReportPlan(this, 'ResourceComplianceReportPlan', {
            reportPlanDescription: 'Resource compliance report plan for AWS Backup restore testing',
            reportPlanName: 'ResourceComplianceReportPlan',
            reportSetting: ( {
                ReportTemplate: 'RESOURCE_COMPLIANCE_REPORT',
                FrameworkArns: reportsFrameworkArns
            } ),
            reportDeliveryChannel: {
                Formats: [ 'JSON' ],
                S3BucketName: globalSettings.bucketName
            },
            reportPlanTags: [ { key: 'Stage', value: StageTag.PROD }, {
                key: 'Application',
                value: `${globalSettings.application}`
            } ],
        });

        new CfnReportPlan(this, 'ControlComplianceReportPlan', {
            reportPlanDescription: 'Control compliance report plan for AWS Backup restore testing',
            reportPlanName: 'ControlComplianceReportPlan',
            reportSetting: ( {
                ReportTemplate: 'CONTROL_COMPLIANCE_REPORT',
                FrameworkArns: reportsFrameworkArns
            } ),
            reportDeliveryChannel: {
                Formats: [ 'JSON' ],
                S3BucketName: globalSettings.bucketName
            },
            reportPlanTags: [ { key: 'Stage', value: StageTag.PROD }, {
                key: 'Application',
                value: `${globalSettings.application}`
            } ]
        });

        new CfnReportPlan(this, 'BackupJobReportPlan', {
            reportPlanDescription: 'Backup job report plan for AWS Backup restore testing',
            reportPlanName: 'BackupJobReportPlan',
            reportSetting: ( {
                ReportTemplate: 'BACKUP_JOB_REPORT'
            } ),
            reportDeliveryChannel: {
                Formats: [ 'JSON' ],
                S3BucketName: globalSettings.bucketName
            },
            reportPlanTags: [ { key: 'Stage', value: StageTag.PROD }, {
                key: 'Application',
                value: `${globalSettings.application}`
            } ]
        });

        new CfnReportPlan(this, 'CopyJobReportPlan', {
            reportPlanDescription: 'Copy job report plan for AWS Backup restore testing',
            reportPlanName: 'CopyJobReportPlan',
            reportSetting: ( {
                ReportTemplate: 'COPY_JOB_REPORT'
            } ),
            reportDeliveryChannel: {
                Formats: [ 'JSON' ],
                S3BucketName: globalSettings.bucketName
            },
            reportPlanTags: [ { key: 'Stage', value: StageTag.PROD }, {
                key: 'Application',
                value: `${globalSettings.application}`
            } ]
        });

        new CfnReportPlan(this, 'RestoreJobReportPlan', {
            reportPlanDescription: 'Restore job report plan for AWS Backup restore testing',
            reportPlanName: 'RestoreJobReportPlan',
            reportSetting: ( {
                ReportTemplate: 'RESTORE_JOB_REPORT'
            } ),
            reportDeliveryChannel: {
                Formats: [ 'JSON' ],
                S3BucketName: globalSettings.bucketName
            },
            reportPlanTags: [ { key: 'Stage', value: StageTag.PROD }, {
                key: 'Application',
                value: `${globalSettings.application}`
            } ]
        });
    }
}
