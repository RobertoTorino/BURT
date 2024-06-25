const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const { RDSClient, DescribeDBInstancesCommand } = require("@aws-sdk/client-rds");
const { BackupClient, PutBackupVaultNotificationsCommand } = require("@aws-sdk/client-backup");

exports.handler = async (event) => {
    console.log("Handling event: ", event);

    const restoreTestingPlanArn = event.detail.restoreTestingPlanArn;
    const resourceType = event.detail.resourceType;
    const createdResourceArn = event.detail.createdResourceArn;
    const restoreJobId = event.detail.restoreJobId;

    const ec2 = new EC2Client();
    const rds = new RDSClient();
    const backup = new BackupClient();

    let validationStatus = "FAILED";
    let validationStatusMessage = "";

    if (resourceType === "EC2") {
        try {
            const instanceId = createdResourceArn.split("/")[1];
            const describeInstancesResponse = await ec2.send(new DescribeInstancesCommand({
                InstanceIds: [instanceId],
            }));
            const instance = describeInstancesResponse.Reservations[0].Instances[0];
            if (instance.State.Name === "running") {
                validationStatus = "SUCCESSFUL";
                validationStatusMessage = `Instance ${instanceId} is running.`;
            } else {
                validationStatusMessage = `Instance ${instanceId} is not in a running state. Current state: ${instance.State.Name}.`;
            }
        } catch (error) {
            validationStatusMessage = `Error validating instance: ${error.message}`;
            console.error(validationStatusMessage, error);
        }
    } else if (resourceType === "RDS") {
        try {
            const dbInstanceIdentifier = createdResourceArn.split(":db:")[1];
            const describeDBInstancesResponse = await rds.send(new DescribeDBInstancesCommand({
                DBInstanceIdentifier: dbInstanceIdentifier,
            }));
            const dbInstance = describeDBInstancesResponse.DBInstances[0];
            if (dbInstance.DBInstanceStatus === "available") {
                validationStatus = "SUCCESSFUL";
                validationStatusMessage = `DB instance ${dbInstanceIdentifier} is available.`;
            } else {
                validationStatusMessage = `DB instance ${dbInstanceIdentifier} is not in an available state. Current state: ${dbInstance.DBInstanceStatus}.`;
            }
        } catch (error) {
            validationStatusMessage = `Error validating DB instance: ${error.message}`;
            console.error(validationStatusMessage, error);
        }
    } else {
        validationStatusMessage = `Unsupported resource type: ${resourceType}`;
    }

    const response = await backup.send(new PutBackupVaultNotificationsCommand({
        BackupVaultName: restoreJobId,
        SNSTopicArn: validationStatusMessage,
        BackupVaultEvents: validationStatus,
    }));

    console.log("PutRestoreValidationResult: ", response);
    console.log("Finished");
};
