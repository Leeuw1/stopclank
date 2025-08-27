#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <linux/sched.h>
#include <sys/syscall.h>
#include <sys/wait.h>
#include <unistd.h>
#include <fcntl.h>
#include <signal.h>

int main(int argc, char** argv) {
	if (argc < 2) {
		fprintf(stderr, "%s: Not enough arguments\n", argv[0]);
		return EXIT_FAILURE;
	}
	const uint64_t clone_flags = CLONE_INTO_CGROUP;
	const int cgroup_fd = open("/sys/fs/cgroup/sandbox_cgroup", O_RDONLY);
	if (cgroup_fd == -1) {
		perror("open failed");
		return EXIT_FAILURE;
	}
	const struct clone_args args = {
		.flags			= clone_flags,
		.exit_signal	= SIGCHLD,
		.cgroup			= cgroup_fd,
	};
#ifdef DEBUG
	fprintf(stderr, "Calling clone3()...\n");
#endif
	const pid_t pid = (pid_t)syscall(SYS_clone3, &args, sizeof args);
	if (pid == -1) {
		perror("clone3 failed");
		return EXIT_FAILURE;
	}
	if (pid == 0) {
		// TODO: setup seccomp environment
		char** child_argv = argv + 1;
		execvp(child_argv[0], child_argv);
		perror("execvp failed");
		return EXIT_FAILURE;
	}
	int status;
	if (waitpid(pid, &status, 0) == -1) {
		perror("waitpid failed");
		return EXIT_FAILURE;
	}
#ifdef DEBUG
	if (WIFEXITED(status)) {
		fprintf(stderr, "sandbox: Exiting with same status as child (%d)\n", WEXITSTATUS(status));
	}
	else {
		psignal(WTERMSIG(status), "sandbox: Child was terminated with signal");
		return EXIT_FAILURE;
	}
#else
	if (WIFEXITED(status)) {
		return WEXITSTATUS(status);
	}
	// Child received fatal signal
	return EXIT_FAILURE;
#endif
}
