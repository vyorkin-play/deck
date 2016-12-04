start:
	npm start
test:
	npm test
lint:
	npm run lint
dll:
	npm run build:dll
build:
	npm run clean
	npm run build
commit:
	npm run commit
release:
	npm run release

.PHONY: start test lint dll build commit release
