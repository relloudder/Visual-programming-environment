PYTHON=python
MANAGE=$(PYTHON) manage.py

update: git_pull update_local
update_local: collect_static migrate_db restart
restart:
	touch programmm/wsgi.py

migrate_db:
	$(MANAGE) syncdb --noinput
	$(MANAGE) migrate --noinput

collect_static:
	$(MANAGE) collectstatic --noinput

git_pull:
	git pull origin master

dev:
	$(MANAGE) runserver --nostatic
