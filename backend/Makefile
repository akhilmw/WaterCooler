PY=python3
VENV=.venv
PIP=$(VENV)/bin/pip
UVICORN=$(VENV)/bin/uvicorn

.PHONY: venv install dev run freeze

venv:
	$(PY) -m venv $(VENV)

install: venv
	$(PIP) install -r requirements.txt

dev:
	$(UVICORN) app.main:app --reload --port $${PORT:-8000}

run:
	$(UVICORN) app.main:app --host 0.0.0.0 --port $${PORT:-8000}

freeze:
	$(PIP) freeze > pinned-requirements.txt