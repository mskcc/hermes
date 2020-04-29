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



## Deployment (TODO)
