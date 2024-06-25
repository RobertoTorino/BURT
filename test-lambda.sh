#!/bin/bash

aws sso login
cdk synth --no-staging

# Find the value of the "aws:asset:path" key under the "Metadata" by searching for the resource that has the desired "aws:asset:path" key within its Metadata.
# Iterate over all the resources and use jq to filter and find the resource containing aws:asset:path in its Metadata once the resource is found, extract the value of aws:asset:path.
asset_path=$(jq -r '.Resources[] | select(.Metadata["aws:asset:path"]) | .Metadata["aws:asset:path"]' cdk.out/backup-validation-workflow-stack.template.json)

# Check if the asset_path was found
if [ -z "$asset_path" ]; then
  echo "Error: aws:asset:path not found in the JSON file."
  exit 1
fi

echo $asset_path
# Output the asset path (for debugging purposes)
echo "The asset path is: [ $asset_path ]"

# cp bootstrap cdk.out/$asset_path
cp -Rf cdk.out/backup-validation-workflow-stack.template.json ./template.json
sam local invoke ValidationWorkflowFunction -e events/ec2-event.json
