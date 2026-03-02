#!/usr/bin/env python3
"""
Patch specific key=value pairs in the production .env file via SSH/SFTP.

Usage (called from GitHub Actions with env vars already set):
  python3 scripts/patch-production-env.py

Required environment variables:
  SSH_HOST, SSH_PORT, SSH_USER, SSH_PASS, SERVER_ENV_PATH

Optional environment variables (any that are non-empty will be written):
  MAIL_MAILER, MAIL_HOST, MAIL_PORT, MAIL_USERNAME,
  MAIL_PASSWORD, MAIL_ENCRYPTION, MAIL_FROM_ADDRESS
"""

import os
import re
import sys

try:
    import paramiko
except ImportError:
    print("Installing paramiko...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "-q"])
    import paramiko


def patch_env(content: str, updates: dict) -> str:
    """Replace existing keys or append new ones. Skips empty values."""
    for key, value in updates.items():
        if not value:
            continue
        pattern = rf"^{re.escape(key)}=.*$"
        replacement = f"{key}={value}"
        if re.search(pattern, content, re.MULTILINE):
            content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
            print(f"  Updated: {key}")
        else:
            content = content.rstrip("\n") + f"\n{replacement}\n"
            print(f"  Added:   {key}")
    return content


def main():
    host     = os.environ["SSH_HOST"]
    port     = int(os.environ.get("SSH_PORT", "65002"))
    username = os.environ["SSH_USER"]
    password = os.environ["SSH_PASS"]
    env_path = os.environ["SERVER_ENV_PATH"]   # e.g. ~/domains/example.com/public_html/fischer/.env

    updates = {
        "MAIL_MAILER":       os.environ.get("MAIL_MAILER", "smtp"),
        "MAIL_HOST":         os.environ.get("MAIL_HOST", ""),
        "MAIL_PORT":         os.environ.get("MAIL_PORT", ""),
        "MAIL_USERNAME":     os.environ.get("MAIL_USERNAME", ""),
        "MAIL_PASSWORD":     os.environ.get("MAIL_PASSWORD", ""),
        "MAIL_ENCRYPTION":   os.environ.get("MAIL_ENCRYPTION", ""),
        "MAIL_FROM_ADDRESS": os.environ.get("MAIL_FROM_ADDRESS", ""),
    }

    # Skip entirely if no mail credentials provided
    if not any([updates["MAIL_HOST"], updates["MAIL_USERNAME"]]):
        print("No MAIL_HOST or MAIL_USERNAME set — skipping .env mail patch.")
        return

    print(f"Connecting to {host}:{port} as {username}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=username, password=password, timeout=30)

    sftp = client.open_sftp()

    print(f"Reading {env_path}...")
    try:
        with sftp.open(env_path, "r") as f:
            content = f.read().decode("utf-8")
    except FileNotFoundError:
        print(f"ERROR: {env_path} not found on server. Deploy the backend first.")
        sftp.close()
        client.close()
        sys.exit(1)

    print("Patching mail settings:")
    patched = patch_env(content, updates)

    with sftp.open(env_path, "w") as f:
        f.write(patched.encode("utf-8"))

    sftp.close()
    client.close()
    print("✓ Production .env updated successfully.")


if __name__ == "__main__":
    main()
