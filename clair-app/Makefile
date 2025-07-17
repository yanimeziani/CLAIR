# IRIELLE Platform Makefile
# Quick commands for development and deployment

.PHONY: help dev build start stop ssl-setup clean logs status

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	docker-compose up -d

build: ## Build all services
	docker-compose build

start: ## Start all services in production mode
	docker-compose up -d

stop: ## Stop all services
	docker-compose down

ssl-setup: ## Setup SSL certificates automatically
	./scripts/ssl-setup.sh

clean: ## Clean up Docker volumes and containers
	docker-compose down -v
	docker system prune -f

logs: ## Show logs for all services
	docker-compose logs -f

status: ## Show status of all services
	docker-compose ps

restart: ## Restart all services
	docker-compose restart

nginx-logs: ## Show nginx logs
	docker-compose logs -f nginx

test-ssl: ## Test SSL configuration
	curl -I https://dev.meziani.org

# Quick development commands
quick-start: stop start ## Quick restart of all services

# Emergency commands for production
emergency-http: ## Switch to HTTP-only mode (emergency)
	@echo "🚨 Switching to HTTP-only mode for emergency..."
	@if [ -f "./nginx/conf.d/irielle-ssl.conf" ]; then \
		mv "./nginx/conf.d/irielle-ssl.conf" "./nginx/conf.d/irielle-ssl.conf.disabled"; \
	fi
	@if [ -f "./nginx/conf.d/irielle-http-only.conf.disabled" ]; then \
		mv "./nginx/conf.d/irielle-http-only.conf.disabled" "./nginx/conf.d/irielle-http-only.conf"; \
	fi
	@docker-compose restart nginx
	@echo "✅ Switched to HTTP-only mode"

emergency-ssl: ## Switch back to SSL mode
	@echo "🔐 Switching back to SSL mode..."
	@if [ -f "./nginx/conf.d/irielle-http-only.conf" ]; then \
		mv "./nginx/conf.d/irielle-http-only.conf" "./nginx/conf.d/irielle-http-only.conf.disabled"; \
	fi
	@if [ -f "./nginx/conf.d/irielle-ssl.conf.disabled" ]; then \
		mv "./nginx/conf.d/irielle-ssl.conf.disabled" "./nginx/conf.d/irielle-ssl.conf"; \
	fi
	@docker-compose restart nginx
	@echo "✅ Switched back to SSL mode"