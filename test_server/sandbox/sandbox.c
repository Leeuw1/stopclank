#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <linux/sched.h>
#include <sys/syscall.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <sys/mount.h>
#include <sys/capability.h>
#include <unistd.h>
#include <fcntl.h>
#include <signal.h>
#include <seccomp.h>

#define NUM_ALLOWED_SYSCALLS	(sizeof allowed_syscalls / sizeof *allowed_syscalls)

const int allowed_syscalls[] = {
	SCMP_SYS(read),
	SCMP_SYS(write),
	SCMP_SYS(open),
	SCMP_SYS(close),
	SCMP_SYS(stat),
	SCMP_SYS(fstat),
	SCMP_SYS(mprotect),
	SCMP_SYS(execve),
	SCMP_SYS(getrandom),
	SCMP_SYS(mmap),
	SCMP_SYS(munmap),
	SCMP_SYS(brk),
	SCMP_SYS(fcntl),
	SCMP_SYS(getcwd),
	SCMP_SYS(gettid),
	SCMP_SYS(readlink),
	SCMP_SYS(arch_prctl),
	SCMP_SYS(set_tid_address),
	SCMP_SYS(getdents64),
	SCMP_SYS(ioctl),
	SCMP_SYS(lseek),
	SCMP_SYS(rt_sigaction),
	SCMP_SYS(rt_sigprocmask),
	SCMP_SYS(readv),
	SCMP_SYS(rename),
	SCMP_SYS(mkdir),
	SCMP_SYS(getuid),
	SCMP_SYS(getgid),
	SCMP_SYS(geteuid),
	SCMP_SYS(getegid),
	SCMP_SYS(exit_group),
};

static void bind_mount(const char* source, const char* target) {
	if (mkdir(target, 0000) == -1) {
		perror("mkdir failed");
		exit(EXIT_FAILURE);
	}
	if (mount(source, target, NULL, MS_BIND | MS_RDONLY | MS_NOSUID, NULL) == -1) {
		perror("mount failed");
		exit(EXIT_FAILURE);
	}
}

int main(int argc, char** argv) {
	if (argc < 2) {
		fprintf(stderr, "%s: Not enough arguments\n", argv[0]);
		return EXIT_FAILURE;
	}
	const uint64_t clone_flags = CLONE_INTO_CGROUP
		| CLONE_NEWCGROUP
		| CLONE_NEWNS
		| CLONE_NEWIPC
		| CLONE_NEWNET
		| CLONE_NEWPID
		| CLONE_NEWUSER
		| CLONE_NEWUTS
		| CLONE_NEWTIME;
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
		bind_mount("/usr", "usr");
		bind_mount("/lib", "lib");
		bind_mount("/usr/src/app/challenges", "challenges");
		char cwd[128];
		if (getcwd(cwd, sizeof cwd) == NULL) {
			perror("getcwd failed");
			return EXIT_FAILURE;
		}
		if (chroot(cwd) == -1) {
			perror("chroot failed");
			return EXIT_FAILURE;
		}
		if (chdir("/") == -1) {
			perror("chdir failed");
			return EXIT_FAILURE;
		}
		if (cap_set_mode(CAP_MODE_NOPRIV) == -1) {
			perror("cap_set_mode failed");
			return EXIT_FAILURE;
		}
		scmp_filter_ctx ctx = seccomp_init(SCMP_ACT_KILL);
		for (size_t i = 0; i < NUM_ALLOWED_SYSCALLS; ++i) {
			seccomp_rule_add(ctx, SCMP_ACT_ALLOW, allowed_syscalls[i], 0);
		}
		seccomp_load(ctx);
		seccomp_release(ctx);
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
