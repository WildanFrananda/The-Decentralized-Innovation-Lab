.PHONY: deploy test build lint

deploy:
	@echo "🚀  Deploying contract…"
	source .env && forge script script/Deploy.s.sol:DeployUpgradableScript --rpc-url $$SEPOLIA_RPC_URL --broadcast --verify -vvvv

test:
	@echo "🧪  Running tests…"
	forge test

build:
	@echo "👉  Building contracts…"
	forge build

lint:
	@echo "🔍  Linting contracts…"
	forge fmt --check

help:
	@echo "Usage:"
	@echo "  make build        # Compile all contract"
	@echo "  make test         # Run tests"
	@echo "  make lint         # Lint contracts"
	@echo "  make deploy       # Deploy via script/Deploy.s.sol"