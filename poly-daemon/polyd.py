#!/usr/bin/env python3
"""
polyd - Poly OS Process Lifecycle & Background Freezer Daemon
Implements iOS-style background process suspension using Linux cgroups v2
while maintaining Windows-style multitasking via keep-alive leases.
"""

import os
import sys
import time
import json
import logging
from dataclasses import dataclass, field
from typing import Dict, Optional, Set

logging.basicConfig(
    level=logging.INFO,
    format="[polyd %(asctime)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("polyd")

CGROUP_ROOT = "/sys/fs/cgroup/poly"
INACTIVE_GRACE_PERIOD_SEC = 15.0  # Time before an inactive window is frozen


@dataclass
class ProcessState:
    pid: int
    app_id: str
    title: str
    last_active_ts: float = field(default_factory=time.time)
    is_frozen: bool = False
    cpu_weight: int = 100
    leases: Set[str] = field(default_factory=set)  # e.g. {"AudioPlayback", "FileTransfer"}
    memory_kb: int = 0


class PolyLifecycleManager:
    def __init__(self, cgroup_path: str = CGROUP_ROOT, dry_run: bool = False):
        self.cgroup_path = cgroup_path
        self.dry_run = dry_run or not os.path.exists(cgroup_path)
        self.processes: Dict[int, ProcessState] = {}
        self.active_pid: Optional[int] = None

        if self.dry_run:
            logger.warning("Running in simulation/dry-run mode (Linux cgroups v2 root not mounted at %s)", cgroup_path)
        else:
            self._ensure_cgroup_root()

    def _ensure_cgroup_root(self):
        try:
            os.makedirs(self.cgroup_path, exist_ok=True)
            # Enable cpu and memory controllers if available
            subtree_control = os.path.join(self.cgroup_path, "cgroup.subtree_control")
            if os.path.exists(subtree_control):
                with open(subtree_control, "w") as f:
                    f.write("+cpu +memory")
        except Exception as e:
            logger.error("Failed to initialize cgroup root: %s", e)
            self.dry_run = True

    def register_app(self, pid: int, app_id: str, title: str):
        """Called when a new Wayland client surface is created."""
        proc = ProcessState(pid=pid, app_id=app_id, title=title)
        self.processes[pid] = proc
        logger.info("Registered app '%s' (PID: %d)", title, pid)

        if not self.dry_run:
            app_cgroup = os.path.join(self.cgroup_path, f"app_{pid}")
            os.makedirs(app_cgroup, exist_ok=True)
            with open(os.path.join(app_cgroup, "cgroup.procs"), "w") as f:
                f.write(str(pid))

    def unregister_app(self, pid: int):
        """Called when a window is closed."""
        if pid in self.processes:
            title = self.processes[pid].title
            del self.processes[pid]
            logger.info("Unregistered app '%s' (PID: %d)", title, pid)
        if self.active_pid == pid:
            self.active_pid = None

    def set_active_window(self, pid: Optional[int]):
        """Called by poly-compositor when window focus changes."""
        now = time.time()
        
        # If active changed, update previous active timestamp
        if self.active_pid and self.active_pid in self.processes and self.active_pid != pid:
            prev = self.processes[self.active_pid]
            prev.last_active_ts = now
            self._set_cpu_weight(prev.pid, 10)  # Lower priority
            logger.info("App '%s' (PID %d) moved to Inactive", prev.title, prev.pid)

        self.active_pid = pid
        if pid and pid in self.processes:
            curr = self.processes[pid]
            curr.last_active_ts = now
            self._set_cpu_weight(curr.pid, 100)  # Max priority
            if curr.is_frozen:
                self._thaw_process(curr)

    def request_lease(self, pid: int, lease_type: str) -> bool:
        """Apps request background work permits (e.g. audio playing, rendering)."""
        if pid in self.processes:
            self.processes[pid].leases.add(lease_type)
            logger.info("Granted lease '%s' to PID %d (%s)", lease_type, pid, self.processes[pid].title)
            if self.processes[pid].is_frozen:
                self._thaw_process(self.processes[pid])
            return True
        return False

    def release_lease(self, pid: int, lease_type: str):
        if pid in self.processes and lease_type in self.processes[pid].leases:
            self.processes[pid].leases.remove(lease_type)
            logger.info("Released lease '%s' from PID %d", lease_type, pid)

    def _freeze_process(self, proc: ProcessState):
        if proc.is_frozen:
            return
        logger.info("[FREEZE] Suspending app '%s' (PID %d) -> Zero CPU, ZRAM compressed", proc.title, proc.pid)
        proc.is_frozen = True
        if not self.dry_run:
            freeze_file = os.path.join(self.cgroup_path, f"app_{proc.pid}", "cgroup.freeze")
            if os.path.exists(freeze_file):
                with open(freeze_file, "w") as f:
                    f.write("1")

    def _thaw_process(self, proc: ProcessState):
        if not proc.is_frozen:
            return
        logger.info("[RESUME] Instant wakeup for '%s' (PID %d)", proc.title, proc.pid)
        proc.is_frozen = False
        if not self.dry_run:
            freeze_file = os.path.join(self.cgroup_path, f"app_{proc.pid}", "cgroup.freeze")
            if os.path.exists(freeze_file):
                with open(freeze_file, "w") as f:
                    f.write("0")

    def _set_cpu_weight(self, pid: int, weight: int):
        if pid in self.processes:
            self.processes[pid].cpu_weight = weight
        if not self.dry_run:
            weight_file = os.path.join(self.cgroup_path, f"app_{pid}", "cpu.weight")
            if os.path.exists(weight_file):
                with open(weight_file, "w") as f:
                    f.write(str(weight))

    def tick(self):
        """Periodic heartbeat evaluation of process states."""
        now = time.time()
        for pid, proc in list(self.processes.items()):
            if pid == self.active_pid:
                continue

            # Check if eligible for freezing
            time_inactive = now - proc.last_active_ts
            has_leases = len(proc.leases) > 0

            if time_inactive >= INACTIVE_GRACE_PERIOD_SEC and not proc.is_frozen and not has_leases:
                self._freeze_process(proc)

    def dump_status(self) -> dict:
        return {
            "active_pid": self.active_pid,
            "processes": [
                {
                    "pid": p.pid,
                    "title": p.title,
                    "app_id": p.app_id,
                    "status": "Active" if p.pid == self.active_pid else ("Frozen" if p.is_frozen else "Inactive"),
                    "cpu_weight": p.cpu_weight,
                    "leases": list(p.leases)
                }
                for p in self.processes.values()
            ]
        }


if __name__ == "__main__":
    manager = PolyLifecycleManager(dry_run=True)
    logger.info("Poly Lifecycle Daemon initialized.")
    # Example demo cycle
    manager.register_app(101, "poly.browser", "Poly Safari / Web")
    manager.register_app(102, "poly.notes", "Notes & Scratchpad")
    manager.register_app(103, "poly.music", "Music Player")
    
    manager.set_active_window(101)
    manager.request_lease(103, "AudioPlayback")  # Music player won't freeze!
    
    print("\n--- Initial State ---")
    print(json.dumps(manager.dump_status(), indent=2))
    
    print("\n--- Simulating 20 seconds of inactivity on Notes app ---")
    manager.processes[102].last_active_ts -= 20.0
    manager.tick()
    
    print("\n--- After Inactivity Tick ---")
    print(json.dumps(manager.dump_status(), indent=2))
