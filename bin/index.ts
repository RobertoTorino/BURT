#!/usr/bin/env node
import { addTags, app, awsGlobal, StageTag } from '../lib/0-backup-global-variables';
import { BackupTestPlanStack } from '../lib/1-backup-testplan-stack';
import { BackupFrameworkStack } from '../lib/2-backup-framework-stack';
import { BackupTestSelectionStack } from '../lib/3-backup-testselection-stack';
import { BackupVaultStack } from '../lib/4-backup-vault-stack';
import { BackupValidationWorkflowStack } from '../lib/5-backup-validation-stack';


const backupTestPlanStack = new BackupTestPlanStack(app, 'backup-testplan-stack', {
    description: 'Restore testing plan for backup tests',
    env: awsGlobal,
});
addTags(backupTestPlanStack, StageTag.PROD);

const backupFrameworkStack = new BackupFrameworkStack(app, 'backup-framework-stack', {
    description: 'Framework for backup tests',
    env: awsGlobal,
});
addTags(backupFrameworkStack, StageTag.PROD);

const backupTestSelectionStack = new BackupTestSelectionStack(app, 'backup-testselection-stack', {
    description: 'Selection for backup tests',
    env: awsGlobal,
});
addTags(backupTestSelectionStack, StageTag.PROD);

const backupValidationWorkflowStack = new BackupValidationWorkflowStack(app, 'backup-validation-workflow-stack', {
    description: 'Backup validation workflow for backup tests',
    env: awsGlobal,
});
addTags(backupValidationWorkflowStack, StageTag.PROD);

const backupVaultStack = new BackupVaultStack(app, 'backup-vault-stack', {
    description: 'Backup vault in AWS Backup to manage backups',
    env: awsGlobal,
});
addTags(backupVaultStack, StageTag.PROD);
