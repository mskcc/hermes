# Seqosystem
TODO Description

## Dependencies
Tested with the following versions.
* [Elixir 1.10.4](https://elixir-lang.org/)
* PostgreSQL 12.1
* Node 14.5.x

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
3. (Optional) If you plan to do releases, be sure to copy your pub key to `.ssh/authorized_keys` on deploy@<access01|access02>
4. run `mix phx.gen.cert` to generate the self-signed ssl certificates

## Deployment (VM)
### Release (causes downtime)
```
mix edeliver build release
# To release a specific branch: mix edeliver build release --branch="<branch_name>"
mix edeliver deploy release to staging
mix edeliver start staging
OR (will run the above) mix edeliver update staging --start-deploy --branch="<branch_name>"
```

### Release by Upgrade (Use this, this should not cause downtime)
```
mix edeliver upgrade staging
mix edeliver upgrade production

```
### Migrate
Not ready, see https://github.com/edeliver/edeliver/issues/235
```
mix edeliver migrate staging
```
instead do the following for now...
```
ssh deploy@<server>
./seqosystem/bin/seqosystem rpc 'Dashboard.Release.migrate'
```

### Setting-up a Machine
```
# As root, install packages
wget https://packages.erlang-solutions.com/erlang/rpm/centos/7/x86_64/esl-erlang_23.0.2-2~centos~7_amd64.rpm
wget https://packages.erlang-solutions.com/erlang/rpm/centos/7/x86_64/elixir_1.10.4-1~centos~7_all.rpm
yum remove erlang*
yum remove nodejs*
yum localinstall esl-erlang_23.0.2-2~centos~7_amd64.rpm
yum localinstall elixir_1.10.4-1~centos~7_all.rpm
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
yum install -y nodejs
yum install https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm
yum install postgresql11-server

vim /etc/ssh/sshd_config
# Append `deploy` to `AllowGroups` (if server is sep-up with Puppet, may require Server Admin assistance)

# Set-up a Deploy user
useradd deploy
su deploy
mkdir .ssh
vim .ssh/authorized_keys
echo "github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==" >> ~/.ssh/known_hosts
# Copy your local pub key
exit # Back as root

service sshd restart
# Ensure you can ssh in as yourself and as `deploy@<server>`. Do not disconnect if not, if sshd is running you can see what's wrong in `/var/log/secure`

# Copy over the config.
scp config/prod.secret.exs deploy@access01:/home/deploy

# Install PostgreSQL
/usr/pgsql-11/bin/postgresql-11-setup initdb
systemctl start postgresql-11
systemctl enable postgresql-11

su - postgres
vim /var/lib/pgsql/11/data/pg_hba.conf # Change "IPv4 local connections" METHOD to md5
createdb <DB_NAME>
createuser <USERNAME> --interactive
psql #ALTER USER caesar WITH password '<PASSWORD>';
# As deploy, make sure the database url is set in the ENVAR

exit
# As root
service postgresql-11.service restart

