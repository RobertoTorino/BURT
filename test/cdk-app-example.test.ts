import { App } from 'aws-cdk-lib';
import { awsGlobal } from '../lib/0-backup-global-variables';
import { BackupTestPlanStack } from '../lib/1-backup-testplan-stack';


describe('Synthesize tests', () => {
    const app = new App();

    test('Creates the stack without exceptions', () => {
        expect(() => {
            new BackupTestPlanStack(app, 'backupTestPlanStack', {
                description: 'backupTestPlanStack',
                env: awsGlobal,
            });
        }).not.toThrow();
    });

    test('This app can synthesize completely', () => {
        expect(() => {
            app.synth();
        }).not.toThrow();
    });
});
