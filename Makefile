start:
	npm start

lint:
	npm run lint --silent

check:
	flow

build:
	npm run build:production

test:
	npm test

.PHONY: start lint check test build
