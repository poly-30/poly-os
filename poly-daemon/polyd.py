#!/usr/bin/env python3
"""
polyd - Poly OS Process Lifecycle & Background Freezer Daemon
Implements iOS-style background process suspension using Linux cgroups v2
while maintaining Windows-style multitasking via keep-alive leases and
configurable TOML rules.
"""

import os
import sys
import time
import json
import logging
import argparse
from dataclasses import dataclass, field
from typing import Dict, Optional, Set, List

# Setup default logger
logging.basicConfig(
    level=logging.INFO,
    format="[polyd %(asctime)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("polyd")

DEFAULT_CGROUP_ROOT = "/sys/fs/cgroup/poly"
DEFAULT_INACTIVE_TIMEOUT = 15.0


@dataclass
class ZramStats:
    """Telemetry data extracted from Linux /sys/block/zram0/mm_stat."""
    algorithm: str = "lz4"
    orig_data_size: int = 0
    compr_data_size: int = 0
    mem_used_total: int = 0
    mem_limit: int = 0
    mem_used_max: int = 0
    same_pages: int = 0
    pages_compacted: int = 0
    huge_pages: int = 0
    ratio: float = 3.2
    savings_bytes: int = 0
    savings_mb: float = 0.0
    is_real: bool = False
    device: str = "/sys/block/zram0"

    def to_dict(self) -> dict:
        return {
            "algorithm": self.algorithm,
            "orig_data_size": self.orig_data_size,
            "compr_data_size": self.compr_data_size,
            "mem_used_total": self.mem_used_total,
            "mem_limit": self.mem_limit,
            "mem_used_max": self.mem_used_max,
            "same_pages": self.same_pages,
            "pages_compacted": self.pages_compacted,
            "huge_pages": self.huge_pages,
            "ratio": round(self.ratio, 2),
            "ratio_str": f"{self.ratio:.2f}x",
            "orig_mb": round(self.orig_data_size / (1024 * 1024), 1),
            "compr_mb": round(self.compr_data_size / (1024 * 1024), 1),
            "savings_mb": round(self.savings_mb, 1),
            "savings_percent": round((1.0 - (self.compr_data_size / max(1, self.orig_data_size))) * 100, 1),
            "is_real": self.is_real,
            "device": self.device
        }


class ZramManager:
    """Interacts with Linux kernel ZRAM driver via sysfs mm_stat & comp_algorithm."""
    def __init__(self, device: str = "/sys/block/zram0", default_algo: str = "lz4"):
        self.device = device
        self.algorithm = default_algo.lower().strip()
        self._last_stats = ZramStats(algorithm=self.algorithm, device=self.device)

    def read_mm_stat(self, frozen_count: int = 0) -> ZramStats:
        """Reads /sys/block/zram0/mm_stat or synthesizes accurate telemetry in simulation."""
        mm_stat_path = os.path.join(self.device, "mm_stat")
        algo_path = os.path.join(self.device, "comp_algorithm")

        # 1. Real Linux sysfs interface
        if os.path.exists(mm_stat_path):
            try:
                if os.path.exists(algo_path):
                    with open(algo_path, "r", encoding="utf-8") as f:
                        for token in f.read().split():
                            if token.startswith("[") and token.endswith("]"):
                                self.algorithm = token[1:-1].strip()
                                break

                with open(mm_stat_path, "r", encoding="utf-8") as f:
                    tokens = f.read().strip().split()

                if len(tokens) >= 2:
                    orig = int(tokens[0])
                    compr = int(tokens[1])
                    used_total = int(tokens[2]) if len(tokens) > 2 else compr
                    limit = int(tokens[3]) if len(tokens) > 3 else 0
                    used_max = int(tokens[4]) if len(tokens) > 4 else used_total
                    same_pages = int(tokens[5]) if len(tokens) > 5 else 0
                    compacted = int(tokens[6]) if len(tokens) > 6 else 0
                    huge_pages = int(tokens[7]) if len(tokens) > 7 else 0

                    ratio = (orig / compr) if compr > 0 else (3.2 if self.algorithm == "lz4" else 4.3)
                    savings = max(0, orig - compr)

                    self._last_stats = ZramStats(
                        algorithm=self.algorithm,
                        orig_data_size=orig,
                        compr_data_size=compr,
                        mem_used_total=used_total,
                        mem_limit=limit,
                        mem_used_max=used_max,
                        same_pages=same_pages,
                        pages_compacted=compacted,
                        huge_pages=huge_pages,
                        ratio=ratio,
                        savings_bytes=savings,
                        savings_mb=savings / (1024 * 1024),
                        is_real=True,
                        device=self.device
                    )
                    return self._last_stats
            except Exception as e:
                logger.warning("Error reading %s: %s (falling back to simulation)", mm_stat_path, e)

        # 2. Simulated/Demonstration Mode
        base_ratio = 3.24 if self.algorithm == "lz4" else 4.28
        jitter = 0.05 * ((time.time() % 30) / 30.0 - 0.5)
        ratio = max(1.5, base_ratio + jitter)

        uncompressed_mb = 112.0 + (frozen_count * 68.0)
        compr_mb = uncompressed_mb / ratio
        savings_mb = uncompressed_mb - compr_mb

        orig_bytes = int(uncompressed_mb * 1024 * 1024)
        compr_bytes = int(compr_mb * 1024 * 1024)

        self._last_stats = ZramStats(
            algorithm=self.algorithm,
            orig_data_size=orig_bytes,
            compr_data_size=compr_bytes,
            mem_used_total=compr_bytes + (3 * 1024 * 1024),
            mem_limit=1024 * 1024 * 1024,
            mem_used_max=int(compr_bytes * 1.2),
            same_pages=int(uncompressed_mb * 14),
            pages_compacted=int(uncompressed_mb * 22),
            huge_pages=int(uncompressed_mb / 6),
            ratio=ratio,
            savings_bytes=orig_bytes - compr_bytes,
            savings_mb=savings_mb,
            is_real=False,
            device=self.device
        )
        return self._last_stats

    def set_algorithm(self, algo: str) -> bool:
        """Sets active compression algorithm (lz4 or zstd)."""
        algo = algo.lower().strip()
        if algo not in ("lz4", "zstd"):
            logger.warning("Invalid ZRAM algorithm: %s. Allowed: 'lz4', 'zstd'", algo)
            return False

        self.algorithm = algo
        algo_path = os.path.join(self.device, "comp_algorithm")
        if os.path.exists(algo_path):
            try:
                with open(algo_path, "w", encoding="utf-8") as f:
                    f.write(algo)
                logger.info("Kernel %s updated to: %s", algo_path, algo)
            except Exception as e:
                logger.warning("Failed writing to %s: %s", algo_path, e)

        logger.info("ZRAM compression backend switched to: %s", algo.upper())
        return True


@dataclass
class PolyConfig:
    """Configuration schema for polyd daemon."""
    poll_interval_seconds: float = 1.0
    freeze_timeout_seconds: float = DEFAULT_INACTIVE_TIMEOUT
    cgroup_root: str = DEFAULT_CGROUP_ROOT
    dry_run: bool = False
    log_level: str = "INFO"
    freezer_enabled: bool = True
    active_cpu_weight: int = 100
    inactive_cpu_weight: int = 10
    zram_compression: bool = True
    compression_algorithm: str = "lz4"
    zram_device: str = "/sys/block/zram0"
    max_memory_mb: int = 0
    whitelist_apps: Set[str] = field(default_factory=lambda: {
        "poly.music", "Music", "Audio", "poly.telemetry", "poly.terminal", "Process Manager"
    })
    default_leases: Set[str] = field(default_factory=lambda: {
        "AudioPlayback", "FileTransfer", "Compilation"
    })
    config_file_loaded: Optional[str] = None


def find_config_file(custom_path: Optional[str] = None) -> Optional[str]:
    """Finds the first existing configuration file from standard locations."""
    if custom_path and os.path.exists(custom_path):
        return os.path.abspath(custom_path)

    xdg_config = os.environ.get("XDG_CONFIG_HOME", os.path.expanduser("~/.config"))
    candidate_paths = [
        # 1. Custom CLI path if provided
        custom_path,
        # 2. XDG user config locations
        os.path.join(xdg_config, "polyd.toml"),
        os.path.join(xdg_config, "poly", "polyd.toml"),
        os.path.expanduser("~/.polyd.toml"),
        # 3. Local working directory / poly-daemon directory
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "polyd.toml"),
        os.path.join(os.getcwd(), "polyd.toml"),
        # 4. System wide configurations
        "/etc/polyd.toml",
        "/etc/polyd.conf",
    ]

    for p in candidate_paths:
        if p and os.path.exists(p):
            return os.path.abspath(p)
    return None


def _simple_toml_fallback(filepath: str) -> dict:
    """Minimal key-value parser for basic TOML when tomllib is absent."""
    result = {}
    current_sec = result
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("[") and line.endswith("]"):
                sec_name = line[1:-1].strip()
                current_sec = result.setdefault(sec_name, {})
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if val.lower() == "true":
                    current_sec[key] = True
                elif val.lower() == "false":
                    current_sec[key] = False
                else:
                    try:
                        current_sec[key] = float(val) if "." in val else int(val)
                    except ValueError:
                        current_sec[key] = val
    return result


def load_config(config_path: Optional[str] = None) -> PolyConfig:
    """Loads configuration from TOML file with automatic fallback to defaults."""
    cfg = PolyConfig()
    target_path = find_config_file(config_path)

    if not target_path:
        logger.info("No configuration file found. Using default internal settings.")
        return cfg

    try:
        data = None
        try:
            import tomllib
            with open(target_path, "rb") as f:
                data = tomllib.load(f)
        except ImportError:
            try:
                import tomli as tomllib
                with open(target_path, "rb") as f:
                    data = tomllib.load(f)
            except ImportError:
                data = _simple_toml_fallback(target_path)

        if data:
            # [daemon] section
            daemon_sec = data.get("daemon", {})
            cfg.poll_interval_seconds = float(daemon_sec.get("poll_interval_seconds", cfg.poll_interval_seconds))
            cfg.freeze_timeout_seconds = float(daemon_sec.get("freeze_timeout_seconds", cfg.freeze_timeout_seconds))
            cfg.cgroup_root = str(daemon_sec.get("cgroup_root", cfg.cgroup_root))
            cfg.dry_run = bool(daemon_sec.get("dry_run", cfg.dry_run))
            cfg.log_level = str(daemon_sec.get("log_level", cfg.log_level)).upper()

            # [freezer] section
            freezer_sec = data.get("freezer", {})
            cfg.freezer_enabled = bool(freezer_sec.get("enabled", cfg.freezer_enabled))
            cfg.active_cpu_weight = int(freezer_sec.get("active_cpu_weight", cfg.active_cpu_weight))
            cfg.inactive_cpu_weight = int(freezer_sec.get("inactive_cpu_weight", cfg.inactive_cpu_weight))
            cfg.zram_compression = bool(freezer_sec.get("zram_compression", cfg.zram_compression))
            cfg.compression_algorithm = str(freezer_sec.get("compression_algorithm", cfg.compression_algorithm)).lower().strip()
            cfg.zram_device = str(freezer_sec.get("zram_device", cfg.zram_device)).strip()
            cfg.max_memory_mb = int(freezer_sec.get("max_memory_mb", cfg.max_memory_mb))

            # [whitelist] section
            whitelist_sec = data.get("whitelist", {})
            if "apps" in whitelist_sec and isinstance(whitelist_sec["apps"], list):
                cfg.whitelist_apps = set(str(a) for a in whitelist_sec["apps"])
            if "default_leases" in whitelist_sec and isinstance(whitelist_sec["default_leases"], list):
                cfg.default_leases = set(str(l) for l in whitelist_sec["default_leases"])

            cfg.config_file_loaded = target_path
            logger.info("Successfully loaded configuration from: %s", target_path)

    except Exception as e:
        logger.error("Failed to parse configuration file '%s': %s (fallback to defaults)", target_path, e)

    # Apply configured logging level
    try:
        numeric_level = getattr(logging, cfg.log_level, logging.INFO)
        logger.setLevel(numeric_level)
    except Exception:
        pass

    return cfg


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
    def __init__(self, config: Optional[PolyConfig] = None, cgroup_path: Optional[str] = None, dry_run: Optional[bool] = None):
        self.config = config or load_config()

        # Command-line or argument overrides
        self.cgroup_path = cgroup_path or self.config.cgroup_root
        if dry_run is not None:
            self.dry_run = dry_run
        else:
            self.dry_run = self.config.dry_run or not os.path.exists(self.cgroup_path)

        self.processes: Dict[int, ProcessState] = {}
        self.active_pid: Optional[int] = None
        self.zram = ZramManager(
            device=self.config.zram_device,
            default_algo=self.config.compression_algorithm
        )

        if self.dry_run:
            logger.warning("Running in simulation/dry-run mode (cgroups v2 root: %s)", self.cgroup_path)
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

    def is_whitelisted(self, proc: ProcessState) -> bool:
        """Checks if process is exempt from background suspension."""
        app_id_lower = proc.app_id.lower()
        title_lower = proc.title.lower()

        for item in self.config.whitelist_apps:
            item_lower = item.lower()
            if item_lower == app_id_lower or item_lower in title_lower:
                return True
        return False

    def register_app(self, pid: int, app_id: str, title: str):
        """Called when a new Wayland client surface is created."""
        proc = ProcessState(pid=pid, app_id=app_id, title=title)
        self.processes[pid] = proc
        logger.info("Registered app '%s' (PID: %d, ID: %s)", title, pid, app_id)

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
        
        # If active changed, update previous active timestamp and downgrade CPU weight
        if self.active_pid and self.active_pid in self.processes and self.active_pid != pid:
            prev = self.processes[self.active_pid]
            prev.last_active_ts = now
            self._set_cpu_weight(prev.pid, self.config.inactive_cpu_weight)
            logger.info("App '%s' (PID %d) moved to Inactive (CPU weight: %d)",
                        prev.title, prev.pid, self.config.inactive_cpu_weight)

        self.active_pid = pid
        if pid and pid in self.processes:
            curr = self.processes[pid]
            curr.last_active_ts = now
            self._set_cpu_weight(curr.pid, self.config.active_cpu_weight)
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
        logger.info("[FREEZE] Suspending app '%s' (PID %d) -> Zero CPU, ZRAM compressed (timeout: %.1fs)",
                    proc.title, proc.pid, self.config.freeze_timeout_seconds)
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
        if not self.config.freezer_enabled:
            return

        now = time.time()
        for pid, proc in list(self.processes.items()):
            if pid == self.active_pid:
                continue

            time_inactive = now - proc.last_active_ts
            has_leases = len(proc.leases) > 0
            is_exempt = self.is_whitelisted(proc)

            # Freeze only when inactive past threshold, not exempted, and holding no active leases
            if time_inactive >= self.config.freeze_timeout_seconds and not proc.is_frozen and not has_leases and not is_exempt:
                self._freeze_process(proc)

    def dump_status(self) -> dict:
        frozen_count = sum(1 for p in self.processes.values() if p.is_frozen)
        zram_stats = self.zram.read_mm_stat(frozen_count=frozen_count)
        return {
            "active_pid": self.active_pid,
            "zram": zram_stats.to_dict(),
            "config": {
                "config_file": self.config.config_file_loaded or "(internal defaults)",
                "freeze_timeout_seconds": self.config.freeze_timeout_seconds,
                "poll_interval_seconds": self.config.poll_interval_seconds,
                "freezer_enabled": self.config.freezer_enabled,
                "active_cpu_weight": self.config.active_cpu_weight,
                "inactive_cpu_weight": self.config.inactive_cpu_weight,
                "zram_compression": self.config.zram_compression,
                "compression_algorithm": self.zram.algorithm,
                "whitelist_apps": list(self.config.whitelist_apps)
            },
            "processes": [
                {
                    "pid": p.pid,
                    "title": p.title,
                    "app_id": p.app_id,
                    "status": "Active" if p.pid == self.active_pid else ("Frozen" if p.is_frozen else "Inactive"),
                    "cpu_weight": p.cpu_weight,
                    "is_whitelisted": self.is_whitelisted(p),
                    "leases": list(p.leases)
                }
                for p in self.processes.values()
            ]
        }


import http.server
import urllib.parse


class PolydIPCHandler(http.server.BaseHTTPRequestHandler):
    """IPC HTTP handler exposing ZRAM telemetry & lifecycle endpoints."""
    manager: Optional[PolyLifecycleManager] = None

    def log_message(self, format, *args):
        # Silence default request logs unless DEBUG
        if logger.isEnabledFor(logging.DEBUG):
            super().log_message(format, *args)

    def _send_json(self, data: dict, status: int = 200):
        body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if not self.manager:
            self._send_json({"error": "Manager not initialized"}, 500)
            return

        if path in ("/status", "/api/status", "/api/telemetry", "/telemetry"):
            self._send_json(self.manager.dump_status())
        elif path in ("/zram/stats", "/api/zram/stats"):
            frozen_count = sum(1 for p in self.manager.processes.values() if p.is_frozen)
            self._send_json(self.manager.zram.read_mm_stat(frozen_count=frozen_count).to_dict())
        elif path in ("/zram/algorithm", "/api/zram/algorithm"):
            if "set" in query:
                new_algo = query["set"][0].lower().strip()
                ok = self.manager.zram.set_algorithm(new_algo)
                self._send_json({
                    "success": ok,
                    "algorithm": self.manager.zram.algorithm,
                    "zram": self.manager.zram.read_mm_stat().to_dict()
                })
            else:
                self._send_json({
                    "algorithm": self.manager.zram.algorithm,
                    "zram": self.manager.zram.read_mm_stat().to_dict()
                })
        else:
            self._send_json({
                "error": "Not Found",
                "endpoints": [
                    "/status",
                    "/telemetry",
                    "/zram/stats",
                    "/zram/algorithm?set=lz4|zstd"
                ]
            }, 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if not self.manager:
            self._send_json({"error": "Manager not initialized"}, 500)
            return

        if path in ("/zram/algorithm", "/api/zram/algorithm"):
            length = int(self.headers.get('Content-Length', 0))
            body_raw = self.rfile.read(length).decode('utf-8') if length > 0 else "{}"
            try:
                data = json.loads(body_raw)
                algo = data.get("algorithm", "").lower().strip()
            except Exception:
                algo = ""

            if algo in ("lz4", "zstd"):
                ok = self.manager.zram.set_algorithm(algo)
                self._send_json({
                    "success": ok,
                    "algorithm": self.manager.zram.algorithm,
                    "zram": self.manager.zram.read_mm_stat().to_dict()
                })
            else:
                self._send_json({"error": "Invalid algorithm. Allowed: 'lz4', 'zstd'"}, 400)
        else:
            self._send_json({"error": "Endpoint does not support POST"}, 404)


def run_ipc_server(manager: PolyLifecycleManager, port: int = 5174):
    """Starts the background IPC HTTP server for telemetry & algorithm control."""
    PolydIPCHandler.manager = manager
    server = http.server.ThreadingHTTPServer(("0.0.0.0", port), PolydIPCHandler)
    logger.info("⚡ polyd IPC & Telemetry HTTP Server active on http://127.0.0.1:%d", port)
    logger.info("   -> Endpoints: /status, /telemetry, /zram/stats, /zram/algorithm?set=lz4|zstd")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down polyd IPC server.")
        server.server_close()


def parse_args():
    parser = argparse.ArgumentParser(
        description="polyd - Poly OS Process Lifecycle & Background Freezer Daemon",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "-c", "--config",
        type=str,
        default=None,
        help="Path to TOML configuration file (e.g. ~/.config/polyd.toml)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Force simulation/dry-run mode without accessing /sys/fs/cgroup"
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Run lifecycle simulation demonstration"
    )
    parser.add_argument(
        "--dump-config",
        action="store_true",
        help="Display loaded configuration parameters and exit"
    )
    parser.add_argument(
        "--server",
        action="store_true",
        help="Run polyd as an active background IPC telemetry server"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=5174,
        help="Port for the IPC HTTP telemetry server"
    )
    parser.add_argument(
        "--set-algorithm",
        type=str,
        choices=["lz4", "zstd"],
        default=None,
        help="Set ZRAM compression algorithm (lz4 or zstd)"
    )
    parser.add_argument(
        "--zram-stats",
        action="store_true",
        help="Query and print ZRAM mm_stat compression metrics directly"
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    config = load_config(args.config)

    if args.dry_run:
        config.dry_run = True

    if args.set_algorithm:
        config.compression_algorithm = args.set_algorithm

    manager = PolyLifecycleManager(config=config, dry_run=True if args.dry_run or args.demo else None)

    if args.set_algorithm:
        manager.zram.set_algorithm(args.set_algorithm)

    if args.zram_stats:
        stats = manager.zram.read_mm_stat()
        print(json.dumps(stats.to_dict(), indent=2))
        sys.exit(0)

    if args.dump_config:
        print(json.dumps({
            "config_file_loaded": config.config_file_loaded,
            "freeze_timeout_seconds": config.freeze_timeout_seconds,
            "poll_interval_seconds": config.poll_interval_seconds,
            "cgroup_root": config.cgroup_root,
            "dry_run": config.dry_run,
            "freezer_enabled": config.freezer_enabled,
            "active_cpu_weight": config.active_cpu_weight,
            "inactive_cpu_weight": config.inactive_cpu_weight,
            "zram_compression": config.zram_compression,
            "compression_algorithm": manager.zram.algorithm,
            "zram_device": config.zram_device,
            "whitelist_apps": list(config.whitelist_apps),
            "default_leases": list(config.default_leases),
        }, indent=2))
        sys.exit(0)

    if args.server:
        # Register sample apps for telemetry visibility
        manager.register_app(101, "poly.browser", "Poly Web Browser")
        manager.register_app(102, "poly.code", "Poly Code Studio")
        manager.register_app(103, "poly.notes", "Notes & Scratchpad")
        manager.register_app(104, "poly.music", "Music Player (Lease)")
        manager.set_active_window(102)
        manager.request_lease(104, "AudioPlayback")
        # Freeze notes for initial telemetry
        manager.processes[103].last_active_ts -= (config.freeze_timeout_seconds + 5.0)
        manager.tick()
        run_ipc_server(manager, port=args.port)
        sys.exit(0)

    logger.info("Poly Lifecycle Daemon initialized (config: %s)", config.config_file_loaded or "built-in defaults")

    # Run demonstration cycle if --demo or default invocation
    print("\n========================================================")
    print(" Poly OS polyd Process Lifecycle Demonstration")
    print("========================================================")
    manager.register_app(101, "poly.browser", "Poly Safari / Web")
    manager.register_app(102, "poly.notes", "Notes & Scratchpad")
    manager.register_app(103, "poly.music", "Music Player (Whitelisted)")

    manager.set_active_window(101)
    manager.request_lease(103, "AudioPlayback")

    print("\n--- Initial State ---")
    print(json.dumps(manager.dump_status(), indent=2))

    print(f"\n--- Simulating {config.freeze_timeout_seconds + 5:.1f}s of inactivity on Notes app ---")
    manager.processes[102].last_active_ts -= (config.freeze_timeout_seconds + 5.0)
    manager.processes[103].last_active_ts -= (config.freeze_timeout_seconds + 5.0)
    manager.tick()

    print("\n--- After Inactivity Tick (ZRAM Active: %s) ---" % manager.zram.algorithm.upper())
    print(json.dumps(manager.dump_status(), indent=2))
