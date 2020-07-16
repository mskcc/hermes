# Seqosystem
TODO Description

## Dependencies
Tested with the following versions.
* [Elixir 1.10.2](https://elixir-lang.org/)
* PostgreSQL 12.1
* Node 12.16

## Code Layout
```
apps/
├── dashboard/ - Primary point of entry, an instance of [Phoenix Web framework](https://www.phoenixframework.org/)
├── lims_client/ - Configurable library for making requests to a LIMS server that can return JSON.
└── beagle_client/ - Configurable library for making requests to Beagle, MSK's interface for [Toil](https://github.com/DataBiosphere/toil) orchestration.
```

## Configuration (TODO)
## Development (TODO)
1. Install [Docker](https://docs.docker.com/compose/install/).
2. `docker-compose up`


## Deployment (VM)
### Release (causes downtime)
```
mix edeliver build release
mix edeliver deploy release to staging
mix edeliver startstaging 
OR (will run the above) mix edeliver update staging --start-deploy
```

### Release by Upgrade (Use this, this should not cause downtime)
```
mix edeliver upgrade staging
mix edeliver upgrade production
```

### Setting-up a Machine (Outdated)
```
# As root, install Docker (CentOS)
yum install -y yum-utils
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
# (Optional) You may have to install selinux:
yum install -y http://mirror.centos.org/centos/7/extras/x86_64/Packages/container-selinux-2.107-3.el7.noarch.rpm
yum install docker-ce docker-ce-cli containerd.io

# Start Docker
systemctl start docker

# Set-up a Deploy user
useradd deploy
usermod -aG docker deploy
su deploy
ssh-keygen -t rsa -b 4096 -C <your@email.com>
cat ~/.ssh/id_rsa.pub
```

