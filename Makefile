# Python version installed; we need 3.10-3.11
PYTHON=`command -v python3.11 || command -v python3.10`

.PHONY: install zobi venv pre-commit up up-detached rebuild rebuild-nocache down logs ps nuke ports open

install: zobi pre-commit

zobi:
	# Install external dependencies
	pip install -r requirements/development.txt

	# Install Zobi in editable (development) mode
	pip install -e .

	# Create an admin user in your metadata database
	zobi fab create-admin \
                    --username admin \
                    --firstname "Admin I."\
                    --lastname Strator \
                    --email admin@zobi.io \
                    --password general

	# Initialize the database
	zobi db upgrade

	# Create default roles and permissions
	zobi init

	# Load some data to play with
	zobi load-examples

	# Install node packages
	cd frontend; npm ci

update: update-py update-js

update-py:
	# Install external dependencies
	pip install -r requirements/development.txt

	# Install Zobi in editable (development) mode
	pip install -e .

	# Initialize the database
	zobi db upgrade

	# Create default roles and permissions
	zobi init

update-js:
	# Install js packages
	cd frontend; npm ci

venv:
	# Create a virtual environment and activate it (recommended)
	if ! [ -x "${PYTHON}" ]; then echo "You need Python 3.10 or 3.11 installed"; exit 1; fi
	test -d venv || ${PYTHON} -m venv venv # setup a python3 virtualenv
	. venv/bin/activate

activate:
	. venv/bin/activate

pre-commit:
	# setup pre commit dependencies
	pip3 install -r requirements/development.txt
	pre-commit install

format: py-format js-format

py-format: pre-commit
	pre-commit run black --all-files

js-format:
	cd frontend; npm run prettier

flask-app:
	flask run -p 8088 --reload --debugger

node-app:
	cd frontend; npm run dev-server

build-cypress:
	cd frontend; npm run build-instrumented
	cd frontend/cypress-base; npm ci

open-cypress:
	if ! [ $(port) ]; then cd frontend/cypress-base; CYPRESS_BASE_URL=http://localhost:9000 npm run cypress open; fi
	cd frontend/cypress-base; CYPRESS_BASE_URL=http://localhost:$(port) npm run cypress open

report-celery-worker:
	celery --app=zobi.tasks.celery_app:app worker

report-celery-beat:
	celery --app=zobi.tasks.celery_app:app beat --pidfile /tmp/celerybeat.pid --schedule /tmp/celerybeat-schedulecd

admin-user:
	zobi fab create-admin

# Docker Compose with auto-assigned ports (for running multiple instances)
up:
	./scripts/docker-compose-up.sh

up-detached:
	./scripts/docker-compose-up.sh -d

# Rebuild images before starting; picks up Dockerfile and dependency changes
# that a plain `make up` would skip, since compose reuses existing images.
rebuild:
	./scripts/docker-compose-up.sh --build

# Rebuild from scratch, ignoring Docker's layer cache, then start.
# `--no-cache` is a `build` flag, so this runs as two steps.
rebuild-nocache:
	./scripts/docker-compose-up.sh build --no-cache
	./scripts/docker-compose-up.sh

down:
	./scripts/docker-compose-up.sh down

logs:
	./scripts/docker-compose-up.sh logs -f

ps:
	./scripts/docker-compose-up.sh ps

nuke:
	./scripts/docker-compose-up.sh nuke

ports:
	./scripts/docker-compose-up.sh ports

open:
	./scripts/docker-compose-up.sh open
