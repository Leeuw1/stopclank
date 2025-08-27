#!/bin/sh
MEMORY_MAX="20M"
mkdir -p /sys/fs/cgroup/sandbox_cgroup &&
echo $MEMORY_MAX > /sys/fs/cgroup/sandbox_cgroup/memory.max &&
flask --app main run --host=0.0.0.0 --debug
