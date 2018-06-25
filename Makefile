include config.mk

PROJECTNAME = selftagger
HOMEDIR = $(shell pwd)
APPDIR = /opt/$(PROJECTNAME)

pushall: sync
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(USER)@$(SERVER):/opt/ --exclude node_modules/ --exclude data/
	$(SSHCMD) "cd $(APPDIR) && npm install"

prettier:
	prettier --single-quote --write "**/*.js"

test:
	node tests/canonicalize-phrase-tests.js

