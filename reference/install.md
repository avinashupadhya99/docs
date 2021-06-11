import * as Macros from "../macros";

# Installing Telepresence

<Macros.InstallSpecific location="reference-page" />

### Dependencies

If you install Telepresence using a pre-built package, dependencies other than [`kubectl`][k] are handled by the package manager. If you install from source, you will also need to install the following software.

[k]: https://kubernetes.io/docs/tasks/tools/install-kubectl/

- `kubectl` (OpenShift users can use `oc`)
- Python 3.5 or newer
- OpenSSH (the `ssh` command)
- `sshfs` to mount the pod's filesystem
- `conntrack` and `iptables` on Linux for the vpn-tcp method
- `torsocks` for the inject-tcp method
- Docker for the container method
- `sudo` to allow Telepresence to
  - modify the local network (via `sshuttle` and `pf`/`iptables`) for the vpn-tcp method
  - run the `docker` command in some configurations on Linux
  - mount the remote filesystem for access in a Docker container
