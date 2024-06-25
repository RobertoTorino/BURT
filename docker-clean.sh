#!/bin/bash
# Clean up docker.

echo "Complete list of docker entries:"
docker images -a
docker ps -a
docker volume ls -f dangling=true
docker volume ls

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Starting Docker..."
  open --background -a Docker

  # Wait until Docker starts
  while ! docker info > /dev/null 2>&1; do
    echo "Waiting for Docker to start..."
    sleep 1
  done
  echo "Docker has started."
else
  echo "Docker is already running."
fi

# end process or continue
echo "===== WARNING! WARNING! WARNING! WARNING! WARNING! WARNING! ======"
echo " Enter [ YES or yes ] if you want to remove everything from Docker"
echo " All networks, all volumes, all images and all build cache"

# Let the script wait for user input.
exec 0</dev/tty
read -t 10 -r answer

if [ "$answer" != "${answer#[YESyes]}" ]; then

  docker image prune -a -f
  echo "All non-active images removed"

  docker ps -a
  docker stop $(docker ps -a -q)
  docker rm $(docker ps -a -q)
  echo "Stop and remove containers"

  docker rmi $(docker images -a -q)
  echo "Remove all other images"

  docker system prune -a --volumes -f

  echo "Removed stopped containers, networks, images, build cache!!"

  # Exit script after 5 seconds.
  sleep 5
  kill -15 $PPID

else
  echo
  echo "You skipped a part of the Docker clean-up!"
  echo "Some stopped containers, networks, volumes, images and build cache can still be present!"
  echo
fi

# List volumes
echo "Check for non-deleted volumes:"
docker volume ls

# Ask user for confirmation
read -p "Do you want to delete all these volumes? (y/n): " choice
case "$choice" in
  y|Y )
    # Delete volumes
    echo "Deleting volumes:"
    docker volume rm $(docker volume ls -q)
    ;;
  n|N )
    echo "Exiting without deleting volumes."
    ;;
  * )
    echo "Invalid choice. Exiting without deleting volumes."
    ;;
esac
