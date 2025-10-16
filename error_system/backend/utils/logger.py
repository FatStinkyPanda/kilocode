"""
Comprehensive Logging System
Multi-destination logging with automatic error context generation
"""
import logging
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
from .error_classes import AppError, ErrorSeverity, ErrorComponent


class AppLogger:
    """
    Comprehensive application logger
    Logs to multiple destinations with organized folder structure
    """

    def __init__(self, project_root: Optional[Path] = None):
        """
        Initialize AppLogger

        Args:
            project_root: Root directory of the project
        """
        if project_root is None:
            # Try to find project root
            current_file = Path(__file__).resolve()
            project_root = current_file.parent.parent.parent

        self.project_root = project_root
        self.logs_dir = project_root / "logs"
        self.errors_dir = project_root / "errors"

        # Create directory structure
        self._create_directories()

        # Initialize loggers
        self._setup_loggers()

        # Error tracking
        self.error_count = 0
        self.errors_by_component: Dict[str, int] = {}
        self.errors_by_severity: Dict[str, int] = {}

    def _create_directories(self):
        """Create logging directory structure"""
        directories = [
            self.logs_dir,
            self.errors_dir,
            self.errors_dir / "by_date",
            self.errors_dir / "by_component",
            self.errors_dir / "by_severity",
            self.errors_dir / "error_patterns",
            self.errors_dir / "debug_snapshots"
        ]

        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)

    def _setup_loggers(self):
        """Set up logging handlers"""
        # Main application logger
        self.app_logger = logging.getLogger("ai_document_generator")
        self.app_logger.setLevel(logging.DEBUG)
        self.app_logger.handlers.clear()

        # Current session log
        session_handler = logging.FileHandler(
            self.logs_dir / "current_session.log",
            mode='a',
            encoding='utf-8'
        )
        session_handler.setLevel(logging.DEBUG)
        session_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        session_handler.setFormatter(session_formatter)
        self.app_logger.addHandler(session_handler)

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter(
            '%(levelname)s: %(message)s'
        )
        console_handler.setFormatter(console_formatter)
        self.app_logger.addHandler(console_handler)

        # Master error log handler
        error_handler = logging.FileHandler(
            self.errors_dir / "master_error_log.log",
            mode='a',
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(session_formatter)
        self.app_logger.addHandler(error_handler)

    def log_error(self, error: AppError):
        """
        Log an AppError with comprehensive tracking

        Args:
            error: AppError instance to log
        """
        self.error_count += 1

        # Update error counts
        component = error.component.value
        severity = error.severity.value

        self.errors_by_component[component] = self.errors_by_component.get(component, 0) + 1
        self.errors_by_severity[severity] = self.errors_by_severity.get(severity, 0) + 1

        # Log to main logger
        log_level = self._get_log_level(error.severity)
        self.app_logger.log(log_level, f"[{error.error_code}] {error.message}")

        # Log to component-specific file
        self._log_to_component_file(error)

        # Log to severity-specific file
        self._log_to_severity_file(error)

        # Log to date-specific file
        self._log_to_date_file(error)

        # Update error summary
        self._update_error_summary(error)

        # Create debug snapshot for critical errors
        if error.severity == ErrorSeverity.CRITICAL:
            self._create_debug_snapshot(error)

        # Update AI context file
        self._update_ai_context_file()

    def _get_log_level(self, severity: ErrorSeverity) -> int:
        """Convert ErrorSeverity to logging level"""
        mapping = {
            ErrorSeverity.CRITICAL: logging.CRITICAL,
            ErrorSeverity.ERROR: logging.ERROR,
            ErrorSeverity.WARNING: logging.WARNING,
            ErrorSeverity.INFO: logging.INFO
        }
        return mapping.get(severity, logging.ERROR)

    def _log_to_component_file(self, error: AppError):
        """Log error to component-specific file"""
        component_file = self.errors_dir / "by_component" / f"{error.component.value}_errors.log"

        with open(component_file, 'a', encoding='utf-8') as f:
            f.write(f"\n{'=' * 80}\n")
            f.write(f"Error Code: {error.error_code}\n")
            f.write(f"Timestamp: {error.timestamp.isoformat()}\n")
            f.write(f"Severity: {error.severity.value}\n")
            f.write(f"Category: {error.category.value}\n")
            f.write(f"Message: {error.message}\n")
            f.write(f"User Message: {error.user_message}\n")
            if error.suggested_fix:
                f.write(f"Suggested Fix: {error.suggested_fix}\n")
            if error.context:
                f.write(f"Context: {json.dumps(error.context.to_dict(), indent=2)}\n")
            if error.stack_trace and error.severity in [ErrorSeverity.CRITICAL, ErrorSeverity.ERROR]:
                f.write(f"\nStack Trace:\n{error.stack_trace}\n")
            f.write(f"{'=' * 80}\n")

    def _log_to_severity_file(self, error: AppError):
        """Log error to severity-specific file"""
        severity_file = self.errors_dir / "by_severity" / f"{error.severity.value}_errors.log"

        with open(severity_file, 'a', encoding='utf-8') as f:
            f.write(f"{error.timestamp.isoformat()} | [{error.error_code}] {error.component.value}: {error.message}\n")

    def _log_to_date_file(self, error: AppError):
        """Log error to date-specific file"""
        date_str = error.timestamp.strftime("%Y-%m-%d")
        date_file = self.errors_dir / "by_date" / f"{date_str}.log"

        with open(date_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(error.to_dict(), indent=2) + "\n")

    def _update_error_summary(self, error: AppError):
        """Update error summary JSON file"""
        summary_file = self.errors_dir / "error_summary.json"

        summary = {
            "total_errors": self.error_count,
            "last_error": error.to_dict(),
            "errors_by_component": self.errors_by_component,
            "errors_by_severity": self.errors_by_severity,
            "last_updated": datetime.utcnow().isoformat()
        }

        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)

    def _create_debug_snapshot(self, error: AppError):
        """Create detailed debug snapshot for critical errors"""
        snapshot_file = self.errors_dir / "debug_snapshots" / f"{error.error_code}.json"

        snapshot = {
            "error": error.to_dict(),
            "system_info": self._get_system_info(),
            "recent_logs": self._get_recent_logs(50),
            "created_at": datetime.utcnow().isoformat()
        }

        with open(snapshot_file, 'w', encoding='utf-8') as f:
            json.dump(snapshot, f, indent=2)

    def _get_system_info(self) -> Dict[str, Any]:
        """Get system information for debug snapshots"""
        import platform
        import sys

        return {
            "platform": platform.platform(),
            "python_version": sys.version,
            "cwd": os.getcwd(),
        }

    def _get_recent_logs(self, num_lines: int = 50) -> List[str]:
        """Get recent log lines"""
        session_log = self.logs_dir / "current_session.log"

        if not session_log.exists():
            return []

        try:
            with open(session_log, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                return lines[-num_lines:] if len(lines) > num_lines else lines
        except Exception:
            return []

    def _update_ai_context_file(self):
        """Update Auto-Error_AI-Context.txt for AI debugging"""
        context_file = self.errors_dir / "Auto-Error_AI-Context.txt"

        # Read error summary
        summary_file = self.errors_dir / "error_summary.json"
        summary = {}
        if summary_file.exists():
            with open(summary_file, 'r', encoding='utf-8') as f:
                summary = json.load(f)

        # Get recent errors by date
        recent_errors = self._get_recent_errors_from_date_logs(10)

        # Generate AI context
        context_content = self._generate_ai_context_content(summary, recent_errors)

        # Write to file
        with open(context_file, 'w', encoding='utf-8') as f:
            f.write(context_content)

    def _get_recent_errors_from_date_logs(self, count: int) -> List[Dict]:
        """Get recent errors from date-specific log files"""
        date_dir = self.errors_dir / "by_date"
        if not date_dir.exists():
            return []

        # Get all date log files, sorted by date (newest first)
        log_files = sorted(date_dir.glob("*.log"), reverse=True)

        errors = []
        for log_file in log_files:
            if len(errors) >= count:
                break

            try:
                with open(log_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Split by error entries and parse JSON
                    for line in content.strip().split('\n'):
                        if line.strip():
                            try:
                                error_data = json.loads(line)
                                errors.append(error_data)
                                if len(errors) >= count:
                                    break
                            except json.JSONDecodeError:
                                continue
            except Exception:
                continue

        return errors[:count]

    def _generate_ai_context_content(self, summary: Dict, recent_errors: List[Dict]) -> str:
        """Generate AI-readable context content"""
        content = []

        content.append("=" * 80)
        content.append("AI DOCUMENT GENERATOR - ERROR CONTEXT FOR AI DEBUGGING")
        content.append("=" * 80)
        content.append(f"\nGenerated: {datetime.utcnow().isoformat()}")
        content.append("\nThis file is automatically generated and contains error context for AI agents")
        content.append("to help debug and fix issues in the application.\n")

        # Summary
        content.append("\n" + "=" * 80)
        content.append("ERROR SUMMARY")
        content.append("=" * 80)
        content.append(f"Total Errors: {summary.get('total_errors', 0)}")
        content.append(f"Last Updated: {summary.get('last_updated', 'N/A')}\n")

        # Errors by component
        content.append("\nErrors by Component:")
        for component, count in summary.get('errors_by_component', {}).items():
            content.append(f"  - {component}: {count}")

        # Errors by severity
        content.append("\nErrors by Severity:")
        for severity, count in summary.get('errors_by_severity', {}).items():
            content.append(f"  - {severity}: {count}")

        # Recent errors
        content.append("\n" + "=" * 80)
        content.append("RECENT ERRORS (Last 10)")
        content.append("=" * 80)

        for i, error in enumerate(recent_errors, 1):
            content.append(f"\n{i}. [{error.get('error_code', 'UNKNOWN')}]")
            content.append(f"   Component: {error.get('component', 'unknown')}")
            content.append(f"   Severity: {error.get('severity', 'unknown')}")
            content.append(f"   Category: {error.get('category', 'unknown')}")
            content.append(f"   Message: {error.get('message', 'No message')}")
            content.append(f"   User Message: {error.get('user_message', 'No user message')}")
            if error.get('suggested_fix'):
                content.append(f"   Suggested Fix: {error.get('suggested_fix')}")
            content.append(f"   Timestamp: {error.get('timestamp', 'unknown')}")

        # Debugging instructions
        content.append("\n" + "=" * 80)
        content.append("DEBUGGING INSTRUCTIONS FOR AI AGENTS")
        content.append("=" * 80)
        content.append("\n1. Review the recent errors above to identify patterns")
        content.append("2. Check component-specific error logs in: errors/by_component/")
        content.append("3. Review debug snapshots for critical errors in: errors/debug_snapshots/")
        content.append("4. Examine the current session log in: logs/current_session.log")
        content.append("5. Check relevant source code files based on the component")
        content.append("\nComponent to Source File Mapping:")
        content.append("  - ai: backend/services/ai_service.py")
        content.append("  - schema: backend/services/schema_service.py")
        content.append("  - file: backend/services/file_service.py")
        content.append("  - template: backend/services/template_service.py")
        content.append("  - latex: backend/services/latex_service.py")
        content.append("  - database: backend/models/ and backend/utils/database.py")
        content.append("  - extraction: backend/services/extraction_service.py")

        content.append("\n" + "=" * 80)
        content.append("END OF ERROR CONTEXT")
        content.append("=" * 80)

        return '\n'.join(content)

    def info(self, message: str):
        """Log info message"""
        self.app_logger.info(message)

    def warning(self, message: str):
        """Log warning message"""
        self.app_logger.warning(message)

    def error(self, message: str):
        """Log error message"""
        self.app_logger.error(message)

    def critical(self, message: str):
        """Log critical message"""
        self.app_logger.critical(message)

    def debug(self, message: str):
        """Log debug message"""
        self.app_logger.debug(message)


# Global logger instance
_logger_instance: Optional[AppLogger] = None


def get_logger() -> AppLogger:
    """Get global logger instance"""
    global _logger_instance
    if _logger_instance is None:
        _logger_instance = AppLogger()
    return _logger_instance
