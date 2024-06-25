import { App, Stack, Tags } from 'aws-cdk-lib';

export const app = new App();

export const awsGlobal = {
    account: process.env.CDK_SYNTH_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_SYNTH_REGION || process.env.CDK_DEFAULT_REGION,
};

export enum StageTag {
    PROD = 'prod',
}

export const addTags = (stack: Stack, stageTag: StageTag) => {
    Tags.of(stack).add('Application', `${globalSettings.application}`, {
        includeResourceTypes: []
    });
    Tags.of(stack)
        .add('Stage', stageTag, {
            includeResourceTypes: []
        });
};

export const globalSettings = {
    application: 'backup-restore-testing',
    bucketName: 'restore-testing-bucket',
    bucketId: 'restore-testing-bucket',
    restoreTestingPlanName: 'BackupRestoreTestingPlan',
    restoreTestingPlanArn: `arn:aws:backup:${awsGlobal.region}:${awsGlobal.account}:restore-testing-plan:[restoreTestingPlanArn]`,
    backupSelectionName: 'backup-selection',
    frameworkName: 'BackupVaultFramework',
    protectedEc2Resources: `arn:aws:ec2:${awsGlobal.region}:${awsGlobal.account}:instance/*`,
    protectedEbsResources: `arn:aws:ec2:${awsGlobal.region}:${awsGlobal.account}:volume/*`,
    protectedRdsResources: `arn:aws:rds:${awsGlobal.region}:${awsGlobal.account}:db:*`,
    protectedS3Resources: 'arn:aws:s3:::[YOUR_BUCKET_ARN]-bucket'
}

export const uniqueEc2Arn = `arn:aws:ec2:${awsGlobal.region}:${awsGlobal.account}:instance/[YOUR_INSTANCE_ID]`;

export const uniqueRdsArn = `arn:aws:rds:${awsGlobal.region}:${awsGlobal.account}:db:[YOUR_RDS_ID]`;

// get these values from your resource
export const testSelectionRoleArn = `arn:aws:iam::${awsGlobal.account}:role/backup-testplan-stack-[]`;
export const reportsFrameworkArns = [ `arn:aws:backup:${awsGlobal.region}:${awsGlobal.account}:framework:[]` ];
export const testSelectionSubnetId = '[testSelectionSubnetId]'
export const testSelectionDdbSubnetGroupName = '[testSelectionSubnetId]';
export const testSelectionSecurityGroupIds = '[testSelectionSecurityGroupIds], [testSelectionSecurityGroupIds]';
export const testSelectionAvailabilityZones = 'eu-west-1a, eu-west-1b, eu-west-1c';
