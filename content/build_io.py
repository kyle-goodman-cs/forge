"""Safe, repeatable file output for the course build.

Every generated file is written to a temporary file beside its target and moved into
place with os.replace(), so a crash can never leave a file empty or half-written.
Text is always UTF-8 with LF line endings, whatever the platform default is.
"""
import contextlib
import io
import os
import tempfile
import zipfile
from pathlib import Path

ZIP_TIMESTAMP = (1980, 1, 1, 0, 0, 0)  # The earliest date a ZIP entry can hold.


def _write_atomic(path, mode, data, **options):
    path = Path(path)
    descriptor, temporary = tempfile.mkstemp(dir=path.parent, prefix=path.name + ".", suffix=".tmp")
    try:
        with open(descriptor, mode, **options) as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temporary, 0o644)  # mkstemp creates private files; generated output is served.
        os.replace(temporary, path)
    except BaseException:
        with contextlib.suppress(OSError):
            os.unlink(temporary)
        raise


def write_text_atomic(path, text):
    _write_atomic(path, "w", text, encoding="utf-8", newline="\n")


def write_zip_atomic(path, entries):
    """Write {name: text} as a ZIP whose bytes depend only on the names and text."""
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        for name in sorted(entries):
            info = zipfile.ZipInfo(name, date_time=ZIP_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3  # Otherwise this varies by operating system.
            info.external_attr = 0o644 << 16
            archive.writestr(info, entries[name].encode("utf-8"))
    _write_atomic(path, "wb", buffer.getvalue())
