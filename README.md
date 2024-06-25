# BURT - Backup restore testing

#### CDK Project for AWS Backup and AWS BackUpVault with Continuous Backup, AWS Backup Restore Testing, Audit Framework and more

## Documentation       
**[AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html)**                    
**[AWS Backup Restore Testing](https://docs.aws.amazon.com/aws-backup/latest/devguide/restore-testing.html)**    
**[GO](https://go.dev/doc/tutorial/getting-started)**                
**[AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)**              
**[AWS SAM and the AWS CDK](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-cdk-getting-started.html)**

## Development process via Makefile

```shell
brew install make
```

To simplify the development process and provide an ability to run tests locally we use a Makefile. A developer can execute a series of actions or execute individual steps.

* Build and validate: `make`
* Execute integration tests: `make test` 
* Validate new and changed stacks with the current state: `make compare`     
* Cleanup the environment: `make clean`

## AWS Backup and AWS BackUpVault with Continuous Backup.

**Backups can be triggered based on tags, resourcetype and/or ARN's. BackUps can be scheduled using cron jobs.**

**With backup enabled you can instantly restore from a failed Database. Effectively this means you are up and running within minutes if a quick restore is necessary (RTO). The benefits of using AWS Backup are that you don't have any downtime for creating a backup and you don't need a maintenance window. With continuous backup enabled you are able to recover Amazon RDS backup data from a specified time within the retention period. You can reduce your recovery point objective (RPO) to 5 minutes or under from the AWS Backup console.**

> **AWS Backup Vault steps and definitions:**
> 1. **Create a Backup Vault.**
> 2. **Create a Backup Plan.**
> 3. **Create the Backup Plan Rules.**
> 4. **Define the Backup Selection.**
> 5. **Set the correct IAM policies.**
>
> - **The Backups are scheduled with a cron expression and managed/stored in a Backup Vault.**
> - **AWS Backup Supports multiple types of how backups are selected, backups based on tagging and backups based on the
    arn of the resource or simply based on the resourcetype.**
> - **The completion window specifies the duration before the backup must be completed, else the job is canceled by AWS
    Backup.**
> - **The start window defines the duration before a job is canceled if it doesn't start successfully.**
> - **You can specify continuous backup for your database, the max. retention period for that is 35 days.**

## AWS Backup Restore Testing Plan

**Restore testing is a feature offered by AWS Backup which provides automated and periodic evaluation of restore
reliability, as well as the ability to monitor restore job duration times.**              
**Follow the correct sequence to create a backup restore testing plan. Once this request is successful, finish the
procedure with the backup CreateRestoreTestingSelection.**
> **Technical:**
> 1. **Create a restore testing plan where you provide a name for your plan, the frequency for your restore tests and
    the target start time.**
> 2. **Assign the resources you want to include in your plan.**
> 3. **Choose to include specific or random recovery points (AWS name for the backups) in your test.**
> 4. **AWS Backup backup intelligently assumes the metadata that will be needed for your restore job to be successful.**
> 5. **When the scheduled time in your plan arrives, AWS Backup starts restore jobs based on your plan and monitors the
     time taken to complete the restore.**
> 6. **After the restore test plan completes its run, you can use the results to show compliance for organizational or
     governance requirements such as the successful completion of restore test scenarios or the restore job completion
     time.**
> 7. **Optionally, you can use Restore testing validation to confirm the restore test results.**
> 8. **Once the optional validation completes or the validation window closes, AWS Backup deletes the resources involved
     with the restore test, and the resources will be deleted.**
> 9. **At the end of the testing process, you can view the results and the completion time of the tests.**

> **In practice:** 
> 
> **We run automated tests on a regular basis in AWS to check if a backup can be restored successful, this will create a cloned test resource which will be deployed in our environment and then tested if it operates without problems, the results are published in AWS Backup. The test start has a time window of 8 hours, the exact start time will be determined by AWS. An event-driven validation will run when a restore testing job completes. The resources have a special tag: "backup-restore-testing". To avoid unnecessary cluttering of resources and still have time to run the validation test, the test resources will be deleted after 1 hour. Test reports are generated (.json format) and stored in S3. They can be viewed through the console. There is also an option to create on-demand reports.**


### Audit Framework

**An Audit Framework is a collection of controls that helps you to evaluate your backup practices. You can use
pre-built, controls to define your policies and evaluate whether your backup practices comply with your policies. You
can set up automatic daily reports to gain insights into the compliance status of your frameworks.**

---

### Audit Reports

**AWS Backup Audit Manager reports are automatically generated evidence of your AWS Backup activity, such as which
backup jobs finished and when and which resources you backed up.**

**There are two types of reports. When you create a report, you choose which type is created.**

1. **Jobs report show jobs finished in the last 24 hours and all active jobs. Jobs reports do not display a status of
   completed with issues. To find this status, you can filter for Completed jobs with one or more status messages. AWS
   Backup will only include a status message as part of a Completed job's status if the message requires attention or
   action.**
2. **Compliance reports can monitor resource levels or the different controls that are in effect. These reports need an
   Audit Framework to collect their data.**

**AWS Backup Audit Manager delivers a daily report in your Amazon S3 bucket. If the report is for the current region
and current account, you can choose to receive the report in either CSV or JSON format. Otherwise, the report is
available in CSV format. The timing of the daily report might fluctuate over several hours because AWS Backup Audit
Manager performs randomization to maintain its performance. You can also run an on-demand report anytime from within the
console.**

---

### Restore Tests Validation

**An event-driven validation runs when a restore testing job completes. You can set this up by creating a validation workflow with any target supported by Amazon EventBridge, such as AWS Lambda. Then add an EventBridge rule that listens for the restore job reaching the status COMPLETED. After the restore test has finished, you can monitor the logs of the validation workflow to ensure it ran as expected, the validation status will display in the AWS Backup console.**

---

### How to Restore an Oracle RDS Backup with AWS Backup
> - **Open the AWS RDS console at https://eu-west-1.console.aws.amazon.com/rds/.**
> - **Rename the old DB instance identifier by adding `-old` to the identifier id.**
> - **Open the AWS Backup console at https://console.aws.amazon.com/backup.**
> - **In AWS Backup choose Protected resources and the Amazon RDS resource ID you want to restore.**
> - **In the upper-right corner, choose Restore.**
> - **For instance specifications accept the defaults or specify the options for the DB engine, License Model, DB instance class, Multi AZ, and Storage type settin[tree.json](cdk.out%2Ftree.json)gs.**
> - **For availability and durability choose your option.**
> - **! Important ! For Settings choose the exact same DB instance identifier as used for the "old" RDS, this makes sure your connection stays intact and your endpoint is not changed.**
> - **For Network and security accept the defaults or specify the options for the Virtual Private Cloud (VPC), Subnet group, Public Accessibility (usually Yes), and Availability zone settings.**
> - **For Database options specify a name that is unique for all DB instances and clusters owned by your AWS account in the current region, specify the options for Database port, DB parameter group, Option Group, Copy tags to snapshots, and IAM DB Authentication Enabled settings or accept the defaults.**
> - **For Backup choose if tags should be copied to the snapshots.**
> - **For Encryption use the default settings. If the source database instance for the snapshot was encrypted, the restored database instance will also be encrypted. This encryption cannot be removed.**
> - **For Log exports choose the log types to publish to Amazon CloudWatch Logs.**
> - **For Maintenance accept the default or specify the option for Auto minor version upgrade.**
> - **In the Restore role pane, choose the IAM role that AWS Backup will assume for this restore.**
> - **For protected resource tags choose copy tags.**

---

## AWS CDK

### Basic commands and descriptions
>
> **Deploy the stacks in the correct order!**
>
> The 'cdk.json' file tells the CDK Toolkit how to execute your app: 'npx ts-node --prefer-ts-exts'.                  
> The 'versionReporting' property allows you to turn off Metadata Reporting which the CDK team uses to collect
analytics.                          
> The 'context' key is used to keep track of feature flags. Feature flags enable the CDK team to push new features that
introduce breaking changes, outside of major version releases. If you start a new project with the 'cdk init' command,
all
feature flags are set to true. For existing projects you can decide for yourself to opt in if this feature flag might
cause breaking changes.
