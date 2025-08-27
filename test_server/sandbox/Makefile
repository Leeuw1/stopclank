all: sandbox

install: sandbox
	cp sandbox /usr/local/bin/

sandbox:
	gcc -std=c99 -Wall -Wextra -O2 sandbox.c -lseccomp -o sandbox
