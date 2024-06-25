package main

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	backup "github.com/aws/aws-sdk-go-v2/service/backup"
	backupTypes "github.com/aws/aws-sdk-go-v2/service/backup/types"
	ec2 "github.com/aws/aws-sdk-go-v2/service/ec2"
	ec2Types "github.com/aws/aws-sdk-go-v2/service/ec2/types"
	rds "github.com/aws/aws-sdk-go-v2/service/rds"
)

type EventDetail struct {
	RestoreTestingPlanArn string `json:"restoreTestingPlanArn"`
	ResourceType          string `json:"resourceType"`
	CreatedResourceArn    string `json:"createdResourceArn"`
	RestoreJobId          string `json:"restoreJobId"`
}

type Event struct {
	Detail EventDetail `json:"detail"`
}

func bootstrap(ctx context.Context, event Event) error {
	log.Printf("Handling event: %+v\n", event)

	resourceType := event.Detail.ResourceType
	createdResourceArn := event.Detail.CreatedResourceArn
	restoreJobId := event.Detail.RestoreJobId

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	ec2Client := ec2.NewFromConfig(cfg)
	rdsClient := rds.NewFromConfig(cfg)
	backupClient := backup.NewFromConfig(cfg)

	validationStatus := "FAILED"
	validationStatusMessage := ""

	if resourceType == "EC2" {
		instanceId := strings.Split(createdResourceArn, "/")[1]
		describeInstancesResponse, err := ec2Client.DescribeInstances(ctx, &ec2.DescribeInstancesInput{
			InstanceIds: []string{instanceId},
		})
		if err != nil {
			validationStatusMessage = fmt.Sprintf("Error validating instance: %v", err)
			log.Println(validationStatusMessage)
		} else {
			instance := describeInstancesResponse.Reservations[0].Instances[0]
			if instance.State.Name == ec2Types.InstanceStateNameRunning {
				validationStatus = "SUCCESSFUL"
				validationStatusMessage = fmt.Sprintf("Instance %s is running.", instanceId)
			} else {
				validationStatusMessage = fmt.Sprintf("Instance %s is not in a running state. Current state: %s.", instanceId, instance.State.Name)
			}
		}
	} else if resourceType == "RDS" {
		dbInstanceIdentifier := strings.Split(createdResourceArn, ":db:")[1]
		describeDBInstancesResponse, err := rdsClient.DescribeDBInstances(ctx, &rds.DescribeDBInstancesInput{
			DBInstanceIdentifier: &dbInstanceIdentifier,
		})
		if err != nil {
			validationStatusMessage = fmt.Sprintf("Error validating DB instance: %v", err)
			log.Println(validationStatusMessage)
		} else {
			dbInstance := describeDBInstancesResponse.DBInstances[0]
			if *dbInstance.DBInstanceStatus == "available" {
				validationStatus = "SUCCESSFUL"
				validationStatusMessage = fmt.Sprintf("DB instance %s is available.", dbInstanceIdentifier)
			} else {
				validationStatusMessage = fmt.Sprintf("DB instance %s is not in an available state. Current state: %s.", dbInstanceIdentifier, *dbInstance.DBInstanceStatus)
			}
		}
	} else {
		validationStatusMessage = fmt.Sprintf("Unsupported resource type: %s", resourceType)
	}

	_, err = backupClient.PutBackupVaultNotifications(ctx, &backup.PutBackupVaultNotificationsInput{
		BackupVaultName: aws.String(restoreJobId),
		SNSTopicArn:     aws.String(validationStatusMessage),
		BackupVaultEvents: []backupTypes.BackupVaultEvent{
			backupTypes.BackupVaultEvent(validationStatus),
		},
	})
	if err != nil {
		log.Fatalf("Failed to put restore validation result: %v", err)
	}

	log.Println("Finished")
	return nil
}

func main() {
	lambda.Start(bootstrap)
}
