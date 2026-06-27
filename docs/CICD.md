# DataArena CI/CD

GitHub Actions workflow: `.github/workflows/deploy.yml`

## Trigger

- Push to `main`: run build, then deploy.
- Manual run: GitHub Actions -> `CI/CD` -> `Run workflow`.

## Required GitHub Secrets

Repository settings -> Secrets and variables -> Actions:

- `SERVER_SSH_KEY`: private key for SSH login to the server

Optional:

- `SERVER_PORT`: SSH port. Leave unset if the server uses port `22`.

Do not commit private keys into the repo.

The workflow deploys to:

- Host: `140.120.53.252`
- User: `680-9000`

## Server Requirements

The remote Windows server must have:

- OpenSSH Server enabled and reachable from GitHub Actions.
- Git installed and available in PATH.
- Docker / Docker Compose available in PATH.
- The repository cloned at:

```powershell
C:\Users\680-9000\Desktop\Data_Arena
```

- The server repo must be on branch `main`.
- The server repo must be able to pull from GitHub using its configured repo/deploy key.

## Deploy Steps

The workflow runs:

```powershell
Set-Location -LiteralPath 'C:\Users\680-9000\Desktop\Data_Arena'
git fetch origin main
git pull --ff-only origin main
docker compose up --build -d
```

Then it checks:

```powershell
http://localhost:8080/api/health
```

If health check fails, the workflow prints recent Docker Compose logs and fails the deployment.

## Important Behavior

The deploy script uses `git pull --ff-only`.

That means deployment will stop instead of overwriting server-side changes if:

- The server repo has local commits not on GitHub.
- The server repo is not on `main`.
- The server repo cannot fast-forward.

Fix the server repo manually, then rerun the workflow.

## Troubleshooting

### Deploy fails with exit code 255

Exit code `255` almost always means SSH failed before the deploy script could run.

Common causes:

- The server is not reachable from GitHub Actions on SSH port `22`.
- Windows OpenSSH Server is not running.
- Firewall/NAT blocks inbound SSH to `140.120.53.252`.
- `SERVER_SSH_KEY` is not the private key that matches the public key on the server.
- The public key is not in `C:\Users\680-9000\.ssh\authorized_keys`.
- The SSH username is wrong.

The workflow has a `Test SSH connection` step. Check that step first:

- `Connection timed out`: network/firewall/port issue.
- `Permission denied (publickey,...)`: key or `authorized_keys` issue.
- `Host key verification failed`: host key changed; rerun after confirming the server identity.
