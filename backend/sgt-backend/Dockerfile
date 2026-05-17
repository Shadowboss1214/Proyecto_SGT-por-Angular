FROM php:8.1-cli

# Cache bust: 2026-05-17
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpq-dev \
    libicu-dev \
    && docker-php-ext-install pdo pdo_pgsql intl \
    && apt-get clean

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN ls -la config/autoload/

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN composer install --no-dev --optimize-autoloader --ignore-platform-req=ext-intl

# Eliminar modo desarrollo
RUN rm -f config/development.config.php

# Crear carpeta de caché y dar permisos de escritura
RUN mkdir -p data/cache && chmod -R 777 data/cache

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]